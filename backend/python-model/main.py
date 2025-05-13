import os
import re
import time
import numpy as np
import pandas as pd
import spacy
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tqdm import tqdm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rank_bm25 import BM25Okapi
from pinecone import Pinecone, ServerlessSpec
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_community.chat_models import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

# ----------- FastAPI и схемы -----------
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

app = FastAPI()

# ----------- Настройки -----------
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
MODEL_DATA_PATH = os.getenv("MODEL_DATA_PATH", "data/df_combined.csv")
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDINGS_DIMENSIONS = 384
INDEX_NAME = "med-search"
CACHE_PATH = "cache/df_train.pkl"
os.makedirs("cache", exist_ok=True)

# ----------- Загрузка моделей -----------
nlp = spacy.load("ru_core_news_sm")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
pc = Pinecone(api_key=PINECONE_API_KEY)

# ----------- Prompt для LLM -----------
prompt = PromptTemplate(input_variables=["query", "relevant_info"], template="""
Вы — полезный помощник. На основе следующей информации ответьте на запрос пользователя.

Запрос: {query}
Релевантная информация: {relevant_info}

Ответ:
""")
chain = LLMChain(llm=llm, prompt=prompt)

def generate_answer(query, relevant_info):
    return chain.run({"query": query, "relevant_info": relevant_info})

# ----------- Текстовый сплиттер -----------
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    tokens = [token.text for token in nlp(text) if token.text != 'nan']
    return ' '.join(tokens)

def process_text(text: str) -> list:
    cleaned = preprocess_text(text)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return text_splitter.split_text(cleaned)

# ----------- Гибридный поисковик -----------
class HybridSearchProcessor:
    def __init__(self, embedding_model, index_name="med-search", df_train=None):
        self.embedding_model = embedding_model
        self.index_name = index_name
        self.bm25 = None
        self.pinecone_index = None
        self.df_train = df_train  # Добавление df_train как атрибута класса

    def initialize(self, training_texts: pd.DataFrame):
        self.df_train = training_texts  # Ensure we always have the most recent df_train
        self.bm25 = BM25Okapi([doc.split() for doc in training_texts["chunk_text"]])
        self.pinecone_index = self._init_index()

        index_stats = self.pinecone_index.describe_index_stats()
        if index_stats.get("total_vector_count", 0) == 0:
            self.process_texts(training_texts)

    def _init_index(self):
        existing = [i["name"] for i in pc.list_indexes()]
        if self.index_name not in existing:
            pc.create_index(
                name=self.index_name,
                dimension=EMBEDDINGS_DIMENSIONS,
                metric="dotproduct",
                spec=ServerlessSpec(cloud='aws', region='us-east-1')
            )
            while not pc.describe_index(self.index_name)["status"]["ready"]:
                time.sleep(1)
        return pc.Index(self.index_name)

    def process_texts(self, df: pd.DataFrame):
        vectors = []
        # Use df directly and iterate through its rows, not just a column
        for i, row in tqdm(df.iterrows(), desc="🔄 Создание векторов", total=len(df)):
            doc = row["chunk_text"]
            dense = self.embedding_model.embed_documents([doc])[0]
            sparse = np.array(self.bm25.get_scores(doc.split()), dtype=np.float32)
            
            # Create metadata dictionary with safe fallbacks for missing columns
            metadata = {'text': doc}
            if 'name' in row:
                metadata['name'] = row['name']
            if 'price' in row:
                metadata['price'] = row['price']
                
            vector = {
                'id': str(hash(doc)),
                'values': dense,
                'metadata': metadata
            }
            
            # Limit sparse vector size to 1000 as per Pinecone's limitations
            if sparse.size > 0:
                # If sparse vector is too large, keep only the top 1000 values
                if sparse.size > 1000:
                    # Get indices of top 1000 values
                    top_indices = np.argsort(sparse)[-1000:]
                    top_values = sparse[top_indices]
                    vector['sparse_values'] = {
                        'indices': top_indices.tolist(),
                        'values': top_values.tolist()
                    }
                else:
                    # Use all sparse values if under 1000
                    vector['sparse_values'] = {
                        'indices': list(range(len(sparse))), 
                        'values': sparse.tolist()
                    }
            
            vectors.append(vector)
        
        # Upload vectors in batches
        if vectors:
            try:
                self.pinecone_index.upsert(vectors=vectors, batch_size=100)
            except Exception as e:
                print(f"Error during vector upsert: {e}")
                # If batch insert fails, try one by one
                for v in tqdm(vectors, desc="Retrying vectors one by one"):
                    try:
                        self.pinecone_index.upsert(vectors=[v])
                    except Exception as e2:
                        print(f"Failed to upsert vector: {e2}")

    def search(self, query: str, top_k: int = 5):
        query_tokens = query.split()
        bm25_scores = self.bm25.get_scores(query_tokens)
        top_bm25 = sorted(enumerate(bm25_scores), key=lambda x: x[1], reverse=True)[:top_k]
        
        # Get dense embeddings for the query
        dense = self.embedding_model.embed_documents([query])[0]
        
        # Create sparse vector for hybrid search, limiting to 1000 elements
        sparse_indices = []
        sparse_values = []
        
        if len(bm25_scores) > 1000:
            # If too many tokens, get top 1000 by score
            top_sparse_indices = np.argsort(bm25_scores)[-1000:]
            sparse_indices = top_sparse_indices.tolist()
            sparse_values = bm25_scores[top_sparse_indices].tolist()
        else:
            # If under 1000 tokens, use all
            sparse_indices = list(range(len(bm25_scores)))
            sparse_values = bm25_scores.tolist()
        
        # Query Pinecone with hybrid search (dense + sparse)
        resp = self.pinecone_index.query(
            vector=dense,
            top_k=top_k,
            include_metadata=True,
            sparse_vector={"indices": sparse_indices, "values": sparse_values} if sparse_indices else None
        )
        
        pine_results = resp.get('matches', [])
        combined = []
        
        # Combine BM25 results
        for idx, sc in top_bm25:
            if idx < len(self.df_train):  # Make sure index is in bounds
                combined.append(self.df_train.iloc[idx].to_dict() | {'score': sc, 'method': 'BM25'})
        
        # Add unique Pinecone results
        seen = {c['chunk_text'] for c in combined}
        for m in pine_results:
            txt = m['metadata']['text']
            if txt not in seen:
                combined.append({'chunk_text': txt, 'score': m['score'], **m['metadata']})
        return combined

class HybridSearchProcessorWithAnswerGeneration(HybridSearchProcessor):
    def __init__(self, embedding_model, index_name="med-search", llm_model=None, df_train=None):
        super().__init__(embedding_model, index_name, df_train)
        self.llm = llm_model
        self.history = []

    def search_and_answer(self, question: str):
        results = self.search(question)
        info = "\n".join(r['text'] if 'text' in r else r['chunk_text'] for r in results)
        hist = "\n".join(f"Запрос: {e['q']} Ответ: {e['a']}" for e in self.history)
        inp = f"{hist}\n\nЗапрос: {question}\nРелевантная информация: {info}"
        ans = generate_answer(question, info)
        self.history.append({'q': question, 'a': ans})
        return ans

# ----------- Загрузка и обработка данных (с кешем) -----------
if os.path.exists(CACHE_PATH):
    df_train = pd.read_pickle(CACHE_PATH)
else:
    df = pd.read_csv(MODEL_DATA_PATH)
    columns_excl = ["срок годности", "форма выпуска", "код атх", "price", "адрес организации", "link"]
    cols = [c for c in df.columns if c not in columns_excl]
    df = df.loc[:, df.isna().sum() < 2700]
    df = df.head(10)
    
    df['processed_chunks'] = df[cols].astype(str).apply(
        lambda row: sum([process_text(str(x)) for x in row if pd.notna(x) and x.strip() != ''], []), axis=1
    )
    df_train = df.explode('processed_chunks').reset_index(drop=True).rename(columns={'processed_chunks': 'chunk_text'})

    # Make sure name and price columns exist in df_train
    if 'name' not in df_train.columns and 'name' in df.columns:
        # Copy name column based on original index
        df_train['name'] = df_train.index.map(lambda i: df.iloc[min(i, len(df)-1)]['name'] if 'name' in df.columns else 'Unknown')
    
    if 'price' not in df_train.columns and 'price' in df.columns:
        # Copy price column based on original index
        df_train['price'] = df_train.index.map(lambda i: df.iloc[min(i, len(df)-1)]['price'] if 'price' in df.columns else 'Unknown')

    df_train.to_pickle(CACHE_PATH)

# ----------- Инициализация процессора -----------
processor = HybridSearchProcessorWithAnswerGeneration(
    embedding_model=embedding_model,
    index_name=INDEX_NAME,
    llm_model=llm,
    df_train=df_train  # Передача df_train при инициализации
)
processor.initialize(df_train)

# ----------- Endpoint -----------
@app.post('/ask', response_model=AskResponse)
def ask(req: AskRequest):
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Пустой запрос")
    return AskResponse(answer=processor.search_and_answer(q))
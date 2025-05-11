#search_and_answer.py
import re
import spacy
import time
import numpy as np
import pandas as pd
from tqdm import tqdm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rank_bm25 import BM25Okapi
from pinecone import Pinecone, ServerlessSpec
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_community.chat_models import ChatOpenAI
import os
import sys
import json

# Инициализация модели spaCy для русского языка
nlp = spacy.load("ru_core_news_sm")

# Конфигурация
PINECONE_API_KEY = 'pcsk_129V2X_2gZVWWhstoirdd9aCjjZ86TUaBh2kJKM6mGuFo3iqefMZFgUDL8KtC8CrxhzbLn'
EMBEDDINGS_DIMENSIONS = 384
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Инициализация Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Инициализация модели эмбеддингов
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Инициализация LLM модели
os.environ["OPENAI_API_KEY"] = "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"
llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
template = """
Вы — полезный помощник. На основе следующей информации ответьте на запрос пользователя как можно яснее и точнее.

Запрос: {query}
Релевантная информация: {relevant_info}

Ответ:
"""

prompt = PromptTemplate(input_variables=["query", "relevant_info"], template=template)
chain = LLMChain(llm=llm, prompt=prompt)

def generate_answer(query, relevant_info):
    return chain.run({"query": query, "relevant_info": relevant_info})

# Разделитель текста
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
    cleaned_text = preprocess_text(text)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    return text_splitter.split_text(cleaned_text)

class HybridSearchProcessor:
    def __init__(self, embedding_model, index_name="med-search"):
        self.embedding_model = embedding_model
        self.index_name = index_name
        self.bm25 = None
        self.pinecone_index = None

    def initialize(self, training_texts):
        self.bm25 = BM25Okapi([doc.split() for doc in training_texts["chunk_text"].tolist()])
        self.pinecone_index = self.initialize_pinecone_index()

    def initialize_pinecone_index(self):
        existing_indexes = [idx["name"] for idx in pc.list_indexes()]
        if self.index_name in existing_indexes:
            pc.delete_index(self.index_name)
            print(f"🔄 Удалён старый индекс: {self.index_name}")

        pc.create_index(
            name=self.index_name,
            dimension=EMBEDDINGS_DIMENSIONS,
            metric="dotproduct",
            spec=ServerlessSpec(cloud='aws', region='us-east-1')
        )

        while not pc.describe_index(self.index_name)["status"]["ready"]:
            time.sleep(1)

        return pc.Index(self.index_name)

    def process_texts(self, training_texts):
        vectors = self.create_hybrid_vectors(training_texts)
        self.pinecone_index.upsert(vectors=vectors, batch_size=100)
        return self.pinecone_index.describe_index_stats()

    def create_hybrid_vectors(self, training_texts):
        results = []
        for i, doc in tqdm(enumerate(training_texts["chunk_text"]), desc="🔄 Создание векторов"):
            dense_vector = self.embedding_model.embed_documents([doc])[0]
            sparse_vector = np.array(self.bm25.get_scores(doc.split()), dtype=np.float32)

            sparse_indices = list(range(len(sparse_vector)))
            sparse_values = sparse_vector.tolist()

            vector_data = {
                'id': str(hash(doc)),
                'values': dense_vector,
                'metadata': {
                    'text': doc,
                    'name': training_texts.loc[i, "name"],
                    'price': training_texts.loc[i, "price"]
                }
            }

            if sparse_indices and sparse_values:
                vector_data['sparse_values'] = {'indices': sparse_indices, 'values': sparse_values}

            results.append(vector_data)
        return results

    def search(self, query: str, alpha: float = 0.5, top_k: int = 5):
        bm25_scores = self.bm25.get_scores(query.split())
        bm25_top_results = sorted(enumerate(bm25_scores), key=lambda x: x[1], reverse=True)[:top_k]

        dense_vector = self.embedding_model.embed_documents([query])[0]
        response = self.pinecone_index.query(
            vector=dense_vector,
            top_k=top_k,
            include_metadata=True
        )
        pinecone_top_results = [{
            'score': match['score'],
            'chunk_text': match['metadata'].get('text', 'No text available'),
            'name': match['metadata'].get('name', 'Unknown'),
            'price': match['metadata'].get('price', 'Unknown')
        } for match in response['matches']]

        combined_results = []

        for idx, score in bm25_top_results:
            chunk_text = training_texts.loc[idx, "chunk_text"]
            name = training_texts.loc[idx, "name"]
            price = training_texts.loc[idx, "price"]
            combined_results.append({
                'score': score,
                'chunk_text': chunk_text,
                'name': name,
                'price': price,
                'method': 'BM25'
            })

        seen_ids = set([result['chunk_text'] for result in combined_results])
        for result in pinecone_top_results:
            if result['chunk_text'] not in seen_ids:
                combined_results.append(result)

        return combined_results

class HybridSearchProcessorWithAnswerGeneration(HybridSearchProcessor):
    def __init__(self, embedding_model, index_name="med-search", llm_model=None):
        super().__init__(embedding_model, index_name)
        self.llm_model = llm_model
        self.history = []  # История запросов и ответов

    def generate_answer(self, query, search_results):
        relevant_info = "\n".join([result['chunk_text'] for result in search_results])
        history_text = "\n".join([f"Запрос: {entry['query']}\nОтвет: {entry['answer']}" for entry in self.history])
        full_input = f"{history_text}\n\nЗапрос: {query}\nРелевантная информация: {relevant_info}"
        answer = generate_answer(query, full_input)
        self.history.append({"query": query, "answer": answer})
        return answer

    def search_and_answer(self, query):
        search_results = self.search(query)
        answer = self.generate_answer(query, search_results)
        return answer

# Загрузка данных
df = pd.read_csv("df_combined (2).csv")
df = df.loc[:, df.isna().sum() < 2700]
df = df.head(50)

columns_to_exclude = ["срок годности", "форма выпуска", "код атх", "price", "адрес организации", "link"]
columns_to_use = [col for col in df.columns if col not in columns_to_exclude]

df["processed_chunks"] = df[columns_to_use].astype(str).apply(
    lambda row: sum([process_text(str(cell)) for cell in row if pd.notna(cell) and str(cell).strip() != '' and str(cell) != 'nan' and not str(cell).isdigit()], []), axis=1
)

training_texts = df.explode("processed_chunks")[["name", "price", "processed_chunks"]].dropna().reset_index(drop=True)
training_texts.rename(columns={"processed_chunks": "chunk_text"}, inplace=True)

# Инициализация процессора
search_processor = HybridSearchProcessorWithAnswerGeneration(embedding_model=embedding_model, index_name="med-search", llm_model=llm)
search_processor.initialize(training_texts)
search_processor.process_texts(training_texts)

# Основная функция для вызова из Node.js
def main():
    # Чтение входных данных из stdin
    input_data = sys.stdin.read()
    try:
        query_data = json.loads(input_data)
        query = query_data.get("query", "")
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        return

    # Выполнение поиска и генерации ответа
    try:
        answer = search_processor.search_and_answer(query)
        print(json.dumps({"answer": answer}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
<<<<<<< HEAD
import { TrpcProvider } from "./lib/trpc";
import { SignInPage } from './pages/auth/SignInPage'
import { SignOutPage } from './pages/auth/SignOutPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { AllIdeasPage } from './pages/ideas/AllIdeasPage'
import { EditIdeaPage } from './pages/ideas/EditIdeaPage'
import { NewIdeaPage } from './pages/ideas/NewIdeaPage'
import { ViewsIdeaPage } from './pages/ideas/ViewsIdeaPage'
import { NotFoundPage } from './pages/other/NotFoundPage'
import { EditProfilePage } from './pages/auth/EditProfilePage'
import { HelmetProvider } from 'react-helmet-async'
import { viewIdeaRouteParams } from "./lib/routes";
import { AppContextProvider } from './lib/ctx';
import * as routes from './lib/routes';
import { BrowserRouter,Route,Routes} from 'react-router-dom'
import { getAllIdeasRoute,getViewIdeaRoute } from "./lib/routes";

import { Layout } from "./components/Layout";

import './styles/global.scss'
 export const App=()=>{
  return (
    <HelmetProvider>
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
          <Route path={routes.getSignOutRoute.definition} element={<SignOutPage />} />
            <Route element={<Layout />}>
            <Route path={routes.getSignUpRoute.definition} element={<SignUpPage />} />
                <Route path={routes.getSignInRoute.definition} element={<SignInPage />} />
                <Route path={routes.getEditProfileRoute.definition} element={<EditProfilePage />} />
                <Route path={routes.getAllIdeasRoute.definition} element={<AllIdeasPage />} />
                <Route path={routes.getViewIdeaRoute.definition} element={<ViewsIdeaPage />} />
                <Route path={routes.getEditIdeaRoute.definition} element={<EditIdeaPage />} />
                <Route path={routes.getNewIdeaRoute.definition} element={<NewIdeaPage />} />
              <Route path="*" element={<NotFoundPage />} />
              
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
     </HelmetProvider>
  )

 }
=======
import { TrpcProvider } from "./lib/trpc";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignOutPage } from "./pages/auth/SignOutPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { AllIdeasPage } from "./pages/ideas/AllIdeasPage";
import { EditIdeaPage } from "./pages/ideas/EditIdeaPage";
import { NewIdeaPage } from "./pages/ideas/NewIdeaPage";
import { ViewsIdeaPage } from "./pages/ideas/ViewsIdeaPage";
import { NotFoundPage } from "./pages/other/NotFoundPage";
import { EditProfilePage } from "./pages/auth/EditProfilePage";

import { viewIdeaRouteParams } from "./lib/routes";
import { AppContextProvider } from "./lib/ctx";
import * as routes from "./lib/routes";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getAllIdeasRoute, getViewIdeaRoute } from "./lib/routes";

import { Layout } from "./components/Layout";

import "./styles/global.scss";
export const App = () => {
  return (
    <HelmetProvider>
      <TrpcProvider>
        <AppContextProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path={routes.getSignOutRoute()}
                element={<SignOutPage />}
              />
              <Route element={<Layout />}>
                <Route
                  path={routes.getSignUpRoute()}
                  element={<SignUpPage />}
                />
                <Route
                  path={routes.getSignInRoute()}
                  element={<SignInPage />}
                />
                <Route
                  path={routes.getAllIdeasRoute()}
                  element={<AllIdeasPage />}
                />
                <Route
                  path={routes.getNewIdeaRoute()}
                  element={<NewIdeaPage />}
                />
                <Route
                  path={routes.getEditProfileRoute()}
                  element={<EditProfilePage />}
                />
                <Route
                  path={routes.getViewIdeaRoute(routes.viewIdeaRouteParams)}
                  element={<ViewIdeaPage />}
                />
                <Route
                  path={routes.getEditIdeaRoute(routes.editIdeaRouteParams)}
                  element={<EditIdeaPage />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </TrpcProvider>
    </HelmetProvider>
  );
};
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c

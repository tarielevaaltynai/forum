import { TrpcProvider } from "./lib/trpc";
import { getAssistantRoute, getUserAssistantRoute } from './lib/routes';
// ...
import { AssistantPage } from "./pages/other/AssistantPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignOutPage } from "./pages/auth/SignOutPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { AllIdeasPage } from "./pages/ideas/AllIdeasPage";
import { EditIdeaPage } from "./pages/ideas/EditIdeaPage";
import { NewIdeaPage } from "./pages/ideas/NewIdeaPage";
import { ViewsIdeaPage } from "./pages/ideas/ViewsIdeaPage";
import { NotFoundPage } from "./pages/other/NotFoundPage";
import { EditProfilePage } from "./pages/auth/EditProfilePage";
import { HelmetProvider } from "react-helmet-async";
import { LikedIdeasPage } from "./pages/ideas/LikedIdeasPage";
import { NotAuthRouteTracker } from "./components/NotAuthRouteTracker";
import { AdminSpecialistsPage } from "./pages/auth/AdminSpecialistPage";
import { MyIdeasPage } from "./pages/ideas/MyIdeasPage";
import { AppContextProvider } from "./lib/ctx";
import * as routes from "./lib/routes";
import { SentryUser } from "./lib/sentry";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import "./styles/global.scss";
import { ThemeProvider } from "./components/Theme";
import { SomeUserPage } from "./pages/ideas/SomeIdeaPage";
export const App = () => {
  return (
    <HelmetProvider>
      <TrpcProvider>
        <AppContextProvider>
          <ThemeProvider>
            <BrowserRouter>
              <SentryUser />
              <NotAuthRouteTracker />
              <Routes>
                <Route
                  path={routes.getSignOutRoute.definition}
                  element={<SignOutPage />}
                />
                <Route element={<Layout />}>
                  <Route
                    path={routes.getSignUpRoute.definition}
                    element={<SignUpPage />}
                  />
                  <Route
                    path={routes.getSignInRoute.definition}
                    element={<SignInPage />}
                  />
                  <Route
                    path={routes.getEditProfileRoute.definition}
                    element={<EditProfilePage />}
                  />
                  <Route
                    path={routes.getAllIdeasRoute.definition}
                    element={<AllIdeasPage />}
                  />
                  <Route
                    path={routes.getViewIdeaRoute.definition}
                    element={<ViewsIdeaPage />}
                  />
                  <Route
                    path={routes.getEditIdeaRoute.definition}
                    element={<EditIdeaPage />}
                  />
                  <Route
                    path={routes.getNewIdeaRoute.definition}
                    element={<NewIdeaPage />}
                  />
                  <Route
                    path={routes.getMyIdeasRoute.definition}
                    element={<MyIdeasPage />}
                  />
                  <Route
                    path={routes.getLikedIdeasRoute.definition}
                    element={<LikedIdeasPage />}
                  />
                  <Route
                    path={routes.getAdminSpecialistRoute.definition}
                    element={<AdminSpecialistsPage />}
                  />

                  <Route
                    path={routes.getUserProfileByNick.definition}
                    element={<SomeUserPage />}
                  />
 <Route
            path={getAssistantRoute.definition}
            element={<AssistantPage />}
          />
           {/* Ассистент для авторизованного пользователя по нику */}
        <Route
          path={getUserAssistantRoute.definition}
          element={<AssistantPage />}
        />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </AppContextProvider>
      </TrpcProvider>
    </HelmetProvider>
  );
};

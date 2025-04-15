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
import { LikedIdeasPage } from "./pages/ideas/LikedIdeasPage";
import { NotAuthRouteTracker } from './components/NotAuthRouteTracker'
import { AdminSpecialistsPage } from "./pages/auth/AdminSpecialistPage"; 
import { MyIdeasPage } from "./pages/ideas/MyIdeasPage";
import { AppContextProvider } from './lib/ctx';
import * as routes from './lib/routes';
import { SentryUser } from './lib/sentry'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserProfilePage from './pages/users/id';
import { Layout } from "./components/Layout";
import './styles/global.scss'

export const App = () => {
  return (
    <HelmetProvider>
      <TrpcProvider>
        <AppContextProvider>
          <BrowserRouter>
            <SentryUser />
            <NotAuthRouteTracker />
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
                <Route path={routes.getMyIdeasRoute.definition} element={<MyIdeasPage />} />
                <Route path={routes.getLikedIdeasRoute.definition} element={<LikedIdeasPage />} />
                <Route path={routes.getAdminSpecialistRoute.definition} element={<AdminSpecialistsPage />} />
                <Route path={routes.getUserProfileRoute.definition} element={<UserProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </TrpcProvider>
    </HelmetProvider>
  )
}

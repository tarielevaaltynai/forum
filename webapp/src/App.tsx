<<<<<<< HEAD
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import * as routes from './lib/routes'
import { TrpcProvider } from "./lib/trpc";
import { AllIdeasPage } from "./pages/AllIdeasPage";
import { NewIdeaPage } from "./pages/NewIdeaPage";
import { ViewIdeaPage } from "./pages/ViewIdeaPage";
import "./styles/global.scss";
=======
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { getAllIdeasRoute, getViewIdeaRoute, viewIdeaRouteParams } from './lib/routes'

import { getAllIdeasRoute, getViewIdeaRoute } from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { AllIdeasPage } from './pages/AllIdeasPage'
import { ViewIdeaPage } from './pages/ViewIdeaPage'
>>>>>>> 934c23af67f40ed1c57cd5f169c99ba73df19034

export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
          <Route element={<Layout />}>
            <Route path={routes.getAllIdeasRoute()} element={<AllIdeasPage />} />
            <Route path={routes.getNewIdeaRoute()} element={<NewIdeaPage />} />
            <Route path={routes.getViewIdeaRoute(routes.viewIdeaRouteParams)} element={<ViewIdeaPage />} />
          </Route>
=======
          <Route path={getAllIdeasRoute()} element={<AllIdeasPage />} />
          <Route path={getViewIdeaRoute(viewIdeaRouteParams)} element={<ViewIdeaPage />} />
>>>>>>> 934c23af67f40ed1c57cd5f169c99ba73df19034
        </Routes>
      </BrowserRouter>
    </TrpcProvider>

          <Route path={getViewIdeaRoute({ ideaNick: ':ideaNick' })} element={<ViewIdeaPage />} />
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
};
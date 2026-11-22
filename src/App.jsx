import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ScrollManager from './components/ScrollManager';
import HomePage from './pages/HomePage';
import './App.css';
import './styles/shell.css';
import './styles/home.css';
import './styles/pages.css';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const BlogPostRoute = lazy(() => import('./pages/BlogPostRoute'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminPortal = lazy(() => import('./admin/AdminPortal'));

function RouteLoader() {
  return (
    <div className="route-fallback-loader" role="status" aria-live="polite">
      <div className="loading-orb" aria-hidden="true" />
      <p>Loading Syncra Digital Agency...</p>
    </div>
  );
}

function AdminLoader() {
  return (
    <div className="admin-loading" role="status" aria-live="polite">
      <div className="loading-orb" aria-hidden="true" />
      <p>Loading Syncra Admin Console...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route
          path="/syncra-admin"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminPortal />
            </Suspense>
          }
        />
        <Route
          path="/syncra-admin/*"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminPortal />
            </Suspense>
          }
        />

        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="about"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="portfolio"
            element={
              <Suspense fallback={<RouteLoader />}>
                <PortfolioPage />
              </Suspense>
            }
          />
          <Route
            path="faq"
            element={
              <Suspense fallback={<RouteLoader />}>
                <FaqPage />
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="insights"
            element={
              <Suspense fallback={<RouteLoader />}>
                <InsightsPage />
              </Suspense>
            }
          />
          <Route
            path="insights/:slug"
            element={
              <Suspense fallback={<RouteLoader />}>
                <BlogPostRoute />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth';
import { Layout } from '@/components';
import { Spinner } from '@/components/ui';

// Lazy load route components for better performance
const DashboardRoute = lazy(() => import('./dashboard').then(m => ({ default: m.DashboardRoute })));
const ContentRoute = lazy(() => import('./content').then(m => ({ default: m.ContentRoute })));
const ContentDetailRoute = lazy(() => import('./content-detail').then(m => ({ default: m.ContentDetailRoute })));
const DistributionsRoute = lazy(() => import('./distributions').then(m => ({ default: m.DistributionsRoute })));
const ContactsRoute = lazy(() => import('./contacts').then(m => ({ default: m.ContactsRoute })));
const PromptsRoute = lazy(() => import('./prompts').then(m => ({ default: m.PromptsRoute })));
const PromptDetailRoute = lazy(() => import('./prompt-detail').then(m => ({ default: m.PromptDetailRoute })));
const AnalyticsRoute = lazy(() => import('./analytics').then(m => ({ default: m.AnalyticsRoute })));
const LoginRoute = lazy(() => import('./login').then(m => ({ default: m.LoginRoute })));

// Loading fallback component
const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Spinner size="lg" />
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginRoute />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <Layout>
              <ContentRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ContentDetailRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributions"
        element={
          <ProtectedRoute>
            <Layout>
              <DistributionsRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactsRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prompts"
        element={
          <ProtectedRoute>
            <Layout>
              <PromptsRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prompts/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PromptDetailRoute />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsRoute />
            </Layout>
          </ProtectedRoute>
        }
      />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

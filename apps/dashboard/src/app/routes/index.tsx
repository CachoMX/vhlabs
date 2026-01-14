import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth';
import { Layout } from '@/components';

// Lazy load route components
import { DashboardRoute } from './dashboard';
import { ContentRoute } from './content';
import { ContentDetailRoute } from './content-detail';
import { DistributionsRoute } from './distributions';
import { ContactsRoute } from './contacts';
import { PromptsRoute } from './prompts';
import { PromptDetailRoute } from './prompt-detail';
import { AnalyticsRoute } from './analytics';
import { LoginRoute } from './login';

export function AppRoutes() {
  return (
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
  );
}

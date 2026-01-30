import { ErrorBoundary } from '@/components';
import { AppProvider } from './provider';
import { AppRouter } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}

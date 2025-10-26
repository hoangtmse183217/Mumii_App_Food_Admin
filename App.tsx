
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LoadingProvider } from './hooks/useLoading';
import { ToastProvider } from './hooks/useToast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <ToastProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ToastProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/providers/AuthenticationProvider.tsx';
import axios from 'axios';
import { AppProvider } from './providers/AppProvider.tsx';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL as string;
axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers['ngrok-skip-browser-warning'] = 'true';
axios.interceptors.response.use(function (response) {
  return response.data;
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);

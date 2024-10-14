import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AuthProvider from '@/providers/AuthenticationProvider.tsx';
import axios from 'axios';
import { Toaster } from './components/ui/toaster.tsx';

axios.defaults.baseURL = localStorage.getItem('http') || 'http://localhost:8000';
axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers['ngrok-skip-browser-warning'] = 'true';
axios.interceptors.response.use(function (response) {
  return response.data;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </StrictMode>,
);

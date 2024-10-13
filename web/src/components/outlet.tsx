import { useAuthority } from '@/providers/AuthenticationProvider';
import NavigationBarr from '@/components/NavigationBar';
import { Outlet as OutletBrowser, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/providers/AppProvider';
import { Backdrop, BackdropProvider } from './ui/backdrop';

export default function Outlet() {
  const { isAuthenticated } = useAuthority();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/') {
      navigate('/dashboard');
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppProvider>
        <BackdropProvider>
          <div className='w-full p-8'>
            <NavigationBarr />
            <OutletBrowser />
          </div>
        </BackdropProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

import { useAuthority } from '@/providers/AuthenticationProvider';
import NavigationBarr from '@/components/NavigationBar';
import { Outlet as OutletBrowser, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster.tsx';

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
    <div className='w-full p-8'>
      <NavigationBarr />
      <OutletBrowser />
      <Toaster />
    </div>
  );
}

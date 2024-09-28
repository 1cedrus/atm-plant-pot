import { useAuthority } from '@/providers/auth-provider';
import NavigationBarr from '@/components/nav-bar';
import { Outlet as OutletBrowser, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster.tsx';

export function Outlet() {
  const { isAuthenticated } = useAuthority();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');

      toast({
        title: 'Unauthorized',
        description: 'You need to login to access the dashboard',
        variant: 'destructive',
      });
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

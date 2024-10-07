import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthority } from '@/providers/AuthenticationProvider';

enum Spot {
  Dashboard = 'dashboard',
  WateringMode = 'watering-mode',
  LedSettings = 'led-settings',
  Settings = 'settings',
}

export default function NavigationBarr() {
  const { pathname } = useLocation();
  const { logout } = useAuthority();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateTo = (spot: Spot) => {
    navigate(`/${spot}`);

    setIsOpen(false);
  };

  return (
    <div className='flex justify-start items-center pb-4'>
      <div className='flex gap-4 items-center'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant='outline' size='icon' onClick={() => setIsOpen(true)}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side='left'>
            <SheetHeader>
              <SheetTitle>🌺 Plant Watering</SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
            <div className='flex flex-col h-full'>
              <div className='p-4'>
                <p className='font-semibold'>Welcome to the plant watering app</p>
                <p className='text-sm text-gray-500'>
                  You can control the led state, watering mode and water your pot manually
                </p>
              </div>
              <Separator />
              <div className='flex-1 flex flex-col w-full'>
                <Button onClick={() => navigateTo(Spot.Dashboard)} variant='link'>
                  Dashboard
                </Button>
                <Separator />
                <Button onClick={() => navigateTo(Spot.WateringMode)} variant='link'>
                  Watering Mode
                </Button>
                <Separator />
                <Button onClick={() => navigateTo(Spot.LedSettings)} variant='link'>
                  LED Settings
                </Button>
              </div>
              <Button onClick={handleLogout} variant='outline' className='mb-8'>
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        {pathname.includes(Spot.Dashboard) && <h1 className='text-2xl font-bold '>💻 Dashboard</h1>}
        {pathname.includes(Spot.WateringMode) && <h1 className='text-2xl font-bold '>💦 Watering Mode</h1>}
        {pathname.includes(Spot.LedSettings) && <h1 className='text-2xl font-bold '>💡 LED Settings</h1>}
      </div>
    </div>
  );
}

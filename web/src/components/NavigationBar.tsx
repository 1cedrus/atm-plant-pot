import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthority } from '@/providers/AuthenticationProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { changePin, login } from '@/lib/apis';
import { toast } from '@/hooks/useToast';

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
              <div className='flex flex-col gap-2'>
                <ChangePasswordButton />
                <Button onClick={handleLogout} variant='outline' className='mb-8'>
                  Logout
                </Button>
              </div>
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

function ChangePasswordButton() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const { setAuthToken } = useAuthority();

  const updatePinMutation = useMutation({
    mutationFn: ({ oldPin, newPin }: { oldPin: string; newPin: string }) => changePin(oldPin, newPin),
    onSuccess: async (data) => {
      console.log(data);
      toast({ title: 'Success', description: 'PIN changed successfully', duration: 3000 });
      const { access_token } = await login(newPin);
      setAuthToken(access_token);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleChangePassword = () => {};

  return (
    <Dialog>
      <DialogTrigger>
        <Button onClick={handleChangePassword} variant='outline' className='w-full'>
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your PIN</DialogTitle>
          <DialogDescription>Pin can only be numeric and length is four</DialogDescription>
          <div>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='current' className='text-right'>
                  Current PIN
                </Label>
                <Input
                  id='current'
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.currentTarget.value)}
                  className='col-span-3'
                  type='password'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={4}
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='new' className='text-right'>
                  New PIN
                </Label>
                <Input
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={4}
                  id='new'
                  value={newPin}
                  onChange={(e) => setNewPin(e.currentTarget.value)}
                  className='col-span-3'
                  type='password'
                />
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            className='w-32'
            disabled={newPin.length !== 4 || currentPin.length !== 4}
            onClick={() => updatePinMutation.mutate({ oldPin: currentPin, newPin })}
            variant='outline'>
            {updatePinMutation.isPending ? 'Changing...' : 'Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

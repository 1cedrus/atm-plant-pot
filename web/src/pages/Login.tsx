import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { useAuthority } from '@/providers/AuthenticationProvider';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/apis';
import useToast from '@/hooks/useToast';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const { setAuthToken, isAuthenticated } = useAuthority();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
         access_token,
      } = await login(pin);

      setAuthToken(access_token);

      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);

      toast({
        title: 'Error',
        description: 'Invalid PIN. Please try again.',
        duration: 3000,
      });
    }

    setPin('');
  };

  return (
    <div className={`flex items-center justify-center`}>
      <Card className={`w-[300px]`}>
        <CardHeader className='text-center'>
          <div className={`mb-8 rounded-full flex items-center justify-center`}>
            <Leaf size={24} />
          </div>
          <CardTitle className={`text-2xl font-bold`}>Plant Watering Pot</CardTitle>
          <CardDescription>Enter your PIN to login</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input
              type='password'
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder='Enter 4-digit PIN'
              className={`text-center text-lg`}
              required
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' className={`w-full`}>
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

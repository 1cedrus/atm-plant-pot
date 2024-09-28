import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { useAuthority } from '@/providers/auth-provider';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const { setAuthToken, isAuthenticated } = useAuthority();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PIN submitted:', pin);

    try {
      // const {
      //   data: { authToken },
      // } = await login(pin);

      setAuthToken(pin);

      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
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
            <Button type='submit' className={`w-full`} >
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertTriangle className='h-10 w-10 text-yellow-600' />
          </div>
          <CardTitle className='text-2xl font-bold text-gray-800'>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-gray-600'>
            Oops! It looks like you've wandered into uncharted territory. The page you're looking for doesn't exist or
            may have been moved.
          </p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link to='/dashboard'>
            <Button className='flex items-center space-x-2'>
              <Home className='h-5 w-5' />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

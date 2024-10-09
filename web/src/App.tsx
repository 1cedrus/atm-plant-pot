import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <div className='flex flex-col min-h-screen'>
        <div className='flex-1 flex justify-center'>
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </div>
    </>
  );
}

export default App;

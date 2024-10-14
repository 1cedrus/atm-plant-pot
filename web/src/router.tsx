import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Outlet from '@/components/Outlet';
import Dashboard from '@/pages/Dashboard';
import WateringMode from '@/pages/WateringMode';
import LEDSettings from '@/pages/LEDSettings';

export default createBrowserRouter(
  createRoutesFromElements([
    <Route path='/' errorElement={<NotFound />}>
      <Route path='' element={<Outlet />}>
        <Route path='dashboard' element={<Dashboard />}></Route>
        <Route path='watering-mode' element={<WateringMode />}></Route>
        <Route path='led-settings' element={<LEDSettings />}></Route>
      </Route>
      <Route path='login' element={<Login />}></Route>
    </Route>,
  ]),
);

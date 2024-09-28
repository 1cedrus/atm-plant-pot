import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import NotFound from './components/not-found';
import LoginPage from './components/login-page';
import { Outlet } from './components/outlet';
import MockDashboard from './components/dash-board';
import WateringModeCard from './components/card/watering-mode';
import LedControlCard from './components/card/led-control';

export default createBrowserRouter(
  createRoutesFromElements([
    <Route path='/' errorElement={<NotFound />}>
      <Route path='' element={<Outlet />}>
        <Route path='dashboard' element={<MockDashboard />}></Route>
        <Route path='watering-mode' element={<WateringModeCard />}></Route>
        <Route path='led-settings' element={<LedControlCard />}></Route>
      </Route>
      <Route path='login' element={<LoginPage />}></Route>
    </Route>,
  ]),
);

import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { Analytics } from '../pages/Analytics';
import { Dashboard } from '../pages/Dashboard';
import { Inventory } from '../pages/Inventory';
import { Login } from '../pages/Login';
import { Notifications } from '../pages/Notifications';
import { Orders } from '../pages/Orders';
import { Profile } from '../pages/Profile';
import { Register } from '../pages/Register';
import { Sales } from '../pages/Sales';
import { Shipments } from '../pages/Shipments';
import { Suppliers } from '../pages/Suppliers';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> }, { path: '/register', element: <Register /> },
  { element: <ProtectedRoute />, children: [{ element: <Layout />, children: [
    { path: '/', element: <Dashboard /> }, { path: '/inventory', element: <Inventory /> }, { path: '/suppliers', element: <Suppliers /> }, { path: '/orders', element: <Orders /> }, { path: '/shipments', element: <Shipments /> }, { path: '/sales', element: <Sales /> }, { path: '/analytics', element: <Analytics /> }, { path: '/notifications', element: <Notifications /> }, { path: '/profile', element: <Profile /> }
  ] }] }
]);

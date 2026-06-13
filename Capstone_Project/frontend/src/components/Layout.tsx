// import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// import { useAppDispatch } from '../hooks/useAppDispatch';
// import { useAppSelector } from '../hooks/useAppSelector';
// import { logout } from '../store/authSlice';

// const links = [
//   ['Dashboard', '/'], ['Inventory', '/inventory'], ['Suppliers', '/suppliers'], ['Procurement', '/orders'], ['Shipments', '/shipments'], ['Analytics', '/analytics'], ['Notifications', '/notifications'], ['Profile', '/profile']
// ];

// export function Layout() {
//   const user = useAppSelector(state => state.auth.user);
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   return <div className="min-h-screen bg-[#f6f7f9]">
//     <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-5 lg:block">
//       <div className="mb-8"><div className="text-lg font-bold text-ink">Smart Inventory</div><div className="text-xs text-steel">Supply chain operations</div></div>
//       <nav className="space-y-1">{links.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => 'block rounded-md px-3 py-2 text-sm font-medium ' + (isActive ? 'bg-mint/10 text-mint' : 'text-steel hover:bg-gray-50 hover:text-ink')}>{label}</NavLink>)}</nav>
//     </aside>
//     <main className="lg:pl-64">
//       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur">
//         <div className="text-sm font-medium text-steel">Enterprise Inventory Console</div>
//         <div className="flex items-center gap-3"><div className="text-right"><div className="text-sm font-semibold text-ink">{user?.fullName}</div><div className="text-xs text-steel">{user?.role}</div></div><button className="rounded-md bg-ink px-3 py-2 text-sm text-white" onClick={() => { dispatch(logout()); navigate('/login'); }}>Logout</button></div>
//       </header>
//       <div className="p-5 lg:p-8"><Outlet /></div>
//     </main>
//   </div>;
// }

import { useEffect, useState, useRef } from 'react';
import { loadDashboardData } from '../store/dataSlice';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { logout } from '../store/authSlice';
import { canAccess, permissionMessage } from '../utils/permissions';
import { ActionModal } from './ui';

const links = [
  { label: 'Dashboard', to: '/', module: 'dashboard' },
  { label: 'Inventory', to: '/inventory', module: 'inventory' },
  { label: 'Suppliers', to: '/suppliers', module: 'suppliers' },
  { label: 'Procurement', to: '/orders', module: 'orders' },
  { label: 'Shipments', to: '/shipments', module: 'shipments' },
  { label: 'Sales', to: '/sales', module: 'sales' },
  { label: 'Analytics', to: '/analytics', module: 'analytics' },
  { label: 'Notifications', to: '/notifications', module: 'notifications' },
  { label: 'Profile', to: '/profile', module: 'profile' }
] as const;

export function Layout() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    dispatch(loadDashboardData());
  }, [dispatch]);

  const navigate = useNavigate();
  const [permissionDialog, setPermissionDialog] = useState<string | null>(null);

  return <div className="min-h-screen bg-[#f6f7f9]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-6 lg:block">
      <div className="mb-9">
        <div className="text-xl font-bold text-ink">Smart Inventory</div>
        <div className="mt-1 text-xs font-medium text-steel">Supply chain operations</div>
      </div>
      <nav className="space-y-1.5">{links.map(link => {
        const allowed = canAccess(user?.role, link.module);
        return <NavLink key={link.to} to={link.to} onClick={event => {
          if (!allowed) {
            event.preventDefault();
            setPermissionDialog(permissionMessage(link.label, user?.role));
          }
        }} className={({ isActive }) => 'block rounded-md px-3 py-2.5 text-sm font-semibold transition ' + (isActive ? 'bg-mint/10 text-mint' : allowed ? 'text-steel hover:bg-gray-50 hover:text-ink' : 'text-steel/60 hover:bg-gray-50')}>{link.label}</NavLink>;
      })}</nav>
    </aside>
    <main className="lg:pl-64">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur">
        <div className="text-sm font-semibold text-steel">Enterprise Inventory Console</div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-ink">{user?.fullName}</div>
            <div className="text-xs font-medium text-steel">{user?.role}</div>
          </div>
          <button className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111827]" onClick={() => { dispatch(logout()); navigate('/login'); }}>Logout</button>
        </div>
      </header>
      <div className="p-5 lg:p-8"><Outlet /></div>
    </main>
    {permissionDialog && <ActionModal title="Access restricted" description={permissionDialog} onClose={() => setPermissionDialog(null)} />}
  </div>;
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { logout } from '../store/authSlice';

const links = [
  ['Dashboard', '/'], ['Inventory', '/inventory'], ['Suppliers', '/suppliers'], ['Procurement', '/orders'], ['Shipments', '/shipments'], ['Analytics', '/analytics'], ['Notifications', '/notifications'], ['Profile', '/profile']
];

export function Layout() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-[#f6f7f9]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-5 lg:block">
      <div className="mb-8"><div className="text-lg font-bold text-ink">Smart Inventory</div><div className="text-xs text-steel">Supply chain operations</div></div>
      <nav className="space-y-1">{links.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => 'block rounded-md px-3 py-2 text-sm font-medium ' + (isActive ? 'bg-mint/10 text-mint' : 'text-steel hover:bg-gray-50 hover:text-ink')}>{label}</NavLink>)}</nav>
    </aside>
    <main className="lg:pl-64">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur">
        <div className="text-sm font-medium text-steel">Enterprise Inventory Console</div>
        <div className="flex items-center gap-3"><div className="text-right"><div className="text-sm font-semibold text-ink">{user?.fullName}</div><div className="text-xs text-steel">{user?.role}</div></div><button className="rounded-md bg-ink px-3 py-2 text-sm text-white" onClick={() => { dispatch(logout()); navigate('/login'); }}>Logout</button></div>
      </header>
      <div className="p-5 lg:p-8"><Outlet /></div>
    </main>
  </div>;
}


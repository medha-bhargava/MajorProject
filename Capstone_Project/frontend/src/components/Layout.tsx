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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return <div className="min-h-screen bg-[#f6f7f9]">
    {mobileNavOpen && (
      <>
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />

        <aside className="fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-xl lg:hidden">
          <div className="mb-9 flex items-start justify-between gap-3">
            <div>
              <div className="text-xl font-bold text-ink">Smart Inventory</div>
              <div className="mt-1 text-xs font-medium text-steel">Supply chain operations</div>
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              className="rounded-md px-2 py-1 text-lg leading-none text-steel transition hover:bg-gray-100 hover:text-ink"
              onClick={() => setMobileNavOpen(false)}
            >
              x
            </button>
          </div>

          <nav className="space-y-1.5">{links.map(link => {
            const allowed = canAccess(user?.role, link.module);
            return <NavLink key={link.to} to={link.to} onClick={event => {
              if (!allowed) {
                event.preventDefault();
                setPermissionDialog(permissionMessage(link.label, user?.role));
              }
              setMobileNavOpen(false);
            }} className={({ isActive }) => 'block rounded-md px-3 py-2.5 text-sm font-semibold transition ' + (isActive ? 'bg-mint/10 text-mint' : allowed ? 'text-steel hover:bg-gray-50 hover:text-ink' : 'text-steel/60 hover:bg-gray-50')}>{link.label}</NavLink>;
          })}</nav>
        </aside>
      </>
    )}

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
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-gray-300 bg-white text-ink shadow-sm transition hover:bg-gray-50 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <span className="space-y-1" aria-hidden="true">
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
            </span>
          </button>
          <div className="hidden truncate text-sm font-semibold text-steel sm:block">Enterprise Inventory Console</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 text-right">
            <div className="truncate text-xs font-semibold text-ink sm:text-sm">{user?.fullName}</div>
            <div className="truncate text-[10px] font-medium text-steel sm:text-xs">{user?.role}</div>
          </div>
          <button className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111827]" onClick={() => { dispatch(logout()); navigate('/login'); }}>Logout</button>
        </div>
      </header>
      <div className="p-5 lg:p-8"><Outlet /></div>
    </main>
    {permissionDialog && <ActionModal title="Access restricted" description={permissionDialog} onClose={() => setPermissionDialog(null)} />}
  </div>;
}

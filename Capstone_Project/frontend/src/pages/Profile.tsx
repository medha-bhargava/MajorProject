import { PageHeader } from '../components/PageHeader';
import { useAppSelector } from '../hooks/useAppSelector';
export function Profile(){ const user=useAppSelector(s=>s.auth.user); return <><PageHeader title="Profile Settings" subtitle="Account and role details for the current session."/><div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-lg font-semibold">{user?.fullName}</div><div className="mt-2 text-sm text-steel">{user?.email}</div><div className="mt-4 inline-flex rounded bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">{user?.role}</div></div></> }


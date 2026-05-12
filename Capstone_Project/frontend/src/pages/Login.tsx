import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { login } from '../store/authSlice';

export function Login() {
  const [email, setEmail] = useState('admin@example.com'); const [password, setPassword] = useState('password123');
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const { loading, error } = useAppSelector(s => s.auth);
  async function submit(event: FormEvent) { event.preventDefault(); await dispatch(login({ email, password })).unwrap(); navigate('/'); }
  return <div className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4"><form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-semibold text-ink">Smart Inventory</h1><p className="mt-1 text-sm text-steel">Sign in to manage inventory operations.</p>
    {error && <div className="mt-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <label className="mt-6 block text-sm font-medium">Email<input className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label className="mt-4 block text-sm font-medium">Password<input type="password" className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} /></label>
    <button className="mt-6 w-full rounded-md bg-mint px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
    <p className="mt-4 text-center text-sm text-steel"><Link className="font-semibold text-mint" to="/register">Create an account</Link></p>
  </form></div>;
}


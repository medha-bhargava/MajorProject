import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { register } from '../store/authSlice';
import type { Role } from '../types';

export function Register() {
  const [fullName,setFullName]=useState('Admin User'); const [email,setEmail]=useState('admin@example.com'); const [password,setPassword]=useState('password123'); const [role,setRole]=useState<Role>('ADMIN');
  const dispatch=useAppDispatch(); const navigate=useNavigate();
  async function submit(e: FormEvent){e.preventDefault(); await dispatch(register({fullName,email,password,role})).unwrap(); navigate('/');}
  return <div className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4"><form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-semibold text-ink">Create Account</h1>
    <label className="mt-5 block text-sm font-medium">Full name<input className="mt-2 w-full rounded-md border px-3 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} /></label>
    <label className="mt-4 block text-sm font-medium">Email<input className="mt-2 w-full rounded-md border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label className="mt-4 block text-sm font-medium">Password<input type="password" className="mt-2 w-full rounded-md border px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} /></label>
    <label className="mt-4 block text-sm font-medium">Role<select className="mt-2 w-full rounded-md border px-3 py-2" value={role} onChange={e=>setRole(e.target.value as Role)}><option>ADMIN</option><option>WAREHOUSE_MANAGER</option><option>PROCUREMENT_MANAGER</option><option>SUPPLIER</option></select></label>
    <button className="mt-6 w-full rounded-md bg-mint px-4 py-2 font-semibold text-white">Register</button><p className="mt-4 text-center text-sm"><Link className="text-mint" to="/login">Back to login</Link></p>
  </form></div>;
}


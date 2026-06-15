import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { register } from '../store/authSlice';
import type { Role } from '../types';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!role) {
      alert('Please select a role');
      return;
    }
    await dispatch(
      register({
        fullName,
        email,
        password,
        role,
      })
    ).unwrap();
    navigate('/');
  }
  return <div className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4"><form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-semibold text-ink">Create Account</h1>
    <label className="mt-5 block text-sm font-medium">
      Full name
      <input 
        required 
        placeholder="Enter full name" 
        className="mt-2 w-full rounded-md border px-3 py-2" 
        value={fullName} 
        onChange={e => setFullName(e.target.value)} 
      />
    </label>
    <label className="mt-4 block text-sm font-medium">
      Email
      <input 
        required 
        placeholder="Enter email" 
        className="mt-2 w-full rounded-md border px-3 py-2" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
    </label>
    <label className="mt-4 block text-sm font-medium">
      Password
      <input 
        required 
        placeholder="Enter password" 
        type="password" 
        className="mt-2 w-full rounded-md border px-3 py-2" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
    </label>
    <label className="mt-4 block text-sm font-medium">
      Role
      <select
        // required
        className="mt-2 w-full rounded-md border px-3 py-2"
        value={role}
        onChange={e => setRole(e.target.value as Role)}
      >
        <option value="" disabled>
          --SELECT--
        </option>
        <option value="ADMIN">ADMIN</option>
        <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
        <option value="PROCUREMENT_MANAGER">PROCUREMENT_MANAGER</option>
        <option value="SUPPLIER">SUPPLIER</option>
      </select>
    </label>
    <button className="mt-6 w-full rounded-md bg-mint px-4 py-2 font-semibold text-white">Register</button><p className="mt-4 text-center text-sm"><Link className="text-mint" to="/login">Back to login</Link></p>
  </form></div>;
}


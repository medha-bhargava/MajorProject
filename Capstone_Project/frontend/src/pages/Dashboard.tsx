import { useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loadDashboardData } from '../store/dataSlice';

const chart = [{period:'Jan',value:40},{period:'Feb',value:52},{period:'Mar',value:48},{period:'Apr',value:61},{period:'May',value:66}];
export function Dashboard(){ const dispatch=useAppDispatch(); const data=useAppSelector(s=>s.data); useEffect(()=>{dispatch(loadDashboardData());},[dispatch]); const cards=[['Inventory Items',data.inventory.length],['Suppliers',data.suppliers.length],['Open Orders',data.orders.filter(o=>o.status!=='COMPLETED').length],['Shipments',data.shipments.length]];
 return <><PageHeader title="Dashboard" subtitle="Operational command center for inventory and supply chain teams." />
 <div className="grid gap-4 md:grid-cols-4">{cards.map(([label,value])=><div key={label} className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-sm text-steel">{label}</div><div className="mt-2 text-3xl font-semibold text-ink">{value}</div></div>)}</div>
 <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-4 font-semibold text-ink">Demand Trend</h2><div className="h-72"><ResponsiveContainer><AreaChart data={chart}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="period"/><YAxis/><Tooltip/><Area type="monotone" dataKey="value" stroke="#2f9e82" fill="#2f9e8233"/></AreaChart></ResponsiveContainer></div></div></> }


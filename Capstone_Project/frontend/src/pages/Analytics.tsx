import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function Analytics(){ const [trends,setTrends]=useState<any[]>([]); useEffect(()=>{api.get('/analytics/stock-trends').then(r=>setTrends(r.data)).catch(()=>setTrends([]));},[]); return <><PageHeader title="Analytics Dashboard" subtitle="Charts-ready metrics for stock flow, suppliers, and demand forecasting."/><div className="rounded-lg border bg-white p-5 shadow-sm"><div className="h-80"><ResponsiveContainer><BarChart data={trends}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="period"/><YAxis/><Tooltip/><Legend/><Bar dataKey="stockIn" fill="#2f9e82"/><Bar dataKey="stockOut" fill="#d97706"/></BarChart></ResponsiveContainer></div></div></> }


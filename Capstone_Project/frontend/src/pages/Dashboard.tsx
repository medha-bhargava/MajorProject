import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

type RevenueItem = {
  sku: string;
  itemName: string;
  revenue: number;
};

type AnalyticsDashboard = {
  revenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  topRevenueItems: RevenueItem[];
};

const initialAnalytics: AnalyticsDashboard = {
  revenue: 0,
  todayRevenue: 0,
  monthlyRevenue: 0,
  topRevenueItems: [],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export function Dashboard() {
  const data = useAppSelector((state) => state.data);
  const [analytics, setAnalytics] =
    useState<AnalyticsDashboard>(initialAnalytics);
  const [analyticsError, setAnalyticsError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/analytics/dashboard')
      .then((response) => {
        if (!active) return;

        setAnalytics({
          revenue: Number(response.data?.revenue || 0),
          todayRevenue: Number(response.data?.todayRevenue || 0),
          monthlyRevenue: Number(response.data?.monthlyRevenue || 0),
          topRevenueItems: response.data?.topRevenueItems || [],
        });
        setAnalyticsError('');
      })
      .catch(() => {
        if (!active) return;

        setAnalytics(initialAnalytics);
        setAnalyticsError('Revenue analytics could not be loaded right now.');
      });

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    ['Inventory Items', data.inventory.length],
    ['Suppliers', data.suppliers.length],
    [
      'Open Orders',
      data.orders.filter((order) => order.status !== 'COMPLETED').length,
    ],
    ['Shipments', data.shipments.length],
    ['Revenue', formatCurrency(analytics.revenue)],
  ];

  const activitySummary = [
    {
      label: 'Pending Orders',
      value: data.orders.filter((order) => order.status === 'PENDING').length,
      detail: 'AWAITING APPROVAL',
      detailColor:
        data.orders.filter((order) => order.status === 'PENDING').length > 0
          ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Approved Orders',
      value: data.orders.filter((order) => order.status === 'APPROVED').length,
      detail: 'READY TO START',
      detailColor:
        data.orders.filter((order) => order.status === 'APPROVED').length > 0
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Low Stock Items',
      value: data.inventory.filter((item) => item.lowStock).length,
      detail: 'NEED ATTENTION',
      detailColor:
        data.inventory.filter((item) => item.lowStock).length > 0
          ? 'bg-rose-100 text-rose-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Delivered Shipments',
      value: data.shipments.filter(
        (shipment) => shipment.status === 'DELIVERED'
      ).length,
      detail: 'COMPLETED DELIVERIES',
      detailColor:
        data.shipments.filter(
          (shipment) => shipment.status === 'DELIVERED'
        ).length > 0
          ? 'bg-sky-100 text-sky-700'
          : 'bg-slate-100 text-steel',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Operational command center for inventory and supply chain teams."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label} className="p-5">
            <div className="text-sm font-medium text-steel">{label}</div>
            <div className="mt-3 text-4xl font-semibold text-ink">
              {value}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            Revenue Summary
          </h2>
          <p className="mt-1 text-sm text-steel">
            Net sales revenue after returned inventory adjustments.
          </p>
        </div>

        {analyticsError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {analyticsError}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">Today</div>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(analytics.todayRevenue)}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">This Month</div>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(analytics.monthlyRevenue)}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">Top SKUs</div>
              <div className="mt-3 space-y-2">
                {analytics.topRevenueItems.length === 0 ? (
                  <div className="text-sm text-steel">No sales revenue yet.</div>
                ) : (
                  analytics.topRevenueItems.map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-ink">{item.sku}</div>
                        <div className="text-xs text-steel">{item.itemName}</div>
                      </div>
                      <div className="font-semibold text-ink">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            Activity Summary
          </h2>
          <p className="mt-1 text-sm text-steel">
            Current operational activity across procurement, stock, and shipments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activitySummary.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="text-sm font-medium text-steel">
                {item.label}
              </div>
              <div className="mt-3 text-3xl font-semibold text-ink">
                {item.value}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${item.detailColor}`}
                >
                  {item.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}



// import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import { PageHeader } from '../components/PageHeader';
// import { Card } from '../components/ui';
// import { useAppSelector } from '../hooks/useAppSelector';

// const chart = [
//   { period: 'Jan', value: 40 },
//   { period: 'Feb', value: 52 },
//   { period: 'Mar', value: 48 },
//   { period: 'Apr', value: 61 },
//   { period: 'May', value: 66 },
// ];

// export function Dashboard() {
//   const data = useAppSelector((state) => state.data);
//   const cards = [
//     ['Inventory Items', data.inventory.length],
//     ['Suppliers', data.suppliers.length],
//     ['Open Orders', data.orders.filter((order) => order.status !== 'COMPLETED').length],
//     ['Shipments', data.shipments.length],
//   ];

//   return (
//     <>
//       <PageHeader title="Dashboard" subtitle="Operational command center for inventory and supply chain teams." />

//       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//         {cards.map(([label, value]) => (
//           <Card key={label} className="p-5">
//             <div className="text-sm font-medium text-steel">{label}</div>
//             <div className="mt-3 text-4xl font-semibold text-ink">{value}</div>
//           </Card>
//         ))}
//       </div>

//       <Card className="mt-6 p-5">
//         <div className="mb-5">
//           <h2 className="text-lg font-semibold text-ink">Demand Trend</h2>
//           <p className="mt-1 text-sm text-steel">Representative demand movement for the current planning cycle.</p>
//         </div>
//         <div className="h-72">
//           <ResponsiveContainer>
//             <AreaChart data={chart}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//               <XAxis dataKey="period" />
//               <YAxis />
//               <Tooltip />
//               <Area type="monotone" dataKey="value" stroke="#2f9e82" fill="#2f9e8233" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </Card>
//     </>
//   );
// }



// import { useEffect } from 'react';
// import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import { PageHeader } from '../components/PageHeader';
// import { useAppDispatch } from '../hooks/useAppDispatch';
// import { useAppSelector } from '../hooks/useAppSelector';
// import { loadDashboardData } from '../store/dataSlice';

// const chart = [{period:'Jan',value:40},{period:'Feb',value:52},{period:'Mar',value:48},{period:'Apr',value:61},{period:'May',value:66}];
// export function Dashboard(){ const dispatch=useAppDispatch(); const data=useAppSelector(s=>s.data); useEffect(()=>{dispatch(loadDashboardData());},[dispatch]); const cards=[['Inventory Items',data.inventory.length],['Suppliers',data.suppliers.length],['Open Orders',data.orders.filter(o=>o.status!=='COMPLETED').length],['Shipments',data.shipments.length]];
//  return <><PageHeader title="Dashboard" subtitle="Operational command center for inventory and supply chain teams." />
//  <div className="grid gap-4 md:grid-cols-4">{cards.map(([label,value])=><div key={label} className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-sm text-steel">{label}</div><div className="mt-2 text-3xl font-semibold text-ink">{value}</div></div>)}</div>
//  <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-4 font-semibold text-ink">Demand Trend</h2><div className="h-72"><ResponsiveContainer><AreaChart data={chart}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="period"/><YAxis/><Tooltip/><Area type="monotone" dataKey="value" stroke="#2f9e82" fill="#2f9e8233"/></AreaChart></ResponsiveContainer></div></div></> }

// import { useEffect } from 'react';
// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';

// import { PageHeader } from '../components/PageHeader';
// import { useAppDispatch } from '../hooks/useAppDispatch';
// import { useAppSelector } from '../hooks/useAppSelector';
// import { loadDashboardData } from '../store/dataSlice';

// const chart = [
//   { period: 'Jan', value: 40 },
//   { period: 'Feb', value: 52 },
//   { period: 'Mar', value: 48 },
//   { period: 'Apr', value: 61 },
//   { period: 'May', value: 66 },
// ];

// export function Dashboard() {
//   const dispatch = useAppDispatch();
//   const data = useAppSelector((state) => state.data);

//   useEffect(() => {
//     dispatch(loadDashboardData());
//   }, [dispatch]);

//   const cards = [
//     ['Inventory Items', data.inventory.length],
//     ['Suppliers', data.suppliers.length],
//     [
//       'Open Orders',
//       data.orders.filter((order) => order.status !== 'COMPLETED').length,
//     ],
//     ['Shipments', data.shipments.length],
//   ];

//   return (
//     <>
//       <PageHeader
//         title="Dashboard"
//         subtitle="Operational command center for inventory and supply chain teams."
//       />

//       {data.loading && (
//         <div className="mb-4 rounded-lg border bg-white p-4 text-sm text-steel shadow-sm">
//           Loading dashboard data...
//         </div>
//       )}

//       {data.error && (
//         <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
//           {data.error}
//         </div>
//       )}

//       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//         {cards.map(([label, value]) => (
//           <div
//             key={String(label)}
//             className="rounded-lg border bg-white p-5 shadow-sm"
//           >
//             <div className="text-sm text-steel">{label}</div>
//             <div className="mt-2 text-3xl font-semibold text-ink">
//               {value}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
//         <h2 className="mb-4 font-semibold text-ink">Demand Trend</h2>

//         <div className="h-72">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={chart}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="period" />
//               <YAxis />
//               <Tooltip />

//               <Area
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#2f9e82"
//                 fill="#2f9e8233"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </>
//   );
// }

import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

export function Dashboard() {
  const data = useAppSelector((state) => state.data);

  const cards = [
    ['Inventory Items', data.inventory.length],
    ['Suppliers', data.suppliers.length],
    [
      'Open Orders',
      data.orders.filter((order) => order.status !== 'COMPLETED').length,
    ],
    ['Shipments', data.shipments.length],
  ];

  const activitySummary = [
    {
      label: 'Pending Orders',
      value: data.orders.filter((order) => order.status === 'PENDING').length,
      detail: 'Awaiting approval',
    },
    {
      label: 'Approved Orders',
      value: data.orders.filter((order) => order.status === 'APPROVED').length,
      detail: 'Ready to start',
    },
    {
      label: 'Low Stock Items',
      value: data.inventory.filter((item) => item.lowStock).length,
      detail: 'Need attention',
    },
    {
      label: 'Delivered Shipments',
      value: data.shipments.filter(
        (shipment) => shipment.status === 'DELIVERED'
      ).length,
      detail: 'Completed deliveries',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Operational command center for inventory and supply chain teams."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <div className="mt-1 text-xs font-medium text-steel">
                {item.detail}
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


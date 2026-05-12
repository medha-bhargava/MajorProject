import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useAppSelector } from '../hooks/useAppSelector';
export function Shipments(){ const shipments=useAppSelector(s=>s.data.shipments); return <><PageHeader title="Shipments" subtitle="Monitor delivery status, carriers, and warehouse transfers."/><div className="grid gap-4 md:grid-cols-2">{shipments.map(shipment=><div key={shipment.id} className="rounded-lg border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="font-semibold">{shipment.trackingNumber}</div><StatusBadge value={shipment.status}/></div><div className="mt-3 text-sm text-steel">{shipment.carrier} · {shipment.originWarehouse} to {shipment.destinationWarehouse}</div></div>)}</div></> }


// import { PageHeader } from '../components/PageHeader';
// import { StatusBadge } from '../components/StatusBadge';
// import { useAppSelector } from '../hooks/useAppSelector';
// export function Shipments(){ const shipments=useAppSelector(s=>s.data.shipments); return <><PageHeader title="Shipments" subtitle="Monitor delivery status, carriers, and warehouse transfers."/><div className="grid gap-4 md:grid-cols-2">{shipments.map(shipment=><div key={shipment.id} className="rounded-lg border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="font-semibold">{shipment.trackingNumber}</div><StatusBadge value={shipment.status}/></div><div className="mt-3 text-sm text-steel">{shipment.carrier} · {shipment.originWarehouse} to {shipment.destinationWarehouse}</div></div>)}</div></> }

import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { ActionModal, Card, EmptyState, PermissionNotice, PrimaryButton } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';
import { canAccess, permissionMessage } from '../utils/permissions';

export function Shipments() {
  const shipments = useAppSelector(s => s.data.shipments);
  const loading = useAppSelector(s => s.data.loading);
  const role = useAppSelector(s => s.auth.user?.role);
  const [showModal, setShowModal] = useState(false);
  const canView = canAccess(role, 'shipments');

  if (!canView) {
    return <><PageHeader title="Shipments" subtitle="Monitor delivery status, carriers, and warehouse transfers." /><PermissionNotice message={permissionMessage('Shipments', role)} /></>;
  }

  return <><PageHeader title="Shipments" subtitle="Monitor delivery status, carriers, and warehouse transfers." actions={<PrimaryButton onClick={() => setShowModal(true)}>Create Shipment</PrimaryButton>} />
    {loading ? <div className="grid gap-4 md:grid-cols-2">{[1, 2].map(card => <div key={card} className="h-28 rounded-lg border bg-white p-5 shadow-sm"><div className="h-4 w-40 rounded bg-gray-200" /><div className="mt-4 h-3 w-52 rounded bg-gray-100" /></div>)}</div> : shipments.length === 0 ? <EmptyState title="No shipments yet" message="Create a shipment record to monitor tracking, carriers, and warehouse transfers." actionLabel="Create Shipment" onAction={() => setShowModal(true)} /> : <div className="grid gap-4 md:grid-cols-2">{shipments.map(shipment => <Card key={shipment.id}><div className="flex items-center justify-between gap-4"><div className="font-semibold text-ink">{shipment.trackingNumber}</div><StatusBadge value={shipment.status} /></div><div className="mt-3 text-sm leading-6 text-steel">{shipment.carrier} · {shipment.originWarehouse} to {shipment.destinationWarehouse}</div></Card>)}</div>}
    {showModal && <ActionModal title="Create shipment" description="Shipment creation placeholder for future form integration." onClose={() => setShowModal(false)}>
      {/* TODO: Wire this form to the existing shipment create API when create-form validation requirements are finalized. */}
      <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-md border px-3 py-2 text-sm" placeholder="Tracking number" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Carrier" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Origin warehouse" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Destination warehouse" /></div>
    </ActionModal>}
  </>;
}

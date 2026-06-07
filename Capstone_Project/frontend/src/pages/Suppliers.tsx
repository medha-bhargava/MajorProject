// import { PageHeader } from '../components/PageHeader';
// import { useAppSelector } from '../hooks/useAppSelector';
// export function Suppliers(){ const suppliers=useAppSelector(s=>s.data.suppliers); return <><PageHeader title="Supplier Management" subtitle="Manage supplier registration, ratings, contacts, and lead times."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{suppliers.map(supplier=><div key={supplier.id} className="rounded-lg border bg-white p-5 shadow-sm"><div className="font-semibold text-ink">{supplier.name}</div><div className="mt-1 text-sm text-steel">{supplier.productCategory}</div><div className="mt-4 text-sm">Rating {supplier.rating} / 5 · Lead time {supplier.averageLeadTimeDays} days</div><div className="mt-2 text-sm text-steel">{supplier.contactPerson} · {supplier.email}</div></div>)}</div></> }

import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ActionModal, Card, EmptyState, PermissionNotice, PrimaryButton } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';
import { canAccess, permissionMessage } from '../utils/permissions';

export function Suppliers() {
  const suppliers = useAppSelector(s => s.data.suppliers);
  const loading = useAppSelector(s => s.data.loading);
  const role = useAppSelector(s => s.auth.user?.role);
  const [showModal, setShowModal] = useState(false);
  const canView = canAccess(role, 'suppliers');

  if (!canView) {
    return <><PageHeader title="Supplier Management" subtitle="Manage supplier registration, ratings, contacts, and lead times." /><PermissionNotice message={permissionMessage('Suppliers', role)} /></>;
  }

  return <><PageHeader title="Supplier Management" subtitle="Manage supplier registration, ratings, contacts, and lead times." actions={<PrimaryButton onClick={() => setShowModal(true)}>Add Supplier</PrimaryButton>} />
    {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map(card => <div key={card} className="h-36 rounded-lg border bg-white p-5 shadow-sm"><div className="h-4 w-36 rounded bg-gray-200" /><div className="mt-4 h-3 w-24 rounded bg-gray-100" /></div>)}</div> : suppliers.length === 0 ? <EmptyState title="No suppliers registered" message="Add supplier records to track contacts, lead times, ratings, and product categories." actionLabel="Add Supplier" onAction={() => setShowModal(true)} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{suppliers.map(supplier => <Card key={supplier.id}><div className="font-semibold text-ink">{supplier.name}</div><div className="mt-1 text-sm text-steel">{supplier.productCategory}</div><div className="mt-4 text-sm font-medium text-ink">Rating {supplier.rating} / 5 · Lead time {supplier.averageLeadTimeDays} days</div><div className="mt-2 text-sm text-steel">{supplier.contactPerson} · {supplier.email}</div></Card>)}</div>}
    {showModal && <ActionModal title="Add supplier" description="Supplier creation placeholder for future form integration." onClose={() => setShowModal(false)}>
      {/* TODO: Wire this form to the existing supplier create API when create-form validation requirements are finalized. */}
      <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-md border px-3 py-2 text-sm" placeholder="Supplier name" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Email" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Category" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Lead time days" /></div>
    </ActionModal>}
  </>;
}

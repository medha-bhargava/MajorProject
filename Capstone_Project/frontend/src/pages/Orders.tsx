// import { PageHeader } from '../components/PageHeader';
// import { StatusBadge } from '../components/StatusBadge';
// import { useAppSelector } from '../hooks/useAppSelector';
// export function Orders(){ const orders=useAppSelector(s=>s.data.orders); return <><PageHeader title="Procurement Orders" subtitle="Track approvals, GRNs, and purchase order lifecycle."/><div className="overflow-hidden rounded-lg border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-steel"><tr><th className="p-3">Item</th><th>SKU</th><th>Qty</th><th>Status</th><th>Unit cost</th></tr></thead><tbody>{orders.map(order=><tr className="border-t" key={order.id}><td className="p-3 font-medium">{order.itemName}</td><td>{order.sku}</td><td>{order.quantity}</td><td><StatusBadge value={order.status}/></td><td>{'$'}{order.unitCost}</td></tr>)}</tbody></table></div></> }

import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { ActionModal, EmptyState, PermissionNotice, PrimaryButton } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';
import { canAccess, permissionMessage } from '../utils/permissions';

export function Orders() {
  const orders = useAppSelector(s => s.data.orders);
  const loading = useAppSelector(s => s.data.loading);
  const role = useAppSelector(s => s.auth.user?.role);
  const [showModal, setShowModal] = useState(false);
  const canView = canAccess(role, 'orders');

  if (!canView) {
    return <><PageHeader title="Procurement Orders" subtitle="Track approvals, GRNs, and purchase order lifecycle." /><PermissionNotice message={permissionMessage('Procurement Orders', role)} /></>;
  }

  return <><PageHeader title="Procurement Orders" subtitle="Track approvals, GRNs, and purchase order lifecycle." actions={<PrimaryButton onClick={() => setShowModal(true)}>Create Order</PrimaryButton>} />
    {loading ? <div className="rounded-lg border bg-white p-6 shadow-sm"><div className="h-4 w-40 rounded bg-gray-200" /><div className="mt-4 space-y-3">{[1, 2, 3].map(row => <div key={row} className="h-10 rounded bg-gray-100" />)}</div></div> : orders.length === 0 ? <EmptyState title="No procurement orders yet" message="Create a purchase order to start tracking approvals, supplier fulfillment, and GRN completion." actionLabel="Create Order" onAction={() => setShowModal(true)} /> : <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-steel"><tr><th className="p-4">Item</th><th>SKU</th><th>Qty</th><th>Status</th><th>Unit cost</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{orders.map(order => <tr className="transition hover:bg-gray-50" key={order.id}><td className="p-4 font-semibold text-ink">{order.itemName}</td><td className="text-steel">{order.sku}</td><td className="font-semibold text-ink">{order.quantity}</td><td><StatusBadge value={order.status} /></td><td className="text-steel">{'$'}{order.unitCost}</td></tr>)}</tbody>
      </table>
    </div>}
    {showModal && <ActionModal title="Create procurement order" description="Order creation placeholder for future form integration." onClose={() => setShowModal(false)}>
      {/* TODO: Wire this form to the existing order create API when create-form validation requirements are finalized. */}
      <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-md border px-3 py-2 text-sm" placeholder="SKU" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Item name" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Quantity" /><input className="rounded-md border px-3 py-2 text-sm" placeholder="Supplier ID" /></div>
    </ActionModal>}
  </>;
}

// import { PageHeader } from '../components/PageHeader';
// import { useAppSelector } from '../hooks/useAppSelector';

// export function Inventory(){ const items=useAppSelector(s=>s.data.inventory); return <><PageHeader title="Inventory Management" subtitle="Search stock, monitor quantities, and identify low-stock items."/><div className="overflow-hidden rounded-lg border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-steel"><tr><th className="p-3">SKU</th><th>Name</th><th>Warehouse</th><th>Qty</th><th>Valuation</th></tr></thead><tbody>{items.map(item=><tr className="border-t" key={item.id}><td className="p-3 font-medium">{item.sku}</td><td>{item.name}</td><td>{item.warehouseCode}</td><td className={item.lowStock?'font-semibold text-rose-600':''}>{item.quantity}</td><td>{'$'}{Number(item.valuation).toLocaleString()}</td></tr>)}</tbody></table></div></> }


import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import {
  ActionModal,
  EmptyState,
  PermissionNotice,
  PrimaryButton,
} from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';
import { canAccess, permissionMessage } from '../utils/permissions';

export function Inventory() {
  const items = useAppSelector((state) => state.data.inventory);
  const loading = useAppSelector((state) => state.data.loading);
  const role = useAppSelector((state) => state.auth.user?.role);

  const [showModal, setShowModal] = useState(false);

  const canView = canAccess(role, 'inventory');

  console.log('Inventory role:', role);
  console.log('Inventory canView:', canView);

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Inventory Management"
          subtitle="Search stock, monitor quantities, and identify low-stock items."
        />

        <PermissionNotice
          message={permissionMessage('Inventory', role)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Inventory Management"
        subtitle="Search stock, monitor quantities, and identify low-stock items."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            Add Item
          </PrimaryButton>
        }
      />

      {/* <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        TEST: Updated Inventory.tsx is rendering correctly.
      </div> */}

      {loading ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="h-4 w-40 rounded bg-gray-200" />

          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-10 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No inventory items yet"
          message="Add your first inventory item to start tracking stock levels, valuation, and low-stock thresholds."
          actionLabel="Add Item"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-steel">
              <tr>
                <th className="p-4">SKU</th>
                <th>Name</th>
                <th>Warehouse</th>
                <th>Qty</th>
                <th>Valuation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  className="transition hover:bg-gray-50"
                  key={item.id}
                >
                  <td className="p-4 font-semibold text-ink">
                    {item.sku}
                  </td>
                  <td className="text-steel">{item.name}</td>
                  <td className="text-steel">
                    {item.warehouseCode}
                  </td>
                  <td
                    className={
                      item.lowStock
                        ? 'font-semibold text-rose-600'
                        : 'font-semibold text-ink'
                    }
                  >
                    {item.quantity}
                  </td>
                  <td className="text-steel">
                    ${Number(item.valuation).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ActionModal
          title="Add inventory item"
          description="Create item UI placeholder. Backend integration can be connected later."
          onClose={() => setShowModal(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-md border px-3 py-2 text-sm"
              placeholder="SKU"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              placeholder="Item Name"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              placeholder="Warehouse"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              placeholder="Quantity"
            />
          </div>
        </ActionModal>
      )}
    </>
  );
}

import { type FormEvent, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import {
  ActionModal,
  EmptyState,
  PermissionNotice,
  PrimaryButton,
  SecondaryButton,
} from '../components/ui';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loadDashboardData } from '../store/dataSlice';
import { canAccess, permissionMessage } from '../utils/permissions';

type InventoryForm = {
  sku: string;
  name: string;
  category: string;
  warehouseCode: string;
  quantity: string;
  lowStockThreshold: string;
  unitCost: string;
};

const initialInventoryForm: InventoryForm = {
  sku: '',
  name: '',
  category: '',
  warehouseCode: '',
  quantity: '',
  lowStockThreshold: '',
  unitCost: '',
};

export function Inventory() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.data.inventory);
  const loading = useAppSelector((state) => state.data.loading);
  const role = useAppSelector((state) => state.auth.user?.role);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialInventoryForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess(role, 'inventory');

  const updateForm = (field: keyof InventoryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialInventoryForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/inventory', {
        sku: form.sku.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        warehouseCode: form.warehouseCode.trim(),
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        unitCost: Number(form.unitCost),
      });

      await dispatch(loadDashboardData()).unwrap();
      closeModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to create inventory item'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Inventory Management"
          subtitle="Search stock, monitor quantities, and identify low-stock items."
        />

        <PermissionNotice message={permissionMessage('Inventory', role)} />
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
                <tr className="transition hover:bg-gray-50" key={item.id}>
                  <td className="p-4 font-semibold text-ink">{item.sku}</td>
                  <td className="text-steel">{item.name}</td>
                  <td className="text-steel">{item.warehouseCode}</td>
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
          description="Create a new inventory record with stock level, cost, and low-stock threshold."
          onClose={closeModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="inventory-item-form"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Item'}
              </PrimaryButton>
            </div>
          }
        >
          <form
            id="inventory-item-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="SKU"
                value={form.sku}
                onChange={(event) => updateForm('sku', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Item Name"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Category"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Warehouse"
                value={form.warehouseCode}
                onChange={(event) =>
                  updateForm('warehouseCode', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => updateForm('quantity', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Low stock threshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(event) =>
                  updateForm('lowStockThreshold', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Unit cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(event) => updateForm('unitCost', event.target.value)}
                required
              />
            </div>
          </form>
        </ActionModal>
      )}
    </>
  );
}
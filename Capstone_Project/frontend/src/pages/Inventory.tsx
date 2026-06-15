import { type FormEvent, useMemo, useState } from 'react';
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
import type { InventoryItem } from '../types';
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

type AdjustmentForm = {
  quantityDelta: string;
  reason: string;
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

const initialAdjustmentForm: AdjustmentForm = {
  quantityDelta: '',
  reason: '',
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

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState(initialAdjustmentForm);
  const [adjustSaving, setAdjustSaving] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const canView = canAccess(role, 'inventory');
  const sortedItems = useMemo(
    () =>
      [...items].sort((firstItem, secondItem) =>
        firstItem.sku.localeCompare(secondItem.sku, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      ),
    [items]
  );

  const updateForm = (field: keyof InventoryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialInventoryForm);
    setError(null);
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentForm(initialAdjustmentForm);
    setAdjustError(null);
  };

  const closeAdjustModal = () => {
    setSelectedItem(null);
    setAdjustmentForm(initialAdjustmentForm);
    setAdjustError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        warehouseCode: form.warehouseCode.trim(),
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        unitCost: Number(form.unitCost),
      };
      const createsLowStockAlert = payload.quantity <= payload.lowStockThreshold;

      await api.post('/inventory', payload);

      await dispatch(loadDashboardData()).unwrap();
      closeModal();

      if (createsLowStockAlert) {
        window.setTimeout(() => {
          void dispatch(loadDashboardData());
        }, 750);
      }
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

  const handleAdjustSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedItem) return;

    setAdjustSaving(true);
    setAdjustError(null);

    try {
      await api.post(`/inventory/${selectedItem.id}/adjust`, {
        quantityDelta: Number(adjustmentForm.quantityDelta),
        reason: adjustmentForm.reason.trim(),
      });

      await dispatch(loadDashboardData()).unwrap();
      closeAdjustModal();
    } catch (err: any) {
      setAdjustError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to adjust stock'
      );
    } finally {
      setAdjustSaving(false);
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item) => (
                // <tr className="transition hover:bg-gray-50" key={item.id}>
                <tr
                  className={`transition hover:bg-gray-50 ${item.lowStock ? 'bg-rose-50/60' : ''
                    }`}
                  key={item.id}
                >
                  <td className="p-4 font-semibold text-ink">{item.sku}</td>
                  {/* <td className="text-steel">{item.name}</td> */}
                  <td className="text-steel">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{item.name}</span>
                      {item.lowStock && (
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          LOW STOCK
                        </span>
                      )}
                    </div>
                  </td>
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
                  <td className="py-3 pr-4">
                    <SecondaryButton
                      className="px-3 py-1.5"
                      onClick={() => openAdjustModal(item)}
                    >
                      Adjust
                    </SecondaryButton>
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
                aria-label="SKU"
                placeholder="SKU"
                value={form.sku}
                onChange={(event) => updateForm('sku', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Item name"
                placeholder="Item Name"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Category"
                placeholder="Category"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Warehouse"
                placeholder="Warehouse"
                value={form.warehouseCode}
                onChange={(event) =>
                  updateForm('warehouseCode', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Quantity"
                placeholder="Quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => updateForm('quantity', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Low stock threshold"
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
                aria-label="Unit cost"
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

      {selectedItem && (
        <ActionModal
          title="Adjust stock"
          description={`Update quantity for ${selectedItem.name}. Use negative numbers for stock reductions.`}
          onClose={closeAdjustModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton
                type="button"
                onClick={closeAdjustModal}
                disabled={adjustSaving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="stock-adjustment-form"
                disabled={adjustSaving}
              >
                {adjustSaving ? 'Saving...' : 'Save Adjustment'}
              </PrimaryButton>
            </div>
          }
        >
          <form
            id="stock-adjustment-form"
            onSubmit={handleAdjustSubmit}
            className="space-y-4"
          >
            {adjustError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {adjustError}
              </div>
            )}

            <div className="grid gap-3">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Quantity delta"
                placeholder="Quantity delta, e.g. 10 or -4"
                type="number"
                value={adjustmentForm.quantityDelta}
                onChange={(event) =>
                  setAdjustmentForm((current) => ({
                    ...current,
                    quantityDelta: event.target.value,
                  }))
                }
                required
              />

              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Reason"
                placeholder="Reason, e.g. MANUAL_RECOUNT"
                value={adjustmentForm.reason}
                onChange={(event) =>
                  setAdjustmentForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                required
              />
            </div>
          </form>
        </ActionModal>
      )}
    </>
  );
}
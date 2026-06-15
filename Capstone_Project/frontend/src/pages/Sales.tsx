import { type FormEvent, useCallback, useEffect, useState } from 'react';
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
import type { SalesRecord, SalesStatus } from '../types';
import { canAccess, permissionMessage } from '../utils/permissions';

type SalesForm = {
  sku: string;
  itemName: string;
  quantity: string;
  unitCost: string;
  status: SalesStatus;
};

const initialSalesForm: SalesForm = {
  sku: '',
  itemName: '',
  quantity: '',
  unitCost: '',
  status: 'SOLD',
};

const statusTone: Record<SalesStatus, string> = {
  SOLD: 'bg-emerald-100 text-emerald-800',
  RETURNED: 'bg-amber-100 text-amber-800',
};

export function Sales() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);

  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialSalesForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess(role, 'sales');

  const loadSalesRecords = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await api.get('/sales');
      setRecords(response.data?.content || response.data || []);
    } catch (err: any) {
      setLoadError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to load sales records'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    void loadSalesRecords();
  }, [canView, loadSalesRecords]);

  const updateForm = (field: keyof SalesForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialSalesForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const sku = form.sku.trim();
    const quantity = Number(form.quantity);

    try {
      await api.post('/sales', {
        sku,
        itemName: form.itemName.trim(),
        quantity,
        unitCost: Number(form.unitCost),
        status: form.status,
      });

      closeModal();
      await loadSalesRecords();
      dispatch(loadDashboardData());
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to save sales record'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Sales Management"
          subtitle="Track sold and returned inventory items."
        />
        <PermissionNotice message={permissionMessage('Sales', role)} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Sales Management"
        subtitle="Track sold and returned inventory items."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            Add Record
          </PrimaryButton>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-10 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No sales records yet"
          message="Add sold or returned inventory records to keep stock quantities current."
          actionLabel="Add Record"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="touch-pan-x overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-steel">
              <tr>
                <th className="p-4">SKU</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr className="transition hover:bg-gray-50" key={record.id}>
                  <td className="p-4 font-semibold text-ink">{record.sku}</td>
                  <td className="text-steel">{record.itemName}</td>
                  <td className="font-semibold text-ink">{record.quantity}</td>
                  <td className="text-steel">
                    ${Number(record.unitCost).toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${statusTone[record.status]}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ActionModal
          title="Add sales record"
          description="Record sold or returned inventory and update stock quantity by SKU."
          onClose={closeModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="sales-record-form"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Record'}
              </PrimaryButton>
            </div>
          }
        >
          <form
            id="sales-record-form"
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
                value={form.itemName}
                onChange={(event) =>
                  updateForm('itemName', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Quantity"
                placeholder="Quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) =>
                  updateForm('quantity', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Unit cost"
                placeholder="Unit Cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(event) =>
                  updateForm('unitCost', event.target.value)
                }
                required
              />
              <select
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Status"
                value={form.status}
                onChange={(event) =>
                  updateForm('status', event.target.value as SalesStatus)
                }
                required
              >
                <option value="SOLD">SOLD</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>
          </form>
        </ActionModal>
      )}
    </>
  );
}

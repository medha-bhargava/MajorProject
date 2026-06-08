import { type FormEvent, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
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

type OrderForm = {
  sku: string;
  itemName: string;
  quantity: string;
  supplierId: string;
  requestedBy: string;
  unitCost: string;
};

const initialOrderForm: OrderForm = {
  sku: '',
  itemName: '',
  quantity: '',
  supplierId: '',
  requestedBy: '',
  unitCost: '',
};

export function Orders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.data.orders);
  const suppliers = useAppSelector((state) => state.data.suppliers);
  const loading = useAppSelector((state) => state.data.loading);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialOrderForm);
  const [saving, setSaving] = useState(false);
  const [actionSavingId, setActionSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canView = canAccess(role, 'orders');
  const canManageOrders = role === 'ADMIN' || role === 'PROCUREMENT_MANAGER';

  const updateForm = (field: keyof OrderForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openModal = () => {
    setForm((current) => ({
      ...current,
      requestedBy: current.requestedBy || user?.fullName || '',
    }));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialOrderForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/orders', {
        sku: form.sku.trim(),
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        supplierId: form.supplierId,
        requestedBy: form.requestedBy.trim(),
        unitCost: Number(form.unitCost),
      });

      await dispatch(loadDashboardData()).unwrap();
      closeModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to create procurement order'
      );
    } finally {
      setSaving(false);
    }
  };

  const runOrderAction = async (
    orderId: string,
    action: 'approve' | 'reject' | 'start' | 'complete'
  ) => {
    setActionSavingId(`${orderId}-${action}`);
    setActionError(null);

    try {
      if (action === 'approve' || action === 'reject') {
        await api.post(`/orders/${orderId}/${action}`, {
          approver: user?.fullName || 'Admin User',
        });
      } else {
        await api.post(`/orders/${orderId}/${action}`);
      }

      await dispatch(loadDashboardData()).unwrap();
    } catch (err: any) {
      setActionError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to update procurement order'
      );
    } finally {
      setActionSavingId(null);
    }
  };

  const renderOrderActions = (order: (typeof orders)[number]) => {
    if (!canManageOrders) return null;

    if (order.status === 'PENDING') {
      return (
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            className="px-3 py-1.5"
            disabled={actionSavingId !== null}
            onClick={() => runOrderAction(order.id, 'approve')}
          >
            Approve
          </PrimaryButton>
          <SecondaryButton
            className="px-3 py-1.5 text-rose-700"
            disabled={actionSavingId !== null}
            onClick={() => runOrderAction(order.id, 'reject')}
          >
            Reject
          </SecondaryButton>
        </div>
      );
    }

    if (order.status === 'APPROVED') {
      return (
        <SecondaryButton
          className="px-3 py-1.5"
          disabled={actionSavingId !== null}
          onClick={() => runOrderAction(order.id, 'start')}
        >
          Start
        </SecondaryButton>
      );
    }

    if (order.status === 'IN_PROGRESS') {
      return (
        <PrimaryButton
          className="px-3 py-1.5"
          disabled={actionSavingId !== null}
          onClick={() => runOrderAction(order.id, 'complete')}
        >
          Complete
        </PrimaryButton>
      );
    }

    return <span className="text-sm text-steel">No actions</span>;
  };

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Procurement Orders"
          subtitle="Track approvals, GRNs, and purchase order lifecycle."
        />
        <PermissionNotice
          message={permissionMessage('Procurement Orders', role)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Procurement Orders"
        subtitle="Track approvals, GRNs, and purchase order lifecycle."
        actions={
          <PrimaryButton onClick={openModal}>
            Create Order
          </PrimaryButton>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
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
      ) : orders.length === 0 ? (
        <EmptyState
          title="No procurement orders yet"
          message="Create a purchase order to start tracking approvals, supplier fulfillment, and GRN completion."
          actionLabel="Create Order"
          onAction={openModal}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-steel">
              <tr>
                <th className="p-4">Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Unit cost</th>
                {canManageOrders && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr className="transition hover:bg-gray-50" key={order.id}>
                  <td className="p-4 font-semibold text-ink">
                    {order.itemName}
                  </td>
                  <td className="text-steel">{order.sku}</td>
                  <td className="font-semibold text-ink">{order.quantity}</td>
                  <td>
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="text-steel">{'$'}{order.unitCost}</td>
                  {canManageOrders && (
                    <td className="py-3 pr-4">
                      {renderOrderActions(order)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ActionModal
          title="Create procurement order"
          description="Create a purchase order with supplier, quantity, requester, and unit cost."
          onClose={closeModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="order-form"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Order'}
              </PrimaryButton>
            </div>
          }
        >
          <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Item name"
                value={form.itemName}
                onChange={(event) => updateForm('itemName', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Quantity"
                placeholder="Quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => updateForm('quantity', event.target.value)}
                required
              />

              {suppliers.length > 0 ? (
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  aria-label="Supplier"
                  value={form.supplierId}
                  onChange={(event) =>
                    updateForm('supplierId', event.target.value)
                  }
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="rounded-md border px-3 py-2 text-sm"
                  aria-label="Supplier ID"
                  placeholder="Supplier ID"
                  value={form.supplierId}
                  onChange={(event) =>
                    updateForm('supplierId', event.target.value)
                  }
                  required
                />
              )}

              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Requested by"
                placeholder="Requested by"
                value={form.requestedBy}
                onChange={(event) =>
                  updateForm('requestedBy', event.target.value)
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
    </>
  );
}
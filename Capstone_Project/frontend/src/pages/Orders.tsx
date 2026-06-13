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
import type { InventoryItem, PurchaseOrder } from '../types';

type OrderForm = {
  sku: string;
  itemName: string;
  quantity: string;
  supplierId: string;
  requestedBy: string;
  unitCost: string;
};

type ShipmentForm = {
  trackingNumber: string;
  carrier: string;
  originWarehouse: string;
  destinationWarehouse: string;
  sku: string;
  quantity: string;
};

const initialOrderForm: OrderForm = {
  sku: '',
  itemName: '',
  quantity: '',
  supplierId: '',
  requestedBy: '',
  unitCost: '',
};

const initialShipmentForm: ShipmentForm = {
  trackingNumber: '',
  carrier: '',
  originWarehouse: '',
  destinationWarehouse: '',
  sku: '',
  quantity: '',
};

export function Orders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.data.orders);
  const inventory = useAppSelector((state) => state.data.inventory);
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
  const [shipmentOrder, setShipmentOrder] = useState<PurchaseOrder | null>(null);
  const [shipmentForm, setShipmentForm] = useState(initialShipmentForm);
  const [shipmentSaving, setShipmentSaving] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);

  const canView = canAccess(role, 'orders');
  const canManageOrders = role === 'ADMIN' || role === 'PROCUREMENT_MANAGER';
  const lowStockItems = inventory.filter((item) => item.lowStock);
  const supplierNameById = new Map(
    suppliers.map((supplier) => [supplier.id, supplier.name])
  );

  const updateForm = (field: keyof OrderForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // const openModal = () => {
  //   setForm((current) => ({
  //     ...current,
  //     requestedBy: current.requestedBy || user?.fullName || '',
  //   }));
  //   setShowModal(true);
  // };
  const openModal = (item?: InventoryItem) => {
    setForm((current) => ({
      ...current,
      sku: item?.sku || current.sku,
      itemName: item?.name || current.itemName,
      quantity: item
        ? String(Math.max(item.lowStockThreshold - item.quantity, 1))
        : current.quantity,
      requestedBy: current.requestedBy || user?.fullName || '',
      unitCost: item ? String(item.unitCost) : current.unitCost,
    }));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialOrderForm);
    setError(null);
  };

  const updateShipmentForm = (field: keyof ShipmentForm, value: string) => {
    setShipmentForm((current) => ({ ...current, [field]: value }));
  };

  const openShipmentModal = (order: PurchaseOrder) => {
    setShipmentOrder(order);
    setShipmentError(null);
    setShipmentForm({
      trackingNumber: `PO-${order.id.slice(0, 8).toUpperCase()}`,
      carrier: '',
      originWarehouse: 'Supplier Dispatch',
      destinationWarehouse: 'Main Warehouse',
      sku: order.sku,
      quantity: String(order.quantity),
    });
  };

  const closeShipmentModal = () => {
    setShipmentOrder(null);
    setShipmentForm(initialShipmentForm);
    setShipmentError(null);
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

  const handleShipmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShipmentSaving(true);
    setShipmentError(null);

    try {
      await api.post('/shipments', {
        trackingNumber: shipmentForm.trackingNumber.trim(),
        carrier: shipmentForm.carrier.trim(),
        originWarehouse: shipmentForm.originWarehouse.trim(),
        destinationWarehouse: shipmentForm.destinationWarehouse.trim(),
        sku: shipmentForm.sku.trim(),
        quantity: Number(shipmentForm.quantity),
        orderId: shipmentOrder?.id,
      });

      await dispatch(loadDashboardData()).unwrap();
      closeShipmentModal();
    } catch (err: any) {
      setShipmentError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to create shipment'
      );
    } finally {
      setShipmentSaving(false);
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

    if (order.status === 'COMPLETED') {
      return (
        <SecondaryButton
          className="px-3 py-1.5"
          disabled={actionSavingId !== null}
          onClick={() => openShipmentModal(order)}
        >
          Create Shipment
        </SecondaryButton>
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
          <PrimaryButton onClick={() => openModal()}>
            Create Order
          </PrimaryButton>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {canManageOrders && lowStockItems.length > 0 && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-rose-900">
              Low Stock Reorder Suggestions
            </h2>
            <p className="mt-1 text-sm text-rose-700">
              These inventory items are at or below their reorder threshold.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-rose-200 bg-white p-4"
              >
                <div className="font-semibold text-ink">{item.name}</div>
                <div className="mt-1 text-sm text-steel">{item.sku}</div>
                <div className="mt-3 text-sm text-rose-700">
                  Current {item.quantity} / Threshold {item.lowStockThreshold}
                </div>

                <PrimaryButton
                  className="mt-4 px-3 py-1.5"
                  onClick={() => openModal(item)}
                >
                  Create Order
                </PrimaryButton>
              </div>
            ))}
          </div>
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
                <th>Supplier</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Procurement cost</th>
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
                  <td className="text-steel">
                    {supplierNameById.get(order.supplierId) || 'Unknown supplier'}
                  </td>
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
                placeholder="Procurement cost"
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

      {shipmentOrder && (
        <ActionModal
          title="Create shipment"
          description={`Create a shipment record for ${shipmentOrder.itemName}.`}
          onClose={closeShipmentModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton
                type="button"
                onClick={closeShipmentModal}
                disabled={shipmentSaving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="order-shipment-form"
                disabled={shipmentSaving}
              >
                {shipmentSaving ? 'Saving...' : 'Save Shipment'}
              </PrimaryButton>
            </div>
          }
        >
          <form
            id="order-shipment-form"
            onSubmit={handleShipmentSubmit}
            className="space-y-4"
          >
            {shipmentError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {shipmentError}
              </div>
            )}

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-steel">
              {supplierNameById.get(shipmentOrder.supplierId) || 'Unknown supplier'} ·{' '}
              {shipmentOrder.quantity} units · {shipmentOrder.sku}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Tracking number"
                placeholder="Tracking number"
                value={shipmentForm.trackingNumber}
                onChange={(event) =>
                  updateShipmentForm('trackingNumber', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Carrier"
                placeholder="Carrier"
                value={shipmentForm.carrier}
                onChange={(event) =>
                  updateShipmentForm('carrier', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Origin warehouse"
                placeholder="Origin warehouse"
                value={shipmentForm.originWarehouse}
                onChange={(event) =>
                  updateShipmentForm('originWarehouse', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Destination warehouse"
                placeholder="Destination warehouse"
                value={shipmentForm.destinationWarehouse}
                onChange={(event) =>
                  updateShipmentForm('destinationWarehouse', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="SKU"
                placeholder="SKU"
                value={shipmentForm.sku}
                onChange={(event) =>
                  updateShipmentForm('sku', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                aria-label="Quantity"
                placeholder="Quantity"
                type="number"
                min="1"
                value={shipmentForm.quantity}
                onChange={(event) =>
                  updateShipmentForm('quantity', event.target.value)
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

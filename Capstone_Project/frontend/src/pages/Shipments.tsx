import { type FormEvent, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  ActionModal,
  Card,
  EmptyState,
  PermissionNotice,
  PrimaryButton,
  SecondaryButton,
} from '../components/ui';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loadDashboardData } from '../store/dataSlice';
import { canAccess, permissionMessage } from '../utils/permissions';

type ShipmentForm = {
  trackingNumber: string;
  carrier: string;
  originWarehouse: string;
  destinationWarehouse: string;
};

const initialShipmentForm: ShipmentForm = {
  trackingNumber: '',
  carrier: '',
  originWarehouse: '',
  destinationWarehouse: '',
};

export function Shipments() {
  const dispatch = useAppDispatch();
  const shipments = useAppSelector((state) => state.data.shipments);
  const loading = useAppSelector((state) => state.data.loading);
  const role = useAppSelector((state) => state.auth.user?.role);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialShipmentForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess(role, 'shipments');

  const updateForm = (field: keyof ShipmentForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialShipmentForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/shipments', {
        trackingNumber: form.trackingNumber.trim(),
        carrier: form.carrier.trim(),
        originWarehouse: form.originWarehouse.trim(),
        destinationWarehouse: form.destinationWarehouse.trim(),
      });

      await dispatch(loadDashboardData()).unwrap();
      closeModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to create shipment'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Shipments"
          subtitle="Monitor delivery status, carriers, and warehouse transfers."
        />
        <PermissionNotice message={permissionMessage('Shipments', role)} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Shipments"
        subtitle="Monitor delivery status, carriers, and warehouse transfers."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            Create Shipment
          </PrimaryButton>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((card) => (
            <div
              key={card}
              className="h-28 rounded-lg border bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="mt-4 h-3 w-52 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <EmptyState
          title="No shipments yet"
          message="Create a shipment record to monitor tracking, carriers, and warehouse transfers."
          actionLabel="Create Shipment"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shipments.map((shipment) => (
            <Card key={shipment.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-ink">
                  {shipment.trackingNumber}
                </div>
                <StatusBadge value={shipment.status} />
              </div>
              <div className="mt-3 text-sm leading-6 text-steel">
                {shipment.carrier} · {shipment.originWarehouse} to{' '}
                {shipment.destinationWarehouse}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <ActionModal
          title="Create shipment"
          description="Create a shipment record with tracking, carrier, and warehouse transfer details."
          onClose={closeModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="shipment-form"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Shipment'}
              </PrimaryButton>
            </div>
          }
        >
          <form id="shipment-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Tracking number"
                value={form.trackingNumber}
                onChange={(event) =>
                  updateForm('trackingNumber', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Carrier"
                value={form.carrier}
                onChange={(event) => updateForm('carrier', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Origin warehouse"
                value={form.originWarehouse}
                onChange={(event) =>
                  updateForm('originWarehouse', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Destination warehouse"
                value={form.destinationWarehouse}
                onChange={(event) =>
                  updateForm('destinationWarehouse', event.target.value)
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
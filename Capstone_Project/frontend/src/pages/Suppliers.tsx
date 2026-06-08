import { type FormEvent, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
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

type SupplierForm = {
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  productCategory: string;
  averageLeadTimeDays: string;
  rating: string;
};

const initialSupplierForm: SupplierForm = {
  name: '',
  email: '',
  phone: '',
  contactPerson: '',
  productCategory: '',
  averageLeadTimeDays: '',
  rating: '',
};

export function Suppliers() {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((state) => state.data.suppliers);
  const loading = useAppSelector((state) => state.data.loading);
  const role = useAppSelector((state) => state.auth.user?.role);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialSupplierForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess(role, 'suppliers');

  const updateForm = (field: keyof SupplierForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialSupplierForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/suppliers', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        contactPerson: form.contactPerson.trim(),
        productCategory: form.productCategory.trim(),
        averageLeadTimeDays: Number(form.averageLeadTimeDays),
        rating: Number(form.rating),
      });

      await dispatch(loadDashboardData()).unwrap();
      closeModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to create supplier'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <>
        <PageHeader
          title="Supplier Management"
          subtitle="Manage supplier registration, ratings, contacts, and lead times."
        />
        <PermissionNotice message={permissionMessage('Suppliers', role)} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Supplier Management"
        subtitle="Manage supplier registration, ratings, contacts, and lead times."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            Add Supplier
          </PrimaryButton>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="h-36 rounded-lg border bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="mt-4 h-3 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          title="No suppliers registered"
          message="Add supplier records to track contacts, lead times, ratings, and product categories."
          actionLabel="Add Supplier"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <div className="font-semibold text-ink">{supplier.name}</div>
              <div className="mt-1 text-sm text-steel">
                {supplier.productCategory}
              </div>
              <div className="mt-4 text-sm font-medium text-ink">
                Rating {supplier.rating} / 5 · Lead time{' '}
                {supplier.averageLeadTimeDays} days
              </div>
              <div className="mt-2 text-sm text-steel">
                {supplier.contactPerson} · {supplier.email}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <ActionModal
          title="Add supplier"
          description="Create a supplier record with contact details, category, lead time, and rating."
          onClose={closeModal}
          footer={
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                form="supplier-form"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Supplier'}
              </PrimaryButton>
            </div>
          }
        >
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Supplier name"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => updateForm('phone', event.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Contact person"
                value={form.contactPerson}
                onChange={(event) =>
                  updateForm('contactPerson', event.target.value)
                }
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Product category"
                value={form.productCategory}
                onChange={(event) =>
                  updateForm('productCategory', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Lead time days"
                type="number"
                min="1"
                value={form.averageLeadTimeDays}
                onChange={(event) =>
                  updateForm('averageLeadTimeDays', event.target.value)
                }
                required
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => updateForm('rating', event.target.value)}
                required
              />
            </div>
          </form>
        </ActionModal>
      )}
    </>
  );
}
// import { PageHeader } from '../components/PageHeader';
// import { useAppSelector } from '../hooks/useAppSelector';
// export function Profile(){ const user=useAppSelector(s=>s.auth.user); return <><PageHeader title="Profile Settings" subtitle="Account and role details for the current session."/><div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-lg font-semibold">{user?.fullName}</div><div className="mt-2 text-sm text-steel">{user?.email}</div><div className="mt-4 inline-flex rounded bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">{user?.role}</div></div></> }

import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ActionModal, Card, PrimaryButton, SecondaryButton } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

export function Profile() {
  const user = useAppSelector((state) => state.auth.user);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Profile Settings"
        subtitle="Account and role details for the current session."
        actions={<PrimaryButton onClick={() => setIsEditOpen(true)}>Edit Profile</PrimaryButton>}
      />

      <Card className="max-w-3xl p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">Signed in as</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{user?.fullName || 'Current User'}</h2>
            <p className="mt-2 text-sm text-steel">{user?.email || 'No email available'}</p>
          </div>
          <span className="inline-flex w-fit rounded-md border border-mint/20 bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">
            {user?.role || 'USER'}
          </span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">Account status</p>
            <p className="mt-1 text-sm font-medium text-ink">Active</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">Workspace</p>
            <p className="mt-1 text-sm font-medium text-ink">Smart Inventory Console</p>
          </div>
        </div>
      </Card>

      <ActionModal
        title="Edit profile"
        description="Profile editing is ready for API integration."
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        footer={<SecondaryButton onClick={() => setIsEditOpen(false)}>Close</SecondaryButton>}
      >
        {/* TODO: Connect this form to the profile update API when the backend endpoint is available. */}
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Full name
            <input
              value={user?.fullName || ''}
              readOnly
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-steel outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Email
            <input
              value={user?.email || ''}
              readOnly
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-steel outline-none"
            />
          </label>
        </div>
      </ActionModal>
    </>
  );
}

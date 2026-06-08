import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

export function Profile() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <>
      <PageHeader
        title="Profile Settings"
        subtitle="Account and role details for the current session."
      />

      <Card className="max-w-3xl p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">
              Signed in as
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {user?.fullName || 'Current User'}
            </h2>
            <p className="mt-2 text-sm text-steel">
              {user?.email || 'No email available'}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-md border border-mint/20 bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">
            {user?.role || 'USER'}
          </span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">
              Account status
            </p>
            <p className="mt-1 text-sm font-medium text-ink">Active</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel">
              Workspace
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              Smart Inventory Console
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
// import { PageHeader } from '../components/PageHeader';
// import { useAppSelector } from '../hooks/useAppSelector';
// export function Notifications(){ const notifications=useAppSelector(s=>s.data.notifications); return <><PageHeader title="Notifications" subtitle="Low-stock, procurement, and shipment alerts from RabbitMQ workflows."/><div className="space-y-3">{notifications.map(notification=><div key={notification.id} className="rounded-lg border bg-white p-4 shadow-sm"><div className="font-semibold text-ink">{notification.title}</div><div className="mt-1 text-sm text-steel">{notification.message}</div></div>)}</div></> }

import { PageHeader } from '../components/PageHeader';
import { Card, EmptyState } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

export function Notifications() {
  const notifications = useAppSelector((state) => state.data.notifications);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Low-stock, procurement, and shipment alerts from RabbitMQ workflows."
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Operational alerts will appear here when inventory thresholds, procurement workflows, or shipment updates emit events."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">{notification.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-steel">{notification.message}</p>
                </div>
                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-steel">
                  Alert
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Card, EmptyState, PrimaryButton } from '../components/ui';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loadDashboardData } from '../store/dataSlice';

export function Notifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.data.notifications);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const markAsRead = async (id: string) => {
    setSavingId(id);
    setError('');

    try {
      await api.patch(`/notifications/${id}/read`);
      await dispatch(loadDashboardData()).unwrap();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to mark notification as read'
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Low-stock, procurement, and shipment alerts."
      />

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Operational alerts will appear here when inventory thresholds, procurement workflows, or shipment updates emit events."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isRead = Boolean(notification.read_at);

            return (
              <Card
                key={notification.id}
                className={`p-4 ${
                  isRead ? 'bg-white' : 'border-mint/30 bg-mint/5'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">
                        {notification.title}
                      </h2>
                      <span
                        className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          isRead
                            ? 'bg-slate-100 text-steel'
                            : 'bg-mint/10 text-mint'
                        }`}
                      >
                        {isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-steel">
                      {notification.message}
                    </p>
                  </div>

                  {!isRead && (
                    <PrimaryButton
                      className="w-fit px-3 py-1.5"
                      disabled={savingId === notification.id}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {savingId === notification.id
                        ? 'Marking...'
                        : 'Mark as read'}
                    </PrimaryButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
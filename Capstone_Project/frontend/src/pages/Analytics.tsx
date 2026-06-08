import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Card, EmptyState, PermissionNotice } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';
import { canAccess, permissionMessage } from '../utils/permissions';

export function Analytics() {
  const role = useAppSelector((state) => state.auth.user?.role);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const allowed = canAccess(role, 'analytics');

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

    api
      .get('/analytics/stock-trends')
      .then((response) => {
        setTrends(response.data);
        setError('');
      })
      .catch(() => {
        setTrends([]);
        setError('Analytics data could not be loaded right now.');
      })
      .finally(() => setLoading(false));
  }, [allowed]);

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Charts-ready metrics for stock flow, suppliers, and demand forecasting."
      />

      {!allowed ? (
        <PermissionNotice message={permissionMessage('Analytics', role)} />
      ) : (
        <Card className="p-5">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-ink">Stock Movement</h2>
            <p className="text-sm text-steel">Inbound and outbound stock by reporting period.</p>
          </div>

          {loading ? (
            <div className="h-80 animate-pulse rounded-md bg-slate-100" />
          ) : error ? (
            <EmptyState title="Analytics unavailable" description={error} />
          ) : trends.length === 0 ? (
            <EmptyState
              title="No analytics data yet"
              description="Stock movement insights will appear once inventory, procurement, and shipment events are available."
            />
          ) : (
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stockIn" fill="#2f9e82" />
                  <Bar dataKey="stockOut" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

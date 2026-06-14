import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui';
import { useAppSelector } from '../hooks/useAppSelector';

type RevenueItem = {
  sku: string;
  itemName: string;
  revenue: number;
};

type AnalyticsDashboard = {
  revenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  topRevenueItems: RevenueItem[];
};

const initialAnalytics: AnalyticsDashboard = {
  revenue: 0,
  todayRevenue: 0,
  monthlyRevenue: 0,
  topRevenueItems: [],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export function Dashboard() {
  const data = useAppSelector((state) => state.data);
  const [analytics, setAnalytics] =
    useState<AnalyticsDashboard>(initialAnalytics);
  const [analyticsError, setAnalyticsError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/analytics/dashboard')
      .then((response) => {
        if (!active) return;

        setAnalytics({
          revenue: Number(response.data?.revenue || 0),
          todayRevenue: Number(response.data?.todayRevenue || 0),
          monthlyRevenue: Number(response.data?.monthlyRevenue || 0),
          topRevenueItems: response.data?.topRevenueItems || [],
        });
        setAnalyticsError('');
      })
      .catch(() => {
        if (!active) return;

        setAnalytics(initialAnalytics);
        setAnalyticsError('Revenue analytics could not be loaded right now.');
      });

    return () => {
      active = false;
    };
  }, []);

  const deliveredShipmentOrderIds = new Set(
    data.shipments
      .filter((shipment) => shipment.status === 'DELIVERED' && shipment.orderId)
      .map((shipment) => shipment.orderId)
  );
  const deliveredProcurementOrders = data.orders.filter(
    (order) =>
      order.status === 'COMPLETED' && deliveredShipmentOrderIds.has(order.id)
  );
  const expenseSummary = deliveredProcurementOrders.reduce(
    (total, order) => total + Number(order.unitCost || 0),
    0
  );
  const topProcuredSkus = Array.from(
    deliveredProcurementOrders.reduce((totals, order) => {
      const current = totals.get(order.sku) || {
        sku: order.sku,
        itemName: order.itemName,
        expense: 0,
      };

      totals.set(order.sku, {
        ...current,
        expense: current.expense + Number(order.unitCost || 0),
      });

      return totals;
    }, new Map<string, { sku: string; itemName: string; expense: number }>())
  )
    .map(([, item]) => item)
    .sort((a, b) => b.expense - a.expense)
    .slice(0, 5);

  const cards = [
    ['Inventory Items', data.inventory.length],
    ['Suppliers', data.suppliers.length],
    [
      'Open Orders',
      data.orders.filter((order) => order.status !== 'COMPLETED').length,
    ],
    ['Shipments', data.shipments.length],
    ['Revenue', formatCurrency(analytics.revenue)],
    ['Expense Summary', formatCurrency(expenseSummary)],
  ];

  const activitySummary = [
    {
      label: 'Pending Orders',
      value: data.orders.filter((order) => order.status === 'PENDING').length,
      detail: 'AWAITING APPROVAL',
      detailColor:
        data.orders.filter((order) => order.status === 'PENDING').length > 0
          ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Approved Orders',
      value: data.orders.filter((order) => order.status === 'APPROVED').length,
      detail: 'READY TO START',
      detailColor:
        data.orders.filter((order) => order.status === 'APPROVED').length > 0
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Low Stock Items',
      value: data.inventory.filter((item) => item.lowStock).length,
      detail: 'NEED ATTENTION',
      detailColor:
        data.inventory.filter((item) => item.lowStock).length > 0
          ? 'bg-rose-100 text-rose-700'
          : 'bg-slate-100 text-steel',
    },
    {
      label: 'Delivered Shipments',
      value: data.shipments.filter(
        (shipment) => shipment.status === 'DELIVERED'
      ).length,
      detail: 'COMPLETED DELIVERIES',
      detailColor:
        data.shipments.filter(
          (shipment) => shipment.status === 'DELIVERED'
        ).length > 0
          ? 'bg-sky-100 text-sky-700'
          : 'bg-slate-100 text-steel',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Operational command center for inventory and supply chain teams."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <Card key={label} className="p-5">
            <div className="text-sm font-medium text-steel">{label}</div>
            <div className="mt-3 text-4xl font-semibold text-ink">
              {value}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            Revenue Summary
          </h2>
          <p className="mt-1 text-sm text-steel">
            Net sales revenue after returned inventory adjustments.
          </p>
        </div>

        {analyticsError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {analyticsError}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">Today</div>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(analytics.todayRevenue)}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">This Month</div>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {formatCurrency(analytics.monthlyRevenue)}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-steel">Top SKUs</div>
              <div className="mt-3 max-h-24 space-y-2 overflow-y-auto pr-3">
                {analytics.topRevenueItems.length === 0 ? (
                  <div className="text-sm text-steel">No sales revenue yet.</div>
                ) : (
                  analytics.topRevenueItems.map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-ink">{item.sku}</div>
                        <div className="text-xs text-steel">{item.itemName}</div>
                      </div>
                      <div className="font-semibold text-ink">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            Expense Summary
          </h2>
          <p className="mt-1 text-sm text-steel">
            Total procurement cost for orders successfully delivered to inventory.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-steel">
              Delivered Procurement Cost
            </div>
            <div className="mt-3 text-2xl font-semibold text-ink">
              {formatCurrency(expenseSummary)}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-steel">
              Included Orders
            </div>
            <div className="mt-3 text-2xl font-semibold text-ink">
              {deliveredProcurementOrders.length}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-steel">
              Top Procured SKUs
            </div>
            <div className="mt-3 max-h-24 space-y-2 overflow-y-auto pr-4">
              {topProcuredSkus.length === 0 ? (
                <div className="text-sm text-steel">No delivered procurement yet.</div>
              ) : (
                topProcuredSkus.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-ink">{item.sku}</div>
                      <div className="text-xs text-steel">{item.itemName}</div>
                    </div>
                    <div className="font-semibold text-ink">
                      {formatCurrency(item.expense)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-ink">
            Activity Summary
          </h2>
          <p className="mt-1 text-sm text-steel">
            Current operational activity across procurement, stock, and shipments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activitySummary.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="text-sm font-medium text-steel">
                {item.label}
              </div>
              <div className="mt-3 text-3xl font-semibold text-ink">
                {item.value}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${item.detailColor}`}
                >
                  {item.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

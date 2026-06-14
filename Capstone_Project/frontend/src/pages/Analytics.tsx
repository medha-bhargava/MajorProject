import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Card, EmptyState, PermissionNotice } from '../components/ui';
import { canAccess, permissionMessage } from '../utils/permissions';
import { useAppSelector } from '../hooks/useAppSelector';
import type { InventoryItem, SalesRecord } from '../types';

type RankedMetric = {
  sku: string;
  value: number;
};

type InventoryHealthPoint = {
  name: string;
  value: number;
  fill: string;
};

const chartColors = {
  revenue: '#6f7fc8',
  sales: '#5b74b8',
  valuation: '#8a79b8',
  quantity: '#9a93b8',
  healthy: '#2f9e82',
  low: '#f59e0b',
  critical: '#dc2626',
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const topByValue = (items: RankedMetric[], limit = 10) =>
  [...items].sort((a, b) => b.value - a.value).slice(0, limit);

const aggregateBySku = (
  records: SalesRecord[],
  getValue: (record: SalesRecord) => number
) => {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    totals.set(record.sku, (totals.get(record.sku) || 0) + getValue(record));
  });

  return Array.from(totals, ([sku, value]) => ({ sku, value }));
};

function AnalyticsBarChart({
  data,
  dataKey,
  color,
  valueFormatter,
}: {
  data: RankedMetric[];
  dataKey: string;
  color: string;
  valueFormatter: (value: number) => string;
}) {
  return (
    <ResponsiveContainer>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 28, bottom: 8, left: 24 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          tickFormatter={(value) => formatNumber(Number(value))}
        />
        <YAxis
          dataKey="sku"
          type="category"
          width={96}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [valueFormatter(Number(value)), dataKey]}
          labelFormatter={(label) => `SKU: ${label}`}
        />
        <Bar dataKey="value" name={dataKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AnalyticsCard({
  title,
  description,
  emptyTitle,
  emptyDescription,
  children,
  hasData,
  className = '',
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
  hasData: boolean;
  className?: string;
}) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-steel">{description}</p>
      </div>

      {hasData ? (
        <div className="h-80">{children}</div>
      ) : (
        <div className="grid h-80 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
          <div>
            <h3 className="text-base font-semibold text-ink">{emptyTitle}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-steel">
              {emptyDescription}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function Analytics() {
  const role = useAppSelector((state) => state.auth.user?.role);
  const allowed = canAccess(role, 'analytics');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      api.get('/sales'),
      api.get('/inventory', { params: { size: 1000 } }),
    ])
      .then(([salesResponse, inventoryResponse]) => {
        setSales(salesResponse.data?.content || salesResponse.data || []);
        setInventory(
          inventoryResponse.data?.content || inventoryResponse.data || []
        );
        setError('');
      })
      .catch(() => {
        setSales([]);
        setInventory([]);
        setError('Analytics data could not be loaded right now.');
      })
      .finally(() => setLoading(false));
  }, [allowed]);

  const soldRecords = useMemo(
    () => sales.filter((record) => record.status === 'SOLD'),
    [sales]
  );

  const topSellingProducts = useMemo(
    () =>
      topByValue(
        aggregateBySku(soldRecords, (record) => Number(record.quantity || 0))
      ),
    [soldRecords]
  );

  const revenueBySku = useMemo(
    () =>
      topByValue(
        aggregateBySku(sales, (record) => {
          const revenue =
            Number(record.quantity || 0) * Number(record.unitCost || 0);
          return record.status === 'RETURNED' ? -revenue : revenue;
        })
      ),
    [sales]
  );

  const inventoryByQuantity = useMemo(
    () =>
      topByValue(
        inventory.map((item) => ({
          sku: item.sku,
          value: Number(item.quantity || 0),
        }))
      ),
    [inventory]
  );

  const inventoryByValuation = useMemo(
    () =>
      topByValue(
        inventory.map((item) => ({
          sku: item.sku,
          value:
            Number(item.valuation) ||
            Number(item.quantity || 0) * Number(item.unitCost || 0),
        }))
      ),
    [inventory]
  );

  const inventoryHealth = useMemo<InventoryHealthPoint[]>(() => {
    const counts = inventory.reduce(
      (current, item) => {
        const quantity = Number(item.quantity || 0);
        const threshold = Number(item.lowStockThreshold || 0);
        const criticalLimit = Math.max(1, Math.floor(threshold * 0.25));

        if (quantity <= criticalLimit) {
          current.critical += 1;
        } else if (quantity <= threshold) {
          current.low += 1;
        } else {
          current.healthy += 1;
        }

        return current;
      },
      { healthy: 0, low: 0, critical: 0 }
    );

    return [
      { name: 'Healthy Stock', value: counts.healthy, fill: chartColors.healthy },
      { name: 'Low Stock', value: counts.low, fill: chartColors.low },
      { name: 'Critical Stock', value: counts.critical, fill: chartColors.critical },
    ].filter((point) => point.value > 0);
  }, [inventory]);

  const totalInventoryItems = inventory.length;

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Business insights for sales performance, inventory risk, and inventory value."
      />

      {!allowed ? (
        <PermissionNotice message={permissionMessage('Analytics', role)} />
      ) : loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((card) => (
            <Card key={card} className="p-5">
              <div className="h-4 w-44 rounded bg-gray-200" />
              <div className="mt-4 h-80 rounded-md bg-slate-100" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Analytics unavailable" description={error} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <AnalyticsCard
              title="Inventory Health"
              description="Distribution of current inventory risk by threshold."
              emptyTitle="No inventory health data"
              emptyDescription="Inventory health will appear once inventory items are available."
              hasData={inventoryHealth.length > 0}
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={inventoryHealth}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={2}
                    label={({ value }) => {
                      const percent = totalInventoryItems
                        ? Math.round((Number(value) / totalInventoryItems) * 100)
                        : 0;
                      return `${percent}%`;
                    }}
                  >
                    {inventoryHealth.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(Number(value))} SKUs`,
                      'Count',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </AnalyticsCard>

            <AnalyticsCard
              title="Revenue by SKU"
              description="Top revenue-generating SKUs after return adjustments."
              emptyTitle="No revenue data yet"
              emptyDescription="Revenue analytics will appear once sales or returns are recorded."
              hasData={revenueBySku.length > 0}
            >
              <AnalyticsBarChart
                data={revenueBySku}
                dataKey="Revenue"
                color={chartColors.revenue}
                valueFormatter={formatCurrency}
              />
            </AnalyticsCard>
          </div>

          <AnalyticsCard
            title="Top Selling Products"
            description="Fastest-moving SKUs based on total SOLD quantity."
            emptyTitle="No sold products yet"
            emptyDescription="Top selling products will appear once SOLD sales records are available."
            hasData={topSellingProducts.length > 0}
          >
            <AnalyticsBarChart
              data={topSellingProducts}
              dataKey="Quantity Sold"
              color={chartColors.sales}
              valueFormatter={(value) => `${formatNumber(value)} units`}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Top SKUs by Inventory Valuation"
            description="Highest inventory investment by current stock value."
            emptyTitle="No valuation data"
            emptyDescription="Inventory valuation will appear once inventory items are available."
            hasData={inventoryByValuation.length > 0}
          >
            <AnalyticsBarChart
              data={inventoryByValuation}
              dataKey="Inventory Valuation"
              color={chartColors.valuation}
              valueFormatter={formatCurrency}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Top SKUs by Inventory Quantity"
            description="Most heavily stocked SKUs by current quantity on hand."
            emptyTitle="No inventory quantity data"
            emptyDescription="Inventory quantity analytics will appear once inventory items are available."
            hasData={inventoryByQuantity.length > 0}
          >
            <AnalyticsBarChart
              data={inventoryByQuantity}
              dataKey="Inventory Quantity"
              color={chartColors.quantity}
              valueFormatter={(value) => `${formatNumber(value)} units`}
            />
          </AnalyticsCard>
        </div>
      )}
    </>
  );
}

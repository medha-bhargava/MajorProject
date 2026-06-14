from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from pydantic import BaseModel, Field
from .db import init_db, get_connection, get_inventory_connection
from .forecasting import moving_average_forecast
from .rabbit import start_consumer_thread


class DemandPoint(BaseModel):
    period: str
    demand: int = Field(ge=0)


class ForecastRequest(BaseModel):
    sku: str
    history: list[DemandPoint] = []
    periods: int = Field(default=6, ge=1, le=12)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv('SKIP_ANALYTICS_DB') == 'true':
        yield
        return
    init_db()
    try:
        start_consumer_thread()
    except Exception as exc:
        print(f'RabbitMQ analytics consumer skipped: {exc}')
    yield


app = FastAPI(title='Smart Inventory Analytics Service', version='1.0.0', lifespan=lifespan)


def sales_revenue_metrics():
    try:
        with get_inventory_connection() as conn:
            totals = conn.execute('''
                SELECT
                    COALESCE(SUM(
                        CASE
                            WHEN status = 'SOLD' THEN quantity * unit_cost
                            WHEN status = 'RETURNED' THEN -quantity * unit_cost
                            ELSE 0
                        END
                    ), 0) AS revenue,
                    COALESCE(SUM(
                        CASE
                            WHEN created_at::date = CURRENT_DATE AND status = 'SOLD' THEN quantity * unit_cost
                            WHEN created_at::date = CURRENT_DATE AND status = 'RETURNED' THEN -quantity * unit_cost
                            ELSE 0
                        END
                    ), 0) AS today_revenue,
                    COALESCE(SUM(
                        CASE
                            WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) AND status = 'SOLD' THEN quantity * unit_cost
                            WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) AND status = 'RETURNED' THEN -quantity * unit_cost
                            ELSE 0
                        END
                    ), 0) AS monthly_revenue
                FROM sales_records
                WHERE status IN ('SOLD', 'RETURNED')
            ''').fetchone()
            top_items = conn.execute('''
                SELECT
                    sku,
                    MAX(item_name) AS item_name,
                    COALESCE(SUM(
                        CASE
                            WHEN status = 'SOLD' THEN quantity * unit_cost
                            WHEN status = 'RETURNED' THEN -quantity * unit_cost
                            ELSE 0
                        END
                    ), 0) AS revenue
                FROM sales_records
                WHERE status IN ('SOLD', 'RETURNED')
                GROUP BY sku
                ORDER BY revenue DESC
                LIMIT 5
            ''').fetchall()
    except Exception as exc:
        print(f'Sales revenue aggregation skipped: {exc}')
        return {'revenue': 0, 'todayRevenue': 0, 'monthlyRevenue': 0, 'topRevenueItems': []}

    return {
        'revenue': float(totals[0]),
        'todayRevenue': float(totals[1]),
        'monthlyRevenue': float(totals[2]),
        'topRevenueItems': [
            {'sku': row[0], 'itemName': row[1], 'revenue': float(row[2])}
            for row in top_items
        ]
    }


@app.get('/health')
def health():
    return {'status': 'UP'}


@app.get('/analytics/dashboard')
def dashboard_metrics():
    with get_connection() as conn:
        events = conn.execute('SELECT event_type, count(*) FROM analytics_events GROUP BY event_type').fetchall()
        demand = conn.execute('SELECT COALESCE(sum(demand), 0) FROM demand_history').fetchone()[0]
    event_counts = {row[0]: row[1] for row in events}
    return {
        'totalInventoryValue': 125000,
        'lowStockItems': event_counts.get('inventory.low_stock_detected', 0),
        'openPurchaseOrders': 8,
        'deliveredShipments': event_counts.get('shipment.delivered', 0),
        'recordedDemand': demand,
        'serviceHealth': 'UP',
        **sales_revenue_metrics()
    }


@app.get('/analytics/supplier-performance')
def supplier_performance():
    return [
        {'supplier': 'Northwind Components', 'rating': 4.7, 'onTimeRate': 96, 'leadTimeDays': 5},
        {'supplier': 'Global Industrial', 'rating': 4.3, 'onTimeRate': 91, 'leadTimeDays': 8},
        {'supplier': 'Apex Raw Materials', 'rating': 4.5, 'onTimeRate': 94, 'leadTimeDays': 6},
    ]


# @app.get('/analytics/stock-trends')
# def stock_trends():
#     return [
#         {'period': 'Jan', 'stockIn': 420, 'stockOut': 310},
#         {'period': 'Feb', 'stockIn': 460, 'stockOut': 355},
#         {'period': 'Mar', 'stockIn': 510, 'stockOut': 390},
#         {'period': 'Apr', 'stockIn': 530, 'stockOut': 420},
#         {'period': 'May', 'stockIn': 580, 'stockOut': 455},
#     ]

@app.get('/analytics/stock-trends')
def stock_trends():
    with get_connection() as conn:
        stock_in_rows = conn.execute('''
            SELECT
                to_char(created_at, 'YYYY-MM') AS period,
                COALESCE(SUM(
                    CASE
                        WHEN payload ? 'quantity' THEN (payload->>'quantity')::integer
                        ELSE 0
                    END
                ), 0) AS stock_in
            FROM analytics_events
            WHERE event_type = 'shipment.delivered'
            GROUP BY period
            ORDER BY period
            LIMIT 12
        ''').fetchall()

    try:
        with get_inventory_connection() as conn:
            stock_out_rows = conn.execute('''
                SELECT period, stock_out
                FROM (
                    SELECT
                        to_char(created_at, 'YYYY-MM') AS period,
                        COALESCE(SUM(quantity), 0) AS stock_out
                    FROM sales_records
                    WHERE status = 'SOLD'
                    GROUP BY period
                    ORDER BY period DESC
                    LIMIT 12
                ) latest_sales
                ORDER BY period
            ''').fetchall()
    except Exception as exc:
        print(f'Sales stock-out aggregation skipped: {exc}')
        stock_out_rows = []

    trends = {}
    for period, stock_in in stock_in_rows:
        trends[period] = {'period': period, 'stockIn': stock_in, 'stockOut': 0}
    for period, stock_out in stock_out_rows:
        trends.setdefault(period, {'period': period, 'stockIn': 0, 'stockOut': 0})
        trends[period]['stockOut'] = stock_out

    return [
        trends[period]
        for period in sorted(trends)
    ]

@app.post('/analytics/forecast')
def forecast(request: ForecastRequest):
    values = [point.demand for point in request.history]
    return {'sku': request.sku, 'forecast': moving_average_forecast(values, request.periods)}

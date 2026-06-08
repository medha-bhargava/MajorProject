from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from pydantic import BaseModel, Field
from .db import init_db, get_connection
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
        'serviceHealth': 'UP'
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
        rows = conn.execute('''
            SELECT
                period,
                COALESCE(SUM(demand), 0) AS stock_in
            FROM demand_history
            GROUP BY period
            ORDER BY period
            LIMIT 12
        ''').fetchall()

    return [
        {
            'period': row[0],
            'stockIn': row[1],
            'stockOut': 0
        }
        for row in rows
    ]

@app.post('/analytics/forecast')
def forecast(request: ForecastRequest):
    values = [point.demand for point in request.history]
    return {'sku': request.sku, 'forecast': moving_average_forecast(values, request.periods)}

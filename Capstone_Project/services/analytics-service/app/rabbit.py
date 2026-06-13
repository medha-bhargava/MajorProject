import json
import os
import threading
import pika
from .db import get_connection
from datetime import datetime, timezone

EXCHANGE = 'smart.inventory.events'
BINDINGS = [
    ('analytics.shipments', 'shipment.delivered'),
    ('analytics.suppliers', 'supplier.created'),
    ('analytics.procurement', 'procurement.completed'),
]


# def persist_event(event_type: str, payload: dict):
#     with get_connection() as conn:
#         # conn.execute('INSERT INTO analytics_events(event_type, payload) VALUES (%s, %s::jsonb)', (event_type, json.dumps(payload)))
#         period = datetime.now(timezone.utc).strftime('%Y-%m')
#         conn.execute(
#             'INSERT INTO demand_history(sku, period, demand) VALUES (%s, %s, %s)',
#             (payload['sku'], period, int(payload['quantity']))
#         )
#         if event_type == 'procurement.completed' and payload.get('sku') and payload.get('quantity'):
#             conn.execute('INSERT INTO demand_history(sku, period, demand) VALUES (%s, %s, %s)', (payload['sku'], 'current', int(payload['quantity'])))
#         conn.commit()

def persist_event(event_type: str, payload: dict):
    with get_connection() as conn:
        conn.execute(
            'INSERT INTO analytics_events(event_type, payload) VALUES (%s, %s::jsonb)',
            (event_type, json.dumps(payload))
        )

        if event_type in ('procurement.completed', 'shipment.delivered') and payload.get('sku') and payload.get('quantity'):
            period = datetime.now(timezone.utc).strftime('%Y-%m')
            conn.execute(
                'INSERT INTO demand_history(sku, period, demand) VALUES (%s, %s, %s)',
                (payload['sku'], period, int(payload['quantity']))
            )

        conn.commit()


def start_consumers():
    url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')
    connection = pika.BlockingConnection(pika.URLParameters(url))
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type='topic', durable=True)
    for queue, key in BINDINGS:
        channel.queue_declare(queue=queue, durable=True)
        channel.queue_bind(queue=queue, exchange=EXCHANGE, routing_key=key)

    def callback(ch, method, _properties, body):
        try:
            persist_event(method.routing_key, json.loads(body.decode('utf-8')))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    for queue, _key in BINDINGS:
        channel.basic_consume(queue=queue, on_message_callback=callback)
    channel.start_consuming()


def start_consumer_thread():
    thread = threading.Thread(target=start_consumers, daemon=True)
    thread.start()
    return thread


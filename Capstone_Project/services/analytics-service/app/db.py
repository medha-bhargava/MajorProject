import os
import psycopg

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://smart:smart@localhost:5432/analytics_db')
INVENTORY_DATABASE_URL = os.getenv('INVENTORY_DATABASE_URL', 'postgresql://smart:smart@localhost:5432/inventory_db')


def get_connection():
    return psycopg.connect(DATABASE_URL)


def get_inventory_connection():
    return psycopg.connect(INVENTORY_DATABASE_URL)


def init_db():
    with get_connection() as conn:
        conn.execute('CREATE EXTENSION IF NOT EXISTS pgcrypto')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS analytics_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_type VARCHAR(120) NOT NULL,
                payload JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS demand_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                sku VARCHAR(120) NOT NULL,
                period VARCHAR(40) NOT NULL,
                demand INTEGER NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        ''')
        conn.commit()

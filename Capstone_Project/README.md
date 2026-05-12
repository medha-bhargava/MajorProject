# Smart Inventory And Supply Chain Management System

Production-grade capstone monorepo demonstrating a microservices-based inventory and supply chain platform.

## Architecture

- React + TypeScript + Vite frontend
- Spring Cloud Gateway API gateway
- Spring Boot services for auth, users, inventory, suppliers, orders/procurement, and shipments
- Node.js notification service with RabbitMQ consumers
- Python FastAPI analytics and forecasting service
- PostgreSQL database ownership per service
- RabbitMQ event-driven workflows
- Docker Compose local runtime

## Services

| Service | Port | Responsibility |
| --- | ---: | --- |
| Frontend | 5173 | Enterprise dashboard UI |
| API Gateway | 8080 | Routing, CORS, JWT validation |
| Auth Service | 8081 | Signup, login, JWT, refresh tokens, roles |
| User Service | 8082 | Profiles, employees, warehouse assignments |
| Inventory Service | 8083 | Stock, items, movements, low-stock events |
| Order Service | 8084 | Purchase requests, approvals, GRN, lifecycle |
| Procurement Service | 8087 | Procurement workflow metadata and process contract |
| Supplier Service | 8085 | Supplier registration, ratings, product mapping |
| Shipment Service | 8086 | Shipment tracking and delivery lifecycle |
| Notification Service | 3001 | Event consumers and notification APIs |
| Analytics Service | 8000 | Metrics, trends, demand forecasting |

## Quick Start

1. Copy environment defaults:

   ```bash
   cp .env.example .env
   ```

2. Start the stack:

   ```bash
   docker-compose up --build
   ```

3. Open:

   - Frontend: http://localhost:5173
   - Gateway: http://localhost:8080
   - RabbitMQ management: http://localhost:15673 (guest / guest)

## Default API Flow

1. Register or login through `/api/auth`.
2. Send the returned JWT as `Authorization: Bearer <token>`.
3. Use gateway routes only from clients; services remain internal in Docker.
4. Inventory, supplier, order, and shipment events publish to RabbitMQ.
5. Notification and analytics services consume relevant events asynchronously.

## Swagger / OpenAPI

Each Spring service exposes Swagger UI at `/swagger-ui.html` on its service port. FastAPI exposes docs at `/docs`.

## Representative Workflows

- Low stock: inventory quantity update below threshold publishes `inventory.low_stock_detected`; notification service stores an alert.
- Procurement completion: order completion publishes `procurement.completed`; inventory service records inbound stock movement.
- Shipment delivery: shipment delivery publishes `shipment.delivered`; analytics service records the event.
- Supplier onboarding: supplier creation publishes `supplier.created`; analytics service syncs supplier performance seed data.

## Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Java service example:

```bash
cd services/inventory-service
mvn test
mvn spring-boot:run
```

Node notification service:

```bash
cd services/notification-service
npm install
npm test
npm run dev
```

Python analytics service:

```bash
cd services/analytics-service
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload
```

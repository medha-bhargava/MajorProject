# Smart Inventory And Supply Chain Management System Design

## Architecture Overview

The platform uses independently deployable services coordinated through a Spring Cloud Gateway. Synchronous client traffic enters through REST APIs. Cross-service operational events use RabbitMQ so alerts and analytics updates do not block transactional workflows.

## Service Ownership

| Service | Database | Primary ownership |
| --- | --- | --- |
| auth-service | auth_db | Credentials, roles, JWT, refresh tokens |
| user-service | user_db | Profiles, employees, warehouse assignments |
| inventory-service | inventory_db | Items, quantities, movements, valuation |
| order-service | order_db | Purchase orders, approvals, GRN completion |
| procurement-service | procurement_db | Workflow metadata and procurement process contract |
| supplier-service | supplier_db | Supplier records, ratings, lead times |
| shipment-service | shipment_db | Shipment lifecycle and transfers |
| notification-service | notification_db | Alert history and outbound email adapter |
| analytics-service | analytics_db | Event analytics, trends, forecasting inputs |

## Communication

- Frontend calls only the gateway using `/api/**` routes.
- Gateway validates JWTs and forwards identity headers to downstream services.
- Services publish business events to `smart.inventory.events`.
- Notification and analytics services consume events asynchronously.

## Security

- Auth service hashes passwords with BCrypt.
- Access tokens are signed JWTs with role and user id claims.
- Gateway rejects protected requests without a valid bearer token.
- Services keep endpoint-level security permissive for local MVP deployment while relying on gateway-fronted traffic in Docker.

## Event Workflows

- `inventory.low_stock_detected`: emitted when stock is at or below threshold; notification service stores and emails the alert.
- `procurement.completed`: emitted when purchase order is completed; inventory service increments item quantity by SKU and analytics stores demand history.
- `shipment.delivered`: emitted after delivery; analytics records shipment performance and notification service creates an alert.
- `supplier.created`: emitted on supplier onboarding; analytics records supplier onboarding for reporting.

## Deployment

Run the full system with `docker-compose up --build` from the monorepo root. PostgreSQL initializes all service databases from `infra/scripts/init-databases.sql`.


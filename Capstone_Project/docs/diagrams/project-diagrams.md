# Smart Inventory Management System Diagrams

These diagrams reflect the current implementation in the repository. Dashed lines represent logical or event-driven relationships rather than database foreign keys.

## 1. System Architecture

```mermaid
flowchart LR
  Browser["Browser"]
  Frontend["React + Vite Frontend<br/>localhost:5173"]
  Gateway["Spring Cloud API Gateway<br/>localhost:8080"]

  Browser --> Frontend
  Frontend -->|REST /api/* with JWT| Gateway

  subgraph Services["Backend Services"]
    Auth["Auth Service<br/>8081"]
    Users["User Service<br/>8082"]
    Inventory["Inventory Service<br/>8083<br/>Inventory + Sales"]
    Orders["Order Service<br/>8084<br/>Procurement order owner"]
    Suppliers["Supplier Service<br/>8085"]
    Shipments["Shipment Service<br/>8086"]
    Procurement["Procurement Service<br/>8087<br/>Workflow reference only"]
    Notifications["Notification Service<br/>3001"]
    Analytics["Analytics Service<br/>8000"]
  end

  Gateway -->|/api/auth| Auth
  Gateway -->|/api/users| Users
  Gateway -->|/api/inventory and /api/sales| Inventory
  Gateway -->|/api/orders| Orders
  Gateway -->|/api/suppliers| Suppliers
  Gateway -->|/api/shipments| Shipments
  Gateway -->|/api/procurements/workflow| Procurement
  Gateway -->|/api/notifications| Notifications
  Gateway -->|/api/analytics| Analytics

  subgraph Data["PostgreSQL Server"]
    AuthDB[("auth_db")]
    UserDB[("user_db")]
    InventoryDB[("inventory_db")]
    OrderDB[("order_db")]
    SupplierDB[("supplier_db")]
    ShipmentDB[("shipment_db")]
    NotificationDB[("notification_db")]
    AnalyticsDB[("analytics_db")]
    ProcurementDB[("procurement_db<br/>provisioned, currently unused")]
  end

  Auth --> AuthDB
  Users --> UserDB
  Inventory --> InventoryDB
  Orders --> OrderDB
  Suppliers --> SupplierDB
  Shipments --> ShipmentDB
  Notifications --> NotificationDB
  Analytics --> AnalyticsDB
  Analytics -.->|Revenue and stock-out queries<br/>sales_records| InventoryDB
  Procurement -.-> ProcurementDB

  Rabbit[("RabbitMQ<br/>smart.inventory.events")]
  Inventory -->|inventory.low_stock_detected| Rabbit
  Orders -->|procurement.approved<br/>procurement.completed| Rabbit
  Suppliers -->|supplier.created| Rabbit
  Shipments -->|shipment.delivered| Rabbit

  Rabbit -->|low stock, procurement.*, delivered| Notifications
  Rabbit -->|supplier.created,<br/>procurement.completed,<br/>shipment.delivered| Analytics
  Rabbit -->|shipment.delivered| Inventory
```

## 2. Use Case Diagram

Mermaid does not provide a dedicated UML use-case syntax, so this diagram uses a flowchart with actor-to-use-case associations.

```mermaid
flowchart LR
  Admin["Admin"]
  Warehouse["Warehouse Manager"]
  ProcurementManager["Procurement Manager"]
  SupplierActor["Supplier"]

  subgraph System["Smart Inventory Management System"]
    Login(["Login / Register"])
    InventoryUC(["Manage Inventory"])
    SupplierUC(["Manage Suppliers"])
    OrdersUC(["Manage Procurement Orders"])
    ShipmentsUC(["Manage Shipments"])
    SalesUC(["Manage Sales Records"])
    NotificationsUC(["View Notifications"])
    AnalyticsUC(["View Analytics"])
    ProfileUC(["View Session Profile"])
    SupplierOrdersUC(["View Procurement Orders"])
    SupplierShipmentsUC(["View Shipments"])
  end

  Admin --> Login
  Admin --> InventoryUC
  Admin --> SupplierUC
  Admin --> OrdersUC
  Admin --> ShipmentsUC
  Admin --> SalesUC
  Admin --> NotificationsUC
  Admin --> AnalyticsUC
  Admin --> ProfileUC

  Warehouse --> Login
  Warehouse --> InventoryUC
  Warehouse --> ShipmentsUC
  Warehouse --> SalesUC
  Warehouse --> NotificationsUC
  Warehouse --> ProfileUC

  ProcurementManager --> Login
  ProcurementManager --> SupplierUC
  ProcurementManager --> OrdersUC
  ProcurementManager --> NotificationsUC
  ProcurementManager --> ProfileUC

  SupplierActor --> Login
  SupplierActor --> SupplierOrdersUC
  SupplierActor --> SupplierShipmentsUC
  SupplierActor --> NotificationsUC
  SupplierActor --> ProfileUC
```

> Current limitation: the Profile page displays account and role information from the authenticated session. Profile editing is not implemented in the frontend.

## 3. Entity-Relationship Diagram

Relationships marked as logical are application-level links across services or scalar identifiers, not enforced cross-database foreign keys.

```mermaid
erDiagram
  APP_USERS ||--o{ REFRESH_TOKENS : "owns (FK)"
  INVENTORY_ITEMS ||--o{ STOCK_MOVEMENTS : "itemId logical link"
  INVENTORY_ITEMS ||--o{ SALES_RECORDS : "SKU logical link"
  SUPPLIERS ||--o{ PURCHASE_ORDERS : "supplierId cross-DB link"
  PURCHASE_ORDERS ||--o{ SHIPMENTS : "orderId cross-DB link"
  SYSTEM_EVENTS ||--o{ NOTIFICATIONS : "produces"
  SYSTEM_EVENTS ||--o{ ANALYTICS_EVENTS : "captured as"
  ANALYTICS_EVENTS ||--o{ DEMAND_HISTORY : "may contribute"

  APP_USERS {
    uuid id PK
    string full_name
    string email UK
    string password_hash
    string role
    boolean active
    datetime created_at
  }

  REFRESH_TOKENS {
    uuid id PK
    string token UK
    uuid user_id FK
    datetime expires_at
    boolean revoked
  }

  USER_PROFILES {
    uuid id PK
    string email UK
    string full_name
    string role
    string phone
    string warehouse_code
    string job_title
    datetime created_at
  }

  INVENTORY_ITEMS {
    uuid id PK
    string sku
    string name
    string category
    string warehouse_code
    int quantity
    int low_stock_threshold
    decimal unit_cost
    datetime updated_at
  }

  STOCK_MOVEMENTS {
    uuid id PK
    uuid item_id
    int quantity_delta
    string reason
    datetime created_at
  }

  SALES_RECORDS {
    uuid id PK
    string sku
    string item_name
    int quantity
    decimal unit_cost
    string status
    datetime created_at
  }

  SUPPLIERS {
    uuid id PK
    string name
    string email UK
    string phone
    string contact_person
    string product_category
    int average_lead_time_days
    decimal rating
    datetime created_at
  }

  PURCHASE_ORDERS {
    uuid id PK
    string sku
    string item_name
    int quantity
    uuid supplier_id
    string requested_by
    string status
    decimal unit_cost
    string approver
    datetime approved_at
    datetime completed_at
    datetime created_at
  }

  SHIPMENTS {
    uuid id PK
    string tracking_number
    string carrier
    string origin_warehouse
    string destination_warehouse
    string sku
    int quantity
    uuid order_id
    string status
    datetime shipped_at
    datetime delivered_at
    datetime created_at
  }

  NOTIFICATIONS {
    uuid id PK
    string type
    string title
    string message
    json payload
    datetime read_at
    datetime created_at
  }

  ANALYTICS_EVENTS {
    uuid id PK
    string event_type
    json payload
    datetime created_at
  }

  DEMAND_HISTORY {
    uuid id PK
    string sku
    string period
    int demand
    datetime created_at
  }

  SYSTEM_EVENTS {
    string routing_key
    json payload
  }
```

> `SYSTEM_EVENTS` is a conceptual RabbitMQ event source, not a PostgreSQL table. `user_profiles` is separate from `app_users`; the current frontend Profile page reads the authenticated session rather than this table.

## 4. Sequence Diagram: Login Flow

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as React Frontend
  participant GW as API Gateway
  participant Auth as Auth Service
  participant DB as auth_db

  User->>UI: Enter email and password
  UI->>GW: POST /api/auth/login
  GW->>Auth: POST /auth/login
  Auth->>DB: Find app_users row by email
  DB-->>Auth: User, password hash, role, active flag
  Auth->>Auth: Verify active account and password hash

  alt Valid credentials
    Auth->>Auth: Generate signed access JWT
    Auth->>DB: Insert refresh_tokens row
    Auth-->>GW: User details + accessToken + refreshToken
    GW-->>UI: Authentication response
    UI->>UI: Store response in smartInventoryAuth localStorage
    UI->>UI: Update Redux authentication state
    UI-->>User: Navigate to Dashboard (/)
  else Invalid credentials
    Auth-->>GW: Authentication error
    GW-->>UI: Error response
    UI-->>User: Display login failure
  end

  Note over UI,GW: Later API requests include Authorization: Bearer accessToken
```

## 5. Sequence Diagram: Sales Flow

```mermaid
sequenceDiagram
  autonumber
  actor User as Admin
  participant UI as React Frontend
  participant GW as API Gateway
  participant INV as Inventory Service
  participant DB as inventory_db
  participant MQ as RabbitMQ
  participant NOTIF as Notification Service
  participant ANA as Analytics Service

  User->>UI: Submit SOLD or RETURNED record
  UI->>GW: POST /api/sales
  GW->>INV: POST /sales
  INV->>DB: Find inventory_items by SKU
  DB-->>INV: Matching inventory item

  alt SKU does not exist
    INV-->>UI: Error: inventory item not found
  else SOLD exceeds available quantity
    INV-->>UI: Error: insufficient inventory
  else Valid sales record
    INV->>INV: Calculate delta<br/>SOLD = -quantity<br/>RETURNED = +quantity
    INV->>DB: Update inventory_items quantity
    INV->>DB: Insert stock_movements
    INV->>DB: Insert sales_records

    opt Updated quantity is at or below threshold
      INV->>MQ: Publish inventory.low_stock_detected
      MQ-->>NOTIF: Persist low-stock notification
    end

    INV-->>GW: Saved SalesRecordResponse
    GW-->>UI: Sales record created
    UI->>GW: GET /api/sales
    UI->>GW: Reload dashboard data APIs
    UI-->>User: Updated Sales, Inventory, and Dashboard views

    Note over ANA,DB: Revenue and stock-out analytics query persisted sales_records directly
    UI->>GW: GET analytics data or load Analytics page
    GW->>ANA: Analytics request
    ANA->>DB: Aggregate SOLD and RETURNED sales_records
    ANA-->>UI: Updated revenue / stock-out metrics
  end
```

## 6. Sequence Diagram: Procurement to Shipment Flow

```mermaid
sequenceDiagram
  autonumber
  actor PM as Procurement Manager
  actor WM as Warehouse Manager
  participant UI as React Frontend
  participant GW as API Gateway
  participant ORD as Order Service
  participant ODB as order_db
  participant SHIP as Shipment Service
  participant SDB as shipment_db
  participant MQ as RabbitMQ
  participant INV as Inventory Service
  participant IDB as inventory_db
  participant NOTIF as Notification Service
  participant ANA as Analytics Service

  PM->>UI: Create procurement order
  UI->>GW: POST /api/orders
  GW->>ORD: POST /orders
  ORD->>ODB: Insert purchase_orders as PENDING
  ORD-->>UI: Created order

  PM->>UI: Approve order
  UI->>GW: POST /api/orders/{id}/approve
  GW->>ORD: Approve order
  ORD->>ODB: PENDING to APPROVED
  ORD->>MQ: Publish procurement.approved
  MQ-->>NOTIF: Store approval notification

  PM->>UI: Start fulfillment
  UI->>GW: POST /api/orders/{id}/start
  GW->>ORD: Start order
  ORD->>ODB: APPROVED to IN_PROGRESS
  Note over ORD,MQ: No event is published for IN_PROGRESS

  PM->>UI: Complete procurement
  UI->>GW: POST /api/orders/{id}/complete
  GW->>ORD: Complete order
  ORD->>ODB: IN_PROGRESS to COMPLETED
  ORD->>MQ: Publish procurement.completed
  MQ-->>NOTIF: Store completion notification
  MQ-->>ANA: Persist analytics event and demand history
  Note over INV,IDB: Procurement completion does not update inventory

  PM->>UI: Create shipment for completed order
  UI->>GW: POST /api/shipments with orderId, SKU, quantity
  GW->>SHIP: POST /shipments
  SHIP->>SDB: Insert shipment as CREATED
  SHIP-->>UI: Shipment created
  Note over SHIP,MQ: Shipment creation does not publish an event

  WM->>UI: Mark shipment IN_TRANSIT
  UI->>GW: POST /api/shipments/{id}/in-transit
  GW->>SHIP: Update shipment
  SHIP->>SDB: CREATED to IN_TRANSIT, set shippedAt
  Note over SHIP,MQ: IN_TRANSIT does not publish an event

  alt Shipment is delivered
    WM->>UI: Mark shipment DELIVERED
    UI->>GW: POST /api/shipments/{id}/delivered
    GW->>SHIP: Update shipment
    SHIP->>SDB: IN_TRANSIT to DELIVERED, set deliveredAt
    SHIP->>MQ: Publish shipment.delivered
    par Inventory consumer
      MQ-->>INV: shipment.delivered
      INV->>IDB: Increase matching SKU quantity
      INV->>IDB: Insert SHIPMENT_DELIVERED stock movement
    and Notification consumer
      MQ-->>NOTIF: Store delivered notification
    and Analytics consumer
      MQ-->>ANA: Persist event and demand history
    end
    UI->>GW: Refresh dashboard data
    UI-->>WM: Show delivered shipment and updated inventory
  else Shipment is cancelled
    WM->>UI: Cancel shipment
    UI->>GW: POST /api/shipments/{id}/cancel
    GW->>SHIP: Update shipment
    SHIP->>SDB: CREATED or IN_TRANSIT to CANCELLED
    Note over SHIP,MQ: CANCELLED does not publish an event
    UI-->>PM: Procurement page allows replacement shipment
  end
```

## 7. Activity Diagram: Inventory Replenishment Lifecycle

```mermaid
flowchart TD
  Start([Inventory quantity added or adjusted])
  Check{Quantity <= low-stock threshold?}
  Normal[Keep normal inventory status]
  Low[Mark item as low stock]
  Event[Publish inventory.low_stock_detected]
  Alert[Create notification]
  Suggestion[Show reorder suggestion on Procurement page]
  CreateOrder[Create procurement order: PENDING]
  Decision{Approve order?}
  Rejected[Order status: REJECTED]
  Approved[Order status: APPROVED]
  Progress[Start order: IN_PROGRESS]
  Complete[Complete order: COMPLETED]
  NoInventory[Inventory remains unchanged]
  CreateShipment[Create linked shipment: CREATED]
  ShipmentDecision{Shipment outcome}
  Transit[Mark shipment: IN_TRANSIT]
  Cancelled[Mark shipment: CANCELLED]
  Replacement{Create replacement shipment?}
  Delivered[Mark shipment: DELIVERED]
  DeliveryEvent[Publish shipment.delivered]
  UpdateInventory[Increase inventory by delivered quantity and SKU]
  Movement[Record SHIPMENT_DELIVERED stock movement]
  Recheck{Still low stock?}
  StillLow[Remain low stock]
  Healthy[Low-stock condition clears]
  AsyncUpdates[Persist delivered notification and analytics event]
  Refresh[Refresh Inventory and Dashboard data]
  End([Lifecycle reflected in UI])

  Start --> Check
  Check -- No --> Normal --> End
  Check -- Yes --> Low --> Event
  Event --> Alert
  Event --> Suggestion
  Suggestion --> CreateOrder --> Decision
  Decision -- Reject --> Rejected --> End
  Decision -- Approve --> Approved --> Progress --> Complete
  Complete --> NoInventory --> CreateShipment --> ShipmentDecision
  ShipmentDecision -- Cancel --> Cancelled --> Replacement
  Replacement -- Yes --> CreateShipment
  Replacement -- No --> End
  ShipmentDecision -- Dispatch --> Transit
  Transit -->|Cancel| Cancelled
  Transit -->|Deliver| Delivered
  Delivered --> DeliveryEvent
  DeliveryEvent --> UpdateInventory
  DeliveryEvent --> AsyncUpdates
  UpdateInventory --> Movement --> Recheck
  Recheck -- Yes --> StillLow --> Refresh
  Recheck -- No --> Healthy --> Refresh
  AsyncUpdates --> Refresh
  Refresh --> End
```

## 8. Deployment Diagram

```mermaid
flowchart TB
  Browser["User Browser"]

  subgraph Host["Docker Host / Developer Machine"]
    Frontend["Frontend Container<br/>Nginx serving React<br/>host 5173 -> container 80"]
    Gateway["API Gateway Container<br/>host/container 8080"]

    subgraph Internal["Docker Internal Network"]
      Auth["Auth Service<br/>8081 internal"]
      Users["User Service<br/>8082 internal"]
      Inventory["Inventory Service<br/>8083 internal"]
      Orders["Order Service<br/>8084 internal"]
      Suppliers["Supplier Service<br/>8085 internal"]
      Shipments["Shipment Service<br/>8086 internal"]
      Procurement["Procurement Service<br/>8087 internal"]
      Notifications["Notification Service<br/>host/container 3001"]
      Analytics["Analytics Service<br/>host/container 8000"]
      Postgres["PostgreSQL 16<br/>host/container 5432"]
      Rabbit["RabbitMQ<br/>host 5673 -> container 5672<br/>management 15673 -> 15672"]
    end
  end

  Browser -->|HTTP localhost:5173| Frontend
  Frontend -->|HTTP localhost:8080/api| Gateway

  Gateway --> Auth
  Gateway --> Users
  Gateway --> Inventory
  Gateway --> Orders
  Gateway --> Suppliers
  Gateway --> Shipments
  Gateway --> Procurement
  Gateway --> Notifications
  Gateway --> Analytics

  Auth -->|auth_db| Postgres
  Users -->|user_db| Postgres
  Inventory -->|inventory_db| Postgres
  Orders -->|order_db| Postgres
  Suppliers -->|supplier_db| Postgres
  Shipments -->|shipment_db| Postgres
  Notifications -->|notification_db| Postgres
  Analytics -->|analytics_db and read inventory_db| Postgres

  Inventory <--> Rabbit
  Orders --> Rabbit
  Suppliers --> Rabbit
  Shipments --> Rabbit
  Rabbit --> Notifications
  Rabbit --> Analytics

  Note["Other provisioned logical database:<br/>procurement_db (currently no implemented entity)"]
  Note -.-> Postgres
```

## Implementation Accuracy Notes

- The frontend Procurement page uses `/api/orders` and the Order Service. The separate Procurement Service currently exposes only `/api/procurements/workflow`.
- Inventory is replenished by the Inventory Service only after consuming `shipment.delivered`; `procurement.completed` does not update inventory.
- Shipment creation, `IN_TRANSIT`, and `CANCELLED` transitions do not currently publish RabbitMQ events.
- Sales records are persisted in `inventory_db.sales_records`. Sales analytics query this table directly; sales creation does not publish a dedicated RabbitMQ event.
- The Analytics Service dashboard still contains some static metrics, while revenue and stock-out calculations use persisted sales records.
- `procurement_db` is created by the database initialization script but has no implemented entity in the current Procurement Service.

# API Summary

Gateway base URL: `http://localhost:8080/api`

## Auth

- `POST /auth/register` - create account and issue tokens
- `POST /auth/login` - authenticate and issue tokens
- `POST /auth/refresh` - rotate refresh token
- `GET /auth/validate` - validate bearer token

## Users

- `GET /users`
- `POST /users`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`

## Inventory

- `GET /inventory?q=&page=&size=&sort=`
- `POST /inventory`
- `GET /inventory/{id}`
- `PUT /inventory/{id}`
- `POST /inventory/{id}/adjust`
- `DELETE /inventory/{id}`

## Suppliers

- `GET /suppliers`
- `POST /suppliers`
- `GET /suppliers/{id}`
- `PUT /suppliers/{id}`
- `DELETE /suppliers/{id}`

## Orders / Procurement

- `GET /orders`
- `POST /orders`
- `POST /orders/{id}/approve`
- `POST /orders/{id}/reject`
- `POST /orders/{id}/start`
- `POST /orders/{id}/complete`
- `GET /procurements/workflow`

## Shipments

- `GET /shipments`
- `POST /shipments`
- `POST /shipments/{id}/in-transit`
- `POST /shipments/{id}/delivered`
- `POST /shipments/{id}/cancel`

## Notifications

- `GET /notifications`
- `PATCH /notifications/{id}/read`

## Analytics

- `GET /analytics/dashboard`
- `GET /analytics/supplier-performance`
- `GET /analytics/stock-trends`
- `POST /analytics/forecast`


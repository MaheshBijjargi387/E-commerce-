# ShopSphere — E-Commerce Microservices Platform

A small but complete e-commerce system built as independent microservices,
secured end-to-end with JWT authentication and role-based authorization.

## Architecture

```
                     ┌─────────────────┐
                     │   React Frontend │  (Vite, port 5173)
                     └────────┬─────────┘
                              │  Axios (attaches JWT to every request)
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
 ┌──────────────────┐ ┌───────────────────┐ ┌──────────────────┐
 │  auth-service     │ │  product-service  │ │  order-service   │
 │  port 8081        │ │  port 8082        │ │  port 8083       │
 │  - register/login │ │  - catalog CRUD   │ │  - place orders  │
 │  - issues JWTs     │ │  - JWT-validated  │ │  - JWT-validated │
 └──────────────────┘ │    write ops      │ │  - calls product-│
                        └───────────────────┘ │    service for   │
                                               │    price/stock   │
                                               └──────────────────┘
```

Each backend service is an independent Spring Boot application with its own
database (H2 in-memory by default, MySQL config provided but commented out).
There is **no shared session** — `auth-service` issues a signed JWT at
login/register, and `product-service` / `order-service` verify that same
token locally (same shared secret), so no service has to call back to
`auth-service` on every request. This is the standard stateless-JWT pattern
for microservices.

### Auth & roles
- Every new user registers with `ROLE_USER`.
- To test admin-only features (creating/editing/deleting products, viewing
  all orders), promote a user to `ROLE_ADMIN` directly in the H2 console
  (see below) or add a seeding step in `AuthService`.
- JWT claims include `userId`, `username` (subject) and `roles`, so every
  downstream service can authorize requests without a database lookup.

## Project layout

```
ecommerce-microservices/
├── auth-service/      Spring Boot — user registration/login, JWT issuing
├── product-service/   Spring Boot — product catalog, admin-only writes
├── order-service/     Spring Boot — order placement/history
├── frontend/          React (Vite) — the storefront UI
└── docker-compose.yml Optional container orchestration (MySQL-based)
```

## Running locally (no Docker)

Requirements: Java 17+, Maven 3.9+, Node.js 18+.

Open four terminals:

```bash
# 1. Auth service
cd auth-service && mvn spring-boot:run     # http://localhost:8081

# 2. Product service
cd product-service && mvn spring-boot:run  # http://localhost:8082

# 3. Order service
cd order-service && mvn spring-boot:run    # http://localhost:8083

# 4. Frontend
cd frontend && npm install && npm run dev  # http://localhost:5173
```

Then open **http://localhost:5173**. Product data is seeded automatically on
first product-service startup.

## Running with Docker Compose

```bash
docker compose up --build
```

This spins up MySQL plus all four services. If you use this route, edit each
service's `src/main/resources/application.yml` to use the MySQL datasource
block (already included, just commented out) instead of H2.

## Key API endpoints

| Service | Method | Path | Auth |
|---|---|---|---|
| auth | POST | `/api/auth/register` | public |
| auth | POST | `/api/auth/login` | public |
| product | GET | `/api/products` | public |
| product | GET | `/api/products/{id}` | public |
| product | POST/PUT/DELETE | `/api/products/**` | `ROLE_ADMIN` |
| order | POST | `/api/orders` | any authenticated user |
| order | GET | `/api/orders/my` | any authenticated user |
| order | GET | `/api/orders/all` | `ROLE_ADMIN` |

All protected endpoints expect `Authorization: Bearer <token>`.

## Promoting a user to admin (H2 console)

1. Start `auth-service`, register a user through the app.
2. Visit `http://localhost:8081/h2-console`, JDBC URL `jdbc:h2:mem:authdb`,
   user `sa`, blank password.
3. Run:
   ```sql
   INSERT INTO user_roles (user_id, role) VALUES (<id>, 'ROLE_ADMIN');
   ```
4. Log out and back in on the frontend to get a fresh token with the new role.

## Notes & next steps

This project favors clarity over exhaustive production hardening. Natural
next steps if you want to extend it:
- Add an API Gateway (Spring Cloud Gateway) so the frontend talks to one
  origin instead of three ports.
- Add service discovery (Eureka) if you scale to more instances.
- Add refresh tokens / token revocation (current tokens are stateless and
  simply expire after 24h).
- Move the shared JWT secret into a proper secrets manager for production.

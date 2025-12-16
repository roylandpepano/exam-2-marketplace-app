# ShopEase - Marketplace App (Client + Server)

A full-stack marketplace application consisting of a Next.js client and a Flask server, containerized with Docker. This README documents the full file structure and provides step-by-step setup instructions for development and production.

## Overview

-  Client: Next.js 14 App Router (TypeScript) with ShadCN UI components
-  Server: Flask + SQLAlchemy + JWT + PayPal integration
-  Containerization: Docker + docker-compose
-  Media: Uploads for product/category assets

## Tech Stack

-  Frontend: Next.js, React, TypeScript, TailwindCSS, ShadCN UI
-  Backend: Python, Flask, SQLAlchemy, Marshmallow, Flask-JWT-Extended
-  Payments: PayPal REST SDK (server-side) + PayPal JS SDK (client-side)
-  Auth: JWT (server) + context/hooks (client)
-  Deployment: Docker Compose

---

## Monorepo Structure

```
exam-2-marketplace-app/
├─ docker-compose.yml
├─ client/                      # Next.js application
├─ server/                      # Flask API server
├─ uploads/                     # Root-level uploads (categories/products)
```

### docker-compose.yml

-  Orchestrates the `client` and `server` services.
-  Builds images from `client/Dockerfile` and `server/Dockerfile`.
-  Sets port mappings for web and API.
-  Includes `db` (Postgres) and `redis` services used by the server.

---

## Client Folder Structure

Path: `client/`

```
client/
├─ components.json
├─ Dockerfile
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ about/page.tsx
│  ├─ admin/page.tsx
│  │  ├─ analytics/page.tsx
│  │  ├─ categories/page.tsx
│  │  ├─ constants/page.tsx
│  │  ├─ orders/page.tsx
│  │  ├─ products/page.tsx
│  │  │  └─ [id]/page.tsx
│  │  └─ users/page.tsx
│  ├─ cart/page.tsx
│  ├─ checkout/page.tsx
│  ├─ forgot-password/page.tsx
│  ├─ login/page.tsx
│  ├─ orders/page.tsx
│  │  └─ [id]/page.tsx
│  └─ profile/page.tsx
├─ components/
│  ├─ AdminLayout.tsx
│  ├─ ClientToaster.tsx
│  ├─ ForgotPasswordDialog.tsx
│  ├─ LoginDialog.tsx
│  ├─ Navbar.tsx
│  ├─ ProductCard.tsx
│  ├─ ProductFilter.tsx
│  ├─ ProductsGrid.tsx
│  ├─ RegisterDialog.tsx
│  ├─ SearchBar.tsx
│  └─ ui/ ... (ShadCN primitives)
├─ contexts/
│  ├─ AuthContext.tsx
│  ├─ CartContext.tsx
│  └─ PayPalContext.tsx
├─ hooks/
│  ├─ use-auth.ts
│  └─ use-mobile.ts
├─ lib/
│  ├─ api.ts
│  ├─ currency.ts
│  ├─ products.ts
│  └─ utils.ts
├─ public/
```

### Client Highlights

-  `app/layout.tsx`: Root layout; global providers/styles.
-  `app/page.tsx`: Homepage.
-  `app/admin/*`: Admin views for analytics, categories, constants, orders, products, users.
-  `components/ui/*`: UI primitives (dialog, button, table, tabs, etc.).
-  `contexts/AuthContext.tsx`: Auth state and actions.
-  `contexts/CartContext.tsx`: Cart state management.
-  `contexts/PayPalContext.tsx`: Injects PayPal SDK and client-side config.
-  `lib/api.ts`: API client helpers and base URL logic.
-  `lib/products.ts`: Product-specific client helpers.

### Client Config Files

-  `next.config.ts`: Next.js config.
-  `tsconfig.json`: TypeScript config.
-  `postcss.config.mjs`: PostCSS/Tailwind.
-  `eslint.config.mjs`: Lint rules.
-  `components.json`: ShadCN component registry.
-  `Dockerfile`: Production image build.

---

## Server Folder Structure

Path: `server/`

```
server/
├─ app.py                    # Flask app factory/entry
├─ config.py                 # Environment config (dev/prod)
├─ Dockerfile
├─ extensions.py             # Flask extensions init (db, Redis cache, etc.)
├─ init_db.py                # DB init and seed scripts
├─ requirements.txt          # Python deps
├─ setup.sh                  # Optional setup automation
├─ wsgi.py                   # WSGI entry point
├─ models/
│  ├─ __init__.py
│  ├─ category.py
│  ├─ constant.py
│  ├─ order.py
│  ├─ product.py
│  ├─ rating.py
│  └─ user.py
├─ routes/
│  ├─ __init__.py
│  ├─ auth.py
│  ├─ categories.py
│  ├─ constants.py
│  ├─ orders.py
│  ├─ payments.py
│  ├─ products.py
│  └─ admin/
│     ├─ __init__.py
│     ├─ analytics.py
│     ├─ categories.py
│     ├─ constants.py
│     ├─ orders.py
│     ├─ products.py
│     └─ users.py
├─ uploads/
│  └─ products/
└─ utils/
   ├─ __init__.py
   ├─ auth.py                # JWT helpers, auth decorators
   ├─ cache.py               # Caching helpers
   └─ helpers.py             # Common utility functions
```

### Server Highlights

-  `app.py`: Creates and configures the Flask app, registers blueprints.
-  `config.py`: Reads environment variables; defines DB URI, JWT secret, PayPal keys.
-  `extensions.py`: Initializes `SQLAlchemy`, `JWT`, and `redis_client` for caching.
-  `init_db.py`: Creates tables and optionally seeds with sample data.
-  `wsgi.py`: Entrypoint for WSGI servers.
-  `models/*`: SQLAlchemy models for `User`, `Product`, `Category`, `Order`, `Rating`, `Constant`.
-  `routes/*`: API endpoints for auth, categories, constants, orders, payments, products; admin-specific routes under `routes/admin/*`.
-  `utils/*`: Auth decorators and helpers.
-  `uploads/products/`: Server-managed product images (if server-side storage is used).

---

## Root Uploads Folder

Path: `uploads/`

```
uploads/
├─ categories/
└─ products/
```

-  Used by the application to store and serve images/media for categories and products.
-  Depending on configuration, the client may reference images from this root or via server routes.

---

## Environment Variables

Create `.env` files or configure environment variables for both services.

### Server `.env` (examples)

-  `FLASK_ENV=development`
-  `SECRET_KEY=your-secret-key`
-  `JWT_SECRET_KEY=your-jwt-secret`
-  `DATABASE_URL=sqlite:///marketplace.db` (or Postgres URI)
-  `REDIS_URL=redis://localhost:6379/0` (or the Compose service URL)
-  `PAYPAL_CLIENT_ID=your-paypal-client-id`
-  `PAYPAL_CLIENT_SECRET=your-paypal-client-secret`
-  `BASE_UPLOAD_DIR=/app/uploads` (adjust if using server/uploads)

### Client `.env` (examples)

-  `NEXT_PUBLIC_API_BASE=http://localhost:5000` (Flask API URL)
-  `NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id`
-  `NEXT_PUBLIC_APP_URL=http://localhost:3000`

If using Docker Compose, these can be placed in a root `.env` file or in service-specific environment blocks.

---

## Setup and Run

Follow these steps to run with Docker (recommended) or locally.

### Prerequisites

-  Docker Desktop (Windows/macOS/Linux)
-  Node.js 20+ (for local client dev)
-  Python 3.11+ (for local server dev)

### Option A: Run with Docker Compose

1. Configure environment variables as above.
2. Build and start both services:

```bash
docker compose up --build
```

3. Access the services:

-  Client (Next.js): http://localhost:3000
-  Server (Flask API): http://localhost:5000
-  Redis: tcp://localhost:6379

4. Stop services:

```bash
docker compose down
```

### Option B: Run Locally (without Docker)

Run server and client in separate terminals.

1. Server

-  Create and activate a virtual environment.
-  Install dependencies.
-  Initialize DB.
-  Run the server.

```bash
# From repo root
cd server
python -m venv .venv
. .venv/Scripts/activate  # Windows
pip install -r requirements.txt
python init_db.py         # optional: create tables/seed
python wsgi.py            # or: flask run if configured
# API at http://localhost:5000
# If using Redis locally, ensure it's running on localhost:6379 or set REDIS_URL accordingly
```

2. Client

-  Install dependencies.
-  Run dev server.

```bash
# From repo root
cd client
npm install
npm run dev
# App at http://localhost:3000
```

Ensure `NEXT_PUBLIC_API_BASE` points to the local server URL.

---

## Common Commands

### Docker

-  Build & run: `docker compose up --build`
-  Stop: `docker compose down`
-  Rebuild client only: `docker compose build client && docker compose up -d`
-  Rebuild server only: `docker compose build server && docker compose up -d`
-  Check Redis keys (inside server container): `redis-cli -h redis KEYS '*'`

### Client

-  Dev: `npm run dev`
-  Build: `npm run build`
-  Start (prod): `npm run start`
-  Lint: `npm run lint`

### Server

-  Run: `python wsgi.py`
-  Init DB: `python init_db.py`
-  Test Redis connection in Python shell:
   -  `python -c "from extensions import redis_client; print(redis_client.ping())"`

---

## Data and Media

-  Product/category images live under `uploads/categories` and `uploads/products` (root) or `server/uploads/products` (server-side depending on config).
-  Ensure your API serves these images (static route) or the client references them directly.

---

## API Overview (Brief)

-  `routes/auth.py`: Login, register, password reset.
-  `routes/products.py`: List/search products, product details.
-  `routes/categories.py`: Category CRUD/listing.
-  `routes/orders.py`: Create/list orders, order detail.
-  `routes/payments.py`: PayPal payment execution endpoints.
-  `routes/constants.py`: App constants/config.
-  `routes/admin/*`: Admin-only endpoints for analytics and resource management.

JWT-protected routes use decorators from `utils/auth.py`.

---

## Caching with Redis

-  Service: A `redis` container is defined in `docker-compose.yml` and the server is configured with `REDIS_URL`.
-  Client: No direct Redis usage on the frontend.
-  Server Integration:
   -  Redis client: `redis_client` in `server/extensions.py` uses `Config.REDIS_URL`.
   -  Utilities: `server/utils/cache.py` exposes `get_cache()`, `set_cache()`, `invalidate_cache()`, and `cached(prefix, ttl)` decorator.
-  Current Usage:
   -  Mutation routes (admin products/categories, product ratings) call `invalidate_cache('products'|'categories')` to clear stale listings.
   -  Read endpoints are not yet decorated; you can enable response caching by decorating GET handlers, e.g.:

```python
from utils.cache import cached

@products_bp.route('', methods=['GET'])
@cached('products', ttl=300)
def get_products():
    ...
```

-  Cache Keys: The helper uses `request.full_path` to include query params in the key. Adjust as needed for finer control.
-  Environment: For Compose, `REDIS_URL=redis://redis:6379/0`. For local, use `redis://localhost:6379/0` or your instance URL.

## Troubleshooting

-  Ports in use: Change port mappings in `docker-compose.yml` or local run commands.
-  API 404/500: Verify `NEXT_PUBLIC_API_BASE` and server is running.
-  Missing images: Confirm files exist under `uploads/` and static serving is configured.
-  PayPal issues: Check client/server PayPal credentials and sandbox mode.
-  Redis connection errors: Verify the `redis` service is up, confirm `REDIS_URL` matches the environment (`redis://redis:6379/0` in Docker, `redis://localhost:6379/0` locally).
-  Cache not updating: Ensure mutation routes call `invalidate_cache(...)` and verify keys with `redis-cli KEYS 'products:*'`.

---

## Contributing

-  Follow existing TypeScript and ESLint style in client.
-  Keep Python code consistent, use helpers/utilities.
-  Avoid large unrelated changes; keep PRs focused.

## License

Internal project. Do not redistribute without permission.

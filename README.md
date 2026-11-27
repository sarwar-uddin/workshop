# Workshop

A small-business inventory and order management system: products, customers, orders and stock, with every stock change recorded. Demo data uses a leather workshop, but nothing in the code is specific to leather.

> **Status: in development, milestone M4 (database + domain).** Products and categories run on PostgreSQL end to end. Customers, orders, inventory, auth and deployment are still to come. See [docs/progress.md](docs/progress.md).

## About

Small workshops and shops tend to track stock in a notebook or a spreadsheet, so the numbers drift: nobody can say why a count changed, or which order used up the last of something. Workshop is a full-stack app built to keep those numbers honest.

The design choices that matter:

- **Stock is backed by a ledger.** `stockQuantity` can't be written through the product API. From the inventory milestone on, every change also records a stock movement in the same transaction, so each count can be explained.
- **Money is never a float.** Prices are `numeric(12,2)` in PostgreSQL and strings end to end.
- **Rules live on the server, with the database as backstop.** Zod rejects bad or unknown input, and PostgreSQL constraints (case-insensitive unique SKUs, restricted foreign keys) catch anything that slips through.
- **Archive, don't delete.** Products keep their history; IDs are UUIDv7.
- **Every decision is written down.** The reasoning lives in [docs/decisions.md](docs/decisions.md).

It's being built one vertical slice at a time, each on its own branch with conventional commits.

## Stack

| Layer    | Tools |
|----------|-------|
| Frontend | React, TypeScript, Vite, React Router, TanStack Query |
| Backend  | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL 18, Drizzle ORM + drizzle-kit migrations |
| Dev      | pnpm workspaces, Docker Compose |

## Architecture

```
Browser → React (apps/web) ──/api──→ Express (apps/api) → service → repository → Drizzle → PostgreSQL
           Vite dev server proxies /api to :3000
```

Inside the API, each layer has one job:

| Layer | File pattern | Responsibility |
|-------|--------------|----------------|
| Routes | `*.routes.ts` | HTTP only: parse the request, call the service, choose the status code |
| Schemas | `*.schemas.ts` | Zod rules for untrusted input; unknown fields are rejected |
| Service | `*.service.ts` | Business rules; translates DB errors (unique/FK violations) into API errors |
| Repository | `*.repository.ts` | The only place with SQL/Drizzle queries |

Rules are enforced on the server, and PostgreSQL constraints back them up. See [docs/database.md](docs/database.md) and [docs/decisions.md](docs/decisions.md).

## Project layout

```
apps/
  api/
    drizzle/              generated SQL migrations (committed)
    src/
      config/env.ts       validated environment variables
      db/                 schema, client (pool), seed, pg error helpers
      errors/             AppError, error contract, error handler
      validation/         parseInput(): Zod → 400 with field details
      products/           routes, schemas, service, repository, types
      categories/         read-only category list
  web/
    src/
      app/                App, QueryClient
      layouts/            AppLayout
      features/           dashboard/, products/
      lib/api.ts          typed API client + ApiError
docs/                     database, decisions, progress
```

## Development

Requires Node 22.9+ (uses `--env-file-if-exists`; developed on Node 26), pnpm, and Docker.

```sh
cp .env.example .env          # local config (never committed)
docker compose up -d db       # PostgreSQL 18 on :5432
pnpm install
pnpm --filter @workshop/api db:migrate   # apply migrations in apps/api/drizzle/
pnpm --filter @workshop/api db:seed      # demo data (safe to re-run)
pnpm --filter @workshop/api dev          # API on :3000
pnpm --filter @workshop/web dev          # web on :5173
```

Typecheck: `pnpm --filter @workshop/api typecheck` and `pnpm --filter @workshop/web exec tsc -b`.

### Database workflow

The schema lives in `apps/api/src/db/schema.ts`. After changing it:

```sh
pnpm --filter @workshop/api db:generate --name <what_changed>   # writes a SQL migration
# read the generated SQL before applying it
pnpm --filter @workshop/api db:migrate
pnpm --filter @workshop/api db:studio                           # optional: browse the DB
```

Commit the schema change and its migration together. Never edit a migration that has already been applied anywhere; add a new one instead.

## API

All responses are JSON. Errors share one shape:

```json
{ "error": { "code": "SKU_TAKEN", "message": "Another product already uses this SKU",
             "details": [{ "path": "sku", "message": "SKU must be unique (case-insensitive)" }] } }
```

`details` is only present for field-level problems.

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| GET | `/api/products` | All products, with their category | 200 `{ products }` |
| GET | `/api/products/:id` | One product | 200 `{ product }` |
| POST | `/api/products` | Create: `sku`, `name`, `price`, optional `description`, `categoryId` | 201 `{ product }` + `Location` |
| PATCH | `/api/products/:id` | Partial update of the fields above, plus `status` (`active`/`archived`) | 200 `{ product }` |
| GET | `/api/categories` | All categories | 200 `{ categories }` |

Notes:

- **`price` is a string** (`"1850.00"`), both in requests and in responses. Money never passes through a float.
- **`stockQuantity` is read-only.** Stock will change only through inventory adjustments, each of which records a movement.
- **Error codes:**

  | Code | Status | When |
  |------|--------|------|
  | `VALIDATION_ERROR` | 400 | A field is missing, invalid, or unknown |
  | `INVALID_JSON` | 400 | The request body is not valid JSON |
  | `CATEGORY_NOT_FOUND` | 400 | `categoryId` doesn't match a category |
  | `PRODUCT_NOT_FOUND` | 404 | No product with that id (a malformed id also gets 404) |
  | `SKU_TAKEN` | 409 | Another product already has that SKU, in any letter case |
  | `INTERNAL_SERVER_ERROR` | 500 | Anything unexpected; the real error is logged on the server |

## License

Copyright © 2026 Sarwar Uddin

Workshop is free software: you can redistribute it and/or modify it under the terms of the [GNU Affero General Public License](LICENSE) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. If you run a modified version on a server, the AGPL requires you to offer its source code to the users who interact with it.

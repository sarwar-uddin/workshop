# Workshop

A small-business inventory and order management system.

## Stack

- React + TypeScript
- Node.js + Express
- PostgreSQL
- Drizzle ORM
- Docker Compose

## Development

```sh
cp .env.example .env          # local config (never committed)
docker compose up -d db       # PostgreSQL 18 on :5432
pnpm install
pnpm --filter @workshop/api db:migrate   # apply migrations in apps/api/drizzle/
pnpm --filter @workshop/api dev          # API on :3000
pnpm --filter @workshop/web dev          # web on :5173
```

### Database workflow

The schema lives in `apps/api/src/db/schema.ts`. After changing it:

```sh
pnpm --filter @workshop/api db:generate --name <what_changed>   # writes a SQL migration
# read the generated SQL before applying it
pnpm --filter @workshop/api db:migrate
```

Commit the schema change and its migration together. Never edit a migration that has already been applied anywhere; add a new one instead.

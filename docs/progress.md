# Progress

Tracks the build against the project's milestones and backlog. Hashes point at the merge commit for each slice.

## Milestones

| Milestone | Status |
|-----------|--------|
| M0 Bootstrap | Done (`cdcb6e5`) |
| M1 TypeScript foundation | Done (`cdcb6e5`) |
| M2 React fundamentals | Done (`59c76ac`) |
| M3 React architecture | Done (`b0af2a7`) |
| M4 PostgreSQL + schema | **In progress.** categories/products done; remaining tables come with their slices |
| M5 Express API | Partly done: products API, validation, error contract. Pagination/filtering still to do |
| M6 Auth | Not started |
| M7 Products + customers | Products API done; customers not started; product UI to be rebuilt (items 10–11) |
| M8 Orders + transactions | Not started |
| M9 Inventory + dashboard | Not started |
| M10 Testing | Not started |
| M11 Operations + deployment | Not started |
| M12 Delivery + release | Not started |

## Backlog status

- [x] 1. Bootstrap repository and tooling
- [x] 2. Docker Compose PostgreSQL environment
- [x] 3. Health endpoint *(note: `/health` was added in bootstrap but dropped during the M3 refactor in `cedce50`; restore it for M11 health checks)*
- [x] 4. Shared API error contract (field `details` added in `44cc4fe`)
- [x] 5. Database schema and first migration (`faea9b0`)
- [x] 6. Seed data (`c1231c9`)
- [x] 7. Product repository/service (`e57e6f8`, `44cc4fe`)
- [x] 8. Product list API (`e57e6f8`)
- [x] 9. Product create/update API (`44cc4fe`)
- [ ] 10. Product list UI: a proper table, status/stock display, archived filter
- [ ] 11. Product form UI: React Hook Form + Zod, inline field errors, edit mode
- [ ] 12–13. Customers API + UI
- [ ] 14–37. Orders, inventory adjustments, dashboard, auth, tests, deployment and release

## Known gaps

- No automated tests yet. Everything so far was verified by hand: constraint tests in SQL and 14 curl cases for the products API.
- `GET /api/products` has no pagination, filtering or search.
- The product form is a minimal placeholder (item 11 replaces it).

## Next session: pick one direction

1. **API test harness (recommended):** Vitest + Supertest against a separate `workshop_test` database. This needs the Express `app` split from `listen()`. It turns today's manual curl checks into `pnpm test`.
2. **Customers slice (items 12–13),** following the products pattern.
3. **Product UI (items 10–11),** with React Hook Form + Zod on the client.

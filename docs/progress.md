# Progress

Tracks the build against the Workshop guide's milestones and issue backlog.

## Milestones

| Milestone | Status |
|-----------|--------|
| M0 Bootstrap | Done (PR #1) |
| M1 TypeScript foundation | Done (PR #1) |
| M2 React fundamentals | Done (PR #2) |
| M3 React architecture | Done (PR #3) |
| M4 PostgreSQL + schema | **In progress.** categories/products done; remaining tables come with their slices |
| M5 Express API | Partly done: products API, validation, error contract. Pagination/filtering still to do |
| M6 Auth | Not started |
| M7 Products + customers | Products API done; customers not started; product UI to be rebuilt (#10, #11) |
| M8–M12 | Not started |

## Backlog status

- [x] 1. Bootstrap repository and tooling
- [x] 2. Docker Compose PostgreSQL environment
- [x] 3. Health endpoint *(note: `/health` was added in bootstrap but dropped during the M3 refactor in `50d65d0`; restore it for M11 health checks)*
- [x] 4. Shared API error contract (field `details` added in PR #7)
- [x] 5. Database schema and first migration (PR #4)
- [x] 6. Seed data (PR #5)
- [x] 7. Product repository/service (PR #6, #7)
- [x] 8. Product list API (PR #6)
- [x] 9. Product create/update API (PR #7)
- [ ] 10. Product list UI: a proper table, status/stock display, archived filter
- [ ] 11. Product form UI: React Hook Form + Zod, inline field errors, edit mode
- [ ] 12–13. Customers API + UI
- [ ] 14–37. See the Workshop guide

## Known gaps

- No automated tests yet. Everything so far was verified by hand: constraint tests in SQL and 14 curl cases for the products API.
- `GET /api/products` has no pagination, filtering or search.
- The product form is a minimal placeholder (#11 replaces it).

## Next session: pick one direction

1. **API test harness (recommended):** Vitest + Supertest against a separate `workshop_test` database. This needs the Express `app` split from `listen()`. It turns today's manual curl checks into `pnpm test`.
2. **Customers slice (#12–13),** following the products pattern.
3. **Product UI (#10–11),** with React Hook Form + Zod on the client.

// Runs inside each test file, before its tests.

import { afterAll, beforeEach } from "vitest";
import { pool } from "../src/db/client.js";

// Every test starts from empty tables, so tests can't depend on each other's
// leftovers or on running in a particular order. The table list comes from
// the catalog, so new tables are wiped automatically as migrations add them.
// (Drizzle's own migration bookkeeping lives in the "drizzle" schema, which
// this doesn't touch.)
beforeEach(async () => {
  const { rows } = await pool.query<{ tables: string | null }>(`
    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') AS tables
    FROM pg_tables
    WHERE schemaname = 'public'
  `);
  const tables = rows[0]?.tables;
  if (tables) await pool.query(`TRUNCATE ${tables} CASCADE`);
});

// Close the pool, or its open connections keep the test worker alive.
afterAll(async () => {
  await pool.end();
});

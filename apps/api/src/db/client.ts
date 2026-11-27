import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// One pool for the whole process. Each query borrows a connection and gives it
// back; a transaction holds one connection until it commits or rolls back.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });

// If Postgres drops an *idle* pooled connection (restart, network blip), the
// pool emits 'error'. Node crashes the process on an 'error' event that has
// no listener. The pool already discards the broken connection, so logging is
// enough. Errors during a query still reject that query's promise as usual.
pool.on("error", (error) => {
  console.error("Idle PostgreSQL connection error:", error.message);
});

export const db = drizzle(pool, { schema });

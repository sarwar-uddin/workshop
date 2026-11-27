import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// One pool for the whole process. Each query borrows a connection and gives it
// back; a transaction holds one connection until it commits or rolls back.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });

export const db = drizzle(pool, { schema });

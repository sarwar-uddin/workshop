// Runs once per `vitest` run, before any test file. It makes sure the test
// database exists and has the same schema as dev, by running the real
// migrations. Testing against the migrations (not a schema push) means a
// broken migration fails the tests too.

import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { getDatabaseName, getTestDatabaseUrl } from "./database-url.js";

export default async function setup() {
  const url = getTestDatabaseUrl();

  await createDatabaseIfMissing(url);

  const pool = new pg.Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: path.resolve(import.meta.dirname, "../drizzle"),
    });
  } finally {
    await pool.end();
  }
}

async function createDatabaseIfMissing(url: string) {
  const name = getDatabaseName(url);

  // You can't CREATE DATABASE while connected to the database you're creating,
  // so connect to the built-in "postgres" maintenance database instead.
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (rowCount === 0) {
      // Identifiers can't be query parameters ($1), so quote the name safely.
      await client.query(`CREATE DATABASE ${pg.escapeIdentifier(name)}`);
      console.log(`Created test database ${name}`);
    }
  } finally {
    await client.end();
  }
}

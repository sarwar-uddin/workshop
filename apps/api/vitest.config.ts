import path from "node:path";
import { defineConfig } from "vitest/config";
import { getTestDatabaseUrl } from "./test/database-url.js";

// Like drizzle.config.ts: load the root .env if there is one. Variables that
// are already set (CI) win, because loadEnvFile never overrides them.
try {
  process.loadEnvFile(path.resolve(import.meta.dirname, "../../.env"));
} catch {
  // No .env file: rely on the environment.
}

const testDatabaseUrl = getTestDatabaseUrl();

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // The app reads DATABASE_URL (src/config/env.ts). Inside test workers it
    // points at the test database, so app code needs no test-only branches.
    env: { DATABASE_URL: testDatabaseUrl, NODE_ENV: "test" },
    // Runs once, before any test file: create + migrate the test database.
    globalSetup: ["./test/global-setup.ts"],
    // Runs inside every test file: wipe tables before each test, close the pool.
    setupFiles: ["./test/setup.ts"],
    // All files share one database, so run them one at a time. Otherwise one
    // file's TRUNCATE could wipe rows another file is in the middle of using.
    fileParallelism: false,
  },
});

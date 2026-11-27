import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside the app, so it loads the root .env itself.
try {
  process.loadEnvFile("../../.env");
} catch {
  // No .env file: fall back to whatever is already in the environment (CI).
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set (copy .env.example to .env)");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});

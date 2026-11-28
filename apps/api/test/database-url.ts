// Tests delete every row between cases, so pointing them at the dev database
// by accident would wipe it. This is the single place that decides which
// database the tests use, and it refuses anything not named *_test.

export function getTestDatabaseUrl(): string {
  const value = process.env.TEST_DATABASE_URL;

  if (value === undefined || value.trim() === "") {
    throw new Error("TEST_DATABASE_URL is not set (copy it from .env.example into .env)");
  }

  const name = getDatabaseName(value);

  if (!name.endsWith("_test")) {
    throw new Error(
      `Refusing to run tests against database "${name}": tests delete all data, ` +
        "so the test database name must end in _test",
    );
  }

  return value;
}

export function getDatabaseName(url: string): string {
  // postgres://user:pass@host:5432/workshop_test -> "workshop_test"
  return decodeURIComponent(new URL(url).pathname.slice(1));
}

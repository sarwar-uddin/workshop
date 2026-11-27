// Recognise PostgreSQL errors by their SQLSTATE code, so services can turn a
// constraint violation into a meaningful API error.
// Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html

export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";

type PgError = { code: string; constraint?: string };

function isPgError(value: unknown): value is PgError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string"
  );
}

// Drizzle wraps driver errors in its own DrizzleQueryError, with the original
// pg error in `cause`, so look at both levels.
export function getPgError(error: unknown): PgError | undefined {
  if (isPgError(error)) return error;
  if (error instanceof Error && isPgError(error.cause)) return error.cause;
  return undefined;
}

import type { z } from "zod";
import { AppError } from "../errors/AppError.js";

// Validate untrusted input (a request body, params or query) against a Zod
// schema. On success, returns the parsed value with its real type. On failure,
// throws a 400 that lists every invalid field, not just the first one.
export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.output<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Request data is invalid",
      400,
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return result.data;
}

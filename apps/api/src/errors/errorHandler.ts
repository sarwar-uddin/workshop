import type { ErrorRequestHandler } from "express";
import { AppError } from "./AppError.js";
import type { ApiErrorBody } from "./types.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };

    res.status(error.statusCode).json(body);
    return;
  }

  // express.json() rejects a body that is not valid JSON. That is the
  // client's mistake, not a server failure.
  if (error?.type === "entity.parse.failed") {
    const body: ApiErrorBody = {
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    };
    res.status(400).json(body);
    return;
  }

  // Unexpected error: the client gets a generic message (internal details can
  // leak information), so the real error must go to the server log.
  console.error(error);

  const body: ApiErrorBody = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  };

  res.status(500).json(body);
};

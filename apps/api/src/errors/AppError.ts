import type { ApiErrorDetail } from "./types.js";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "AppError";
  }
}

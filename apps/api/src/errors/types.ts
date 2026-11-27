export type ApiErrorDetail = {
  // Dotted path to the offending field, such as "price" or "items.0.quantity".
  path: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    // Only present for validation errors, so a form can mark each field.
    details?: ApiErrorDetail[];
  };
};

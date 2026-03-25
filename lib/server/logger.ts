type LogContext = Record<string, string | number | boolean | null | undefined>;

export function logServerError(
  event: string,
  error: unknown,
  context: LogContext = {},
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${event}]`, {
    message,
    stack,
    context,
  });
}

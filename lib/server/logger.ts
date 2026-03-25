type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  event: string;
  message?: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
  duration_ms?: number;
};

function emit(entry: LogEntry): void {
  console.log(JSON.stringify(entry));
}

export function logServerError(
  event: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  emit({
    level: "error",
    event,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined && { context }),
    ...(stack !== undefined && { stack }),
  });
}

export function logServerWarn(
  event: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  emit({
    level: "warn",
    event,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined && { context }),
  });
}

export function logServerInfo(
  event: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  emit({
    level: "info",
    event,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined && { context }),
  });
}

export async function withTiming<T>(
  event: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    emit({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - start,
      ...(context !== undefined && { context }),
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    emit({
      level: "error",
      event,
      message,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - start,
      ...(context !== undefined && { context }),
      ...(stack !== undefined && { stack }),
    });
    throw error;
  }
}

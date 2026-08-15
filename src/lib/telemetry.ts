/**
 * Structured system logger — isomorphic on purpose (no "server-only" guard):
 * checkout/inventory events are logged from Route Handlers, currency and UI
 * crash events from the browser. Every entry is a single-line JSON object so
 * it can be piped into any real log aggregator (Vercel Log Drains, Datadog,
 * etc.) without changing a call site — this console sink is the "Fallback
 * Mode" for observability, the same pattern used for Stripe/Supabase
 * elsewhere in this app.
 */

export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface TelemetryEvent {
  level: LogLevel;
  event: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const RECENT_EVENTS_LIMIT = 200;

// Small in-memory ring buffer of recent events, server-side only in
// practice (the browser gets a fresh module instance per page load). Handy
// for local debugging without wiring a real log sink.
const recentEvents: TelemetryEvent[] = [];

function record(level: LogLevel, event: string, message: string, context?: Record<string, unknown>): TelemetryEvent {
  const entry: TelemetryEvent = {
    level,
    event,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  recentEvents.push(entry);
  if (recentEvents.length > RECENT_EVENTS_LIMIT) recentEvents.shift();

  const line = JSON.stringify(entry);
  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);

  return entry;
}

export const telemetry = {
  info: (event: string, message: string, context?: Record<string, unknown>) =>
    record("INFO", event, message, context),
  warn: (event: string, message: string, context?: Record<string, unknown>) =>
    record("WARN", event, message, context),
  error: (event: string, message: string, context?: Record<string, unknown>) =>
    record("ERROR", event, message, context),
  /** Read-only snapshot for debugging/tests — not a substitute for a real sink. */
  recent: (): TelemetryEvent[] => [...recentEvents],
};

// Tiny structured logger. Replaces the `console.warn`/`console.error`
// and silent `.catch(() => {})` patterns scattered across the codebase.
//
// Keeps a consistent shape:
//   [sam:<scope>] <message> { ...context }
//
// The log line is easy to grep and gives future ops a clean hook if we
// ever wire this up to a proper observability pipeline (Sentry, Axiom,
// etc.) — just swap the body of `logError` without touching callers.

type Context = Record<string, unknown> | undefined;

function format(scope: string, err: unknown, context?: Context) {
  const message = err instanceof Error ? err.message : String(err);
  const payload = context
    ? ` ${JSON.stringify(context, (_, v) => (v === undefined ? null : v))}`
    : "";
  return `[sam:${scope}] ${message}${payload}`;
}

export function logError(scope: string, err: unknown, context?: Context) {
  // Always include the raw error so stack traces survive in DevTools.
   
  console.error(format(scope, err, context), err);
}

export function logWarn(scope: string, message: string, context?: Context) {
   
  console.warn(format(scope, message, context));
}

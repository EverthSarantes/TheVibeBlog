// Simple client-side rate limiter to prevent abuse.
// Not a security boundary (can be bypassed), but reduces accidental spam.

const actions = new Map();

export function canPerform(action, cooldownMs = 2000) {
  const now = Date.now();
  const last = actions.get(action) || 0;
  if (now - last < cooldownMs) {
    return false;
  }
  actions.set(action, now);
  return true;
}

export function resetRateLimit(action) {
  actions.delete(action);
}
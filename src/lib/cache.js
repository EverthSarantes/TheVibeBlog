// Simple in-memory cache with TTL for Firestore data.
// Reduces repeated reads and minimizes Firebase costs.

const cache = new Map();
const DEFAULT_TTL = 60 * 1000; // 1 minute

export function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

export function cacheInvalidate(key) {
  if (key) cache.delete(key);
  else cache.clear();
}

export function cacheInvalidatePrefix(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// Longer TTL for rarely-changing data
export const TTL = {
  SHORT: 30 * 1000,       // 30s - articles list
  MEDIUM: 2 * 60 * 1000,  // 2min - article detail
  LONG: 5 * 60 * 1000,    // 5min - user profiles, tags
  STATIC: 10 * 60 * 1000, // 10min - tags list
};
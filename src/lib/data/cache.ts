// High-performance server-side in-memory cache with stale-while-revalidate

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const envTTL = process.env.CACHE_TTL_SECONDS;
    if (envTTL && !isNaN(Number(envTTL))) {
      this.defaultTTL = Number(envTTL) * 1000;
    }
  }

  get<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return { data: null, isStale: true };
    }

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttlMs;

    return {
      data: entry.data,
      isStale,
    };
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs || this.defaultTTL,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getEntryTime(key: string): string | null {
    const entry = this.cache.get(key);
    return entry ? new Date(entry.timestamp).toISOString() : null;
  }
}

// Global singleton to persist across hot reloads in dev
const globalCache = globalThis as unknown as { __incidentCache?: MemoryCache };

export const cache = globalCache.__incidentCache || new MemoryCache();
if (process.env.NODE_ENV !== 'production') {
  globalCache.__incidentCache = cache;
}

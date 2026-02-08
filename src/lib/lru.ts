type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class LruCache {
  private maxEntries: number;
  private store: Map<string, CacheEntry<unknown>>;

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh LRU order
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = this.get<T | Promise<T>>(key);
    if (cached) {
      return cached instanceof Promise ? await cached : cached;
    }

    const pending = factory();
    this.set(key, pending, ttlMs);

    try {
      const resolved = await pending;
      this.set(key, resolved, ttlMs);
      return resolved;
    } catch (error) {
      this.delete(key);
      throw error;
    }
  }
}

export const appCache = new LruCache(500);

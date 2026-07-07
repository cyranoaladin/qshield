import type { CacheAdapter } from "../types.js";

type MemoryCacheOptions = {
  readonly now?: () => number;
};

type Entry = {
  readonly expiresAt: number;
  readonly value: unknown;
};

export class MemoryCache implements CacheAdapter {
  private readonly entries = new Map<string, Entry>();
  private readonly now: () => number;

  constructor(options: MemoryCacheOptions = {}) {
    this.now = options.now ?? Date.now;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);

    if (entry === undefined) {
      return null;
    }

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);

      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      expiresAt: this.now() + ttlSeconds * 1000,
      value,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }
}

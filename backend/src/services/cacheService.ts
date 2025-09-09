// Simple in-memory cache for development
// In production, this would use Redis

interface CacheEntry {
  data: any;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: any, ttlSeconds: number = 600): Promise<void> {
    const expiry = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, {
      data,
      expiry
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  constructor() {
    // Run cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
}

export const cacheService = new CacheService();

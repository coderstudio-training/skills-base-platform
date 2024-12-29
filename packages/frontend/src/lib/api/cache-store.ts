// lib/api/cache-store.ts
'use client';

const CACHE_VERSION_KEY = 'app_cache_version';

export class CacheVersionStore {
  private version: string;
  private lastChecked: number = 0;
  private checkCooldown: number = 5000; // 5 seconds cooldown
  private subscribers: Set<() => void> = new Set();
  private static instance: CacheVersionStore;

  private constructor() {
    // Initialize with stored version or generate new one
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem(CACHE_VERSION_KEY);
      this.version = savedVersion || this.generateNewVersion();
    } else {
      this.version = this.generateNewVersion();
    }
  }

  private generateNewVersion(): string {
    return Math.random().toString(36).substring(7);
  }

  static getInstance(): CacheVersionStore {
    if (!CacheVersionStore.instance) {
      CacheVersionStore.instance = new CacheVersionStore();
    }
    return CacheVersionStore.instance;
  }

  async checkServerVersion(): Promise<boolean> {
    const now = Date.now();

    // Return early if within cooldown period
    if (now - this.lastChecked < this.checkCooldown) {
      return false;
    }

    try {
      const response = await fetch('/api/version', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (!response.ok) {
        return false;
      }

      const { version } = await response.json();
      this.lastChecked = now;

      // Only update and notify if version is different
      if (version !== this.version) {
        this.setVersion(version);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking server version:', error);
      return false;
    }
  }

  getVersion() {
    return this.version;
  }

  setVersion(newVersion: string) {
    this.version = newVersion;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_VERSION_KEY, newVersion);
    }
    this.notifySubscribers();
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

// Keep this for backwards compatibility
export function generateNewVersion(): string {
  return Math.random().toString(36).substring(7);
}

// Update this to use server version
export async function invalidateCache() {
  // This function now triggers a server-side version update
  try {
    const response = await fetch('/api/version', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_REVALIDATION_TOKEN}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to invalidate cache');
    }

    const { version } = await response.json();
    CacheVersionStore.getInstance().setVersion(version);
  } catch (error) {
    console.error('Error invalidating cache:', error);
    // Fallback to local version update if server request fails
    CacheVersionStore.getInstance().setVersion(generateNewVersion());
  }
}

export const cacheStore = CacheVersionStore.getInstance();

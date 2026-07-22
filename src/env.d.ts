// lib.dom's CacheStorage type is missing Cloudflare Workers' `caches.default`.
declare global {
  interface CacheStorage {
    readonly default: Cache;
  }
}

export {};

// cache.js — localStorage caching with TTL (time-to-live)

const Cache = (() => {
  const PREFIX = 'ghd_';       // namespace so we don't clash with other apps
  const TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

  function set(key, data) {
    const entry = {
      data,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      // localStorage can throw if storage quota is exceeded
      console.warn('Cache write failed:', e);
    }
  }

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      const age = Date.now() - entry.timestamp;

      if (age > TTL_MS) {
        // Data is stale — delete it and return null
        localStorage.removeItem(PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (e) {
      return null;
    }
  }

  function clear(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  return { set, get, clear, clearAll };
})();
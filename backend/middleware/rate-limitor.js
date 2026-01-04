// middleware/rate-limitor.js
export default function rateLimiter({ limit, windowSeconds, windowMinutes }) {
  const store = new Map();

  // Convert to ms internally
  let windowMs = 0;
  if (windowSeconds) windowMs = windowSeconds * 1000;
  if (windowMinutes) windowMs = windowMinutes * 60 * 1000;

  return function (req, res, next) {
    const clientKey = req.ip;
    const routeKey = req.route.path;
    const key = `${routeKey}:${clientKey}`;
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, { count: 1, windowStart: now });
      return next();
    }

    const entry = store.get(key);
    if (now - entry.windowStart < windowMs) {
      if (entry.count >= limit) {
        return res.status(429).json({ error: "Too many requests" });
      }
      entry.count++;
    } else {
      store.set(key, { count: 1, windowStart: now });
    }

    next();
  };
}
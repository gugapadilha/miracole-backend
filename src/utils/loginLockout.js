const redis = require('redis');
const config = require('../config');

let client = null;
const memoryStore = new Map();

async function init() {
  try {
    client = redis.createClient({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    });
    await client.connect();
    console.log('✅ Redis connected for login lockout');
  } catch (err) {
    client = null;
    console.error('❌ Redis (lockout) connection failed:', err.message);
  }
}

init();

const keyFor = (username) => `login_fail:${(username || '').toLowerCase()}`;

async function recordFailure(username, windowSeconds = 1800) {
  if (client) {
    try {
      const key = keyFor(username);
      const cnt = await client.incr(key);
      if (cnt === 1) {
        await client.expire(key, windowSeconds);
      }
      return cnt;
    } catch (e) {
      // fall back to memory
    }
  }
  const now = Date.now();
  const item = memoryStore.get(username) || { count: 0, expiresAt: now + (windowSeconds * 1000) };
  if (item.expiresAt < now) {
    item.count = 0;
    item.expiresAt = now + (windowSeconds * 1000);
  }
  item.count += 1;
  memoryStore.set(username, item);
  return item.count;
}

async function reset(username) {
  if (client) {
    try { await client.del(keyFor(username)); return; } catch (e) { /* noop */ }
  }
  memoryStore.delete(username);
}

async function isLocked(username, maxAttempts = 7) {
  if (client) {
    try {
      const key = keyFor(username);
      const countStr = await client.get(key);
      const count = countStr ? parseInt(countStr, 10) : 0;
      if (count >= maxAttempts) {
        const ttl = await client.ttl(key);
        return { locked: true, retryAfter: ttl > 0 ? ttl : 0 };
      }
      return { locked: false, retryAfter: 0 };
    } catch (e) {
      // fall through
    }
  }
  const now = Date.now();
  const item = memoryStore.get(username);
  if (!item) return { locked: false, retryAfter: 0 };
  if (item.expiresAt < now) { memoryStore.delete(username); return { locked: false, retryAfter: 0 }; }
  if (item.count >= maxAttempts) {
    return { locked: true, retryAfter: Math.ceil((item.expiresAt - now) / 1000) };
  }
  return { locked: false, retryAfter: 0 };
}

module.exports = {
  recordFailure,
  reset,
  isLocked
};



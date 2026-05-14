type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as {
  layerUpRateLimitBuckets?: Map<string, RateLimitBucket>;
};

function getBuckets() {
  if (!globalForRateLimit.layerUpRateLimitBuckets) {
    globalForRateLimit.layerUpRateLimitBuckets = new Map();
  }

  return globalForRateLimit.layerUpRateLimitBuckets;
}

function pruneExpiredBuckets(
  buckets: Map<string, RateLimitBucket>,
  now: number,
) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkFixedWindowRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const buckets = getBuckets();

  if (buckets.size > 5_000) {
    pruneExpiredBuckets(buckets, now);
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

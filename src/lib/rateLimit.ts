import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set"
  );
}

const redis = new Redis({ url: redisUrl, token: redisToken });

const limiters = new Map<string, Ratelimit>();

function getLimiter(bucket: string, limit: number, windowSec: number): Ratelimit {
  const key = `${bucket}:${limit}:${windowSec}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `rl:${bucket}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export async function rateLimit(
  userId: string | undefined | null,
  bucket: string,
  limit: number,
  windowSec: number
): Promise<{ limited: boolean }> {
  if (!userId) {
    return { limited: true };
  }

  try {
    const limiter = getLimiter(bucket, limit, windowSec);
    const result = await limiter.limit(userId);
    return { limited: !result.success };
  } catch (err) {
    console.warn(`[rateLimit] Upstash unreachable for ${bucket}:${userId}, failing open:`, err);
    return { limited: false };
  }
}

export const RATE_LIMIT_RESPONSE = {
  error: "Pansy needs a short breather — try again in a few minutes.",
};

import { getClient } from "@/lib/storage";

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSec: number
): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const c = await getClient();
    
    // Failsafe: If Redis is completely down or not configured, let the traffic through.
    // We don't want the app to break just because the rate limiter couldn't connect.
    if (!c) {
      return { success: true, limit, remaining: limit };
    }

    const key = `ratelimit:${identifier}`;
    
    // Increment the counter
    const requests = await c.incr(key);

    // If it's the very first request, set the expiration window
    // This ensures the key is automatically deleted and uses almost 0 memory long-term
    if (requests === 1) {
      await c.expire(key, windowSec);
    }

    const remaining = Math.max(0, limit - requests);

    return {
      success: requests <= limit,
      limit,
      remaining,
    };
  } catch (error) {
    // Failsafe: if the Redis command fails for any reason, fail open.
    console.error("Rate limit error:", error);
    return { success: true, limit, remaining: limit };
  }
}

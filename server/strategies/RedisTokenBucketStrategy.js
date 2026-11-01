// strategies/RedisTokenBucketStrategy.js
import RateLimiterStrategy from './RateLimiterStrategy.js';
import redis from '../config/redis.js';

class RedisTokenBucketStrategy extends RateLimiterStrategy {
    async consume(clientId, limit, windowMs) {
        const key = `ratelimit:token_bucket:${clientId}`;
        const now = Date.now();
        const requestedTokens = 1;

        // Execute the custom Redis Lua command
        // Keys: [key] -> KEYS[1]
        // Args: [limit, windowMs, now, requestedTokens] -> ARGV[1..4]
        const [allowed, remaining, resetTimeMs] = await redis.tokenBucketRateLimit(
            key,
            limit,
            windowMs,
            now,
            requestedTokens
        );

        return {
            allowed: allowed === 1,
            remaining: Number(remaining),
            resetTimeMs: Number(resetTimeMs)
        };
    }
}

export default RedisTokenBucketStrategy;
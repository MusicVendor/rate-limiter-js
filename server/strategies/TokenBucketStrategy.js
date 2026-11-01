// strategies/TokenBucketStrategy.js
const RateLimiterStrategy = require('./RateLimiterStrategy');

class TokenBucketStrategy extends RateLimiterStrategy {
    constructor() {
        super();
        this.buckets = {}; // In-memory bucket state by clientId
    }

    async consume(clientId, limit, windowMs) {
        const currentTime = Date.now();

        // Initialize bucket if first time seeing this client
        if (!this.buckets[clientId]) {
            this.buckets[clientId] = {
                tokens: limit,             // Start full
                lastRefillTime: currentTime
            };
        }

        const bucket = this.buckets[clientId];

        // 1. Calculate time passed since last evaluation
        const timePassedMs = currentTime - bucket.lastRefillTime;

        // 2. Refill tokens proportionally based on elapsed time (Lazy Refill)
        const refillRatePerMs = limit / windowMs;
        const tokensToAdd = timePassedMs * refillRatePerMs;

        if (tokensToAdd > 0) {
            // Cap capacity to max limit
            bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
            bucket.lastRefillTime = currentTime;
        }

        // 3. Evaluate if request can consume 1 token
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1; // Consume token
            return {
                allowed: true,
                remaining: Math.floor(bucket.tokens),
                resetTimeMs: currentTime + windowMs
            };
        }

        // 4. Rate limit exceeded
        const tokensNeeded = 1 - bucket.tokens;
        const timeToNextTokenMs = Math.ceil(tokensNeeded / refillRatePerMs);

        return {
            allowed: false,
            remaining: 0,
            resetTimeMs: currentTime + timeToNextTokenMs
        };
    }
}

module.exports = TokenBucketStrategy;
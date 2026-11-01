// strategies/RateLimiterStrategy.js

class RateLimiterStrategy {
    /**
     * Consume a token/request slot for a given client.
     * @param {string} clientId - Unique identifier (e.g. client IP)
     * @param {number} limit - Maximum requests allowed
     * @param {number} windowMs - Time window size in milliseconds
     * @returns {Promise<{ allowed: boolean, remaining: number, resetTimeMs: number }>}
     */
    async consume(clientId, limit, windowMs) {
        throw new Error("Method 'consume()' must be implemented by subclass.");
    }
}

module.exports = RateLimiterStrategy;
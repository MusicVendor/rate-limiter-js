// factory/strategyFactory.js
const FixedWindowStrategy = require('../strategies/FixedWindowStrategy');
const TokenBucketStrategy = require('../strategies/TokenBucketStrategy');
const RedisTokenBucketStartegy = require('../strategies/RedisTokenBucketStrategy');x

// Singleton strategy instances maintaining state across incoming requests
const strategies = {
    'fixed-window': new FixedWindowStrategy(),
    'token-bucket': new TokenBucketStrategy(),
    'redis-token-bucket': new RedisTokenBucketStartegy()
};

/**
 * Returns the requested rate-limiting strategy instance.
 * @param {string} [algorithmName] - Name of algorithm passed from header (e.g., 'token-bucket')
 * @returns {RateLimiterStrategy}
 */
const getStrategy = (algorithmName) => {
    const key = algorithmName?.toLowerCase().trim();
    
    // Return requested strategy if found; otherwise default to fixed-window
    return strategies[key] || strategies['fixed-window'];
};

module.exports = {getStrategy};
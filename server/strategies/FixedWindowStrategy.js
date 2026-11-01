// strategies/FixedWindowStrategy.js
const RateLimiterStrategy = require('./RateLimiterStrategy');

class FixedWindowStrategy extends RateLimiterStrategy {
    constructor() {
        super();
        this.requestCounts = {}; // In-memory map
    }

    async consume(clientId, limit, windowMs) {
        const currentTime = Date.now();

        if (!this.requestCounts[clientId]) {
            this.requestCounts[clientId] = { count: 1, startTime: currentTime };
            return {
                allowed: true,
                remaining: limit - 1,
                resetTimeMs: currentTime + windowMs
            };
        }

        const clientData = this.requestCounts[clientId];

        
        if (currentTime - clientData.startTime > windowMs) {
            clientData.count = 1;
            clientData.startTime = currentTime;
            return {
                allowed: true,
                remaining: limit - 1,
                resetTimeMs: currentTime + windowMs
            };
        }


        if (clientData.count >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTimeMs: clientData.startTime + windowMs
            };
        }

        clientData.count += 1;
        return {
            allowed: true,
            remaining: limit - clientData.count,
            resetTimeMs: clientData.startTime + windowMs
        };
    }
}

module.exports =  FixedWindowStrategy;
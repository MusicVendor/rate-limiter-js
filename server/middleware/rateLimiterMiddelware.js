const { getStrategy } = require('../factory/strategyFactory');

const LIMIT = 5;
const WINDOW_MS = 60000;

const rateLimiterMiddleware = async (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const algorithm = req.headers['x-algorithm'] || 'fixed-window';

    const strategy = getStrategy(algorithm);
    const { allowed, remaining, resetTimeMs } = await strategy.consume(clientIp, LIMIT, WINDOW_MS);

    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Algorithm', algorithm);

    if (!allowed) {
        const retryAfterSeconds = Math.ceil((resetTimeMs - Date.now()) / 1000);
        res.setHeader('Retry-After', Math.max(retryAfterSeconds, 1));

        return res.status(429).json({
            error: "Too many requests",
            message: `Rate limit exceeded. Try again after ${Math.max(retryAfterSeconds, 1)} seconds`
        });
    }

    next();
};

module.exports = rateLimiterMiddleware;
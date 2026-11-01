-- src/lua/token_bucket.lua
-- KEYS[1]: Rate limit key (e.g., "rate_limit:token_bucket:127.0.0.1")
-- ARGV[1]: Maximum bucket capacity (limit)
-- ARGV[2]: Window size in milliseconds
-- ARGV[3]: Current timestamp in milliseconds
-- ARGV[4]: Requested tokens (usually 1)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local refill_rate = capacity / window_ms

-- Retrieve existing bucket state stored as a Redis Hash
local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

if not tokens then
    -- First time seeing key: initialize bucket to full capacity
    tokens = capacity
    last_refill = now
else
    -- Calculate lazy token refill
    local elapsed = now - last_refill
    if elapsed > 0 then
        local tokens_to_add = elapsed * refill_rate
        tokens = math.min(capacity, tokens + tokens_to_add)
        last_refill = now
    end
end

-- Check if request can be fulfilled
if tokens >= requested then
    tokens = tokens - requested
    -- Save updated bucket state and set key expiration
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
    redis.call('PEXPIRE', key, window_ms)
    return {1, math.floor(tokens), now + window_ms} -- {allowed (1=true), remaining, resetTimeMs}
else
    local tokens_needed = requested - tokens
    local time_to_wait = math.ceil(tokens_needed / refill_rate)
    return {0, math.floor(tokens), now + time_to_wait} -- {allowed (0=false), remaining, resetTimeMs}
end --{UNDERSTAND THIS CODE}
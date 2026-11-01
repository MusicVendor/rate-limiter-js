const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const tokenBucketLuaPath = path.resolve('src/lua/token_bucket.lua');
const tokenBucketLuaScript = fs.readFileSync(tokenBucketLuaPath, 'utf8')

redis.defineCommand('tokenBucketRateLimit', {
  numberOfKeys: 1,
  lua: tokenBucketLuaScript,
});

export default redis;
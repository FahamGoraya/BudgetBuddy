import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));

await redisClient.connect();

export default redisClient;

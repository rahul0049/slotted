import {createClient} from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const redisClient = createClient({
    url:process.env.REDIS_URL,
});
redisClient.on('error',(err)=>console.error('Redis client error',err));
await redisClient.connect();
console.log('Redis connected');
export default redisClient;
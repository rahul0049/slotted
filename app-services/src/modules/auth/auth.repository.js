import { query } from "../../shared/db/index.js";
import redisClient from "../../shared/redis.js";

export const createUser = async ({name,email,passwordHash,role='user'})=>{
    const result = await query(
        `INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) 
        RETURNING id,name,email,role,created_at`,[name,email,passwordHash,role] 
    );
    return result.rows[0];
};


export const findUserByEmail = async (email)=>{
    const result = await query(
        `SELECT * FROM users WHERE email = $1`,[email]
    );
    return result.rows[0];
};


export const findUserById = async ({id})=>{
    const result = await query(
        `SELECT id,name,email,role,created_at FROM users WHERE id=$1`,[id]
    );
    return result.rows[0];
}

export const storeRefreshToken = async (userId, refreshToken, ttlSeconds) => {
  await redisClient.set(`refresh:${userId}`, refreshToken, { EX: ttlSeconds });
};

export const getStoredRefreshToken = async (userId) => {
  return redisClient.get(`refresh:${userId}`);
};

export const deleteRefreshToken = async (userId) => {
  await redisClient.del(`refresh:${userId}`);
};



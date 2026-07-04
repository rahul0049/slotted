import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import authRoutes from './modules/auth/auth.routes.js';
import { query } from './shared/db/index.js';
import redisClient from './shared/redis.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
const app = express();
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/catalog',catalogRoutes);
app.get('/health', async (req, res) => {
  try {
    const result = await query(
      'SELECT current_database(), current_user'
    );

    console.log(result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("FULL ERROR:", err);

    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>console.log(`app-service running on port ${PORT}`));
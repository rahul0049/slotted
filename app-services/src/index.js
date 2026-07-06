import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import authRoutes from './modules/auth/auth.routes.js';
import { query } from './shared/db/index.js';
import redisClient from './shared/redis.js';
import bookingRoutes from './modules/booking/booking.routes.js'
import catalogRoutes from './modules/catalog/catalog.routes.js';
const app = express();
app.use('/api/payment/webhook',(req,res,next)=>{
  let raw ='';
  req.on('data',chunk=>raw+=chunk);
  req.on('end',()=>{
    req.rawBody=raw;
    req.body=JSON.parse(raw);
    next();
  });
});
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/catalog',catalogRoutes);
app.use('/api/booking',bookingRoutes);
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
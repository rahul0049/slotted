import { query,pool } from "../../shared/db/index.js";
import redisClient from "../../shared/redis.js";
const LOCK_TTL_SECONDS=600;

export const lockSeatInRedis = async(unitId,userId)=>{
    const result = await redisClient.set(
        `seat:lock:${unitId}`,
        userId,
        {NX:true,EX:LOCK_TTL_SECONDS}
    );
    return result === 'OK';
};

export const getLockOwner = async(unitId)=>{
    return redisClient.get(`seat:lock:${unitId}`);
};

export const releaseSeatLock = async(unitId)=>{
    await redisClient.del(`seat:lock:${unitId}`);
}


export const findInventoryUnit = async(unitId)=>{
    const result =await query(
        `SELECT * FROM inventory_units WHERE id = $1`,
        [unitId]
    );
    return result.rows[0];
}

export const findBookingByIdempotencyKey = async(key)=>{
    const result = await query(`
        SELECT * FROM bookings WHERE idempotency_key=$1`,
    [key]);
    return result.rows[0];
}


export const createBookingTransaction = async ({userId,providerId,unitIds,totalAmount,idempotencyKey})=>{
    const client = await pool.connect();
    try {
        await client.query(`BEGIN`);
        const placeholders = unitIds.map((_,i)=>`$${i+1}`).join(', ');
        const unitResults = await client.query(
            `SELECT id,status,version FROM inventory_units
            WHERE id IN(${placeholders})
            FOR UPDATE`,
            unitIds
        );
        const units = unitResults.rows;

        const unavailable = units.filter(u=>u.status!=='AVAILABLE');
        if(unavailable.length>0){
            await client.query(`ROLLBACK`);
            const err = new Error('One or more seats are no longer available');
            err.status = 409;
            throw err;
        }

        for(const unitId of unitIds){
            await client.query(
                `INSERT INTO booking_units (booking_id,inventory_unit_id)
                VALUES ($1,$2)`,
                [booking.id,unitId]
            );
        }

        for(const unit of units){
            const updated = await client.query(
                `UPDATE inventory_units
                SET status = 'LOCKED', version=version+1
                WHERE id=$1 AND version =$2`,
                [unit.id,unit.version]
            );
            if(updated.rowCount===0){
                await client.query(`ROLLBACK`);
                const err = new Error('SEAT was modified concurrently-please retry');
                err.status= 409;
                throw err;
            }
        }
        await client.query(`COMMIT`);
        return booking;

    } catch (err) {
        try{await client.query(`ROLLBACK`);} catch(_){}
        throw err;
    }

    finally{
        client.release();
    }
};

export const findBookingById = async (id)=>{
    const result = await query(
        `SELECT 
        b.*,
        array_agg(bu.inventory_unit_id) AS unit_ids
        FROM bookings b
        JOIN booking_units bu ON bu.booking_id=b.id
        WHERE b.id=$1
        GROUP BY b.id`,
        [id]
    );
    return result.rows[0];
};

export const findBookingByUser = async (userId)=>{
    const result = await query(
        `SELECT
        b.*,
        array_agg(bu.inventory_unit_id) AS unit_ids
        FROM bookings b
        JOIN booking_units bu ON bu.booking_id=b.id
        WHERE b.user_id =$1
        GROUP BY b.id
        ORDER BY b.created_at DESC`,
        [userId]
    );
    return result.rows;
}
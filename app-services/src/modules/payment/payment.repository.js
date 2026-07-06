import { query,Pool } from "../../shared/db/index.js";
import { releaseSeatLock } from "../booking/booking.repository.js";

export const findPaymentByBookingId = async(bookingId)=>{
    const result = await query(
        `SELECT * FROM payments WHERE booking_id=$1`,
        [bookingId]
    );
    return result.rows[0];
}

export const findPaymentByTxnId = async(txnId)=>{
    const result = await query(
        `SELECT * FROM payments WHERE provider_txn_id=$1`,
        [txnId]
    );
    return result.rows[0];
}

export const createPayment = async({bookingId,amount ,providerTxnId})=>{
    const result = await query(
        `INSERT INTO payments (booking_id,amount,provider_txn_id,status) 
        VALUES ($1,$2,$3,'PENDING)
        RETURNING *`,
        [bookingId,amount,providerTxnId]
    );
    return result.rows[0];
}

export const confirmBookingTransaction = async(bookingId)=>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`UPDATE payments SET status = 'SUCCESS' WHERE booking_id=$1`,
            [bookingId]
        );
        await client.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`,
            [bookingId]
        );
        const unitsResult = await client.query(
            `SELECT inventory_unit_id FROM booking_units WHERE booking_id=$1`,
            [bookingId]
        );
        const unitIds = unitsResult.rows.map(r=>r.inventory_unit_id);
        for(const unitId of unitIds){
            await client.query(
                `UPDATE inventory_units SET status = 'BOOKED' where id=$1`,
                [unitId]
            );
            await releaseSeatLock(unitId);
        }
        await client.query('COMMIT');
        return unitIds;

    } catch (err) {
        try{await client.query('ROLLBACK');} catch(_){}
        throw err;
    }
    finally{
        client.release();
    }

}

export const failBookingTransaction = async(bookingId)=>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE payments SET status = 'FAILED' WHERE booking_id = $1`,
            [bookingId]
        )
        await client.query(
            `UPDATE bookings SET status = 'FAILED' WHERE id = $1`,
            [bookingId]
        )
        const unitsResult = await client.query(
            `SELECT inventory_unit_id FROM booking_units WHERE booking_id=$1`,
            [bookingId]
        );
        const unitIds = unitsResult.rows.map(r=>r.inventory_unit_id);
        for(const unitId of unitIds){
            await client.query(
                `UPDATE inventory_units SET status = 'AVAILABLE' WHERE id=$1`,
                [unitId]
            );
            await releaseSeatLock(unitId);
        }
        await client.query('COMMIT');
        return unitIds;
        
    } catch (err) {
        try{await client.query('ROLLBACK');} catch(_){}
        throw err;
    }
    finally{
        client.release();
    }
};
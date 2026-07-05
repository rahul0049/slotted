import { createBookingTransaction, findBookingById, findBookingByIdempotencyKey, findBookingByUser, findInventoryUnit, getLockOwner, lockSeatInRedis, releaseSeatLock } from "./booking.repository.js"

export const lockSeat = async(unitId,userId)=>{
    const unit = await findInventoryUnit(unitId);
    if(!unit){
        const err=new Error('Seat not found');
        err.status=404;
        throw err;
    }
    if(unit.status!=='AVAILABLE'){
        const err = new Error(`Seat is currently ${unit.statu.toLowerCase()}`);
        err.status=409;
        throw err;
    }
    const locked = await lockSeatInRedis(unitId,userId);
    if(!locked){
        const err = new Error('Seat is already locked by another user ');
        err.status = 409; 
        throw err;
    }
    return {locked:true,unitId,expiresIn:600};
};

export const releaseSeat = async(unitId,userId)=>{
    const owner = await getLockOwner(unitId);
    if(owner !==userId){
        const err = new Error('You do not own the lock on this seat');
        err.status = 403;
        throw err;
    }
    await releaseSeatLock(unitId);
    return {released:true,unitId};
}

export const createBooking = async({userId,providerId,unitId,totalAmount,idempotencyKey})=>{
    const existing = await findBookingByIdempotencyKey(idempotencyKey);
    if(existing) return existing;
    for(const unitId of unitIds){
        const owner = await getLockOwner(unitId);
        if(owner!==userId){
            const err = new Error(`You do not hold the lock on seat ${unitId}`);
            err.status = 403;
            throw err;
        }
    }
    const booking = await createBookingTransaction({userId,providerId,unitId,totalAmount,idempotencyKey});
    return booking;
}

export const getBooking = async(bookingId,userId)=>{
    const booking = await findBookingById(bookingId);
    if(!booking){
        const err = new Error('Booking not found ');
        err.status = 404;
        throw err;
    }
    if(booking.user_id!==userId){
        const err = new Error('Forbidden');
        err.status= 403;
        throw err;
    }
    return booking;
}

export const getUserBookings = async(userId)=>{
    return findBookingByUser(userId);
}
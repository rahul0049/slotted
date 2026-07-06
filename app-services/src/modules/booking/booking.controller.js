import { createBooking, getBooking,releaseSeat, getUserBookings, lockSeat } from "./booking.service.js";

export const lockSeatController = async(req,res)=>{
    try {
        const {unitId}=req.params;
        const userId =req.user.id;
        const result = await lockSeat(unitId,userId);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({error:err.message});
    }
};
export const releaseLockController = async (req, res) => {
  try {
    const { unitId } = req.params;
    const userId = req.user.id;
    const result = await releaseSeat(unitId, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createBookingController = async(req,res)=>{
    try {
        const {providerId,unitIds,totalAmount}=req.body;
        const userId = req.user.id;
        const idempotencyKey = req.headers['idempotency-key'];
        if (!idempotencyKey) {
             return res.status(400).json({ error: 'Idempotency-Key header is required' });
        }

        if (!providerId || !unitIds?.length || !totalAmount) {
            return res.status(400).json({error:'providerId,unitsId,totalAmount are required'});
        }
        const booking = await createBooking({userId,providerId,unitId,totalAmount,idempotencyKey});
        res.status(201).json({booking});
    } catch (err) {
        res.status(err.status || 500).json({error:err.message});
    }
};

export const getBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await getBooking(id, userId);
    res.status(200).json({ booking });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getUserBookingsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await getUserBookings(userId);
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
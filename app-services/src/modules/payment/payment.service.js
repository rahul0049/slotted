import { findBookingById } from "../booking/booking.repository.js";
import { createPayment,findPaymentByBookingId,findPaymentByTxnId,confirmBookingTransaction,failBookingTransaction } from "./payment.repository.js";
import { initiatePayment,verifyWebhookSignature } from "../../shared/utils/mockGateway.js";
export const initiatePaymentService = async({bookingId,userId})=>{
    const booking = await findBookingById(bookingId);
    if(!booking){
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
    }
    if(booking.user_id!==userId){
        const err = new Error('Forbidden');
        err.status=403;
        throw err;
    }
    if(booking.status !== 'PENDING'){
        const err = new Error(`Booking is alreading ${booking.status.toLowerCase()}`);
        err.status = 409;
        throw err;
    }
    const existing = await findPaymentByBookingId(bookingId);
    if(existing) return existing;
    const {orderId,amount,currency} = await initiatePayment({
        amount:booking.total_amount,
        bookingId,
    })
    const payment = await createPayment({
        bookingId,
        amount :booking.total_amount,
        providerTxnId:orderId,
    });

    return {
        ...payment,
        orderId,
        amount,
        currency,
        keyId:process.env.RAZORPAY_KEY_ID,
    }
};
export const handleWebhook = async({rawBody,payload,signature})=>{
    const isValid = verifyWebhookSignature(rawBody,signature);
    if(!isValid){
        const err = new Error('Invalid webhook signature');
        err.status = 401;
        throw err;
    }
    const event = payload.event;
    const entity =payload.payload?.payment?.entity;
    if(!entity){
        const err = new Error('Invalid webhook payload');
        err.status = 400;
        throw err;
    }
    const payment = await findPaymentByTxnId(entity.order_id);
    if(!payment){
        const err = new Error('Payment record not found');
        err.status = 404;
        throw err;
    }
    if(event ==='payment.captured'){
        await confirmBookingTransaction(payment.booking_id);
        return {result:'confirmed',bookingId:payment.booking_id};
    }

    if(event==='payment.failed'){
        await failBookingTransaction(payment.booking_id);
        return {result:'failed',bookingId:payment.booking_id};
    }
    return {result:'ignored',event};
}
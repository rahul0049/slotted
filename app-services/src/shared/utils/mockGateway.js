import Razorpay from 'razorpay';
import crypto, { sign } from 'crypto';
import 'dotenv/config';

const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
});

export const initiatePayment = async({amount,bookingId})=>{
    const order = await razorpay.orders.create({
        amount:Math.round(amount*100),
        currency:'INR',
        receipt:bookingId,
        notes:{bookingId}
    });
    return {
        orderId:order.id,
        amount:order.amount,
        currency:order.currency,
        status:order.status,
    };
}

export const verifyWebhookSignature = async(rawBody,signature)=>{
    const expected = crypto
    .createHmac('sha256',process.env.PAYMENT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
    return expected===signature;
}

export const verifyPaymentSignature = async({orderId,paymentId,signature})=>{
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
    .createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
    return expected===signature;
}
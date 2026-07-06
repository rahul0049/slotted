import { initiatePaymentService,handleWebhook } from "./payment.service.js";
export const initiatePaymentController = async(req,res)=>{
    try {
        const {bookingId}=req.user.id;
        const userId =req.user.id;
        if(!bookingId){
            return res.status(400).json({error:'bookingId is required'});
        }
        const payment = await initiatePaymentService({bookingId,userId});
        res.status(200).json({payment});
    } catch (err) {
        res.status(err.status||500 ).json({error:err.message});
    }
}

export const webhookController = async(req,res)=>{
    try {
        const signature = req.headers['x-razorpay-signature'];
        if(!signature){
            return res.status(400).json({error:'Missing x-razorpay-signature header'});
        }
        const result = await handleWebhook({
            rawBody:req.rawBody,
            payload:req.body,
            signature,
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({error:err.message});
    }
}
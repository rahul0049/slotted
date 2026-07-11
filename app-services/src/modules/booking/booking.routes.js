import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { createBookingController, getBookingController, getUserBookingsController, lockSeatController, releaseLockController } from "./booking.controller.js";
const router = Router();
import { checkQueueEligibility } from "../../shared/middleware/checkQueueEligibility.js";

router.use(authenticate);
router.post('/lock/:userId',lockSeatController);
router.delete('/lock/:userId',releaseLockController);
router.post('/',createBookingController);
router.get('/',getUserBookingsController);
router.get('/:id',getBookingController);
router.post('/lock/:unitId',authenticate,checkQueueEligibility((req)=>req.body.providerId),lockSeatController);
export default router;
import {Router} from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { initiatePaymentController, webhookController } from './payment.controller.js';
const router = Router();
router.post('/initiate',authenticate,initiatePaymentController);
router.post('/webhook',webhookController);
export default router;
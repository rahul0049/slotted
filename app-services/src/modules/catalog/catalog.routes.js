import {Router} from 'express';
import { getProviderController, listInventoryController, listProvidersController } from './catalog.controller.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
const router = Router();
router.get('/providers',listProvidersController);
router.get('/providers/:id',getProviderController);
router.get('/providers/:id/inventory',authenticate,listInventoryController);
export default router;
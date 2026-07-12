import {Router} from 'express';
import { listProvidersController,
  getProviderController,
  listInventoryController,
  createVenueController,
  createProviderController,
  createInventoryController,
  listVenuesController, } from './catalog.controller.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
const router = Router();
router.get('/providers',listProvidersController);
router.get('/providers/:id',getProviderController);
router.get('/providers/:id/inventory',authenticate,listInventoryController);

router.get('/providers/:id/inventory', authenticate, listInventoryController);

router.post('/venues', authenticate, authorize('admin', 'provider'), createVenueController);
router.post('/providers', authenticate, authorize('admin', 'provider'), createProviderController);
router.post('/providers/:id/inventory', authenticate, authorize('admin', 'provider'), createInventoryController);

export default router;
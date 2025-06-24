import { Router } from 'express';
import ChainController from './chainController';
import DataSyncService from '../services/dataSyncService';

const router = Router();

// Initialize data sync service and controller
const dataSyncService = new DataSyncService();
const chainController = new ChainController(dataSyncService);

// Simple routes without swagger docs for now
router.get('/chains', chainController.getAllChains);
router.get('/chain/:chainName', chainController.getChainDetails);
router.get('/chain/:chainName/lite', chainController.getChainLite);
router.get('/chain/:chainName/assets', chainController.getChainAssets);
router.get('/chain/:chainName/endpoints/rpc', chainController.getChainEndpointsRpc);
router.get('/chain/:chainName/endpoints/rest', chainController.getChainEndpointsRest);
router.get('/chain/:chainName/endpoints/grpc', chainController.getChainEndpointsGrpc);
router.get('/chain/:chainName/peers', chainController.getChainPeers);
router.get('/chain/:chainName/seeds', chainController.getChainSeeds);

// Export both router and dataSyncService for app initialization
export { router, dataSyncService };

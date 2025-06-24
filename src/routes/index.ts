import { Router } from 'express';
import ChainController from './chainController';
import DataSyncService from '../services/dataSyncService';
import { validateChainName, validatePaginationQuery, validateFilterQuery, validateSearchQuery } from '../middleware/validation';
import { generalRateLimit, syncRateLimit, searchRateLimit, burstRateLimit } from '../middleware/rateLimiting';
import { securityHeaders, requestLogger } from '../middleware/security';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Apply security headers and request logging to all routes
router.use(securityHeaders);
router.use(requestLogger);

// Apply general rate limiting to all routes
router.use(generalRateLimit);

// Initialize data sync service and controller
const dataSyncService = new DataSyncService();
const chainController = new ChainController(dataSyncService);

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         error:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/chains:
 *   get:
 *     summary: Get list of all chains
 *     tags: [Chains]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Number of chains to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of chains to skip
 *     responses:
 *       200:
 *         description: List of chain names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/chains', validatePaginationQuery, chainController.getAllChains);

/**
 * @swagger
 * /v1/chain/{chainName}:
 *   get:
 *     summary: Get complete chain information
 *     tags: [Chains]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: Complete chain information
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName', validateChainName, chainController.getChainDetails);

/**
 * @swagger
 * /v1/chain/{chainName}/lite:
 *   get:
 *     summary: Get essential chain information
 *     tags: [Chains]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: Essential chain information
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/lite', validateChainName, chainController.getChainLite);

/**
 * @swagger
 * /v1/chain/{chainName}/assets:
 *   get:
 *     summary: Get chain asset list
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: Chain asset list
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/assets', validateChainName, chainController.getChainAssets);

/**
 * @swagger
 * /v1/chain/{chainName}/endpoints/rpc:
 *   get:
 *     summary: Get RPC endpoints
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: RPC endpoints
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/endpoints/rpc', validateChainName, chainController.getChainEndpointsRpc);

/**
 * @swagger
 * /v1/chain/{chainName}/endpoints/rest:
 *   get:
 *     summary: Get REST API endpoints
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: REST API endpoints
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/endpoints/rest', validateChainName, chainController.getChainEndpointsRest);

/**
 * @swagger
 * /v1/chain/{chainName}/endpoints/grpc:
 *   get:
 *     summary: Get gRPC endpoints
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: gRPC endpoints
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/endpoints/grpc', validateChainName, chainController.getChainEndpointsGrpc);

/**
 * @swagger
 * /v1/chain/{chainName}/peers:
 *   get:
 *     summary: Get persistent peers
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: List of persistent peers
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/peers', validateChainName, chainController.getChainPeers);

/**
 * @swagger
 * /v1/chain/{chainName}/seeds:
 *   get:
 *     summary: Get seed nodes
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: chainName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the chain
 *     responses:
 *       200:
 *         description: List of seed nodes
 *       404:
 *         description: Chain not found
 */
router.get('/chain/:chainName/seeds', validateChainName, chainController.getChainSeeds);

/**
 * @swagger
 * /v1/sync:
 *   post:
 *     summary: Manually trigger data sync (Admin only)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: X-API-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin API key for authentication
 *     responses:
 *       200:
 *         description: Sync started successfully
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: IP address not authorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Sync failed
 */
router.post('/sync', adminAuth, syncRateLimit, chainController.triggerSync);

// Export both router and dataSyncService for app initialization
export { router, dataSyncService };

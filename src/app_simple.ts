import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { router as apiRoutes, dataSyncService } from './routes/index_simple';
import logger from './utils/logger';

// Load environment variables
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Cosmos Chain Registry API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      chains: '/v1/chains',
      chain: '/v1/chain/{chainName}',
      chainLite: '/v1/chain/{chainName}/lite',
      assets: '/v1/chain/{chainName}/assets',
      rpcEndpoints: '/v1/chain/{chainName}/endpoints/rpc',
      restEndpoints: '/v1/chain/{chainName}/endpoints/rest',
      grpcEndpoints: '/v1/chain/{chainName}/endpoints/grpc',
      peers: '/v1/chain/{chainName}/peers',
      seeds: '/v1/chain/{chainName}/seeds'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const chains = dataSyncService.getAllChainNames();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    chains_loaded: chains.length,
    uptime: process.uptime()
  });
});

// API routes
app.use('/v1', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Initialize data sync service and start server
async function startServer() {
  try {
    logger.info('Initializing data sync service...');
    await dataSyncService.initialize();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/v1/chains`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;

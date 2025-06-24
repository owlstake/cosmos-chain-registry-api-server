import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { router as apiRoutes, dataSyncService } from './routes';
import logger from './utils/logger';

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;
const ENABLE_SWAGGER = process.env.ENABLE_SWAGGER === 'true';

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' })); // Request size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Swagger configuration
if (ENABLE_SWAGGER) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Cosmos Chain Registry API',
        version: '1.0.0',
        description: 'REST API server for Cosmos Chain Registry data with daily sync from cosmos/chain-registry repository',
        contact: {
          name: 'API Support',
        },
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'Admin API key for sync operations'
          }
        }
      }
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Redirect root to Swagger documentation
  app.get('/', (req, res) => {
    res.redirect('/v1/api-docs');
  });

  logger.info('Swagger UI enabled at /v1/api-docs');
} else {
  // Simple root endpoint when Swagger is disabled
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
}

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
      if (ENABLE_SWAGGER) {
        logger.info(`Swagger documentation available at http://localhost:${PORT}/v1/api-docs`);
      }
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

# Cosmos Chain Registry API Server

A production-ready REST API server that provides access to Cosmos ecosystem chain data. This server automatically syncs with the official [cosmos/chain-registry](https://github.com/cosmos/chain-registry) repository daily and serves the data through a fast, cached API.

## ✨ Features

- **🔄 Auto-sync**: Daily synchronization with cosmos/chain-registry at 2 AM
- **⚡ In-memory caching**: Fast response times with efficient caching
- **🛡️ Security**: Rate limiting, input validation, security headers
- **📚 API Documentation**: Interactive Swagger UI documentation
- **🐳 Docker Ready**: Production containerization with multi-stage builds
- **📊 Health Monitoring**: Built-in health check endpoints
- **🔧 Configurable**: Environment-based configuration

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/cosmos-chain-registry-api-server.git
cd cosmos-chain-registry-api-server

# Run with Docker Compose (production)
docker-compose up -d

# Or run development version with hot reload
docker-compose --profile development up -d
```

### Option 2: Manual Installation

```bash
# Prerequisites: Node.js 18+ and Git

# Clone and install
git clone https://github.com/your-username/cosmos-chain-registry-api-server.git
cd cosmos-chain-registry-api-server
npm install

# Configure environment
cp .env.example .env
# Edit .env file as needed

# Build and start
npm run build
npm start

# Or run in development mode
npm run dev
```

## 📋 API Endpoints

### Chain Information
- `GET /v1/chains` - List all chains with pagination
- `GET /v1/chain/{chainName}` - Get complete chain information
- `GET /v1/chain/{chainName}/lite` - Get essential chain information

### Assets & Network
- `GET /v1/chain/{chainName}/assets` - Get chain asset list
- `GET /v1/chain/{chainName}/endpoints` - Get RPC/API endpoints
- `GET /v1/chain/{chainName}/peers` - Get persistent peers
- `GET /v1/chain/{chainName}/seeds` - Get seed nodes

### Utility
- `GET /health` - Health check and status
- `POST /v1/sync` - Manual sync trigger (admin only, requires API key)
- `GET /v1/api-docs` - Interactive API documentation (if enabled)

### Example API Calls

```bash
# List first 10 chains
curl "http://localhost:3000/v1/chains?limit=10"

# Get Osmosis chain information
curl "http://localhost:3000/v1/chain/osmosis"

# Get Cosmos Hub assets
curl "http://localhost:3000/v1/chain/cosmoshub/assets"

# Check server health
curl "http://localhost:3000/health"

# Manual sync (admin only - requires API key)
curl -X POST "http://localhost:3000/v1/sync" \
  -H "X-API-Key: your-admin-api-key"
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Server Configuration
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode

# Features
ENABLE_SWAGGER=false        # Enable Swagger UI (default: false in production)
LOG_LEVEL=info             # Logging level (error, warn, info, debug)

# Data Sync
CACHE_TTL=3600             # Cache TTL in seconds (1 hour)
SYNC_INTERVAL=86400        # Sync interval in seconds (24 hours)

# Security
ALLOWED_ORIGINS=*          # CORS allowed origins (comma-separated)

# Admin Authentication (for sync endpoint)
ADMIN_API_KEY=your-secure-admin-key    # Admin API key for manual sync
ADMIN_IPS=127.0.0.1,your-server-ip    # Comma-separated IP whitelist

# Optional: General API Authentication
API_KEYS=key1,key2         # Optional API keys for general access
```

### Docker Environment

For Docker deployments, you can override environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - ENABLE_SWAGGER=false
  - LOG_LEVEL=info
```

## 📊 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2025-06-24T10:00:00.000Z",
  "pagination": { /* pagination info for list endpoints */ }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2025-06-24T10:00:00.000Z"
}
```

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and run production container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Mode

```bash
# Run development container with hot reload
docker-compose --profile development up -d

# Access development server
curl http://localhost:3001/health
```

### Docker Configuration

The production Docker setup includes:
- Multi-stage builds for optimized image size
- Non-root user for security
- Health checks for monitoring
- Volume mounts for data persistence
- Resource limits and reservations

## 📁 Project Structure

```
├── src/
│   ├── app.ts                 # Express application setup
│   ├── routes/
│   │   ├── index.ts          # Route configuration
│   │   └── chainController.ts # API controllers
│   ├── services/
│   │   └── dataSyncService.ts # Data synchronization
│   ├── middleware/
│   │   ├── validation.ts     # Input validation
│   │   ├── rateLimiting.ts   # Rate limiting
│   │   └── security.ts       # Security middleware
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       └── logger.ts         # Logging configuration
├── data/                      # Chain registry data (auto-generated)
├── logs/                      # Application logs
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                # Container definition
└── package.json              # Dependencies and scripts
```

## 🛡️ Security Features

- **Admin Authentication**: API key + IP whitelist for sync endpoint
- **Rate Limiting**: 1000 requests per 15 minutes, 30 requests per minute burst
- **Input Validation**: Chain names, query parameters, request size limits
- **Security Headers**: CSP, XSS protection, content type options
- **CORS Configuration**: Configurable allowed origins
- **Request Size Limits**: 10KB maximum request size
- **Non-root Container**: Docker containers run as non-root user
- **Access Logging**: All admin operations are logged with IP and timestamp

## 📝 Available Scripts

```bash
npm run build          # Build TypeScript to JavaScript
npm run start          # Start production server
npm run dev            # Start development server with hot reload
npm run docker:build   # Build Docker image
npm run docker:run     # Run Docker containers
npm run docker:stop    # Stop Docker containers
npm run docker:dev     # Run development Docker containers
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

The `/health` endpoint provides server status:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-24T10:00:00.000Z",
  "chains_loaded": 217,
  "uptime": 3600
}
```

### Docker Health Checks

Docker containers include automatic health checks:
- Interval: 30 seconds
- Timeout: 10 seconds  
- Start period: 40 seconds
- Retries: 3

## 🔄 Data Synchronization

The server automatically syncs with the cosmos/chain-registry repository:

- **Schedule**: Daily at 2:00 AM
- **Manual Trigger**: POST `/v1/sync` (rate limited to 5 requests/hour)
- **Data Source**: https://github.com/cosmos/chain-registry
- **Filtered Content**: Excludes non-chain directories like `.github`, `_IBC`, etc.
- **Caching**: In-memory cache with configurable TTL

### Sync Process

1. Clone/pull latest chain-registry repository
2. Filter valid chain directories
3. Parse `chain.json`, `assetlist.json`, and `versions.json` files
4. Update in-memory cache
5. Log sync status and statistics

## 🚦 Rate Limiting

Different endpoints have different rate limits:

- **General API**: 1000 requests per 15 minutes
- **Sync Endpoint**: 5 requests per hour
- **Burst Protection**: 30 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change `PORT` in `.env` file
2. **Git not available**: Install Git or use Docker
3. **Permission denied**: Check file permissions for `data/` and `logs/` directories
4. **Sync failures**: Check internet connectivity and GitHub access

### Logs

Application logs are stored in the `logs/` directory:
- `logs/app.log` - General application logs
- `logs/error.log` - Error logs only

For Docker:
```bash
# View container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f cosmos-chain-registry-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Cosmos Chain Registry](https://github.com/cosmos/chain-registry) - Official chain registry data source
- [Cosmos Ecosystem](https://cosmos.network/) - The Internet of Blockchains

---

**Live API**: Currently syncing data from **217 chains** in the Cosmos ecosystem!

For questions or support, please open an issue on GitHub.

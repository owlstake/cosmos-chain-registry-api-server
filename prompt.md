# Project Prompt - Cosmos Chain Registry API Server

## Project Overview
Build a REST API server that serves Cosmos chain registry data by pulling from the official [cosmos/chain-registry](https://github.com/cosmos/chain-registry) repository daily and exposing it through structured API endpoints.

## Core Requirements
- **Data Source**: Daily sync from https://github.com/cosmos/chain-registry
- **Tech Stack**: Node.js/Express.js + TypeScript, no database needed
- **Architecture**: Read directly from JSON files, in-memory caching
- **Containerization**: Docker support

## Key Features
1. **Daily Auto-sync**: Pull latest data from chain-registry repository
2. **REST API**: Serve chain information through structured endpoints
3. **Performance**: In-memory caching for fast responses
4. **Monitoring**: Health checks, logging, metrics
5. **Security**: Rate limiting, CORS, input validation
6. **Documentation**: Swagger/OpenAPI (configurable via ENABLE_SWAGGER env var)

## API Endpoints to Implement
- `GET /v1/chains` - List all chains
- `GET /v1/chain/:chainName` - Full chain details
- `GET /v1/chain/:chainName/lite` - Basic chain info
- `GET /v1/chain/:chainName/assets` - Chain assets
- `GET /v1/chain/:chainName/endpoints/rpc` - RPC endpoints
- `GET /v1/chain/:chainName/endpoints/rest` - REST endpoints
- `GET /v1/chain/:chainName/endpoints/grpc` - gRPC endpoints
- `GET /v1/chain/:chainName/peers` - Persistent peers
- `GET /v1/chain/:chainName/seeds` - Seed nodes

## Data Structure
Each chain folder contains:
- `chain.json` (required) - Main chain information
- `assetlist.json` (required) - Asset/token information  
- `versions.json` (optional) - Version history

## Ignored Folders During Sync
- `.github/` - GitHub specific files
- `_IBC/` - IBC templates and docs
- `_memo_keys/` - Memo keys documentation
- `_non-cosmos/` - Non-cosmos chains
- `_scripts/` - Utility scripts
- `_template/` - Template files

## Implementation Phases
### Phase 1 (1-2 days): Core Setup
- Project structure setup with TypeScript
- Basic Express server
- Data sync service implementation
- Core API endpoints

### Phase 2 (1-2 days): Enhancement
- Caching implementation
- Error handling & validation
- Security features (CORS, rate limiting)
- API documentation (Swagger/OpenAPI with ENABLE_SWAGGER toggle)

### Phase 3 (1-2 days): Production Ready
- Unit & integration tests
- Docker setup
- Monitoring & logging
- CI/CD pipeline

## Success Criteria
- ✅ API server serves accurate data from chain-registry
- ✅ Daily sync works reliably with error handling
- ✅ Performance is optimized with caching
- ✅ Production-ready with Docker, tests, monitoring
- ✅ API documentation is complete and accurate

## Technical Constraints
- No database - read directly from JSON files
- Must handle large JSON files efficiently
- Graceful error handling for missing/invalid data
- Cache invalidation on data updates
- Memory-efficient data processing

## Environment Configuration
- `ENABLE_SWAGGER=true` - Enable Swagger UI at `/v1/api-docs` endpoint (root `/` redirects here)
- `ENABLE_SWAGGER=false` - Disable Swagger (production mode)
- Other env vars: PORT, LOG_LEVEL, CACHE_TTL, SYNC_INTERVAL

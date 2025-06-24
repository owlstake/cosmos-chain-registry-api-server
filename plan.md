# Cosmos Chain Registry API Server Development Plan

## 1. Architecture & Tech Stack
- Backend Framework: Express.js/Node.js
- Database: Not required as data will be read directly from JSON files
- TypeScript for type-safety
- Git for source code management
- Docker for application containerization

## 2. Project Structure
```
cosmos-chain-registry-api-server/
├── src/
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Helper functions
│   └── app.ts           # Express app setup
├── tests/               # Unit tests
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## 3. API Endpoints

### Chain Information
- `GET /v1/chains` - Get list of all chains
- `GET /v1/chain/:chainName` - Get detailed information of a specific chain
- `GET /v1/chain/:chainName/lite` - Get basic information of a specific chain

#### lite example
```json
{
  "name": "celestia",
  "pretty_name": "Celestia",
  "network_type": "mainnet",
  "website": "https://celestia.org/",
  "daemon_name": "celestia-appd",
  "chain_id": "celestia",
  "node_home": "$HOME/.celestia-app",
  "denom": "utia",
  "git_repo": "https://github.com/celestiaorg/celestia-app",
  "recommended_version": "v3.3.1",
  "last_modified": "Thu Jun 12 2025"
}
```
- `GET /v1/chain/:chainName/assets` - Get list of assets for a specific chain
- `GET /v1/chain/{chain}/endpoints/rpc` - Returns a list of active public RPC endpoints
- `GET /v1/chain/{chain}/endpoints/rest` - Returns a list of active public REST endpoints
- `GET /v1/chain/{chain}/endpoints/grpc` - Returns a list of active public gRPC endpoints
- `GET /v1/chain/{chain}/endpoints/peers` - Returns a list of chain peers
- `GET /v1/chain/{chain}/endpoints/seeds` - Returns a list of chain seeds
- `GET /v1/chain/{chain}/assets` - Returns all the native assets of the chain



## 4. Features & Functionality
- Auto-sync with GitHub repository
- Caching for performance optimization
- Rate limiting
- API documentation with Swagger/OpenAPI (configurable via .env)
- Error handling & logging
- Health check endpoint
- Metrics endpoint for monitoring

### Swagger Configuration
- Environment variable: `ENABLE_SWAGGER=true/false`
- When enabled: Swagger UI available at `/v1/api-docs`
- Root path `/` redirects to `/v1/api-docs` when Swagger is enabled
- Auto-generate from API routes and TypeScript interfaces
- Include examples from actual chain data

## 5. Implementation Steps
1. Setup basic project with TypeScript and Express
2. Implement service to read and parse data from chain-registry
3. Implement API endpoints
4. Add validation and error handling
5. Setup Docker
6. Write documentation
7. Write tests
8. Setup CI/CD

## 6. Security Considerations
- CORS configuration
- Rate limiting
- Security headers
- Input validation
- Error handling that doesn't leak sensitive information

## 7. Monitoring & Maintenance
- Health checks
- Logging
- Metrics collection
- Error tracking
- Performance monitoring

## 8. Expected Timeline
- Phase 1 (Setup & Core Features): 1-2 ngày
  - Project setup
  - Basic API implementation
  - Data fetching service

- Phase 2 (Enhancement & Security): 1-2 days
  - Caching implementation
  - Security features
  - Error handling
  - Documentation
  - Swagger setup (configurable via ENABLE_SWAGGER)

- Phase 3 (Testing & Deployment): 1-2 days
  - Unit tests
  - Integration tests
  - Docker setup
  - CI/CD pipeline

## 9. Important Notes
- Ensure performance when handling large JSON files
- Implement appropriate caching strategy
- Handle error cases gracefully
- Ensure API documentation is always up-to-date
- Monitor system health and performance

## 10. Data Synchronization Strategy
### Auto-sync with Chain Registry Repository
- Implement cron job that runs daily to pull new data
- Directories to ignore during sync:
  ```
  .github/         # GitHub specific files
  _IBC/           # IBC related templates and documentation
  _memo_keys/     # Memo keys documentation
  _non-cosmos/    # Non-cosmos chains (will implement in later phase)
  _scripts/       # Utility scripts
  _template/      # Template files
  ```
- Sync steps:
  1. Clone/Pull latest from chain-registry repository
  2. Filter out ignored directories
  3. Compare version/hash of current data with new data
  4. If there are changes:
     - Update with new data
     - Invalidate cache
     - Log changes
  5. If no changes:
     - Log "no changes"

### Error Handling during sync process
- Retry mechanism if pull fails
- Alert system for team when errors occur
- Comprehensive logging of sync process

### Monitoring Sync Process
- Track successful/failed sync attempts
- Track sync duration
- Track data volume changes
- Notification when significant data changes occur

### Data storage structure
```
data/
└── current/          # Data pulled from chain-registry (filtered, excluding ignored directories)
``` 
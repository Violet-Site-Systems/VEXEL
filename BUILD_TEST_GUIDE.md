# VEXEL Build & Test Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run unit tests (no external services required)
npm test

# Build the project
npm run build

# Run API server (development)
npm run api:dev

# Run all tests including integration tests
npm run test:all
```

## Project Structure

```
vexel/
├── src/                      # Core SDK (compiles to dist/)
│   ├── api/                  # REST + WebSocket API Gateway
│   ├── wallet/               # Key management & encryption
│   ├── signature/            # Signing & verification
│   ├── badge/                # VERIFIED_HUMAN badge minting
│   ├── haap/                 # HAAP Protocol (KYC → DID → Token)
│   ├── cross-platform/       # MAS agent communication
│   ├── agents/               # Sentinel & Maestro agents
│   │   ├── sentinel/         # Security guardian agent
│   │   └── maestro/          # Orchestration agent
│   ├── database/             # PostgreSQL integration (EXCLUDED from build)
│   ├── ipfs/                 # IPFS storage (EXCLUDED from build)
│   ├── knowledge-base/       # Arweave migration (EXCLUDED from build)
│   └── __tests__/
│       └── integration/      # Tests requiring external services
│
├── contracts/                # Solidity smart contracts
│   └── AgentHeartbeat.sol    # Agent inactivity monitoring
│
├── dashboard/                # Monitoring dashboard (separate package)
├── subgraph/                 # TheGraph indexer (separate deployment)
├── test/                     # Contract tests
└── dist/                     # Compiled output (created by npm run build)
```

## What's Included in the Build

The compiled `dist/` directory includes:
- ✅ Core SDK (wallet, signature, badge, HAAP)
- ✅ API Gateway (REST + WebSocket)
- ✅ Cross-platform agent communication
- ✅ Sentinel & Maestro agents
- ✅ TypeScript definitions (.d.ts files)

**Excluded from build** (experimental/requires external services):
- ❌ Database integration (`src/database/**/*`)
- ❌ IPFS client (`src/ipfs/**/*`)
- ❌ Knowledge base migration (`src/knowledge-base/**/*`)

## Testing Strategy

### Unit Tests (Default)
```bash
npm test
```
- **No external dependencies required**
- Tests: 232 passing
- Duration: ~70 seconds
- Uses: `jest.unit.config.js`

### Integration Tests
```bash
npm run test:integration
```
- **Requires external services**: PostgreSQL, IPFS
- Location: `src/__tests__/integration/`
- Uses: `jest.integration.config.js`
- Duration: Varies based on service availability

### All Tests
```bash
npm run test:all
```
Runs unit tests followed by integration tests.

## Dependency Classification

### Runtime Dependencies (`dependencies`)
Required to run the compiled application:
- `express`, `socket.io` - API Gateway
- `ethers` - Blockchain interaction
- `jsonwebtoken` - Authentication
- `helmet`, `cors` - Security
- `dotenv` - Configuration
- `swagger-jsdoc`, `swagger-ui-express` - API documentation

### Development Dependencies (`devDependencies`)
Required only for development, testing, and building:
- `typescript`, `ts-node`, `ts-jest` - TypeScript tooling
- `jest`, `@types/*` - Testing & type definitions
- `hardhat` - Smart contract development
- `@openzeppelin/contracts`, `@chainlink/contracts` - Contract dependencies

## Building for Production

```bash
# Clean previous build
npm run clean

# Build TypeScript to JavaScript
npm run build

# Test production install (no devDependencies)
npm ci --omit=dev

# Run production server
node dist/api/server.js
```

## Environment Variables

Create `.env` file based on `.env.example`:

```bash
# Required for production
JWT_SECRET=your-secret-key-here
WALLET_ENCRYPTION_KEY=your-encryption-key-here

# Optional
API_PORT=3000
CORS_ORIGIN=*
NODE_ENV=production
```

## Common Tasks

### Run API Server
```bash
# Development (with auto-reload)
npm run api:dev

# Production
npm run api:start
```

### Compile Smart Contracts
```bash
npm run compile
```

### Run Contract Tests
```bash
npm run test:contracts
```

### Deploy Contracts
```bash
# Mumbai testnet
npm run deploy:mumbai

# Polygon mainnet
npm run deploy:polygon
```

## Dashboard (Separate Package)

The dashboard is a standalone React application:

```bash
cd dashboard
npm install
npm run dev       # Development server
npm run build     # Production build
```

## Troubleshooting

### Tests Fail with "Cannot find module"
- **Cause**: Integration tests require external dependencies
- **Solution**: Run `npm test` for unit tests only, or install integration dependencies

### Build Fails with TypeScript Errors
- **Cause**: Type errors in source files
- **Solution**: Check `npm run build` output for specific errors

### API Server Crashes with "Cannot find module 'dotenv'"
- **Cause**: `dotenv` was incorrectly in devDependencies (FIXED in this PR)
- **Solution**: Ensure you're on the latest version with corrected dependencies

### "Invalid or expired token" Errors
- **Cause**: Missing or incorrect JWT_SECRET
- **Solution**: Set `JWT_SECRET` environment variable

## Need Help?

- **Documentation**: See `REFURBISHED_ROADMAP.md` for detailed task breakdown
- **Issues**: https://github.com/Violet-Site-Systems/VEXEL/issues
- **Contributing**: See `CONTRIBUTING.md`

---

**Last Updated**: January 2026  
**Version**: 1.0.0

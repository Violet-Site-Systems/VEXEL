# VEXEL Copilot Instructions

## Project Overview

**VEXEL** is a DID (Decentralized Identifier) bridge layer creating sovereign interoperability across distributed identity systems. It enables autonomous, cross-chain identity bridging while preserving cryptographic sovereignty.

### Architecture Tiers

1. **Identity Layer** (`src/wallet/`, `src/signature/`, `src/utils/did.ts`): Manages agent wallets, cryptographic signatures, and W3C DID documents
2. **Verification Layer** (`src/haap/`, `src/badge/`): Human attestation (HAAP Protocol), KYC verification, and VERIFIED_HUMAN badge minting
3. **API Layer** (`src/api/`): REST/WebSocket gateway with authentication, semantic processing, and emotional state tracking
4. **Data Layer** (`src/database/`, `contracts/`, `subgraph/`): PostgreSQL agent metadata, smart contracts, and TheGraph indexing
5. **Storage Layer** (`src/knowledge-base/`, `src/ipfs/`): IPFS metadata hashing, Arweave agent memory preservation

## Critical Architecture Patterns

### Data Flows

**Agent Identity Creation:**
```
Wallet Creation → DID Document → Badge Minting → HAAP Token
```
- See [HAAPProtocol.ts](src/haap/HAAPProtocol.ts#L44-L55) for complete flow
- Each step depends on previous; KYC gates badge minting

**Agent Registration:**
```
DID Register → PostgreSQL Record → IPFS Metadata Hash → Smart Contract
```
- Use `src/database/repository.ts` for persisting agent metadata
- Always hash metadata to IPFS before contract interaction

### Component Integration Points

- **WalletManager** ↔ **SignatureInjector**: Wallet must be loaded before signing operations
- **BadgeMinter** ↔ **HAAPProtocol**: Badge contract address required in config
- **KYCService** ↔ **HAAPProtocol**: KYC verification gates attestation token issuance
- **APIGateway** ↔ **WebSocketServer**: WebSocket routes authenticated via `AuthMiddleware`
- **DatabaseClient** ↔ **Repository**: All DB queries wrapped in transaction handling

## Key Conventions

### TypeScript & Typing

- **Strict mode enabled** in `tsconfig.json` – all types must be explicit
- Use interfaces for config objects: `WalletConfig`, `HAAPConfig`, `APIGatewayConfig`
- Export types alongside implementations for external use (see `src/index.ts`)
- No `any` types – use generics or union types instead

### Configuration

- Environment variables loaded via `dotenv` (see `src/api/server.ts`)
- All services accept config objects in constructor (avoid global state)
- Fallback to sensible defaults: `network: 'polygon-mumbai'`, `port: 3000`
- Critical secrets: `JWT_SECRET`, `WALLET_ENCRYPTION_KEY`, `DATABASE_PASSWORD`

### Error Handling

- Services throw descriptive errors with context (e.g., `"Wallet not found for agent: {agentId}"`)
- Database operations wrapped in try-catch with logging
- Transactions use `DatabaseClient.transaction()` to auto-rollback on error

### Testing

- Jest configured in `jest.config.js` with ts-jest
- Test files colocated: `ComponentName.test.ts` next to `ComponentName.ts`
- Patterns: `describe()` blocks per method, `it()` per scenario
- Use mocks for external services (e.g., `MockKYCProvider` in `src/haap/`)
- Command: `npm test` (watch mode: `npm run test:watch`)

## Developer Workflows

### Building

```bash
npm run build          # TypeScript → dist/
npm run clean          # Remove dist/
npm run prepublishOnly # Clean + build (pre-publish hook)
```

### Testing

```bash
npm test               # All tests (Jest)
npm run test:coverage  # Coverage report
npm run test:watch     # Watch mode (rerun on changes)
npm run test:api       # Only API tests
npm run test:contracts # Only Solidity contract tests (Hardhat)
```

### Running Services

```bash
npm run api:start      # Start API Gateway (blocking)
npm run api:dev        # Start with ts-node watch (development)
npm run demo           # Build + run examples/demo.js
```

### Smart Contracts

```bash
npm run compile        # Compile Solidity contracts (Hardhat)
npm run deploy:mumbai  # Deploy to Mumbai testnet
npm run deploy:polygon # Deploy to Polygon mainnet
```

### Database

- Schema: `database/schema.sql`
- Migrations run via `npm run build` if applicable
- Local dev: PostgreSQL on localhost:5432

## Project Phases & Status

- ✅ **Phase 1**: DID integration, wallet management, HAAP protocol (COMPLETED)
- ✅ **Phase 2.1**: AgentHeartbeat smart contract with Chainlink automation (COMPLETED)
- ✅ **Phase 2.3**: Knowledge base migration to Arweave (COMPLETED)
- 📋 **Phase 3.1**: API Gateway + WebSocket Layer (COMPLETED)
- 📋 **Phase 3.2**: Monitoring Dashboard (COMPLETED)
- 🚀 **Phase 3.3**: MAS Agent Integration (IN PROGRESS)
  - ✅ **Sentinel Agent**: Cryptography, key management, policy enforcement, monitoring

See [PHASE_3.1_QUICKSTART.md](PHASE_3.1_QUICKSTART.md), [PHASE_3.2_QUICKSTART.md](PHASE_3.2_QUICKSTART.md) for current work.

## Key Files to Know

| File | Purpose |
|------|---------|
| [src/index.ts](src/index.ts) | Main library exports & VexelConfig |
| [src/haap/HAAPProtocol.ts](src/haap/HAAPProtocol.ts) | Complete KYC→DID→Badge→Token flow |
| [src/api/APIGateway.ts](src/api/APIGateway.ts) | REST/WebSocket server initialization |
| [src/database/client.ts](src/database/client.ts) | PostgreSQL pool, transactions, queries |
| [src/wallet/WalletManager.ts](src/wallet/WalletManager.ts) | Polygon wallet creation & loading |
| [contracts/AgentHeartbeat.sol](contracts/AgentHeartbeat.sol) | Agent inactivity monitoring contract |
| [database/schema.sql](database/schema.sql) | PostgreSQL schema (agents, capabilities, memory) |
| [src/agents/sentinel/](src/agents/sentinel/) | **NEW**: Sentinel Agent (security guardian) |
| [src/agents/sentinel/sentinel.ts](src/agents/sentinel/sentinel.ts) | Main Sentinel Agent class |
| [src/agents/sentinel/crypto.ts](src/agents/sentinel/crypto.ts) | Cryptographic operations (sign/verify) |
| [src/agents/sentinel/keys.ts](src/agents/sentinel/keys.ts) | Key management (generate/rotate/revoke) |
| [src/agents/sentinel/policy.ts](src/agents/sentinel/policy.ts) | Policy enforcement engine (RBAC/ABAC) |
| [src/agents/sentinel/monitor.ts](src/agents/sentinel/monitor.ts) | Security monitoring & alerts |

## Common Pitfalls to Avoid

1. **Missing wallet before signing**: Always call `walletManager.loadWallet()` before `signatureInjector.injectSignature()`
2. **Hardcoded RPC endpoints**: Use environment variables or config objects
3. **Skipping KYC**: HAAP requires KYC approval before badge minting – don't bypass
4. **Non-transactional DB writes**: Wrap multi-step updates in `DatabaseClient.transaction()`
5. **Unencrypted wallet storage**: Use `WALLET_ENCRYPTION_KEY` environment variable
6. **Type-unsafe queries**: Use generics: `query<AgentRecord>()` not `query()`

## External Dependencies to Know

- **ethers.js**: Polygon wallet management, signing, RPC interaction
- **did-jwt**, **did-resolver**: W3C DID document creation and validation
- **express**: REST API framework with middleware pattern
- **socket.io**: WebSocket server for real-time agent events
- **pg**: PostgreSQL client with connection pooling
- **hardhat**: Solidity contract compilation and testing
- **arweave**: Permanent storage for agent knowledge base

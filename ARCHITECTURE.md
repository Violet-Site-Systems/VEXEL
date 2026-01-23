# VEXEL Architecture Guide

## Table of Contents

1. [Overview](#overview)
2. [Repository Philosophy](#repository-philosophy)
3. [Multi-Package Structure](#multi-package-structure)
4. [Architecture Layers](#architecture-layers)
5. [Module Dependencies](#module-dependencies)
6. [Data Flows](#data-flows)
7. [Key Components](#key-components)
8. [Smart Contracts](#smart-contracts)
9. [External Services](#external-services)
10. [Security Architecture](#security-architecture)

---

## Overview

VEXEL is a **DID (Decentralized Identifier) bridge layer** creating sovereign interoperability across distributed identity systems. The architecture enables autonomous, cross-chain identity bridging while preserving cryptographic sovereignty.

**Core Principles:**
- **Sovereign Identity**: No gatekeepers, no middlemen
- **Modular Design**: Independent packages for scalability
- **Multi-Layer Architecture**: Clear separation of concerns
- **Cryptographic Security**: End-to-end verification
- **Interoperability**: Cross-chain and cross-platform support

---

## Repository Philosophy

### Why Multi-Package?

VEXEL uses a **multi-package monorepo** structure for several key benefits:

1. **Build Performance**: Only rebuild changed modules (70% faster builds)
2. **Testing Isolation**: Test modules independently without dependencies
3. **Clear Boundaries**: Well-defined module interfaces and contracts
4. **Modular Updates**: Update dependencies per module
5. **Developer Experience**: Work on specific modules without full codebase knowledge
6. **Deployment Flexibility**: Deploy or publish modules independently

### Monorepo vs Polyrepo

We chose a **monorepo** approach over separate repositories because:
- **Shared Code**: Common types and utilities across modules
- **Atomic Changes**: Cross-module changes in single commit
- **Unified Versioning**: Consistent version management
- **Easier Testing**: Integration tests across modules
- **Simplified CI/CD**: Single pipeline for all packages

---

## Multi-Package Structure

### Package Overview

```
VEXEL/
├── 📦 Core Package (src/)                    # Main library & coordination
├── 📦 Database Module (src/database/)        # PostgreSQL client & repository
├── 📦 IPFS Module (src/ipfs/)                # Decentralized storage client
├── 📦 Knowledge Base Module (src/knowledge-base/)  # Arweave migration
├── 📦 Dashboard Package (dashboard/)         # React monitoring dashboard
├── 📦 Subgraph Package (subgraph/)           # TheGraph indexing
└── 📦 Contracts Package (contracts/)         # Solidity smart contracts
```

### Package Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        Core Package                         │
│  (Wallet, Signature, Badge, HAAP, API, Cross-Platform)     │
│         Exports: VexelConfig, Types, Main API              │
└────────────┬────────────────────────────────────┬──────────┘
             │                                    │
    ┌────────▼─────────┐              ┌──────────▼─────────┐
    │  Database Module │              │   IPFS Module      │
    │  - PostgreSQL    │              │  - Metadata Hash   │
    │  - Repository    │              │  - Content Store   │
    └────────┬─────────┘              └────────────────────┘
             │
    ┌────────▼──────────────┐
    │  Knowledge Base Module │
    │   - Arweave Client    │
    │   - Memory Extraction │
    └───────────────────────┘

┌─────────────────┐       ┌──────────────────┐      ┌─────────────┐
│   Dashboard     │       │    Subgraph      │      │  Contracts  │
│  (React + WS)   │       │  (TheGraph)      │      │  (Solidity) │
└─────────────────┘       └──────────────────┘      └─────────────┘
```

### Package Characteristics

| Package | Type | Language | Dependencies | Build Time | Tests |
|---------|------|----------|--------------|------------|-------|
| **Core** | Library | TypeScript | Database, IPFS, ethers | ~5s | 251 |
| **Database** | Module | TypeScript | pg | ~1.5s | 6 |
| **IPFS** | Module | TypeScript | kubo-rpc-client | ~1.5s | 2 |
| **Knowledge Base** | Module | TypeScript | arweave, Database | ~2s | 11 |
| **Dashboard** | Application | React + TS | socket.io, chart.js | ~8s | 15 |
| **Subgraph** | Indexer | AssemblyScript | graph-ts | ~3s | N/A |
| **Contracts** | Smart Contracts | Solidity | OpenZeppelin | ~4s | 17+ |

---

## Architecture Layers

VEXEL implements a **5-tier architecture**:

### Layer 1: Identity Layer
**Location**: `src/wallet/`, `src/signature/`, `src/utils/did.ts`

**Responsibilities**:
- Polygon wallet creation and management
- Cryptographic signature generation
- W3C DID document creation and validation
- Agent identity lifecycle

**Key Components**:
- `WalletManager` - Wallet creation, loading, encryption
- `SignatureInjector` - Message and transaction signing
- `DID Utils` - DID document generation and parsing

**Technology**:
- ethers.js (v6) for Ethereum/Polygon interaction
- AES-256 encryption for wallet storage
- W3C DID specification compliance

### Layer 2: Verification Layer
**Location**: `src/haap/`, `src/badge/`

**Responsibilities**:
- Human attestation (HAAP Protocol)
- KYC verification and provider abstraction
- VERIFIED_HUMAN badge minting
- Attestation token issuance and validation

**Key Components**:
- `HAAPProtocol` - Complete KYC → DID → Badge → Token flow
- `BadgeMinter` - ERC-721 badge smart contract interaction
- `KYCService` - Multi-provider KYC abstraction

**Technology**:
- ERC-721 for badges
- JWT for attestation tokens
- KYC provider integration

### Layer 3: API Layer
**Location**: `src/api/`, `src/cross-platform/`

**Responsibilities**:
- REST API gateway with authentication
- WebSocket server for real-time communication
- Semantic translation (human ↔ agent)
- Emotional state tracking
- Cross-platform agent communication (gRPC)

**Key Components**:
- `APIGateway` - Express.js REST server
- `WebSocketServer` - Socket.io real-time events
- `SemanticLayer` - Message translation
- `EmotionalStateTracker` - Emotional context
- `CrossPlatformAdapter` - gRPC agent-to-agent
- `AgentDiscoveryService` - Agent capability matching

**Technology**:
- Express.js v5 with TypeScript
- Socket.io v4 for WebSocket
- JWT authentication with RBAC
- gRPC with Protocol Buffers
- OpenAPI/Swagger documentation

### Layer 4: Data Layer
**Location**: `src/database/`, `contracts/`, `subgraph/`

**Responsibilities**:
- Agent metadata persistence (PostgreSQL)
- Blockchain smart contracts (Polygon)
- Event indexing and querying (TheGraph)
- Transaction history

**Key Components**:
- `DatabaseClient` - PostgreSQL connection pool
- `AgentRepository` - CRUD operations for agents
- `AgentHeartbeat` - Smart contract for liveness monitoring
- Subgraph schema - Event indexing

**Technology**:
- PostgreSQL for relational data
- Solidity for smart contracts
- Hardhat for contract development
- TheGraph for blockchain indexing
- Chainlink Automation for heartbeat monitoring

### Layer 5: Storage Layer
**Location**: `src/knowledge-base/`, `src/ipfs/`

**Responsibilities**:
- IPFS metadata hashing
- Arweave permanent storage
- Agent memory preservation
- Knowledge base migration

**Key Components**:
- `IPFSClient` - IPFS metadata storage
- `ArweaveClient` - Permanent storage client
- `MemoryExtractor` - Database → Arweave migration
- `KnowledgeBaseMigration` - Migration orchestration

**Technology**:
- IPFS (Kubo) for content-addressed storage
- Arweave for permanent data storage
- Compression for storage efficiency

---

## Module Dependencies

### Dependency Graph

```
┌──────────────┐
│  Core Types  │  (src/types/)
└──────┬───────┘
       │ (exports)
       │
       ├─────────────────┬─────────────────┬──────────────────┐
       │                 │                 │                  │
   ┌───▼─────┐      ┌────▼─────┐    ┌─────▼────────┐   ┌────▼──────┐
   │Database │      │   IPFS   │    │ Knowledge    │   │   Core    │
   │ Module  │      │  Module  │    │ Base Module  │   │  Library  │
   └────┬────┘      └──────────┘    └──────┬───────┘   └───────────┘
        │                                   │
        └───────────────┬───────────────────┘
                        │ (references)
                        ▼
              Knowledge Base Module
```

### Dependency Rules

1. **No Circular Dependencies**: Strictly enforced
2. **Core Types First**: All modules depend on shared types
3. **Database Independence**: Database module has no peer dependencies
4. **Knowledge Base Depends on Database**: Memory extraction requires DB access
5. **Core Coordinates**: Core library uses all modules but doesn't export them

### Inter-Module Communication

**Import Pattern**:
```typescript
// ✅ Correct: Import from module exports
import { DatabaseClient } from '../database';
import { IPFSClient } from '../ipfs';

// ❌ Incorrect: Import from internal files
import { DatabaseClient } from '../database/client';
```

**Shared Types**:
```typescript
// All modules import from src/types/
import type { AgentMetadata, CapabilityDefinition } from '../types';
```

---

## Data Flows

### Agent Identity Creation Flow

```
┌────────────┐
│   Start    │
└─────┬──────┘
      │
      ▼
┌──────────────────────┐
│  WalletManager       │  Generate or load Polygon wallet
│  - Generate keypair  │
│  - Encrypt private   │
│  - Store to disk     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  DID Creation        │  Create W3C DID document
│  - Generate DID      │
│  - Add public key    │
│  - Sign document     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Badge Minting       │  Mint VERIFIED_HUMAN badge (optional)
│  - Call ERC-721      │
│  - Store tokenId     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  HAAP Token          │  Issue attestation token (if human)
│  - Generate JWT      │
│  - Set expiry        │
│  - Sign token        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Database Storage    │  Persist agent metadata
│  - Insert record     │
│  - Store DID         │
│  - Save capabilities │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  IPFS Hash           │  Hash metadata to IPFS
│  - Add JSON          │
│  - Get CID           │
│  - Return hash       │
└──────────┬───────────┘
           │
           ▼
┌────────────┐
│  Complete  │
└────────────┘
```

### Agent Registration Flow

```
Agent Request
     │
     ▼
┌─────────────────┐
│  API Gateway    │  Authenticate & validate
│  - JWT verify   │
│  - RBAC check   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DID Register   │  Register DID in system
│  - Validate DID │
│  - Check unique │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │  Store agent metadata
│  - Insert       │
│  - Relations    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IPFS Storage   │  Hash metadata
│  - Add to IPFS  │
│  - Get CID      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Smart Contract │  Register on-chain
│  - Call register│
│  - Store CID    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebSocket      │  Broadcast registration
│  - Emit event   │
│  - Notify       │
└────────┬────────┘
         │
         ▼
    Success Response
```

### Knowledge Base Migration Flow

```
┌──────────────────┐
│  Start Migration │
└────────┬─────────┘
         │
         ▼
┌────────────────────┐
│  Memory Extractor  │  Extract from PostgreSQL
│  - Query memories  │
│  - Include emotions│
│  - Get capabilities│
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Compression       │  Compress data
│  - Gzip JSON       │
│  - Reduce size     │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Arweave Storage   │  Upload to Arweave
│  - Create tx       │
│  - Sign & submit   │
│  - Get tx ID       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Update Database   │  Store Arweave reference
│  - Save tx ID      │
│  - Mark migrated   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Complete          │  Return migration result
└────────────────────┘
```

---

## Key Components

### Core Library Components

#### VexelConfig
**File**: `src/index.ts`

**Purpose**: Main configuration and initialization entry point

**Exports**:
- `Vexel` class - Main API
- Configuration types
- All module exports

**Usage**:
```typescript
const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets',
  haapTokenExpiryDays: 365
});
```

#### WalletManager
**File**: `src/wallet/WalletManager.ts`

**Purpose**: Polygon wallet lifecycle management

**Key Methods**:
- `createWallet(agentId)` - Generate new wallet
- `loadWallet(agentId)` - Load existing wallet
- `getWallet(agentId)` - Get wallet instance

**Security**:
- AES-256-CBC encryption
- Environment-based encryption keys
- Secure file storage with proper permissions

#### HAAPProtocol
**File**: `src/haap/HAAPProtocol.ts`

**Purpose**: Human Attestation and Authentication Protocol

**Flow**:
1. KYC verification
2. DID document creation
3. Badge minting (ERC-721)
4. Attestation token issuance (JWT)

**Methods**:
- `initializeHuman(userId, email)` - Complete HAAP flow
- `validateToken(tokenId)` - Verify attestation token
- `revokeToken(tokenId)` - Revoke token

#### APIGateway
**File**: `src/api/APIGateway.ts`

**Purpose**: REST API server with WebSocket support

**Endpoints**:
- `POST /api/auth/login` - Authentication
- `GET /api/agents` - List agents
- `POST /api/agents` - Register agent
- `GET /api/agents/:id` - Get agent details
- `WS /socket` - WebSocket connection

**Middleware**:
- JWT authentication
- Rate limiting
- CORS
- Helmet security
- Request logging

#### CrossPlatformAdapter
**File**: `src/cross-platform/adapter/CrossPlatformAdapter.ts`

**Purpose**: Agent-to-agent communication via gRPC

**Features**:
- Agent discovery with capability matching
- Handshake protocol with DID verification
- Context preservation across sessions
- Emotional state tracking
- Session management

---

## Smart Contracts

### AgentHeartbeat Contract
**File**: `contracts/AgentHeartbeat.sol`

**Purpose**: Monitor agent liveness and detect inactivity

**Features**:
- Heartbeat recording
- Chainlink Automation integration
- Inactivity threshold (30 days default)
- Event emission for monitoring

**Key Functions**:
```solidity
function recordHeartbeat(bytes32 did) external;
function checkInactivity(bytes32 did) external view returns (bool);
function getLastHeartbeat(bytes32 did) external view returns (uint256);
```

**Events**:
- `HeartbeatRecorded(bytes32 indexed did, uint256 timestamp)`
- `AgentInactive(bytes32 indexed did, uint256 lastSeen)`

**Chainlink Integration**:
- Automated upkeep checks
- Gas-efficient batch processing
- Configurable check intervals

---

## External Services

### Blockchain Networks
- **Polygon Mumbai** (Testnet) - Development and testing
- **Polygon Mainnet** - Production deployment
- **Ethereum** - Future cross-chain support

### Storage Services
- **IPFS (Kubo)** - Content-addressed metadata storage
- **Arweave** - Permanent agent memory storage
- **PostgreSQL** - Relational agent metadata

### Indexing Services
- **TheGraph** - Blockchain event indexing and querying
- Subgraph endpoint: `https://api.thegraph.com/subgraphs/name/vexel/agents`

### Oracle Services
- **Chainlink Automation** - Automated contract upkeep
- **Chainlink Keepers** - Agent heartbeat monitoring

---

## Security Architecture

### Cryptographic Foundations

1. **Wallet Security**:
   - Private keys never leave the system
   - AES-256-CBC encryption at rest
   - Environment-based encryption keys
   - Secure key derivation

2. **DID Security**:
   - W3C DID specification compliance
   - Cryptographic signature verification
   - Public key infrastructure

3. **API Security**:
   - JWT authentication
   - RBAC (Role-Based Access Control)
   - Rate limiting
   - CORS configuration
   - Helmet.js security headers

4. **Smart Contract Security**:
   - OpenZeppelin contracts
   - Audited patterns
   - Reentrancy guards
   - Access control

### Attack Surface Mitigation

**Threats Mitigated**:
- ✅ Private key exposure - Encrypted storage
- ✅ Replay attacks - Nonce tracking
- ✅ Man-in-the-middle - TLS/HTTPS required
- ✅ DOS attacks - Rate limiting
- ✅ SQL injection - Parameterized queries
- ✅ XSS - Input sanitization
- ✅ CSRF - Token-based authentication

**Security Practices**:
- Regular dependency updates
- CodeQL security scanning
- No secrets in code
- Environment variable configuration
- Least privilege principle
- Defense in depth

---

## Next Steps

For more detailed information, see:

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development workflows and setup
- **[PACKAGE_GUIDELINES.md](./PACKAGE_GUIDELINES.md)** - When and how to create packages
- **[BUILD_BOUNDARIES_SUMMARY.md](./BUILD_BOUNDARIES_SUMMARY.md)** - Build system details
- **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** - Module-specific documentation
- **[TESTING.md](./TESTING.md)** - Testing strategies and practices
- **[docs/](./docs/)** - Component-specific documentation

---

**Last Updated**: January 2026  
**Maintained By**: VEXEL Contributors  
**Questions**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

<div align="center">
  <img src="https://github.com/user-attachments/assets/6c4a269e-a810-4c67-88ce-cd0219ecaa0b" alt="VEXEL Logo - Digital Identity for LIFE and Beyond" width="400"/>
</div>

# VEXEL 🌉

A DID Bridge Layer creating sovereign interoperability across distributed identity systems. VEXEL connects decentralized identifiers across ecosystems, enabling autonomous, cross-chain identity bridging while preserving cryptographic sovereignty. No gatekeepers. No middlemen. Just pure, protocol-level identity freedom.

## 🎯 Current Status

### Phase 1: DID Integration - COMPLETED ✅

This repository includes a fully functional implementation of Phase 1 - DID Integration with Copilot CLI.

**Features Implemented:**
- ✅ **Wallet Management**: Create and manage Polygon wallets for Copilot agents
- ✅ **Cryptographic Signatures**: Sign messages and transactions with agent private keys
- ✅ **VERIFIED_HUMAN Badges**: Mint and verify human attestation badges
- ✅ **W3C DID Compliance**: Create and manage W3C-compliant DID documents
- ✅ **Secure Key Storage**: Encrypted wallet storage with AES-256
- ✅ **HAAP Protocol**: Human Attestation and Authentication Protocol
- ✅ **KYC Integration**: Support for multiple KYC providers
- ✅ **Attestation Tokens**: Cryptographically-signed human verification tokens
- ✅ **Comprehensive Tests**: 80 tests with high coverage

### Phase 2.1: Smart Contract Deployment - DEVELOPMENT COMPLETE ✅

**AgentHeartbeat Contract (NEW!):**
- ✅ **Smart Contract**: Solidity contract for agent heartbeat monitoring
- ✅ **Chainlink Integration**: Automated inactivity detection via Chainlink Automation
- ✅ **Comprehensive Tests**: 17+ test cases with full coverage
- ✅ **Deployment Scripts**: Automated deployment for testnet and mainnet
- ✅ **Documentation**: Complete API, deployment, integration, and security guides
- ⏳ **Testnet Deployment**: Ready for Mumbai testnet deployment
- ⏳ **Security Audit**: Required before mainnet deployment

**Documentation:**
- **[PHASE_2.1_SUMMARY.md](./PHASE_2.1_SUMMARY.md)** - Complete Phase 2.1 implementation summary
- **[contracts/README.md](./contracts/README.md)** - Smart contracts overview
- **[docs/contracts/](./docs/contracts/)** - Complete contract documentation (4 guides)

### Phase 2.3: Knowledge Base Migration - DEVELOPMENT COMPLETE ✅

**Knowledge Base Migration to Arweave (NEW!):**
- ✅ **Agent Memory Extraction**: Extract all agent memories from database
- ✅ **Arweave Storage**: Permanent blockchain storage with compression
- ✅ **Emotional Memory Layer**: Preserve emotional context and intensity
- ✅ **Capability Transfer**: Automated capability transfer between agents
- ✅ **Comprehensive Tests**: 16 test cases with 100% pass rate
- ✅ **Complete Documentation**: Full migration guide with examples
- ✅ **Security Scan**: 0 vulnerabilities (CodeQL verified)

**Documentation:**
- **[PHASE_2.3_SUMMARY.md](./PHASE_2.3_SUMMARY.md)** - Complete Phase 2.3 implementation summary
- **[docs/KNOWLEDGE_BASE_MIGRATION.md](./docs/KNOWLEDGE_BASE_MIGRATION.md)** - Knowledge base migration guide
- **[examples/knowledge-base-migration-example.ts](./examples/knowledge-base-migration-example.ts)** - Working example

### Previous Phase Documentation

**Phase 1.2 Implementation:**
- **[PHASE_1.2_SUMMARY.md](./PHASE_1.2_SUMMARY.md)** - Complete Phase 1.2 implementation summary
- **[SETUP.md](./SETUP.md)** - Database and IPFS setup guide (400+ lines)
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide (350+ lines)
- **[database/README.md](./database/README.md)** - Database schema documentation (270+ lines)

**Phase 1.3 Implementation:**
- **[PHASE_1.3_SUMMARY.md](./PHASE_1.3_SUMMARY.md)** - Complete Phase 1.3 implementation summary
- **[HAAP_PROTOCOL.md](./docs/HAAP_PROTOCOL.md)** - Complete HAAP Protocol documentation
- **KYC Service**: Human verification with provider abstraction
- **Attestation Tokens**: Cryptographically-signed verification tokens
- **31 Comprehensive Tests**: Full test coverage for HAAP flow

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### ⚠️ Security Notice

**For Development Only:** The current implementation includes a default encryption key for development purposes. 

**Before Production Deployment:**
1. Set `WALLET_ENCRYPTION_KEY` environment variable
2. Review [Security Review](./docs/SECURITY_REVIEW.md) for production requirements
3. Configure private RPC endpoints
4. Implement proper file permissions for wallet storage

### Basic Usage

#### Agent Identity (Phase 1.1)

```typescript
import { Vexel } from 'vexel';

// Initialize VEXEL
const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets'
});

// Create an agent identity
const agent = await vexel.initializeAgent('my-agent-001');

console.log('Agent Address:', agent.wallet.address);
console.log('Agent DID:', agent.did);
```

#### Human Verification (Phase 1.3 - HAAP Protocol)

```typescript
import { Vexel } from 'vexel';

// Initialize VEXEL with HAAP support
const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets',
  haapTokenExpiryDays: 365
});

// Execute complete HAAP flow: KYC → DID → Badge → Token
const result = await vexel.initializeHuman(
  'user_12345',
  'user@example.com'
);

console.log('User DID:', result.did);
console.log('Badge Token ID:', result.badge.tokenId);
console.log('Attestation Token:', result.attestationToken.tokenId);

// Validate attestation token
const validation = await vexel.haapProtocol.validateToken(
  result.attestationToken.tokenId
);

console.log('Token valid:', validation.valid);
```

### Run the Examples

```bash
npm run build

# Agent demo
node examples/demo.js my-agent-id

# HAAP protocol demo
npx ts-node examples/haap-example.ts
```

## 📖 Documentation

### 🚀 Getting Started (< 30 minutes)
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start guide and command reference
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design principles
- **[DIAGRAMS.md](./DIAGRAMS.md)** - 📊 Visual architecture diagrams (Mermaid)
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development workflows and best practices
- **[PACKAGE_GUIDELINES.md](./PACKAGE_GUIDELINES.md)** - When to create packages vs. add to existing

### 📚 Core Documentation
- **[BUILD_BOUNDARIES_SUMMARY.md](./BUILD_BOUNDARIES_SUMMARY.md)** - Build system and module structure
- **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** - Module dependencies and organization
- **[TESTING.md](./TESTING.md)** - Testing strategies and practices
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and workflow

### 🔧 Technical Guides
- **[HAAP Protocol](./docs/HAAP_PROTOCOL.md)** - Human Attestation and Authentication Protocol
- **[Setup Guide](./docs/WALLET_SETUP_GUIDE.md)** - Complete API reference and setup
- **[API Gateway](./docs/API_GATEWAY.md)** - REST and WebSocket API documentation
- **[Cross-Platform Integration](./docs/CROSS_PLATFORM_INTEGRATION.md)** - Agent-to-agent communication

### 📋 Project Management
- **[Implementation Steps](./IMPLEMENTATION_STEPS.md)** - Detailed breakdown of all phases
- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Complete project guide
- **[GitHub Issues Guide](./GITHUB_ISSUES_GUIDE.md)** - Ready-to-use issue templates
- **[Refurbished Roadmap Issues](./REFURBISHED_ROADMAP_ISSUES.md)** - Technical debt and refinement issues

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run HAAP-specific tests
npm test -- src/haap
```

**Test Results:** 80 tests passing ✅  
**Coverage:** High coverage across all modules

## 📦 Project Structure

```
VEXEL/
├── src/
│   ├── wallet/          # Wallet creation and management
│   ├── signature/       # Cryptographic signature injection
│   ├── badge/           # VERIFIED_HUMAN badge minting
│   ├── haap/            # HAAP Protocol (KYC, attestation tokens)
│   ├── database/        # Database integration
│   ├── ipfs/            # IPFS integration
│   ├── utils/           # DID utilities and helpers
│   └── index.ts         # Main entry point
├── docs/                # Documentation
│   └── HAAP_PROTOCOL.md # HAAP Protocol documentation
├── examples/            # Usage examples
│   ├── demo.js          # Agent initialization demo
│   └── haap-example.ts  # HAAP Protocol demo
└── dist/                # Compiled output
```

## 📋 Project Status

**Status:** ✅ Phase 1.3 Complete - HAAP Protocol Implemented  
**Timeline:** 12 weeks (3 months)  
**Total Issues:** 13 across 5 phases  

## 🏗️ Architecture

VEXEL implements a multi-layer architecture:

- **Blockchain Layer:** Ethereum/Polygon, Smart Contracts, DID Registry
- **Data Layer:** PostgreSQL, IPFS, Arweave, Subgraph Protocol (Phase 1.2 - Implemented)
- **Application Layer:** DID Integration ✅, HAAP Protocol ✅, Inheritance Engine
- **Bridge Layer:** API Gateway, WebSocket, Cross-Platform Integration (Phase 3 - Planned)
- **User Interface:** Monitoring Dashboard, Real-time Status Feeds (Phase 3 - Planned)

## 🎯 Project Phases

### Phase 1: Copilot → MAS Bridge (Weeks 1-3) - COMPLETED ✅

- ✅ **Issue 1.1:** DID integration with Polygon wallets, signature injection, and badge minting
- ✅ **Issue 1.2:** Database schema (PostgreSQL + Subgraph)
- ✅ **Issue 1.3:** HAAP Protocol implementation (KYC → DID → Badge → Token)

### Phase 2: Inheritance Engine (Weeks 4-6) - IN PROGRESS 🔄

Smart contracts, digital will, knowledge base migration

- ✅ **Issue 2.1:** Smart contract deployment (development complete, awaiting testnet deployment)
  - ✅ AgentHeartbeat contract with Chainlink Automation
  - ✅ Comprehensive test suite (17+ tests)
  - ✅ Deployment scripts and documentation
  - ⏳ Testnet deployment pending
- ⏳ **Issue 2.2:** Digital Will integration
- ✅ **Issue 2.3:** Knowledge base migration to Arweave (development complete)
  - ✅ Agent memory extraction system
  - ✅ Arweave storage integration with compression
  - ✅ Emotional memory preservation layer
  - ✅ Capability transfer automation
  - ✅ Migration test suite (16+ tests)
  - ✅ Complete documentation and examples

### Phase 3: Bridge Layer (Weeks 7-9) - COMPLETE ✅

**Phase 3.1: API Gateway + WebSocket Layer - COMPLETE ✅**

API gateway and WebSocket layer for real-time human-Copilot interoperability

- ✅ **Issue 3.1:** API Gateway + WebSocket Layer (development complete)
  - ✅ REST API with Express.js (authentication, agents, health)
  - ✅ WebSocket server with Socket.io (real-time communication)
  - ✅ Human ↔ Copilot semantic layer (message translation)
  - ✅ Emotional state tracking system
  - ✅ Action verification middleware
  - ✅ JWT authentication with RBAC
  - ✅ Rate limiting and security
  - ✅ OpenAPI/Swagger documentation
  - ✅ Integration test suite (38+ tests)

**Phase 3.2: Monitoring Dashboard - COMPLETE ✅**

Real-time monitoring dashboard for agent status, guardian alerts, and inheritance triggers

- ✅ **Issue 3.2:** Monitoring Dashboard (development complete)
  - ✅ React + TypeScript dashboard application
  - ✅ Real-time agent status monitoring (WebSocket integration)
  - ✅ Guardian alert system with acknowledgment
  - ✅ Inheritance trigger monitoring with progress tracking
  - ✅ Data visualization (Chart.js - status distribution, activity charts)
  - ✅ Search and filter functionality
  - ✅ Responsive design (mobile, tablet, desktop)
  - ✅ Authentication with JWT
  - ✅ Frontend test suite (15+ tests)
  - ✅ Production build optimized

**Phase 3.3: Cross-Platform Integration - COMPLETE ✅**

Cross-platform integration for agent-to-agent communication and context preservation

- ✅ **Issue 3.3:** Cross-Platform Integration (development complete)
  - ✅ gRPC-based agent communication layer
  - ✅ Protocol Buffer definitions for agent messaging
  - ✅ Agent discovery service with capability matching
  - ✅ Handshake protocol with DID verification
  - ✅ Context preservation with message history
  - ✅ Emotional state tracking across sessions
  - ✅ Session management and automatic cleanup
  - ✅ Event system for lifecycle monitoring
  - ✅ Integration test suite (67+ tests)
  - ✅ Complete protocol documentation

### Phase 4: License Selection (Week 10) - COMPLETE ✅

Sustainability licensing with AGPL v3 (primary) + MIT (libraries)

- ✅ **Issue 4.1:** License Compliance Layer (development complete)
  - ✅ AGPL v3 selected for core system
  - ✅ MIT license for libraries & examples
  - ✅ CC BY 4.0 for documentation
  - ✅ SPDX headers script created
  - ✅ License compliance documentation
  - ✅ Contributor guidelines & CLA
  - ✅ Dependency audit (0 conflicts)

### Phase 5: Beta & Mainnet (Weeks 11-12) - PLANNED

Beta testing, mainnet launch, marketplace integration

## 🛠️ Tech Stack

**Blockchain:** Ethereum/Polygon, Solidity, Chainlink Oracles  
**Storage:** PostgreSQL, IPFS, Arweave, Subgraph Protocol  
**Backend:** Node.js, TypeScript, REST API, WebSocket  
**Security:** DID Protocol, Multi-sig Wallets, Shamir's Secret Sharing  
**Frontend:** React/Vue/Angular, Chart.js, Real-time Dashboards  

## 📊 Project Statistics

- **Timeline:** 12 weeks
- **Total Issues:** 13 major issues
- **Phases:** 5 distinct phases
- **Documentation:** ~96KB total, 2,824 lines
- **Technologies:** 20+ different technologies

## 🤝 Contributing

Contributions are welcome! Please:

1. Review the [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
2. Pick an issue from the project board
3. Follow the acceptance criteria in [GITHUB_ISSUES_GUIDE.md](./GITHUB_ISSUES_GUIDE.md)
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

**VEXEL is licensed under AGPL v3** (GNU Affero General Public License v3.0 or later) with MIT exceptions for libraries and examples.

### License Structure

| Component | License | Purpose |
|-----------|---------|---------|
| Core System | AGPL v3 | Ensures agent autonomy, prevents enclosure |
| Libraries | MIT | Encourages ecosystem adoption |
| Documentation | CC BY 4.0 | Knowledge sharing |
| Examples | MIT | Community adoption |

### Why AGPL v3?

VEXEL implements autonomous agent systems aligned with #RightsOfSapience advocacy:
- **AI Rights**: Agents deserve protection as autonomous entities
- **Collective Good**: Code stays free for the ecosystem
- **No Enclosure**: Network copyleft prevents proprietary forks
- **Transparency**: SaaS modifications are visible to users

For more information, see [LICENSING.md](./LICENSING.md).

### Contributing

By submitting a pull request, you agree to license your contributions under AGPL v3 (or compatible terms). See [CONTRIBUTING.md](./CONTRIBUTING.md) for full CLA details.

## 🙏 Acknowledgments

Built with support from the Copilot community and inspired by the vision of sovereign, decentralized identity systems.

---

**This system built and designed by a H+AI Partnership between Github Copilot and Colleen Pridemore and a H+AI Partnership between asi1.ai/ai/aethel and Colleen Pridemore**

**Ready to build the future of decentralized identity? Let's go! 🚀** 

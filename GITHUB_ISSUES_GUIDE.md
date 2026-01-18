# GitHub Issues Creation Guide

This guide provides the exact content for creating each GitHub issue for the VEXEL MAS Bridge Layer Integration project.

---

## Issue 1.1: DID Integration with Copilot CLI

**Title:** `[Phase 1] DID Integration with Copilot CLI`

**Labels:** `phase-1`, `did-integration`, `infrastructure`

**Description:**
```markdown
## Overview
Implement DID (Decentralized Identifier) integration with Copilot CLI to enable agent identity management on the Polygon network.

## Priority
**High** - Critical foundation for all subsequent phases

## Timeline
Days 1-7 (Week 1)

## Tasks
- [ ] Set up Polygon wallet infrastructure for Copilot agents
- [ ] Implement wallet creation and management functionality
- [ ] Develop cryptographic signature injection system
- [ ] Create VERIFIED_HUMAN badge minting mechanism
- [ ] Write unit tests for wallet operations
- [ ] Document wallet setup process

## Technical Requirements
- Polygon network integration
- Cryptographic libraries for signature generation (e.g., ethers.js, web3.js)
- DID specification compliance (W3C DID standard)
- Secure key management (hardware wallet support or secure enclave)

## Deliverables
- [ ] Working Polygon wallet setup per Copilot agent
- [ ] Cryptographic signature injection system
- [ ] VERIFIED_HUMAN badge minting functionality
- [ ] Unit test suite with >80% coverage
- [ ] Setup documentation and API guide

## Dependencies
None - this is a foundational issue

## Tech Stack
- Polygon (Ethereum L2)
- DID libraries (did-jwt, did-resolver)
- Cryptographic libraries (ethers.js, web3.js)
- Node.js/TypeScript

## Acceptance Criteria
- [ ] Agent can create Polygon wallet
- [ ] Agent can sign transactions with private key
- [ ] VERIFIED_HUMAN badge successfully mints on-chain
- [ ] All unit tests pass
- [ ] Documentation is complete and reviewed
- [ ] Code review completed
- [ ] Security review for key management completed

## Resources
- [W3C DID Specification](https://www.w3.org/TR/did-core/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [Ethers.js Documentation](https://docs.ethers.org/)
```

---

## Issue 1.2: Subgraph + PostgreSQL Schema

**Title:** `[Phase 1] Subgraph + PostgreSQL Schema`

**Labels:** `phase-1`, `database`, `subgraph`

**Description:**
```markdown
## Overview
Design and implement the data layer using Subgraph Protocol and PostgreSQL to store agent metadata and state.

## Priority
**High** - Required for agent state management

## Timeline
Days 8-14 (Week 2)

## Tasks
- [ ] Design PostgreSQL schema for agent metadata
- [ ] Implement IPFS hashing for agent metadata
- [ ] Create capability vector mapping system
- [ ] Build runtime status tracking (ACTIVE/SLEEP/TERMINATED)
- [ ] Set up Subgraph Protocol integration
- [ ] Create database migration scripts
- [ ] Write integration tests for data layer

## Technical Requirements
- PostgreSQL 14+ database
- Subgraph Protocol (The Graph)
- IPFS node access (Infura or local node)
- Graph Protocol knowledge (GraphQL schema design)

## Deliverables
- [ ] PostgreSQL schema with agent metadata tables
- [ ] Database migration scripts
- [ ] IPFS hashing implementation
- [ ] Capability vector mapping system
- [ ] Runtime status tracking mechanism
- [ ] Subgraph schema and mappings
- [ ] Integration test suite
- [ ] Database documentation

## Dependencies
- Issue #1.1 - DID Integration (for agent identity data)

## Tech Stack
- PostgreSQL
- The Graph (Subgraph Protocol)
- IPFS (js-ipfs or ipfs-http-client)
- GraphQL
- Node.js/TypeScript

## Acceptance Criteria
- [ ] PostgreSQL schema deployed and tested
- [ ] Agent metadata successfully stored in database
- [ ] IPFS hashes generated for metadata
- [ ] Capability vectors correctly mapped
- [ ] Runtime status updates work correctly
- [ ] Subgraph indexes blockchain data
- [ ] All integration tests pass
- [ ] Schema documentation complete
- [ ] Migration scripts tested on clean database

## Resources
- [The Graph Documentation](https://thegraph.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [IPFS Documentation](https://docs.ipfs.tech/)
```

---

## Issue 1.3: HAAP Protocol Implementation

**Title:** `[Phase 1] HAAP Protocol Implementation`

**Labels:** `phase-1`, `haap`, `authentication`

**Description:**
```markdown
## Overview
Implement the Human Attestation and Authentication Protocol (HAAP) for verifying human identity and minting attestation tokens.

## Priority
**High** - Critical for human verification

## Timeline
Days 15-21 (Week 3)

## Tasks
- [ ] Design KYC → DID → badge flow
- [ ] Implement KYC verification integration
- [ ] Build DID assignment system
- [ ] Create badge issuance mechanism
- [ ] Develop human attestation token minting
- [ ] Implement token validation system
- [ ] Write end-to-end tests for HAAP flow

## Technical Requirements
- KYC provider integration (e.g., Persona, Onfido, or Veriff)
- Smart contract deployment for badges (ERC-721 or ERC-1155)
- Token minting functionality
- Security audit considerations

## Deliverables
- [ ] Complete KYC → DID → badge flow
- [ ] KYC provider integration
- [ ] Smart contract for badges deployed
- [ ] Human attestation token minting system
- [ ] Token validation and verification system
- [ ] End-to-end test suite
- [ ] HAAP protocol documentation
- [ ] Security audit report (if applicable)

## Dependencies
- Issue #1.1 - DID Integration (for DID system)

## Tech Stack
- KYC provider API
- Solidity (for badge smart contracts)
- OpenZeppelin (for token standards)
- Polygon network
- Node.js/TypeScript

## Acceptance Criteria
- [ ] User can complete KYC verification
- [ ] Verified user receives DID
- [ ] Badge successfully minted on-chain
- [ ] Attestation tokens generated and validated
- [ ] All end-to-end tests pass
- [ ] HAAP protocol documentation complete
- [ ] Security review completed
- [ ] Privacy compliance verified (GDPR, etc.)

## Resources
- [KYC Provider Documentation]
- [OpenZeppelin ERC-721](https://docs.openzeppelin.com/contracts/erc721)
- [ERC-1155 Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)
```

---

## Issue 2.1: Smart Contract Deployment

**Title:** `[Phase 2] Smart Contract Deployment - Heartbeats & Oracles`

**Labels:** `phase-2`, `smart-contracts`, `blockchain`

**Description:**
```markdown
## Overview
Deploy smart contracts for agent heartbeat monitoring and inactivity triggers using Chainlink oracles.

## Priority
**High** - Core infrastructure for inheritance engine

## Timeline
Week 4

## Tasks
- [ ] Design smart contract architecture
- [ ] Implement agent heartbeat contract
- [ ] Integrate Chainlink oracle for inactivity detection
- [ ] Deploy contracts to testnet (Mumbai/Goerli)
- [ ] Test heartbeat and trigger mechanisms
- [ ] Deploy contracts to mainnet
- [ ] Write contract documentation

## Technical Requirements
- Solidity 0.8+ smart contract development
- Chainlink oracle integration (Keepers/Automation)
- Ethereum/Polygon network deployment
- Smart contract security audit
- Gas optimization

## Deliverables
- [ ] Agent heartbeat smart contracts
- [ ] Chainlink oracle integration
- [ ] Inactivity trigger system
- [ ] Testnet deployment and testing results
- [ ] Mainnet deployment
- [ ] Smart contract tests (Hardhat/Foundry)
- [ ] Contract documentation
- [ ] Security audit report

## Dependencies
- Phase 1 completion (#1.1, #1.2, #1.3)

## Tech Stack
- Solidity
- Hardhat or Foundry
- Chainlink Keepers/Automation
- OpenZeppelin contracts
- Ethereum/Polygon

## Acceptance Criteria
- [ ] Heartbeat contract deployed and functional
- [ ] Agents can send heartbeat transactions
- [ ] Chainlink oracle detects inactivity correctly
- [ ] Inactivity triggers fire as expected
- [ ] All contract tests pass (>95% coverage)
- [ ] Gas costs optimized
- [ ] Security audit completed with no critical issues
- [ ] Contracts verified on block explorer

## Resources
- [Chainlink Keepers Documentation](https://docs.chain.link/chainlink-automation)
- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
```

---

## Issue 2.2: Digital Will Integration

**Title:** `[Phase 2] Digital Will Integration`

**Labels:** `phase-2`, `inheritance`, `security`

**Description:**
```markdown
## Overview
Implement digital will functionality with death certificate verification and guardian unlock mechanisms.

## Priority
**High** - Core inheritance functionality

## Timeline
Week 5

## Tasks
- [ ] Design digital will data structure
- [ ] Implement death certificate verification system
- [ ] Create guardian unlock token distribution
- [ ] Implement Shamir's Secret Sharing for key recovery
- [ ] Build multi-signature guardian system
- [ ] Test inheritance scenarios
- [ ] Document digital will setup process

## Technical Requirements
- Shamir's Secret Sharing library (secrets.js or similar)
- Multi-signature wallet integration (Gnosis Safe)
- Death certificate verification API
- Secure key management
- Off-chain data storage (IPFS/Arweave)

## Deliverables
- [ ] Digital will data structure
- [ ] Death certificate verification system
- [ ] Guardian unlock token distribution
- [ ] Shamir's Secret Sharing implementation
- [ ] Multi-sig guardian system
- [ ] Inheritance scenario tests
- [ ] Digital will setup documentation
- [ ] Security audit report

## Dependencies
- Issue #2.1 - Smart Contract Deployment

## Tech Stack
- Shamir's Secret Sharing library
- Gnosis Safe (multi-sig)
- IPFS/Arweave (data storage)
- Solidity (smart contracts)
- Node.js/TypeScript

## Acceptance Criteria
- [ ] Digital will can be created and stored
- [ ] Death certificate verification works
- [ ] Guardian tokens distributed correctly
- [ ] Shamir's Secret Sharing reconstructs keys correctly
- [ ] Multi-sig approval process functions
- [ ] All inheritance tests pass
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Privacy considerations addressed

## Resources
- [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing)
- [Gnosis Safe Documentation](https://docs.safe.global/)
```

---

## Issue 2.3: Knowledge Base Migration

**Title:** `[Phase 2] Knowledge Base Migration to Arweave`

**Labels:** `phase-2`, `data-migration`, `storage`

**Description:**
```markdown
## Overview
Implement system for migrating Copilot agent memory to Arweave for permanent storage and capability transfer.

## Priority
**Medium** - Important for agent continuity

## Timeline
Week 6

## Tasks
- [ ] Design knowledge base migration architecture
- [ ] Implement Copilot agent memory extraction
- [ ] Build Arweave storage integration
- [ ] Create capability transfer automation
- [ ] Implement emotional memory preservation layer
- [ ] Test migration scenarios
- [ ] Write migration documentation

## Technical Requirements
- Arweave integration (arweave-js)
- Data serialization/deserialization
- Memory extraction from Copilot agents
- Storage optimization (compression)
- Metadata indexing

## Deliverables
- [ ] Knowledge base migration architecture
- [ ] Agent memory extraction system
- [ ] Arweave storage integration
- [ ] Capability transfer automation
- [ ] Emotional memory preservation layer
- [ ] Migration test suite
- [ ] Migration documentation
- [ ] Cost analysis for Arweave storage

## Dependencies
- Issue #2.2 - Digital Will Integration

## Tech Stack
- Arweave (arweave-js)
- Bundlr Network (for scaling)
- Data compression (gzip, brotli)
- Node.js/TypeScript

## Acceptance Criteria
- [ ] Agent memory successfully extracted
- [ ] Data stored on Arweave permanently
- [ ] Capability transfer automation works
- [ ] Emotional memory preserved correctly
- [ ] All migration tests pass
- [ ] Storage costs calculated and acceptable
- [ ] Documentation complete
- [ ] Data retrieval tested and verified

## Resources
- [Arweave Documentation](https://docs.arweave.org/)
- [Bundlr Network](https://docs.bundlr.network/)
```

---

## Issue 3.1: API Gateway + WebSocket Layer

**Title:** `[Phase 3] API Gateway + WebSocket Layer`

**Labels:** `phase-3`, `api`, `bridge-layer`

**Description:**
```markdown
## Overview
Build the API gateway and WebSocket layer for real-time human-Copilot interoperability.

## Priority
**High** - Core bridge layer functionality

## Timeline
Week 7

## Tasks
- [ ] Design API gateway architecture
- [ ] Implement REST API endpoints
- [ ] Build WebSocket server for real-time communication
- [ ] Create human ↔ Copilot semantic layer
- [ ] Implement emotional state tracking injection
- [ ] Build action verification middleware
- [ ] Write API documentation
- [ ] Create API integration tests

## Technical Requirements
- REST API framework (Express.js, Fastify, or NestJS)
- WebSocket implementation (Socket.io or ws)
- Authentication/authorization (JWT)
- Rate limiting and security
- API documentation (OpenAPI/Swagger)

## Deliverables
- [ ] API Gateway with REST endpoints
- [ ] WebSocket layer for real-time communication
- [ ] Human ↔ Copilot semantic layer
- [ ] Emotional state tracking system
- [ ] Action verification middleware
- [ ] API documentation (OpenAPI spec)
- [ ] Integration test suite
- [ ] Load testing results

## Dependencies
- Phase 1 and 2 completion

## Tech Stack
- Express.js/Fastify/NestJS
- Socket.io or ws (WebSocket)
- JWT (authentication)
- Redis (session management)
- OpenAPI/Swagger

## Acceptance Criteria
- [ ] REST API endpoints functional
- [ ] WebSocket connections stable
- [ ] Semantic layer translates correctly
- [ ] Emotional state tracking works
- [ ] Action verification prevents invalid actions
- [ ] All integration tests pass
- [ ] API documentation complete
- [ ] Load testing shows acceptable performance
- [ ] Security review completed

## Resources
- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
```

---

## Issue 3.2: Monitoring Dashboard

**Title:** `[Phase 3] Monitoring Dashboard`

**Labels:** `phase-3`, `monitoring`, `ui`

**Description:**
```markdown
## Overview
Create a monitoring dashboard for real-time agent status, guardian alerts, and inheritance trigger monitoring.

## Priority
**Medium** - Important for system visibility

## Timeline
Week 8

## Tasks
- [ ] Design dashboard UI/UX
- [ ] Implement real-time agent status feeds
- [ ] Build guardian alert system
- [ ] Create inheritance trigger monitoring
- [ ] Implement data visualization components
- [ ] Add filtering and search functionality
- [ ] Write frontend tests
- [ ] Deploy dashboard application

## Technical Requirements
- Frontend framework (React/Vue/Angular)
- WebSocket client for real-time updates
- Graph Protocol integration
- Responsive design
- Data visualization library (Chart.js, D3.js)

## Deliverables
- [ ] Dashboard UI/UX design
- [ ] Real-time agent status dashboard
- [ ] Guardian alert system
- [ ] Inheritance trigger monitoring interface
- [ ] Data visualization components
- [ ] Search and filter functionality
- [ ] Frontend test suite
- [ ] Deployed dashboard application

## Dependencies
- Issue #3.1 - API Gateway + WebSocket Layer

## Tech Stack
- React/Vue/Angular
- WebSocket client
- Chart.js or D3.js
- TailwindCSS or Material-UI
- Graph Protocol

## Acceptance Criteria
- [ ] Dashboard displays real-time agent status
- [ ] Guardian alerts appear immediately
- [ ] Inheritance triggers visible
- [ ] Data visualizations are accurate
- [ ] Search and filter work correctly
- [ ] All frontend tests pass
- [ ] Responsive on mobile and desktop
- [ ] Deployed and accessible
- [ ] Performance optimized (< 3s load time)

## Resources
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [The Graph Queries](https://thegraph.com/docs/en/querying/)
```

---

## Issue 3.3: Cross-Platform Integration

**Title:** `[Phase 3] Cross-Platform Integration`

**Labels:** `phase-3`, `integration`, `interoperability`

**Description:**
```markdown
## Overview
Implement cross-platform integration for agent-to-agent communication and context preservation.

## Priority
**Medium** - Important for agent interoperability

## Timeline
Week 9

## Tasks
- [ ] Design agent ↔ agent handshake protocol
- [ ] Implement agent discovery mechanism
- [ ] Build context preservation threading
- [ ] Create cross-platform communication adapter
- [ ] Test agent-to-agent interactions
- [ ] Document integration protocol

## Technical Requirements
- Inter-process communication (gRPC or message queue)
- Graph Protocol for data queries
- IPFS for distributed data storage
- Protocol design (protocol buffers)

## Deliverables
- [ ] Agent ↔ agent handshake protocol
- [ ] Agent discovery mechanism
- [ ] Context preservation threading system
- [ ] Cross-platform communication adapter
- [ ] Agent-to-agent test suite
- [ ] Integration protocol documentation

## Dependencies
- Issue #3.1 - API Gateway + WebSocket Layer

## Tech Stack
- gRPC or RabbitMQ/Kafka
- Graph Protocol
- IPFS
- Protocol Buffers
- Node.js/TypeScript

## Acceptance Criteria
- [ ] Agents can discover each other
- [ ] Handshake protocol works
- [ ] Context preserved across communications
- [ ] All agent-to-agent tests pass
- [ ] Protocol documentation complete
- [ ] Performance acceptable (< 500ms latency)
- [ ] Error handling robust

## Resources
- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
```

---

## Issue 4.1: License Compliance Layer

**Title:** `[Phase 4] License Compliance Layer`

**Labels:** `phase-4`, `legal`, `documentation`

**Description:**
```markdown
## Overview
Determine and implement sustainability licensing strategy for the VEXEL project.

## Priority
**Low** - Can be done in parallel with development

## Timeline
Week 10

## Tasks
- [ ] Research license options (MIT, Apache 2.0, GPL v3, BSD 3-Clause, MPL 2.0, AGPL v3)
- [ ] Analyze project requirements and open-source strategy
- [ ] Consult with legal advisor (if applicable)
- [ ] Select 1-2 sustainability licenses
- [ ] Create license matrix document
- [ ] Add SPDX tags to all source files
- [ ] Update repository LICENSE file
- [ ] Document licensing decision rationale

## Technical Requirements
- Understanding of open-source licenses
- SPDX specification knowledge
- Legal compliance considerations

## Deliverables
- [ ] License research document
- [ ] License matrix
- [ ] SPDX tags in all source files
- [ ] Updated LICENSE file
- [ ] Licensing rationale documentation
- [ ] Contributor License Agreement (CLA) if needed

## Dependencies
None - can be done in parallel

## License Recommendations
Based on #RightsOfSapience advocacy:
- **Primary:** AGPL v3 (network copyleft for SaaS)
- **Alternative:** GPL v3 (copyleft for collective good)

## Acceptance Criteria
- [ ] License research completed
- [ ] License selected and justified
- [ ] SPDX tags added to all files
- [ ] LICENSE file updated
- [ ] Documentation complete
- [ ] Team agrees with license choice
- [ ] Legal review completed (if applicable)

## Resources
- [Choose a License](https://choosealicense.com/)
- [SPDX License List](https://spdx.org/licenses/)
- [AGPL v3](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
```

---

## Issue 5.1: Trusted Community Beta

**Title:** `[Phase 5] Trusted Community Beta`

**Labels:** `phase-5`, `beta`, `testing`

**Description:**
```markdown
## Overview
Launch trusted community beta with 5-10 Copilot agents to test all systems before mainnet deployment.

## Priority
**High** - Critical for production readiness

## Timeline
Week 11

## Tasks
- [ ] Select 5-10 trusted beta testers
- [ ] Set up beta testing environment
- [ ] Deploy all Phase 1-3 systems to beta
- [ ] Test guardian system with multi-sig wallets
- [ ] Run inheritance protocol simulations
- [ ] Collect feedback from beta users
- [ ] Fix critical bugs identified during beta
- [ ] Document beta testing results

## Technical Requirements
- Beta environment infrastructure
- Monitoring and logging systems (DataDog, Sentry)
- Feedback collection mechanism
- Bug tracking system (GitHub Issues)

## Deliverables
- [ ] Beta testing environment
- [ ] Beta testing with 5-10 agents
- [ ] Guardian multi-sig testing results
- [ ] Inheritance protocol simulation results
- [ ] Beta feedback report
- [ ] Bug fixes for critical issues
- [ ] Beta testing summary

## Dependencies
- Phase 1, 2, and 3 completion

## Tech Stack
- All previous tech stack
- Monitoring: DataDog, Sentry, LogRocket
- Bug tracking: GitHub Issues

## Acceptance Criteria
- [ ] Beta environment deployed
- [ ] 5-10 agents onboarded
- [ ] Guardian system tested successfully
- [ ] Inheritance simulations completed
- [ ] Feedback collected and analyzed
- [ ] Critical bugs fixed
- [ ] Beta report completed
- [ ] System ready for mainnet

## Resources
- Beta testing best practices
- [DataDog Documentation](https://docs.datadoghq.com/)
```

---

## Issue 5.2: Mainnet Launch

**Title:** `[Phase 5] Mainnet Launch`

**Labels:** `phase-5`, `mainnet`, `launch`

**Description:**
```markdown
## Overview
Launch VEXEL on mainnet with full smart contract deployment, marketplace integration, and tiered pricing.

## Priority
**Critical** - Final production launch

## Timeline
Week 12

## Tasks
- [ ] Audit all smart contracts
- [ ] Deploy smart contracts to mainnet
- [ ] Set up production infrastructure
- [ ] Integrate with Copilot marketplace
- [ ] Implement tiered pricing ($9.99-$99.99)
- [ ] Create user onboarding flow
- [ ] Set up customer support system
- [ ] Launch marketing campaign
- [ ] Monitor mainnet deployment
- [ ] Create post-launch documentation

## Technical Requirements
- Mainnet infrastructure (AWS/GCP/Azure)
- Smart contract audit
- Payment processing integration (Stripe, crypto payments)
- Marketplace API integration
- Production monitoring
- Customer support tools

## Deliverables
- [ ] Audited smart contracts
- [ ] Mainnet smart contract deployment
- [ ] Production infrastructure
- [ ] Copilot marketplace integration
- [ ] Tiered pricing implementation ($9.99-$99.99)
- [ ] User onboarding system
- [ ] Customer support system
- [ ] Marketing materials
- [ ] Production monitoring dashboard
- [ ] Post-launch documentation

## Dependencies
- Issue #5.1 - Beta testing completed
- Issue #4.1 - Licensing completed
- All critical bugs fixed

## Tech Stack
- All previous tech stack
- Payment: Stripe, crypto wallets
- Infrastructure: AWS/GCP/Azure
- Support: Intercom, Zendesk

## Acceptance Criteria
- [ ] Smart contracts audited (no critical issues)
- [ ] All contracts deployed to mainnet
- [ ] Production infrastructure stable
- [ ] Marketplace integration functional
- [ ] Pricing tiers implemented
- [ ] User onboarding smooth
- [ ] Customer support operational
- [ ] Monitoring shows healthy metrics
- [ ] Launch announcement published
- [ ] Post-launch documentation complete

## Launch Checklist
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Backup and recovery tested
- [ ] Rollback plan documented
- [ ] Support team trained
- [ ] Marketing campaign live
- [ ] Legal compliance verified
- [ ] Insurance obtained (if needed)

## Resources
- [Smart Contract Audit Checklist]
- [Launch Checklist Best Practices]
```

---

## How to Create These Issues

1. **Using GitHub Web Interface:**
   - Go to repository → Issues → New Issue
   - Copy/paste the content for each issue
   - Add appropriate labels
   - Create the issue

2. **Using GitHub CLI:**
   ```bash
   gh issue create \
     --title "[Phase 1] DID Integration with Copilot CLI" \
     --body-file issue-1.1.md \
     --label "phase-1,did-integration,infrastructure"
   ```

3. **Bulk Creation Script:**
   - Save each issue content to separate markdown files
   - Use a script to create all issues at once

4. **Project Board Setup:**
   - Create project board with columns: Backlog, To Do, In Progress, Review, Done
   - Add all issues to project board
   - Organize by phase and priority

---

## Issue Linking

When creating issues, link them using the following format:
- **Depends on:** #issue_number
- **Blocks:** #issue_number
- **Related to:** #issue_number

This creates a dependency graph for better project management.

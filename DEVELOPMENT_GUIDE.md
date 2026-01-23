# VEXEL Development Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Common Development Workflows](#common-development-workflows)
4. [Building and Testing](#building-and-testing)
5. [Working with Modules](#working-with-modules)
6. [Working with Smart Contracts](#working-with-smart-contracts)
7. [Working with the Dashboard](#working-with-the-dashboard)
8. [Adding Dependencies](#adding-dependencies)
9. [Debugging](#debugging)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 8.0.0 (comes with Node.js)
- **Git** >= 2.30.0
- **PostgreSQL** >= 13 (for database module)
- **IPFS Desktop** or **kubo** (optional, for IPFS testing)

### Quick Start (< 5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Violet-Site-Systems/VEXEL.git
cd VEXEL

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Build the project
npm run build

# 5. Run tests
npm test

# 6. Run a demo
npm run demo my-agent-id
```

---

## Development Environment Setup

### Step 1: Install Dependencies

Install root-level dependencies:
```bash
npm install
```

Install module-specific dependencies (if working on specific modules):
```bash
# Database module
cd src/database && npm install && cd ../..

# IPFS module
cd src/ipfs && npm install && cd ../..

# Knowledge Base module
cd src/knowledge-base && npm install && cd ../..

# Dashboard
cd dashboard && npm install && cd ..
```

### Step 2: Configure Environment

Create a `.env` file from the example:
```bash
cp .env.example .env
```

**Essential Environment Variables**:
```bash
# Network Configuration
NETWORK=polygon-mumbai
RPC_URL=https://rpc-mumbai.maticvigil.com

# Wallet Security
WALLET_ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/vexel
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=vexel
DATABASE_USER=vexel_user
DATABASE_PASSWORD=your_password

# IPFS
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# API Configuration
API_PORT=3000
JWT_SECRET=your-jwt-secret-here

# Smart Contracts
BADGE_CONTRACT_ADDRESS=0x...
HEARTBEAT_CONTRACT_ADDRESS=0x...
```

**Security Note**: Never commit `.env` files or hardcode secrets!

### Step 3: Set Up PostgreSQL Database

**Install PostgreSQL** (if not already installed):
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS
```

**Create Database**:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user and database
CREATE USER vexel_user WITH PASSWORD 'your_password';
CREATE DATABASE vexel OWNER vexel_user;
GRANT ALL PRIVILEGES ON DATABASE vexel TO vexel_user;
\q

# Run schema migrations
psql -U vexel_user -d vexel -f database/schema.sql
```

### Step 4: Set Up IPFS (Optional)

For local IPFS testing:

**Option A: IPFS Desktop**
1. Download from https://docs.ipfs.tech/install/ipfs-desktop/
2. Install and run
3. Default API endpoint: `http://localhost:5001`

**Option B: Kubo CLI**
```bash
# Install kubo
wget https://dist.ipfs.io/kubo/v0.16.0/kubo_v0.16.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.16.0_linux-amd64.tar.gz
cd kubo && sudo bash install.sh

# Initialize and start
ipfs init
ipfs daemon
```

### Step 5: Configure Smart Contract Deployment

For Mumbai testnet deployment:

```bash
# Get Mumbai MATIC from faucet
# https://faucet.polygon.technology/

# Set private key in .env (for deployment only!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Deploy contracts
npm run deploy:mumbai
```

---

## Common Development Workflows

### Workflow 1: Making Changes to Core Library

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes in src/
# Edit files as needed

# 3. Build incrementally (faster)
npm run build:core

# 4. Run related tests
npm test -- src/wallet   # Test specific module

# 5. Run all tests
npm test

# 6. Commit changes
git add .
git commit -m "feat(wallet): add new wallet method"

# 7. Push and create PR
git push origin feature/your-feature-name
```

### Workflow 2: Working on a Specific Module

```bash
# Navigate to module
cd src/database

# Make changes
# Edit files...

# Build just this module
npm run build

# Test just this module
npm test

# Return to root
cd ../..

# Build all modules
npm run build:modules
```

### Workflow 3: Adding a New Feature

```bash
# 1. Understand the requirements
# Read relevant documentation

# 2. Write tests first (TDD)
# Create test file: src/<module>/__tests__/feature.test.ts

# 3. Implement the feature
# Create implementation file: src/<module>/feature.ts

# 4. Export from module
# Update src/<module>/index.ts

# 5. Build and test
npm run build
npm test

# 6. Update documentation
# Update relevant .md files

# 7. Create PR with examples
```

### Workflow 4: Fixing a Bug

```bash
# 1. Reproduce the bug
# Write a failing test

# 2. Fix the bug
# Make minimal changes

# 3. Verify the fix
npm run build
npm test

# 4. Check for regressions
npm run test:all

# 5. Document the fix
# Update CHANGELOG.md

# 6. Submit PR with test
```

---

## Building and Testing

### Build Commands

**Core Library**:
```bash
# Build core library only
npm run build
# or
npm run build:core

# Clean and rebuild
npm run clean
npm run build
```

**Modules**:
```bash
# Build individual modules
npm run build:database
npm run build:ipfs
npm run build:knowledge-base

# Build all modules
npm run build:modules

# Build everything (core + modules)
npm run build:all
```

**Smart Contracts**:
```bash
# Compile Solidity contracts
npm run compile

# View artifacts
ls artifacts/contracts/
```

**Dashboard**:
```bash
# Navigate to dashboard
cd dashboard

# Development build
npm run build

# Production build (optimized)
npm run build
```

### Test Commands

**Unit Tests**:
```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- src/wallet/WalletManager.test.ts

# Run tests for a module
npm test -- src/api/__tests__

# Watch mode (rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Module Tests**:
```bash
# Test individual modules
npm run test:database
npm run test:ipfs
npm run test:knowledge-base

# Test all modules
npm run test:modules
```

**Integration Tests**:
```bash
# Run integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all
```

**Smart Contract Tests**:
```bash
# Test Solidity contracts (Hardhat)
npm run test:contracts

# Coverage
npx hardhat coverage
```

**Dashboard Tests**:
```bash
cd dashboard

# Run tests
npm test

# Coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Test Patterns

**Unit Test Example**:
```typescript
// src/wallet/__tests__/WalletManager.test.ts
import { WalletManager } from '../WalletManager';

describe('WalletManager', () => {
  let walletManager: WalletManager;

  beforeEach(() => {
    walletManager = new WalletManager({
      walletDir: './test-wallets',
      network: 'polygon-mumbai'
    });
  });

  afterEach(async () => {
    // Cleanup test wallets
    await walletManager.cleanup();
  });

  describe('createWallet', () => {
    it('should create a new wallet with valid address', async () => {
      const agentId = 'test-agent-001';
      const wallet = await walletManager.createWallet(agentId);

      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.privateKey).toBeDefined();
    });

    it('should throw error for duplicate wallet creation', async () => {
      const agentId = 'test-agent-002';
      await walletManager.createWallet(agentId);

      await expect(
        walletManager.createWallet(agentId)
      ).rejects.toThrow('Wallet already exists');
    });
  });
});
```

**Integration Test Example**:
```typescript
// src/__tests__/integration/haap-flow.test.ts
import { Vexel } from '../../index';

describe('HAAP Flow Integration', () => {
  let vexel: Vexel;

  beforeAll(() => {
    vexel = new Vexel({
      network: 'polygon-mumbai',
      walletDir: './test-wallets',
      haapTokenExpiryDays: 365
    });
  });

  it('should complete full HAAP flow', async () => {
    const result = await vexel.initializeHuman(
      'user_12345',
      'user@example.com'
    );

    expect(result.did).toBeDefined();
    expect(result.badge.tokenId).toBeDefined();
    expect(result.attestationToken).toBeDefined();
  });
});
```

---

## Working with Modules

### Understanding Module Structure

Each module follows this structure:
```
src/<module-name>/
├── index.ts              # Public API exports
├── <Component>.ts        # Implementation files
├── __tests__/            # Test files
│   └── <Component>.test.ts
├── package.json          # Module dependencies
├── tsconfig.json         # TypeScript config
└── jest.config.js        # Test configuration
```

### Creating a New Module

**Step 1: Create Directory Structure**
```bash
mkdir -p src/new-module/__tests__
cd src/new-module
```

**Step 2: Create package.json**
```json
{
  "name": "@vexel/new-module",
  "version": "1.0.0",
  "description": "New module description",
  "main": "../../dist/new-module/index.js",
  "types": "../../dist/new-module/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "jest --config jest.config.js",
    "clean": "rm -rf ../../dist/new-module"
  },
  "license": "AGPL-3.0-or-later",
  "dependencies": {},
  "devDependencies": {}
}
```

**Step 3: Create tsconfig.json**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/new-module",
    "declarationDir": "../../dist/new-module",
    "baseUrl": ".",
    "rootDir": "..",
    "paths": {
      "../types": ["../types/index"]
    }
  },
  "include": ["./**/*", "../types/index.ts"],
  "exclude": ["**/*.test.ts", "**/__tests__/**"]
}
```

**Step 4: Create jest.config.js**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^../types$': '<rootDir>/../types/index.ts'
  }
};
```

**Step 5: Create Implementation**
```typescript
// src/new-module/NewComponent.ts
/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 */

export class NewComponent {
  constructor() {
    // Implementation
  }

  public doSomething(): void {
    // Implementation
  }
}
```

**Step 6: Export from Module**
```typescript
// src/new-module/index.ts
export { NewComponent } from './NewComponent';
export type { NewComponentConfig } from './types';
```

**Step 7: Update Root Build Scripts**
```json
// package.json
{
  "scripts": {
    "build:new-module": "cd src/new-module && npm run build",
    "test:new-module": "cd src/new-module && npm test",
    "clean:new-module": "cd src/new-module && npm run clean"
  }
}
```

**Step 8: Update Root tsconfig.json**
```json
// tsconfig.json
{
  "exclude": [
    "src/new-module/**/*"
  ]
}
```

### Adding Dependencies to a Module

```bash
# Navigate to module
cd src/database

# Add dependency
npm install pg

# Add dev dependency
npm install --save-dev @types/pg

# Update package.json if needed
# Return to root
cd ../..

# Rebuild module
npm run build:database
```

---

## Working with Smart Contracts

### Development Workflow

**1. Write Contract**:
```solidity
// contracts/NewContract.sol
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

contract NewContract {
    // Implementation
}
```

**2. Write Tests**:
```typescript
// test/contracts/NewContract.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NewContract", function () {
  it("Should do something", async function () {
    const Contract = await ethers.getContractFactory("NewContract");
    const contract = await Contract.deploy();
    await contract.deployed();

    expect(await contract.doSomething()).to.equal(true);
  });
});
```

**3. Compile**:
```bash
npm run compile
```

**4. Test**:
```bash
npm run test:contracts
```

**5. Deploy to Testnet**:
```bash
npm run deploy:mumbai
```

**6. Verify**:
```bash
npm run verify:mumbai <CONTRACT_ADDRESS>
```

### Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy (local network)
npx hardhat run scripts/deploy.js

# Deploy (Mumbai testnet)
npx hardhat run scripts/deploy.js --network mumbai

# Verify contract
npx hardhat verify --network mumbai <ADDRESS> <CONSTRUCTOR_ARGS>

# Console
npx hardhat console --network mumbai
```

---

## Working with the Dashboard

### Development Workflow

```bash
# Navigate to dashboard
cd dashboard

# Install dependencies (if not done)
npm install

# Start development server (with hot reload)
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
cd dashboard

# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Build output in dashboard/dist/
```

### Adding Components

```typescript
// dashboard/src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
    </div>
  );
};
```

### Connecting to WebSocket

```typescript
// dashboard/src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);

    return () => newSocket.close();
  }, [url]);

  return socket;
};
```

---

## Adding Dependencies

### Adding to Core Package

```bash
# From root directory
npm install <package-name>

# Dev dependency
npm install --save-dev <package-name>

# Rebuild
npm run build
```

### Adding to Module

```bash
# Navigate to module
cd src/database

# Add dependency
npm install <package-name>

# Rebuild module
npm run build

# Test module
npm test

# Return to root
cd ../..
```

### Adding to Dashboard

```bash
cd dashboard

# Add dependency
npm install <package-name>

# Rebuild
npm run build

cd ..
```

### Dependency Guidelines

1. **Check licenses**: Ensure compatibility with AGPL v3
2. **Check security**: Run `npm audit` after adding
3. **Minimize dependencies**: Only add what's necessary
4. **Pin versions**: Use exact versions for critical deps
5. **Update package-lock.json**: Commit lock file changes

---

## Debugging

### Debugging Node.js Code

**Using VS Code**:

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Server",
      "program": "${workspaceFolder}/src/api/server.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

**Using Console**:
```typescript
// Add breakpoints with debugger statement
function myFunction() {
  debugger; // Execution will pause here
  // ...
}
```

**Run with inspector**:
```bash
node --inspect-brk dist/api/server.js
# Open chrome://inspect in Chrome
```

### Debugging Smart Contracts

**Hardhat Console**:
```bash
npx hardhat console --network mumbai

# In console:
const Contract = await ethers.getContractFactory("AgentHeartbeat");
const contract = await Contract.attach("0x...");
await contract.recordHeartbeat("0x...");
```

**Event Logs**:
```typescript
// Listen to events
contract.on("HeartbeatRecorded", (did, timestamp) => {
  console.log(`Heartbeat: ${did} at ${timestamp}`);
});
```

### Debugging Tests

**Run single test**:
```bash
npm test -- -t "should create wallet"
```

**Run with more detail**:
```bash
npm test -- --verbose
```

**Debug failed tests**:
```bash
npm test -- --onlyFailures
```

---

## Common Tasks

### Task 1: Create a New Agent Identity

```typescript
import { Vexel } from 'vexel';

const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets'
});

const agent = await vexel.initializeAgent('my-agent-001');
console.log('Agent DID:', agent.did);
console.log('Agent Address:', agent.wallet.address);
```

### Task 2: Register Agent with HAAP Protocol

```typescript
const result = await vexel.initializeHuman(
  'user_12345',
  'user@example.com'
);

console.log('DID:', result.did);
console.log('Badge Token ID:', result.badge.tokenId);
console.log('Attestation Token:', result.attestationToken.tokenId);
```

### Task 3: Query Agent from Database

```typescript
import { DatabaseClient, AgentRepository } from './src/database';

const db = new DatabaseClient({
  connectionString: process.env.DATABASE_URL
});

const repo = new AgentRepository(db);
const agent = await repo.getAgent('did:vexel:0x123...');

console.log('Agent:', agent);
```

### Task 4: Store Data in IPFS

```typescript
import { IPFSClient } from './src/ipfs';

const ipfs = new IPFSClient({
  host: 'localhost',
  port: 5001
});

const metadata = {
  agentId: 'agent-001',
  capabilities: ['chat', 'code']
};

const cid = await ipfs.add(JSON.stringify(metadata));
console.log('IPFS CID:', cid);
```

### Task 5: Migrate Knowledge Base to Arweave

```typescript
import { KnowledgeBaseMigration } from './src/knowledge-base';

const migration = new KnowledgeBaseMigration({
  arweaveKey: JSON.parse(process.env.ARWEAVE_KEY),
  databaseUrl: process.env.DATABASE_URL
});

const result = await migration.migrateAgent('agent-001');
console.log('Arweave TX ID:', result.transactionId);
```

### Task 6: Start API Server

```typescript
import { APIGateway } from './src/api';

const api = new APIGateway({
  port: 3000,
  jwtSecret: process.env.JWT_SECRET
});

await api.start();
console.log('API Server running on http://localhost:3000');
```

### Task 7: Connect Agents via gRPC

```typescript
import { CrossPlatformAdapter } from './src/cross-platform';

const adapter = new CrossPlatformAdapter({
  port: 50051,
  agentId: 'agent-001',
  did: 'did:vexel:0x123...'
});

await adapter.start();
console.log('gRPC server running on port 50051');
```

---

## Troubleshooting

### Build Issues

**Problem**: TypeScript compilation errors
```
Solution: 
1. Clean build artifacts: npm run clean
2. Delete node_modules: rm -rf node_modules
3. Reinstall: npm install
4. Rebuild: npm run build
```

**Problem**: Module not found errors
```
Solution:
1. Check tsconfig.json paths
2. Ensure module is built: npm run build:<module>
3. Check import statements
```

**Problem**: Slow build times
```
Solution:
1. Use incremental builds: enabled by default
2. Build only changed module: npm run build:<module>
3. Check for large dependencies
```

### Test Issues

**Problem**: Tests fail with "Cannot find module"
```
Solution:
1. Build before testing: npm run build
2. Check jest.config.js moduleNameMapper
3. Ensure all dependencies installed
```

**Problem**: Database tests fail
```
Solution:
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Run schema migrations: psql -f database/schema.sql
```

**Problem**: IPFS tests fail
```
Solution:
1. Check IPFS daemon is running
2. Verify IPFS_HOST and IPFS_PORT
3. Try: ipfs daemon
```

### Runtime Issues

**Problem**: Wallet encryption error
```
Solution:
1. Set WALLET_ENCRYPTION_KEY in .env
2. Use 32-byte key (64 hex characters)
3. Never commit encryption key
```

**Problem**: RPC connection errors
```
Solution:
1. Check RPC_URL in .env
2. Try different RPC endpoint
3. Verify network connectivity
```

**Problem**: API authentication fails
```
Solution:
1. Check JWT_SECRET is set
2. Verify token format
3. Check token expiry
```

### Smart Contract Issues

**Problem**: Contract deployment fails
```
Solution:
1. Check network configuration in hardhat.config.js
2. Verify deployer has sufficient MATIC
3. Check gas price and limits
```

**Problem**: Contract verification fails
```
Solution:
1. Wait a few minutes after deployment
2. Ensure constructor args are correct
3. Check network name matches
```

---

## Best Practices

### Code Quality

1. **Follow TypeScript strict mode**: Enable all type checking
2. **Write tests first**: TDD approach when possible
3. **Keep functions small**: Single responsibility principle
4. **Use descriptive names**: Clear variable and function names
5. **Document public APIs**: JSDoc for exported functions
6. **Handle errors gracefully**: Try-catch with meaningful messages

### Git Workflow

1. **Small commits**: One logical change per commit
2. **Conventional commits**: Use feat/fix/docs/chore prefixes
3. **Feature branches**: Branch from main, PR to merge
4. **Code review**: All changes reviewed before merge
5. **Squash commits**: Clean history on merge

### Performance

1. **Lazy load modules**: Import only what you need
2. **Cache results**: Memoize expensive computations
3. **Use incremental builds**: Faster iteration
4. **Profile before optimizing**: Measure first
5. **Batch operations**: Reduce database/RPC calls

### Security

1. **Never commit secrets**: Use environment variables
2. **Validate inputs**: Sanitize all user input
3. **Use prepared statements**: Prevent SQL injection
4. **Rate limit APIs**: Prevent abuse
5. **Keep dependencies updated**: Regular security patches

### Documentation

1. **Keep docs updated**: Change code = change docs
2. **Include examples**: Show, don't just tell
3. **Document decisions**: ADRs for architecture choices
4. **Link related docs**: Cross-reference
5. **Review readability**: Can a new dev understand?

---

## Next Steps

- **[PACKAGE_GUIDELINES.md](./PACKAGE_GUIDELINES.md)** - When to create new packages
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/](./docs/)** - Component-specific documentation

---

**Last Updated**: January 2026  
**Maintained By**: VEXEL Contributors  
**Questions**: See [CONTRIBUTING.md](./CONTRIBUTING.md) or [GitHub Discussions](https://github.com/Violet-Site-Systems/VEXEL/discussions)

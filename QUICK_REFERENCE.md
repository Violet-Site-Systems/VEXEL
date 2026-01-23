# VEXEL Quick Reference

## 🚀 Getting Started (Under 5 Minutes)

```bash
# Clone and setup
git clone https://github.com/Violet-Site-Systems/VEXEL.git
cd VEXEL
npm install
cp .env.example .env

# Build and test
npm run build
npm test

# Run demo
npm run demo my-agent-id
```

---

## 📦 Package Structure

```
VEXEL/
├── Core Package (src/)                  # Main library
├── Database Module (src/database/)      # PostgreSQL
├── IPFS Module (src/ipfs/)              # Storage
├── Knowledge Base (src/knowledge-base/) # Arweave
├── Dashboard (dashboard/)               # React UI
├── Subgraph (subgraph/)                 # TheGraph
└── Contracts (contracts/)               # Solidity
```

---

## 🔨 Common Commands

### Build
```bash
npm run build              # Build core
npm run build:modules      # Build all modules
npm run build:all          # Build everything
```

### Test
```bash
npm test                   # Unit tests
npm run test:modules       # Module tests
npm run test:integration   # Integration tests
npm run test:all           # All tests
```

### Clean
```bash
npm run clean              # Clean core
npm run clean:all          # Clean everything
```

### Specific Modules
```bash
npm run build:database     # Build database module
npm run test:ipfs          # Test IPFS module
npm run clean:knowledge-base  # Clean KB module
```

---

## 📖 Documentation Map

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| **[README.md](./README.md)** | Project overview | 5 min |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture | 15 min |
| **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** | Development workflows | 20 min |
| **[PACKAGE_GUIDELINES.md](./PACKAGE_GUIDELINES.md)** | Package decisions | 10 min |
| **[BUILD_BOUNDARIES_SUMMARY.md](./BUILD_BOUNDARIES_SUMMARY.md)** | Build system | 10 min |
| **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** | Module details | 10 min |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribution guide | 15 min |
| **[TESTING.md](./TESTING.md)** | Testing strategies | 10 min |

**Total Onboarding Time**: ~30 minutes to understand everything

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────┐
│  Layer 5: Storage (IPFS, Arweave)      │
├─────────────────────────────────────────┤
│  Layer 4: Data (PostgreSQL, Contracts) │
├─────────────────────────────────────────┤
│  Layer 3: API (REST, WebSocket, gRPC)  │
├─────────────────────────────────────────┤
│  Layer 2: Verification (HAAP, Badges)  │
├─────────────────────────────────────────┤
│  Layer 1: Identity (Wallet, DID, Sig)  │
└─────────────────────────────────────────┘
```

---

## 🔑 Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Vexel** | `src/index.ts` | Main API entry point |
| **WalletManager** | `src/wallet/` | Polygon wallets |
| **HAAPProtocol** | `src/haap/` | Human verification |
| **APIGateway** | `src/api/` | REST/WebSocket server |
| **DatabaseClient** | `src/database/` | PostgreSQL client |
| **IPFSClient** | `src/ipfs/` | IPFS storage |
| **ArweaveClient** | `src/knowledge-base/` | Permanent storage |

---

## 💻 Development Workflows

### Adding a New Feature
```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Write tests (TDD)
# Create test file

# 3. Implement feature
# Create implementation

# 4. Build and test
npm run build
npm test

# 5. Commit and PR
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Fixing a Bug
```bash
# 1. Reproduce with test
# Write failing test

# 2. Fix the bug
# Make minimal changes

# 3. Verify fix
npm run build
npm test

# 4. Submit PR
```

### Working on a Module
```bash
# Navigate to module
cd src/database

# Make changes
# ...

# Build just this module
npm run build

# Test just this module
npm test

# Return to root
cd ../..
```

---

## 🧪 Testing Quick Reference

```bash
# Run specific test file
npm test -- WalletManager.test.ts

# Run tests matching pattern
npm test -- -t "should create wallet"

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Only failed tests
npm test -- --onlyFailures
```

---

## 🔐 Environment Variables

Essential `.env` configuration:

```bash
# Network
NETWORK=polygon-mumbai
RPC_URL=https://rpc-mumbai.maticvigil.com

# Security
WALLET_ENCRYPTION_KEY=<32-byte-key>
JWT_SECRET=<your-secret>

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/vexel

# API
API_PORT=3000

# Contracts
BADGE_CONTRACT_ADDRESS=0x...
HEARTBEAT_CONTRACT_ADDRESS=0x...
```

---

## 📊 Module Dependencies

```
Core Types (src/types/)
    │
    ├─→ Database Module
    ├─→ IPFS Module
    ├─→ Knowledge Base Module
    └─→ Core Library
         │
         └─→ API, Wallet, HAAP, etc.
```

**Rule**: No circular dependencies!

---

## 🎯 Common Tasks

### Create Agent Identity
```typescript
import { Vexel } from 'vexel';

const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets'
});

const agent = await vexel.initializeAgent('agent-001');
console.log('DID:', agent.did);
```

### Register with HAAP
```typescript
const result = await vexel.initializeHuman(
  'user_123',
  'user@example.com'
);
console.log('Badge:', result.badge.tokenId);
```

### Store in IPFS
```typescript
import { IPFSClient } from './src/ipfs';

const ipfs = new IPFSClient();
const cid = await ipfs.add(JSON.stringify(metadata));
```

### Query Database
```typescript
import { DatabaseClient, AgentRepository } from './src/database';

const db = new DatabaseClient({ connectionString: process.env.DATABASE_URL });
const repo = new AgentRepository(db);
const agent = await repo.getAgent('did:vexel:0x123...');
```

### Start API Server
```typescript
import { APIGateway } from './src/api';

const api = new APIGateway({ port: 3000, jwtSecret: process.env.JWT_SECRET });
await api.start();
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Tests Fail
```bash
# Ensure built first
npm run build

# Check specific module
npm run build:database
npm run test:database
```

### Module Not Found
```bash
# Check paths in tsconfig.json
# Rebuild modules
npm run build:modules
```

### Database Connection Error
```bash
# Check PostgreSQL running
sudo service postgresql status

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

---

## 📝 Best Practices

### Code
- ✅ Write tests first (TDD)
- ✅ Keep functions small
- ✅ Use TypeScript strict mode
- ✅ Document public APIs
- ✅ Handle errors gracefully

### Git
- ✅ Small, focused commits
- ✅ Conventional commit messages
- ✅ Feature branches
- ✅ Code review all changes

### Performance
- ✅ Use incremental builds
- ✅ Test only what changed
- ✅ Profile before optimizing
- ✅ Lazy load modules

### Security
- ✅ Never commit secrets
- ✅ Validate all inputs
- ✅ Use environment variables
- ✅ Keep dependencies updated

---

## 🎓 Learning Path

**Day 1** (30 min):
1. Read README.md
2. Skim ARCHITECTURE.md
3. Run quick start commands

**Day 2** (1 hour):
1. Read DEVELOPMENT_GUIDE.md
2. Make a small change
3. Build and test

**Day 3** (1 hour):
1. Read PACKAGE_GUIDELINES.md
2. Explore module structure
3. Run examples

**Day 4+**:
1. Pick an issue
2. Contribute!

---

## 🔗 Useful Links

- **GitHub**: https://github.com/Violet-Site-Systems/VEXEL
- **Issues**: https://github.com/Violet-Site-Systems/VEXEL/issues
- **Discussions**: https://github.com/Violet-Site-Systems/VEXEL/discussions
- **Polygon Docs**: https://docs.polygon.technology/
- **IPFS Docs**: https://docs.ipfs.tech/
- **Arweave Docs**: https://docs.arweave.org/

---

## 🆘 Getting Help

1. **Read the docs** - Most questions answered here
2. **Search issues** - Someone may have asked before
3. **Ask in discussions** - Community support
4. **Open an issue** - For bugs or features
5. **Email support** - support@vexel.dev

---

## 📦 Package Decision Tree

```
Need to add code?
│
├─ Different tech stack? ───→ YES → New Application Package
│
├─ Optional feature? ───────→ YES → New Module Package
│
├─ Clear domain boundary? ──→ YES → Consider Module Package
│
├─ Build performance gain? ─→ YES → New Module Package
│
└─ Otherwise ───────────────→ Add to Existing Package
```

---

## 🚦 Status Check

```bash
# Check build status
npm run build:all && echo "✅ Build OK" || echo "❌ Build Failed"

# Check test status
npm run test:all && echo "✅ Tests OK" || echo "❌ Tests Failed"

# Check security
npm audit && echo "✅ No Vulnerabilities" || echo "❌ Security Issues"
```

---

## 📅 Maintenance Tasks

### Weekly
- [ ] Run `npm audit` and fix issues
- [ ] Update dependencies (patch versions)
- [ ] Review open PRs

### Monthly
- [ ] Update dependencies (minor versions)
- [ ] Review documentation accuracy
- [ ] Performance benchmarks

### Quarterly
- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Security audit

---

**Last Updated**: January 2026  
**Maintained By**: VEXEL Contributors

**Ready to build? Start with [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)!** 🚀

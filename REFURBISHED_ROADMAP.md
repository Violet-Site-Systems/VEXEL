# VEXEL Refurbished Roadmap

**Last Updated**: January 2026  
**Status**: Active Development  
**Priority Levels**: P0 (Critical - Blocks Release), P1 (High - Blocks Production), P2 (Medium - Technical Debt)

## Executive Summary

This roadmap addresses critical gaps identified in the VEXEL project feedback, focusing on build correctness, dependency hygiene, testing infrastructure, and security hardening. These tasks enable VEXEL to ship reliably and maintain production-grade quality.

---

## A) Build/Package Correctness (P0)

### BUILD-01: Fix runtime vs dev dependency classification ✅ IN PROGRESS

**Goal**: Runtime code must not depend on devDependencies.

**Problem**: `dotenv` is imported by `src/api/server.ts` but listed in `devDependencies`. In production installs (where devDependencies aren't installed), the API server crashes.

**Files**:
- `package.json`
- `src/api/server.ts`

**Steps**:
1. Move `dotenv` from `devDependencies` → `dependencies`
2. Run production-style install test: `npm ci --omit=dev && node dist/index.js`

**Acceptance Criteria**:
- API server starts without module-not-found errors when devDependencies are omitted
- `npm audit` reports no missing production dependencies

---

### BUILD-02: Decide and enforce what the published package includes

**Goal**: Either ship DB/IPFS/knowledge-base modules OR clearly quarantine them as "internal/experimental".

**Problem**: `tsconfig.json` excludes `src/database/**/*`, `src/ipfs/**/*`, `src/knowledge-base/**/*` from compilation, but they're referenced in docs and examples as shipped features.

**Files**:
- `tsconfig.json`
- `src/index.ts`
- `package.json`
- Documentation files

**Option A: Ship them** (Recommended if features are complete):
1. Remove `src/database`, `src/ipfs`, `src/knowledge-base` from tsconfig excludes
2. Add missing runtime deps (`pg`, `kubo-rpc-client`) to `dependencies`
3. Export modules from `src/index.ts` or document subpath exports
4. Update `package.json` with optional peer dependencies if needed

**Option B: Don't ship yet** (If experimental):
1. Keep excludes, move directories to `experimental/` or `internal/`
2. Remove references from mainline docs and examples
3. Add `.experimentalrc` or similar to document experimental status

**Acceptance Criteria (Option A)**:
- `npm run build` produces `dist/database/*`, `dist/ipfs/*`, `dist/knowledge-base/*`
- Consumers can import modules without reaching into `src/`
- All required dependencies are in `package.json`

**Acceptance Criteria (Option B)**:
- README/SETUP/TESTING do not claim these features exist in shipped SDK
- Clear documentation separates stable vs experimental features

---

### BUILD-03: Dependency audit and pruning ✅ IN PROGRESS

**Goal**: Remove unused dependencies or wire them into real implementations.

**Problem**: `package.json` includes dependencies that aren't used by compiled code, inflating install size and supply-chain risk.

**Files**:
- `package.json`
- All source files (scan imports)

**Steps**:
1. **Audit unused dependencies**:
   - `redis`: Not imported anywhere → REMOVE or document why included
   - `uuid`: Not imported in compiled code → REMOVE or use it
   - `did-jwt`, `did-resolver`: Not imported → REMOVE if DID features are stubbed
   - `arweave`: Only used in excluded knowledge-base → depends on BUILD-02
   
2. **Fix type package placement**:
   - Move ALL `@types/*` packages from `dependencies` → `devDependencies`
   - Types: `@types/cors`, `@types/express`, `@types/jsonwebtoken`, `@types/swagger-jsdoc`, `@types/swagger-ui-express`, `@types/uuid`

3. **Add missing runtime dependencies** (if BUILD-02 Option A):
   - `pg` (PostgreSQL client)
   - `kubo-rpc-client` (IPFS client)

**Acceptance Criteria**:
- All dependencies in `dependencies` are referenced by compiled `dist/**` output
- All `@types/*` are in `devDependencies`
- `npm install --production` installs only what's needed to run
- Documentation justifies any "unused-looking" deps

---

### BUILD-04: Add explicit package boundaries for multi-project repo

**Goal**: Make dashboard/subgraph clearly separate install units.

**Files**:
- Root `README.md`
- Root `package.json` (add scripts)

**Steps**:
1. Document package structure in README:
   ```
   /                 → Core SDK + API + Contracts (this package)
   /dashboard        → Monitoring dashboard (separate npm package)
   /subgraph         → TheGraph indexer (separate deployment)
   ```

2. Add convenience scripts to root `package.json`:
   ```json
   "scripts": {
     "dashboard:install": "cd dashboard && npm install",
     "dashboard:dev": "cd dashboard && npm run dev",
     "dashboard:build": "cd dashboard && npm run build",
     "subgraph:codegen": "cd subgraph && graph codegen",
     "subgraph:build": "cd subgraph && graph build"
   }
   ```

**Acceptance Criteria**:
- New contributors can discover how to run each component from root scripts
- README clearly delineates package boundaries

---

## B) Testing & CI Stability (P0)

### TEST-01: Split unit tests vs integration tests ✅ IN PROGRESS

**Goal**: `npm test` runs fast and passes without Postgres/IPFS dependencies.

**Problem**: `jest.config.js` runs ALL tests under `src/`, including `src/__tests__/repository.test.ts` and `src/__tests__/ipfs.test.ts` which require `pg` and `kubo-rpc-client` (not in package.json).

**Files**:
- `jest.config.js`
- `src/__tests__/repository.test.ts`
- `src/__tests__/ipfs.test.ts`
- `package.json` (scripts)

**Steps**:
1. Create separate Jest configs:
   - `jest.unit.config.js`: Excludes `src/__tests__/integration/`
   - `jest.integration.config.js`: Only runs `src/__tests__/integration/`

2. Move integration tests:
   ```bash
   mkdir -p src/__tests__/integration
   mv src/__tests__/repository.test.ts src/__tests__/integration/
   mv src/__tests__/ipfs.test.ts src/__tests__/integration/
   ```

3. Update `package.json` scripts:
   ```json
   {
     "test": "jest --config jest.unit.config.js",
     "test:integration": "jest --config jest.integration.config.js",
     "test:all": "npm test && npm run test:integration"
   }
   ```

4. Add `pg` and `kubo-rpc-client` to `devDependencies` (for integration tests)

**Acceptance Criteria**:
- `npm test` passes on clean machine without DB/IPFS
- `npm run test:integration` runs DB/IPFS tests when services available
- CI can run unit tests without external dependencies

---

### TEST-02: Fix Jest toolchain version compatibility

**Goal**: Ensure Jest and ts-jest versions are compatible.

**Files**:
- `package.json`

**Current versions**:
- `jest@30.2.0`
- `ts-jest@29.4.6`

**Steps**:
1. Check ts-jest compatibility: https://github.com/kulshekhar/ts-jest
2. Either:
   - Upgrade `ts-jest` to `^30.x` (if available), OR
   - Downgrade `jest` to `^29.x` to match `ts-jest@29.x`

**Acceptance Criteria**:
- `npm test` runs without ts-jest preset errors
- No version mismatch warnings

---

### TEST-03: Fix TypeScript compilation errors in tests ✅ IN PROGRESS

**Goal**: Resolve type errors preventing tests from compiling.

**Problem**: 
1. `src/index.test.ts`: Type errors in `src/api/routes/auth.ts` routes
2. `src/__tests__/ipfs.test.ts`: Missing `kubo-rpc-client` dependency

**Files**:
- `src/api/routes/auth.ts`
- `src/api/types.ts`
- `src/__tests__/ipfs.test.ts`

**Steps**:
1. Fix auth route type errors:
   - Routes expect `Request` but receive `AuthRequest`
   - Ensure middleware properly types `req.user` as `JWTPayload`

2. Handle ipfs test dependency:
   - Either add `kubo-rpc-client` to devDependencies, OR
   - Move test to integration suite

**Acceptance Criteria**:
- All tests compile successfully
- No TypeScript errors in test files

---

### CI-01: Add GitHub Actions workflow for continuous integration

**Goal**: Enforce "green main" behavior with automated testing.

**Files**:
- `.github/workflows/ci.yml` (new)

**Steps**:
1. Create CI workflow with jobs:
   ```yaml
   jobs:
     build:
       - npm ci
       - npm run build
       - npm run lint (if exists)
     
     test-unit:
       - npm test
     
     test-contracts:
       - npm run compile
       - npm run test:contracts
   ```

2. Optional: Add dashboard job
   ```yaml
     dashboard:
       - cd dashboard && npm ci
       - npm run lint
       - npm run build
   ```

**Acceptance Criteria**:
- PRs fail if build/tests fail
- Workflow completes in reasonable time (<10 minutes)

---

### CI-02: Add integration test workflow with services

**Goal**: Run DB/IPFS tests in CI with required services.

**Files**:
- `.github/workflows/integration.yml` (new)

**Steps**:
1. Set up PostgreSQL service:
   ```yaml
   services:
     postgres:
       image: postgres:14
       env:
         POSTGRES_PASSWORD: test
       options: >-
         --health-cmd pg_isready
         --health-interval 10s
   ```

2. Run integration tests:
   ```yaml
   - name: Run integration tests
     env:
       DATABASE_URL: postgres://postgres:test@localhost:5432/vexel_test
     run: npm run test:integration
   ```

**Acceptance Criteria**:
- Integration workflow passes with real DB
- Tests can connect to services

---

## C) API Gateway Security and Correctness (P1)

### SEC-01: WebSocket authentication via JWT, not client-supplied userId

**Goal**: Prevent identity spoofing.

**Problem**: `src/api/websocket/WebSocketServer.ts` accepts `socket.handshake.auth.userId` as identity without verification.

**Files**:
- `src/api/websocket/WebSocketServer.ts`
- `src/api/middleware/auth.ts`

**Steps**:
1. Require JWT in handshake: `socket.handshake.auth.token`
2. Verify token server-side, derive userId/role from token
3. Reject connection if missing/invalid
4. Store verified identity in socket context

**Acceptance Criteria**:
- Client cannot connect with invalid token
- Connected socket sessions have server-trusted identity

---

### SEC-02: Fix CORS config contradiction

**Goal**: Avoid invalid `origin="*"` with `credentials: true`.

**Problem**: Browser CORS policy rejects `Access-Control-Allow-Origin: *` when credentials are included.

**Files**:
- `src/api/APIGateway.ts`

**Steps**:
1. If `origin === "*"`, set `credentials: false`
2. If credentials required, enforce explicit allowlist origins from environment variable

**Acceptance Criteria**:
- No CORS errors in browser console
- Configuration is internally consistent

---

### SEC-03: Resource-scoped authorization for actions

**Goal**: Prevent cross-agent tampering.

**Problem**: `ActionVerificationMiddleware` checks roles but not ownership.

**Files**:
- `src/api/middleware/actionVerification.ts`
- `src/api/routes/agents.ts`

**Steps**:
1. Extend verification to check ownership:
   - If action targets `agentId`, verify request user owns that agent (DB lookup)
   - OR verify agent role can only modify itself
2. Add policy matrix: `action type → required role + ownership rule`

**Acceptance Criteria**:
- Human users can only mutate agents they own
- Agent role can only mutate itself

---

### SEC-04: Replace "token vending machine" login with real auth

**Goal**: Don't ship dev auth endpoint to production.

**Problem**: `/api/auth/login` accepts any userId/role without verification.

**Files**:
- `src/api/routes/auth.ts`

**Steps**:
1. Gate current login behind `NODE_ENV !== 'production'` OR `DEV_AUTH_ENABLED=true`
2. In production mode, require real auth provider (OAuth, API keys, etc.)
3. Document dev mode clearly in README

**Acceptance Criteria**:
- In production, `/api/auth/login` cannot mint admin tokens from thin air
- Dev mode is clearly documented

---

## D) API ↔ Dashboard Integration (P1)

### API-01: Implement real agent CRUD backed by DB

**Goal**: Make `/api/agents` return actual agents, not stub messages.

**Problem**: Routes return "requires database integration" messages.

**Files**:
- `src/api/routes/agents.ts`
- `src/database/*` (if BUILD-02 ships it)

**Steps**:
1. Initialize `DatabaseClient` in API gateway
2. Implement routes:
   - `GET /api/agents` → list agents
   - `GET /api/agents/:agentId` → get single agent
   - `PUT /api/agents/:agentId/status` → update status
   - `GET /api/agents/:agentId/capabilities` → get capabilities

**Acceptance Criteria**:
- Dashboard `getAgents()` returns real agent list
- Status updates persist and can be re-fetched

---

### API-02: Add request validation (zod or joi)

**Goal**: Validate request bodies to prevent runtime errors.

**Files**:
- `src/api/routes/auth.ts`
- `src/api/routes/agents.ts`

**Steps**:
1. Add validation library: `npm install zod`
2. Define schemas for each route input
3. Validate and return 400 with specific errors

**Acceptance Criteria**:
- Malformed inputs get predictable 400 responses
- No route relies on implicit types from JSON bodies

---

### API-03: Make Swagger generation work from dist

**Goal**: `/api-docs` works after compilation.

**Problem**: Swagger looks for `./src/api/routes/*.ts` which doesn't exist in dist.

**Files**:
- `src/api/APIGateway.ts`

**Steps**:
1. Change `apis` path to work at runtime:
   ```typescript
   apis: [path.join(__dirname, 'routes/*.js')]
   ```
2. OR include JSDoc in compiled output

**Acceptance Criteria**:
- Swagger UI shows endpoints when running compiled dist server

---

### DASH-01: Align dashboard agent types with API

**Goal**: Stop type drift between dashboard and API.

**Problem**: Dashboard expects `active`/`inactive` but API returns `ACTIVE`/`SLEEP`/`TERMINATED`.

**Files**:
- `dashboard/src/types/index.ts`
- `dashboard/src/services/api.ts`

**Steps**:
1. Map API runtime status enum → dashboard status union
2. Update `getDashboardStats()` logic accordingly

**Acceptance Criteria**:
- Dashboard shows correct status counts from real API responses

---

## E) Wallet/Key Security Hardening (P1)

### WALLET-01: Enforce encryption key in production

**Goal**: Wallet storage isn't "security theater".

**Files**:
- `src/wallet/WalletManager.ts`

**Steps**:
1. If `NODE_ENV === 'production'` and no `WALLET_ENCRYPTION_KEY`, throw at startup
2. Set file permissions `0o600` when writing wallets

**Acceptance Criteria**:
- Production run fails fast without encryption key
- Wallet files are not world-readable

---

### WALLET-02: Stop returning mnemonic by default

**Goal**: Reduce accidental secret exfiltration.

**Files**:
- `src/wallet/WalletManager.ts`

**Steps**:
1. Add option `returnMnemonic?: boolean` default false
2. Only include mnemonic when explicitly requested

**Acceptance Criteria**:
- `createWallet()` does not leak mnemonic unless configured

---

## F) HAAP Protocol Correctness (P2)

### HAAP-01: Use crypto-grade token ID generation

**Goal**: Avoid predictable token IDs.

**Files**:
- `src/haap/HAAPProtocol.ts`

**Steps**:
1. Generate token IDs via `crypto.randomBytes(16).toString('hex')` or UUID v4

**Acceptance Criteria**:
- Token IDs are not based on time/random substring

---

### HAAP-02: Persist tokens and KYC status

**Goal**: Tokens survive process restarts.

**Problem**: In-memory storage loses all tokens on restart.

**Files**:
- `src/haap/HAAPProtocol.ts`
- `src/haap/KYCService.ts`

**Steps** (choose one):
1. Implement Redis-backed storage
2. OR implement DB-backed storage

**Acceptance Criteria**:
- After restart, `validateToken(tokenId)` still works

---

## G) Contracts + Subgraph Coherence (P2)

### CHAIN-01: Fix DID squatting in AgentHeartbeat

**Goal**: Prevent attackers registering someone else's DID.

**Files**:
- `contracts/AgentHeartbeat.sol`
- `test/contracts/AgentHeartbeat.test.ts`

**Steps**:
1. Require `msg.sender == agentAddress` in `registerAgent`
2. OR require EIP-712 signature proving control
3. Add tests for unauthorized registration

**Acceptance Criteria**:
- Unauthorized registration attempts revert
- Tests cover attack path

---

### SUBGRAPH-01: Make subgraph match deployed contracts

**Goal**: Subgraph should be deployable.

**Problem**: `subgraph/subgraph.yaml` references `AgentRegistry` contract that doesn't exist.

**Files**:
- `subgraph/subgraph.yaml`
- `subgraph/src/mapping.ts`

**Steps** (pick one):
1. Add `contracts/AgentRegistry.sol` + deployment scripts, OR
2. Rewrite subgraph to index `AgentHeartbeat` events

**Acceptance Criteria**:
- `graph codegen` and `graph build` succeed
- Indexed events match actual chain events

---

## H) Documentation Drift Control (P2)

### DOC-01: Create "single source of truth" run matrix

**Goal**: Stop docs lying by accident.

**Files**:
- `README.md`
- `SETUP.md`
- `TESTING.md`

**Steps**:
1. Add matrix to README:
   ```
   | Component | Directory | Command | Required Services |
   |-----------|-----------|---------|-------------------|
   | SDK Tests | / | npm test | None |
   | API Server | / | npm run api:start | Optional: DB, IPFS |
   | Dashboard | /dashboard | npm run dev | API Server |
   | Contracts | / | npm run compile | None |
   | Subgraph | /subgraph | graph build | Deployed contracts |
   ```

2. Remove steps referencing excluded modules unless they're shipped

**Acceptance Criteria**:
- New dev can run SDK tests, API, dashboard, and contracts without guessing

---

### DOC-02: Make examples compile against published surface

**Goal**: Examples only import what's actually exported/built.

**Files**:
- `examples/*`
- `src/index.ts`

**Steps**:
1. For each example, ensure imports target public API
2. Move examples using excluded modules to `experimental/`

**Acceptance Criteria**:
- `npx ts-node examples/<file>.ts` works after npm install

---

## Implementation Priority

### Immediate (Block Release)
1. BUILD-01 ✅ Move dotenv to dependencies
2. BUILD-03 ✅ Move @types/* to devDependencies  
3. TEST-01 ✅ Separate integration tests
4. TEST-03 ✅ Fix compilation errors

### Short-term (Block Production)
5. BUILD-02: Decide on shipping DB/IPFS modules
6. SEC-01: WebSocket JWT authentication
7. SEC-04: Gate dev auth endpoint
8. API-01: Implement real agent routes

### Medium-term (Technical Debt)
9. CI-01: GitHub Actions CI workflow
10. SEC-03: Resource-scoped authorization
11. WALLET-01: Enforce encryption in production

### Long-term (Quality Improvements)
12. HAAP-02: Persistent token storage
13. CHAIN-01: Fix DID squatting
14. DOC-01: Complete run matrix

---

## Success Metrics

- ✅ **Build correctness**: `npm ci --omit=dev && npm run build && node dist/index.js` succeeds
- ✅ **Test reliability**: `npm test` passes in clean environment without external services
- ✅ **Dependency hygiene**: No unused dependencies in `dependencies`, all types in `devDependencies`
- ✅ **Documentation accuracy**: README instructions work on first try for new contributors
- ✅ **Security baseline**: No dev-only auth endpoints reachable in production

---

## Getting Help

- **Questions**: Open GitHub Discussion
- **Bugs**: File GitHub Issue with `[Roadmap]` prefix
- **Contributing**: See `CONTRIBUTING.md` for task pickup process

**Last Review**: January 2026  
**Next Review**: After BUILD-01 through TEST-03 completion

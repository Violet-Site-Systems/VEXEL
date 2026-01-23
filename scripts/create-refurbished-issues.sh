#!/bin/bash
# Create Refurbished Roadmap Issues using GitHub CLI
# Usage: ./scripts/create-refurbished-issues.sh

set -e

echo "Creating 22 Refurbished Roadmap Issues..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo "Creating issue: $title"
    gh issue create --title "$title" --body "$body" --label "$labels"
    echo "✓ Created"
    echo ""
}

# P0.1: Build Boundaries
create_issue \
    "[P0] Establish Build Boundaries for DB/IPFS/Knowledge-Base Modules" \
    "$(cat << 'EOF'
## Overview
Establish clear build boundaries and module separation for database, IPFS, and knowledge-base modules to improve build performance, testing isolation, and code organization.

## Priority
**P0 - Critical** - Required for scalable development and testing

## Problem Statement
Current monolithic build structure couples database, IPFS, and knowledge-base components, leading to:
- Slow build times (all modules rebuild on any change)
- Difficult to test modules in isolation
- Unclear dependency boundaries
- Hard to maintain and extend

## Tasks
- [ ] Analyze current module dependencies and coupling
- [ ] Define clear module boundaries and interfaces
- [ ] Refactor database module (\`src/database/\`) for independent builds
- [ ] Refactor IPFS module (\`src/ipfs/\`) for independent builds
- [ ] Refactor knowledge-base module (\`src/knowledge-base/\`) for independent builds
- [ ] Create module-specific build scripts
- [ ] Update TypeScript project references for incremental builds
- [ ] Add module-level unit tests
- [ ] Update documentation with new module structure

## Technical Requirements
- TypeScript project references (tsconfig.json per module)
- Clear module interfaces and exports
- Minimal cross-module dependencies
- Jest configuration per module (if applicable)

## Acceptance Criteria
- [ ] Each module can be built independently
- [ ] Each module can be tested independently
- [ ] Build time reduced by at least 30% for incremental builds
- [ ] No circular dependencies between modules
- [ ] Documentation updated and reviewed
- [ ] All existing tests pass
- [ ] No breaking changes to public APIs

## Related Files
- \`src/database/\`
- \`src/ipfs/\`
- \`src/knowledge-base/\`
- \`tsconfig.json\`
- \`package.json\`
EOF
)" \
    "P0,build,architecture,refactor"

# P0.2: Multi-Package Documentation
create_issue \
    "[P0] Document Multi-Package Repository Structure and Guidelines" \
    "$(cat << 'EOF'
## Overview
Create comprehensive documentation for the multi-package repository structure, explaining module organization, build system, and development workflows.

## Priority
**P0 - Critical** - Essential for onboarding and maintainability

## Problem Statement
Current repository lacks clear documentation on:
- How modules are organized
- When to create new packages vs. adding to existing ones
- Build and test workflows
- Inter-module dependencies and contracts
- Development guidelines for multi-package setup

## Tasks
- [ ] Document current repository structure
- [ ] Create architecture diagram showing module relationships
- [ ] Write guidelines for when to create new packages
- [ ] Document build system and workflows
- [ ] Create development workflow guide
- [ ] Document testing strategy for multi-package setup
- [ ] Add examples of common development tasks
- [ ] Create troubleshooting guide

## Acceptance Criteria
- [ ] New developers can understand repository structure in < 30 minutes
- [ ] All major architectural decisions documented
- [ ] Build and test workflows clearly explained
- [ ] Examples provided for common tasks
- [ ] Documentation reviewed by 2+ team members
- [ ] Links integrated into README.md

## Dependencies
- Issue #R0.1 (Build Boundaries) - should be completed first

## Related Files
- \`README.md\`
- \`CONTRIBUTING.md\`
- \`package.json\`
- \`tsconfig.json\`
EOF
)" \
    "P0,documentation,architecture"

# P0.3: Jest Version Alignment
create_issue \
    "[P0] Align Jest and ts-jest Versions for Test Stability" \
    "$(cat << 'EOF'
## Overview
Align Jest and ts-jest versions to ensure test stability, eliminate version conflicts, and improve test performance.

## Priority
**P0 - Critical** - Test reliability is essential for CI/CD

## Problem Statement
Current Jest/ts-jest setup has:
- Potential version mismatches between Jest and ts-jest
- Inconsistent test behavior across environments
- Slow test execution times
- Type checking issues during tests
- Deprecation warnings in test output

## Tasks
- [ ] Audit current Jest and ts-jest versions
- [ ] Research compatible version combinations
- [ ] Update Jest to latest stable version
- [ ] Update ts-jest to compatible version
- [ ] Update @types/jest to match Jest version
- [ ] Test all unit tests with new versions
- [ ] Test all integration tests with new versions
- [ ] Update jest.config.js configurations
- [ ] Fix any test failures from version updates
- [ ] Update documentation with new versions
- [ ] Add version compatibility checks to CI

## Acceptance Criteria
- [ ] All unit tests pass (0 failures)
- [ ] All integration tests pass (0 failures)
- [ ] No deprecation warnings in test output
- [ ] Test execution time improved or maintained
- [ ] Type checking works correctly in tests
- [ ] CI pipeline passes
- [ ] Documentation updated

## Related Files
- \`package.json\`
- \`jest.config.js\`
- \`jest.unit.config.js\`
- \`jest.integration.config.js\`
- \`tsconfig.json\`
EOF
)" \
    "P0,testing,dependencies,build"

# P0.4: GitHub Actions CI
create_issue \
    "[P0] Implement GitHub Actions CI Workflow for Automated Testing" \
    "$(cat << 'EOF'
## Overview
Implement comprehensive GitHub Actions CI workflow for automated testing, linting, building, and security scanning on every push and pull request.

## Priority
**P0 - Critical** - Automated testing is essential for quality assurance

## Problem Statement
Repository lacks automated CI pipeline, resulting in:
- Manual testing burden on developers
- Inconsistent test execution
- Late detection of build failures
- No automated security scanning
- Risk of merging broken code

## Tasks
- [ ] Create \`.github/workflows/ci.yml\` workflow file
- [ ] Configure Node.js environment setup
- [ ] Add dependency installation and caching
- [ ] Configure unit test execution
- [ ] Configure integration test execution
- [ ] Add TypeScript build verification
- [ ] Add linting checks (ESLint)
- [ ] Add security scanning (npm audit)
- [ ] Configure test coverage reporting
- [ ] Configure workflow triggers (push, PR)
- [ ] Add status badge to README
- [ ] Document CI workflow

## Acceptance Criteria
- [ ] CI runs on every push to any branch
- [ ] CI runs on every pull request
- [ ] All unit tests execute and pass
- [ ] All integration tests execute and pass
- [ ] TypeScript builds successfully
- [ ] Linting passes (no errors)
- [ ] Security audit passes (no critical vulnerabilities)
- [ ] Workflow completes in < 10 minutes
- [ ] Documentation complete

## Dependencies
- Issue #R0.3 (Jest alignment) - should be completed first

## Related Files
- \`.github/workflows/\` (new directory)
- \`package.json\`
- \`README.md\`
EOF
)" \
    "P0,ci,github-actions,automation"

# P0.5: Integration Test Workflow
create_issue \
    "[P0] Create Integration Test Workflow with PostgreSQL Service" \
    "$(cat << 'EOF'
## Overview
Create dedicated integration test workflow with PostgreSQL service container for database integration testing in CI environment.

## Priority
**P0 - Critical** - Database integration tests are core to system reliability

## Problem Statement
Current integration tests may not run reliably in CI due to:
- Lack of PostgreSQL service configuration
- Environment setup complexity
- Missing database initialization
- Connection configuration issues
- Test data management challenges

## Tasks
- [ ] Configure PostgreSQL service in GitHub Actions
- [ ] Set up database initialization scripts
- [ ] Configure test database connection strings
- [ ] Create database migration runner for tests
- [ ] Add test data seeding mechanism
- [ ] Configure database cleanup between test runs
- [ ] Test all database-dependent integration tests
- [ ] Add database health check
- [ ] Document integration test setup
- [ ] Add troubleshooting guide

## Acceptance Criteria
- [ ] PostgreSQL service starts in CI
- [ ] Database schema created automatically
- [ ] Test data seeded before tests run
- [ ] All integration tests pass in CI
- [ ] Tests clean up after themselves
- [ ] Connection errors handled gracefully
- [ ] Workflow completes in < 15 minutes
- [ ] Documentation complete

## Dependencies
- Issue #R0.4 (CI Workflow) - should be completed first or in parallel

## Related Files
- \`.github/workflows/ci.yml\` or \`.github/workflows/integration-tests.yml\`
- \`database/schema.sql\`
- \`jest.integration.config.js\`
- \`src/database/client.ts\`
EOF
)" \
    "P0,testing,ci,database,postgres"

echo ""
echo "P0 Issues Created (5/22)"
echo "Creating P1 Security & API Issues..."
echo ""

# P1.1: WebSocket JWT Auth
create_issue \
    "[P1] Implement JWT Authentication for WebSocket Connections" \
    "$(cat << 'EOF'
## Overview
Implement JWT-based authentication for WebSocket connections to secure real-time communication between clients and the API gateway.

## Priority
**P1 - High** - Security vulnerability in production

## Problem Statement
Current WebSocket implementation may lack proper authentication:
- Unauthenticated WebSocket connections possible
- No token validation on connection
- Vulnerable to unauthorized access
- Session hijacking risks

## Tasks
- [ ] Design WebSocket authentication flow
- [ ] Implement JWT validation on WebSocket connection
- [ ] Add token refresh mechanism for long-lived connections
- [ ] Implement authorization checks for WebSocket events
- [ ] Add connection authentication middleware
- [ ] Handle token expiration gracefully
- [ ] Add reconnection with authentication
- [ ] Write authentication tests
- [ ] Document WebSocket authentication flow

## Acceptance Criteria
- [ ] Unauthenticated connections rejected
- [ ] Valid JWT tokens accepted
- [ ] Expired tokens rejected with clear error
- [ ] Token refresh works seamlessly
- [ ] All authentication tests pass
- [ ] Documentation complete

## Related Files
- \`src/api/websocket/\` or \`src/api/WebSocketServer.ts\`
- \`src/api/middleware/AuthMiddleware.ts\`
EOF
)" \
    "P1,security,websocket,authentication"

# P1.2: CORS Fix
create_issue \
    "[P1] Fix and Harden CORS Configuration for Production" \
    "$(cat << 'EOF'
## Overview
Fix CORS configuration to properly restrict cross-origin requests while enabling legitimate clients in production.

## Priority
**P1 - High** - Security risk and potential production issues

## Problem Statement
Current CORS configuration may have issues:
- Overly permissive origins (e.g., \`*\`)
- Missing credentials support
- Incorrect allowed methods/headers
- Lack of environment-specific configuration

## Tasks
- [ ] Audit current CORS configuration
- [ ] Define allowed origins per environment
- [ ] Configure environment-specific CORS settings
- [ ] Implement origin validation logic
- [ ] Set appropriate allowed methods and headers
- [ ] Configure credentials support (if needed)
- [ ] Test CORS with different origins
- [ ] Document CORS configuration

## Acceptance Criteria
- [ ] Only whitelisted origins allowed in production
- [ ] Development environment has relaxed CORS
- [ ] Preflight requests handled correctly
- [ ] No overly permissive settings
- [ ] All CORS tests pass
- [ ] Documentation complete

## Related Files
- \`src/api/APIGateway.ts\`
- \`src/api/server.ts\`
- \`.env.example\`
EOF
)" \
    "P1,security,api,cors"

# P1.3: Resource-Scoped Authorization
create_issue \
    "[P1] Implement Resource-Scoped Authorization for API Endpoints" \
    "$(cat << 'EOF'
## Overview
Implement fine-grained, resource-scoped authorization to ensure users can only access and modify their own resources.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Current authorization may lack resource-level checks:
- Users might access other users' data
- No ownership validation on resources
- Missing role-based access control (RBAC)
- Potential privilege escalation risks

## Tasks
- [ ] Design resource-scoped authorization model
- [ ] Implement ownership validation middleware
- [ ] Add role-based access control (RBAC)
- [ ] Protect agent CRUD endpoints
- [ ] Protect wallet endpoints
- [ ] Protect knowledge base endpoints
- [ ] Add authorization tests for all endpoints
- [ ] Document authorization model
- [ ] Perform security audit

## Acceptance Criteria
- [ ] Users can only access their own resources
- [ ] Unauthorized access attempts blocked
- [ ] Role-based permissions enforced
- [ ] All authorization tests pass
- [ ] No authorization bypass vulnerabilities
- [ ] Documentation complete

## Related Files
- \`src/api/middleware/AuthMiddleware.ts\`
- \`src/api/routes/\`
EOF
)" \
    "P1,security,authorization,api"

# P1.4: Production Login Hardening
create_issue \
    "[P1] Harden Production Login and Authentication System" \
    "$(cat << 'EOF'
## Overview
Implement production-grade login hardening including rate limiting, brute force protection, and secure session management.

## Priority
**P1 - High** - Essential for production security

## Problem Statement
Current login system may lack production-grade security:
- No rate limiting on login attempts
- Missing brute force protection
- No account lockout mechanism
- Missing login monitoring/alerting
- Vulnerable to credential stuffing

## Tasks
- [ ] Implement rate limiting for login endpoints
- [ ] Add brute force protection (account lockout)
- [ ] Enforce strong password requirements
- [ ] Add failed login attempt logging
- [ ] Implement account lockout after N failed attempts
- [ ] Implement secure session management
- [ ] Add login monitoring and alerting
- [ ] Document security measures
- [ ] Perform security testing

## Acceptance Criteria
- [ ] Login rate limited (e.g., 5 attempts per 15 minutes)
- [ ] Account locked after N failed attempts
- [ ] Strong passwords enforced
- [ ] Failed attempts logged
- [ ] All security tests pass
- [ ] Documentation complete

## Related Files
- \`src/api/routes/auth.ts\` or equivalent
- \`src/api/middleware/\`
EOF
)" \
    "P1,security,authentication,production"

# P1.5: Agent CRUD
create_issue \
    "[P1] Complete Agent CRUD API Implementation" \
    "$(cat << 'EOF'
## Overview
Complete implementation of Create, Read, Update, Delete (CRUD) operations for agent management via REST API.

## Priority
**P1 - High** - Core functionality for agent management

## Problem Statement
Agent CRUD operations may be incomplete or inconsistent:
- Missing or incomplete endpoints
- No standardized error handling
- Inconsistent request/response formats
- Missing validation
- No pagination for list operations

## Tasks
- [ ] Implement POST /agents - Create new agent
- [ ] Implement GET /agents - List agents (with pagination)
- [ ] Implement GET /agents/:id - Get agent by ID
- [ ] Implement PUT /agents/:id - Update agent
- [ ] Implement DELETE /agents/:id - Delete agent
- [ ] Add request validation for all endpoints
- [ ] Add error handling and status codes
- [ ] Implement pagination for list endpoint
- [ ] Write integration tests for all endpoints
- [ ] Generate OpenAPI/Swagger documentation

## Acceptance Criteria
- [ ] All CRUD operations functional
- [ ] Proper HTTP status codes returned
- [ ] Request validation works correctly
- [ ] Pagination works correctly
- [ ] All integration tests pass
- [ ] API documentation complete

## Related Files
- \`src/api/routes/agents.ts\` or equivalent
- \`src/database/repository.ts\`
EOF
)" \
    "P1,api,feature,agents"

# P1.6: API Input Validation
create_issue \
    "[P1] Implement Comprehensive API Input Validation" \
    "$(cat << 'EOF'
## Overview
Implement comprehensive input validation for all API endpoints to prevent injection attacks, data corruption, and security vulnerabilities.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Current API may lack proper input validation:
- Missing validation on request parameters
- SQL injection vulnerabilities
- XSS vulnerabilities
- Data type mismatches
- Missing sanitization

## Tasks
- [ ] Audit all API endpoints for validation gaps
- [ ] Implement validation for all POST endpoints
- [ ] Implement validation for all PUT/PATCH endpoints
- [ ] Implement validation for query parameters
- [ ] Add input sanitization
- [ ] Validate data types and formats
- [ ] Test validation with malicious inputs
- [ ] Document validation rules

## Acceptance Criteria
- [ ] All API inputs validated
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Invalid inputs rejected with clear errors
- [ ] All validation tests pass
- [ ] Documentation complete

## Related Files
- \`src/api/routes/\`
- \`src/api/middleware/\`
- \`src/api/validators/\` (new directory)
EOF
)" \
    "P1,security,api,validation"

# P1.7: Swagger Fix
create_issue \
    "[P1] Fix Swagger/OpenAPI Documentation Generation" \
    "$(cat << 'EOF'
## Overview
Fix and improve Swagger/OpenAPI documentation generation to provide accurate, up-to-date API documentation.

## Priority
**P1 - High** - Essential for API usability and integration

## Problem Statement
Current Swagger documentation may have issues:
- Missing or incomplete endpoint documentation
- Outdated schemas
- Incorrect request/response examples
- Missing authentication documentation
- Swagger UI not accessible or broken

## Tasks
- [ ] Audit current Swagger/OpenAPI spec
- [ ] Update all endpoint descriptions
- [ ] Document all request parameters
- [ ] Document all response schemas
- [ ] Add request/response examples
- [ ] Document authentication/authorization
- [ ] Configure Swagger UI
- [ ] Validate OpenAPI spec
- [ ] Add Swagger UI to API server

## Acceptance Criteria
- [ ] All endpoints documented in Swagger
- [ ] Schemas accurate and up-to-date
- [ ] Examples provided for all endpoints
- [ ] Swagger UI loads without errors
- [ ] OpenAPI spec validates
- [ ] Documentation complete

## Related Files
- \`src/api/swagger.ts\` or equivalent
- \`swagger.json\` or \`openapi.yaml\`
EOF
)" \
    "P1,documentation,api,swagger"

# P1.8: Dashboard Type Alignment
create_issue \
    "[P1] Fix Dashboard TypeScript Type Alignment Issues" \
    "$(cat << 'EOF'
## Overview
Fix TypeScript type alignment issues between dashboard frontend and backend API to ensure type safety and prevent runtime errors.

## Priority
**P1 - High** - Type safety is critical for maintainability

## Problem Statement
Dashboard may have type mismatches with backend:
- Frontend types don't match API responses
- Missing TypeScript definitions
- Type casting bypassing type safety
- Runtime errors from type mismatches

## Tasks
- [ ] Audit dashboard TypeScript types
- [ ] Compare dashboard types with API response types
- [ ] Create shared type definitions
- [ ] Update dashboard types to match API
- [ ] Fix all type errors in dashboard code
- [ ] Remove unnecessary type casting
- [ ] Configure strict TypeScript mode

## Acceptance Criteria
- [ ] Dashboard builds without TypeScript errors
- [ ] Types match API responses exactly
- [ ] No \`any\` types used
- [ ] No unsafe type casting
- [ ] Strict mode enabled
- [ ] Documentation complete

## Related Files
- \`dashboard/src/types/\`
- \`src/api/types/\`
- \`dashboard/tsconfig.json\`
EOF
)" \
    "P1,typescript,dashboard,types"

# P1.9: Dashboard Security
create_issue \
    "[P1] Harden Dashboard Security and CORS Configuration" \
    "$(cat << 'EOF'
## Overview
Harden dashboard security including CORS configuration, CSP headers, and secure cookie settings.

## Priority
**P1 - High** - Security vulnerability in production

## Problem Statement
Dashboard may have security vulnerabilities:
- Weak CORS configuration
- Missing Content Security Policy (CSP)
- Insecure cookie settings
- Missing security headers
- XSS vulnerabilities

## Tasks
- [ ] Configure proper CORS for dashboard
- [ ] Implement Content Security Policy (CSP)
- [ ] Set secure cookie attributes
- [ ] Add security headers (helmet.js)
- [ ] Implement CSRF protection
- [ ] Add XSS protection
- [ ] Perform security audit

## Acceptance Criteria
- [ ] CORS restricted to dashboard domain
- [ ] CSP blocks unauthorized scripts
- [ ] Cookies have secure attributes
- [ ] All security headers present
- [ ] All security tests pass
- [ ] Documentation complete

## Related Files
- \`dashboard/src/\`
- \`src/api/APIGateway.ts\`
EOF
)" \
    "P1,security,dashboard,cors"

echo ""
echo "P1 Security & API Issues Created (14/22)"
echo "Creating P1 Wallet Security Issues..."
echo ""

# P2.1: Encryption Key Enforcement
create_issue \
    "[P1] Enforce Wallet Encryption Key Requirement" \
    "$(cat << 'EOF'
## Overview
Enforce mandatory encryption key configuration for wallet storage to prevent unencrypted wallet data.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Wallet encryption may be optional or poorly enforced:
- Wallets stored without encryption
- Missing encryption key validation
- Weak encryption keys accepted
- Plaintext private keys in storage

## Tasks
- [ ] Make WALLET_ENCRYPTION_KEY environment variable required
- [ ] Validate encryption key strength (length, entropy)
- [ ] Reject weak or missing encryption keys
- [ ] Implement key validation on startup
- [ ] Encrypt all existing wallets
- [ ] Add encryption tests
- [ ] Document encryption requirements

## Acceptance Criteria
- [ ] Application fails to start without encryption key
- [ ] Weak encryption keys rejected
- [ ] All wallets encrypted at rest
- [ ] No plaintext private keys in storage
- [ ] All encryption tests pass
- [ ] Documentation complete

## Related Files
- \`src/wallet/WalletManager.ts\`
- \`.env.example\`
- \`SETUP.md\`
EOF
)" \
    "P1,security,wallet,encryption"

# P2.2: Mnemonic Protection
create_issue \
    "[P1] Protect Mnemonic Phrases from API Responses" \
    "$(cat << 'EOF'
## Overview
Prevent mnemonic phrases from being returned in API responses to avoid accidental exposure of wallet recovery phrases.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Wallet API endpoints may expose mnemonic phrases:
- Mnemonics returned in wallet creation response
- Mnemonics visible in GET wallet endpoints
- No masking in logs or error messages
- Risk of accidental exposure

## Tasks
- [ ] Audit all wallet-related API endpoints
- [ ] Remove mnemonic from all API responses
- [ ] Add mnemonic masking in logs
- [ ] Implement secure mnemonic display (one-time view only)
- [ ] Add mnemonic encryption in database
- [ ] Add mnemonic security tests
- [ ] Document secure mnemonic handling

## Acceptance Criteria
- [ ] No mnemonics in API responses
- [ ] Mnemonics masked in logs
- [ ] Mnemonics encrypted in database
- [ ] All security tests pass
- [ ] Documentation complete

## Related Files
- \`src/wallet/WalletManager.ts\`
- \`src/api/routes/wallet.ts\` (if exists)
EOF
)" \
    "P1,security,wallet,api"

echo ""
echo "Wallet Security Issues Created (16/22)"
echo "Creating P2 HAAP, Contracts, Documentation Issues..."
echo ""

# P3.1: HAAP Token ID
create_issue \
    "[P2] Implement Deterministic HAAP Token ID Generation" \
    "$(cat << 'EOF'
## Overview
Implement deterministic and collision-resistant token ID generation for HAAP attestation tokens.

## Priority
**P2 - Medium** - Important for HAAP protocol integrity

## Problem Statement
HAAP token ID generation may have issues:
- Non-deterministic token IDs
- Potential collisions
- No versioning support
- Difficult to verify token authenticity

## Tasks
- [ ] Design deterministic token ID generation algorithm
- [ ] Implement collision-resistant hashing
- [ ] Add version prefix to token IDs
- [ ] Include agent DID in token ID
- [ ] Add timestamp to token ID
- [ ] Implement uniqueness validation
- [ ] Test token ID generation at scale
- [ ] Document token ID format

## Acceptance Criteria
- [ ] Token IDs are deterministic
- [ ] No collisions in 1M generated tokens
- [ ] Token IDs include version prefix
- [ ] Token IDs verifiable
- [ ] All tests pass
- [ ] Documentation complete

## Related Files
- \`src/haap/HAAPProtocol.ts\`
- \`src/haap/token.ts\` (if exists)
EOF
)" \
    "P2,haap,feature,tokens"

# P3.2: HAAP Storage
create_issue \
    "[P2] Implement Persistent Storage for HAAP Tokens" \
    "$(cat << 'EOF'
## Overview
Implement persistent storage for HAAP attestation tokens in the database for querying, verification, and audit trails.

## Priority
**P2 - Medium** - Important for HAAP token management

## Problem Statement
HAAP tokens may not be persistently stored:
- Tokens lost after restart
- No audit trail
- Can't query issued tokens
- No revocation mechanism

## Tasks
- [ ] Design HAAP token database schema
- [ ] Create haap_tokens table
- [ ] Implement token insertion on issuance
- [ ] Add token query endpoints
- [ ] Implement token revocation mechanism
- [ ] Create database indexes for performance
- [ ] Write database migration script
- [ ] Test token storage and retrieval
- [ ] Document token storage schema

## Acceptance Criteria
- [ ] Tokens persisted to database
- [ ] Tokens queryable by agent DID
- [ ] Revocation mechanism works
- [ ] Query performance < 100ms
- [ ] All storage tests pass
- [ ] Documentation complete

## Related Files
- \`database/schema.sql\`
- \`src/haap/HAAPProtocol.ts\`
- \`src/database/repository.ts\`
EOF
)" \
    "P2,haap,database,storage"

# P3.3: Contract DID Protection
create_issue \
    "[P2] Add DID Registration Protection to Smart Contracts" \
    "$(cat << 'EOF'
## Overview
Add protection mechanisms to smart contracts to prevent unauthorized DID registration and DID hijacking.

## Priority
**P2 - Medium** - Security enhancement for smart contracts

## Problem Statement
Smart contract DID registration may lack protection:
- No ownership verification
- DID hijacking possible
- Missing signature validation
- Vulnerable to spam attacks

## Tasks
- [ ] Add signature verification for DID registration
- [ ] Implement ownership proof requirement
- [ ] Add rate limiting to prevent spam
- [ ] Implement DID uniqueness checks
- [ ] Add event logging for auditing
- [ ] Write contract tests for protection
- [ ] Gas optimization
- [ ] Audit contract security

## Acceptance Criteria
- [ ] Signature required for registration
- [ ] Unauthorized registrations blocked
- [ ] DID uniqueness enforced
- [ ] All contract tests pass
- [ ] Security audit passed
- [ ] Documentation complete

## Related Files
- \`contracts/AgentRegistry.sol\` (if exists)
- \`contracts/DIDRegistry.sol\` (if exists)
EOF
)" \
    "P2,smart-contracts,security,did"

# P3.4: Subgraph Alignment
create_issue \
    "[P2] Align Subgraph Schema with Smart Contract Events" \
    "$(cat << 'EOF'
## Overview
Ensure subgraph schema and mappings are aligned with smart contract events to provide accurate on-chain data indexing.

## Priority
**P2 - Medium** - Important for data consistency

## Problem Statement
Subgraph may be out of sync with contracts:
- Schema doesn't match contract events
- Missing event handlers
- Incorrect data transformations
- Outdated subgraph deployment

## Tasks
- [ ] Audit smart contract events
- [ ] Review subgraph schema
- [ ] Update schema to match contract events
- [ ] Add missing event handlers
- [ ] Update existing event handlers
- [ ] Test subgraph locally
- [ ] Deploy updated subgraph
- [ ] Verify indexing accuracy
- [ ] Document subgraph schema

## Acceptance Criteria
- [ ] Schema matches all contract events
- [ ] All events indexed correctly
- [ ] No missing data
- [ ] Subgraph syncs successfully
- [ ] Queries return accurate data
- [ ] Documentation complete

## Related Files
- \`subgraph/schema.graphql\`
- \`subgraph/src/mapping.ts\`
- \`subgraph/subgraph.yaml\`
EOF
)" \
    "P2,subgraph,smart-contracts,indexing"

# P3.5: Documentation Matrix
create_issue \
    "[P2] Create Documentation Run Matrix for Multiple Environments" \
    "$(cat << 'EOF'
## Overview
Create documentation run matrix showing how to run, test, and deploy VEXEL across multiple environments (dev, staging, prod).

## Priority
**P2 - Medium** - Important for operations and onboarding

## Problem Statement
Current documentation may lack environment-specific guidance:
- No clear environment setup differences
- Missing deployment instructions per environment
- Unclear configuration for dev/staging/prod
- Missing environment-specific requirements

## Tasks
- [ ] Document development environment setup
- [ ] Document staging environment setup
- [ ] Document production environment setup
- [ ] Create configuration matrix (env vars, services)
- [ ] Document deployment process per environment
- [ ] Add testing strategy per environment
- [ ] Create troubleshooting guide per environment
- [ ] Add environment comparison chart

## Acceptance Criteria
- [ ] All environments documented
- [ ] Configuration differences clear
- [ ] Deployment process documented
- [ ] New developers can set up any environment
- [ ] Operations team can deploy confidently
- [ ] Documentation reviewed by team

## Related Files
- \`SETUP.md\`
- \`.env.example\`
- \`README.md\`
EOF
)" \
    "P2,documentation,devops,testing"

# P3.6: Examples Alignment
create_issue \
    "[P2] Align Code Examples with Public API Changes" \
    "$(cat << 'EOF'
## Overview
Update code examples in the examples/ directory to align with current public API and best practices.

## Priority
**P2 - Medium** - Important for developer experience

## Problem Statement
Code examples may be outdated:
- Examples use deprecated APIs
- Missing examples for new features
- Examples don't follow best practices
- Broken examples (don't run)
- Missing error handling

## Tasks
- [ ] Audit all code examples
- [ ] Update examples to use current API
- [ ] Add examples for new features
- [ ] Fix broken examples
- [ ] Add error handling to examples
- [ ] Create TypeScript versions (if not present)
- [ ] Add comments explaining code
- [ ] Test all examples
- [ ] Add README per example

## Acceptance Criteria
- [ ] All examples run without errors
- [ ] Examples use current API
- [ ] Examples cover major features
- [ ] Each example has README
- [ ] Comments explain code clearly
- [ ] Examples tested and verified

## Related Files
- \`examples/\`
- \`README.md\`
- \`src/index.ts\` (public API exports)
EOF
)" \
    "P2,documentation,examples,api"

echo ""
echo "============================================"
echo "✓ All 22 Refurbished Roadmap Issues Created!"
echo "============================================"
echo ""
echo "Summary:"
echo "  - P0 (Critical): 5 issues"
echo "  - P1 (High): 11 issues"
echo "  - P2 (Medium): 6 issues"
echo ""
echo "Next steps:"
echo "1. Review issues in the repository"
echo "2. Set up project board to track progress"
echo "3. Assign issues to team members"
echo "4. Begin implementation starting with P0 issues"

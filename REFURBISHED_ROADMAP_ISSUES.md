# Refurbished Roadmap Issues - Technical Debt & Refinements

This document provides the exact content for creating 21 GitHub issues for VEXEL refurbishment tasks focused on build correctness, security hardening, and production readiness.

---

## P0 - Build/Package Correctness & CI (5 Issues)

---

### Issue R0.1: Build Boundaries for DB/IPFS/Knowledge-Base Modules

**Title:** `[P0] Establish Build Boundaries for DB/IPFS/Knowledge-Base Modules`

**Labels:** `P0`, `build`, `architecture`, `refactor`

**Description:**
```markdown
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
- [ ] Refactor database module (`src/database/`) for independent builds
- [ ] Refactor IPFS module (`src/ipfs/`) for independent builds
- [ ] Refactor knowledge-base module (`src/knowledge-base/`) for independent builds
- [ ] Create module-specific build scripts
- [ ] Update TypeScript project references for incremental builds
- [ ] Add module-level unit tests
- [ ] Update documentation with new module structure

## Technical Requirements
- TypeScript project references (tsconfig.json per module)
- Clear module interfaces and exports
- Minimal cross-module dependencies
- Jest configuration per module (if applicable)

## Deliverables
- [ ] Separate build configurations for each module
- [ ] Clear module dependency graph documentation
- [ ] Module-level test scripts
- [ ] Updated tsconfig.json with project references
- [ ] Migration guide for developers
- [ ] Performance comparison (before/after build times)

## Acceptance Criteria
- [ ] Each module can be built independently
- [ ] Each module can be tested independently
- [ ] Build time reduced by at least 30% for incremental builds
- [ ] No circular dependencies between modules
- [ ] Documentation updated and reviewed
- [ ] All existing tests pass
- [ ] No breaking changes to public APIs

## Dependencies
None - foundational refactor

## Related Files
- `src/database/`
- `src/ipfs/`
- `src/knowledge-base/`
- `tsconfig.json`
- `package.json`

## Resources
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Monorepo Build Optimization](https://turborepo.org/docs/core-concepts/monorepos)
```

---

### Issue R0.2: Multi-Package Repository Structure Documentation

**Title:** `[P0] Document Multi-Package Repository Structure and Guidelines`

**Labels:** `P0`, `documentation`, `architecture`

**Description:**
```markdown
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

## Technical Requirements
- Clear architecture diagrams (mermaid or similar)
- Code examples for common scenarios
- Step-by-step workflows
- Searchable documentation format (Markdown)

## Deliverables
- [ ] `ARCHITECTURE.md` - System architecture overview
- [ ] `MULTI_PACKAGE_GUIDE.md` - Multi-package development guide
- [ ] Architecture diagrams (module relationships)
- [ ] Build workflow documentation
- [ ] Testing strategy documentation
- [ ] Development guidelines and best practices
- [ ] Troubleshooting guide

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
- `README.md`
- `CONTRIBUTING.md`
- `package.json`
- `tsconfig.json`

## Resources
- [Documenting Architecture Decisions](https://adr.github.io/)
- [Monorepo Documentation Best Practices](https://monorepo.tools/)
```

---

### Issue R0.3: Jest/ts-jest Version Alignment

**Title:** `[P0] Align Jest and ts-jest Versions for Test Stability`

**Labels:** `P0`, `testing`, `dependencies`, `build`

**Description:**
```markdown
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
- [ ] Update jest.unit.config.js
- [ ] Update jest.integration.config.js
- [ ] Fix any test failures from version updates
- [ ] Update documentation with new versions
- [ ] Add version compatibility checks to CI

## Technical Requirements
- Jest 29.x+ (latest stable)
- ts-jest compatible with Jest version
- TypeScript 5.x compatibility
- Node.js LTS compatibility

## Deliverables
- [ ] Updated package.json with aligned versions
- [ ] All tests passing with new versions
- [ ] Updated Jest configurations
- [ ] Performance comparison report
- [ ] Migration guide (if breaking changes)
- [ ] CI workflow updated

## Acceptance Criteria
- [ ] All unit tests pass (0 failures)
- [ ] All integration tests pass (0 failures)
- [ ] No deprecation warnings in test output
- [ ] Test execution time improved or maintained
- [ ] Type checking works correctly in tests
- [ ] CI pipeline passes
- [ ] Documentation updated

## Dependencies
None - can be done independently

## Related Files
- `package.json`
- `jest.config.js`
- `jest.unit.config.js`
- `jest.integration.config.js`
- `tsconfig.json`

## Resources
- [Jest Compatibility](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
```

---

### Issue R0.4: GitHub Actions CI Workflow

**Title:** `[P0] Implement GitHub Actions CI Workflow for Automated Testing`

**Labels:** `P0`, `ci`, `github-actions`, `automation`

**Description:**
```markdown
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
- [ ] Create `.github/workflows/ci.yml` workflow file
- [ ] Configure Node.js environment setup
- [ ] Add dependency installation and caching
- [ ] Configure unit test execution
- [ ] Configure integration test execution
- [ ] Add TypeScript build verification
- [ ] Add linting checks (ESLint)
- [ ] Add code formatting checks (Prettier)
- [ ] Add security scanning (npm audit)
- [ ] Configure test coverage reporting
- [ ] Add build artifact upload (if needed)
- [ ] Configure workflow triggers (push, PR)
- [ ] Add status badge to README
- [ ] Test workflow on multiple Node versions (if needed)
- [ ] Document CI workflow

## Technical Requirements
- GitHub Actions runner (ubuntu-latest)
- Node.js LTS version(s)
- PostgreSQL service for integration tests
- Environment secrets management
- Workflow caching for dependencies

## Deliverables
- [ ] `.github/workflows/ci.yml` - Main CI workflow
- [ ] Workflow passing on main branch
- [ ] Test coverage reporting integration
- [ ] README badge showing CI status
- [ ] CI workflow documentation
- [ ] Troubleshooting guide for CI failures

## Acceptance Criteria
- [ ] CI runs on every push to any branch
- [ ] CI runs on every pull request
- [ ] All unit tests execute and pass
- [ ] All integration tests execute and pass
- [ ] TypeScript builds successfully
- [ ] Linting passes (no errors)
- [ ] Security audit passes (no critical vulnerabilities)
- [ ] Workflow completes in < 10 minutes
- [ ] Failed workflows provide clear error messages
- [ ] Documentation complete

## Dependencies
- Issue #R0.3 (Jest alignment) - should be completed first
- Issue #R0.5 (Integration test workflow) - related but can be parallel

## Related Files
- `.github/workflows/` (new directory)
- `package.json`
- `README.md`

## Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Node.js Template](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
```

---

### Issue R0.5: Integration Test Workflow with Postgres

**Title:** `[P0] Create Integration Test Workflow with PostgreSQL Service`

**Labels:** `P0`, `testing`, `ci`, `database`, `postgres`

**Description:**
```markdown
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
- [ ] Configure connection pooling for tests
- [ ] Document integration test setup
- [ ] Add troubleshooting guide

## Technical Requirements
- PostgreSQL 14+ service container
- Database initialization SQL scripts
- Test environment variables
- Database migration scripts
- Test data fixtures

## Deliverables
- [ ] PostgreSQL service configuration in CI
- [ ] Database initialization scripts
- [ ] Test data seeding scripts
- [ ] Updated integration test configuration
- [ ] All integration tests passing in CI
- [ ] Integration test documentation
- [ ] Local development setup guide

## Acceptance Criteria
- [ ] PostgreSQL service starts in CI
- [ ] Database schema created automatically
- [ ] Test data seeded before tests run
- [ ] All integration tests pass in CI
- [ ] Tests clean up after themselves
- [ ] Connection errors handled gracefully
- [ ] Workflow completes in < 15 minutes
- [ ] Local setup matches CI environment
- [ ] Documentation complete

## Dependencies
- Issue #R0.4 (CI Workflow) - should be completed first or in parallel

## Related Files
- `.github/workflows/ci.yml` or `.github/workflows/integration-tests.yml`
- `database/schema.sql`
- `jest.integration.config.js`
- `src/database/client.ts`

## Resources
- [GitHub Actions PostgreSQL Service](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers)
- [Jest Integration Testing Best Practices](https://jestjs.io/docs/testing-frameworks)
```

---

## P1 - Security & API/Dashboard (9 Issues)

---

### Issue R1.1: WebSocket JWT Authentication

**Title:** `[P1] Implement JWT Authentication for WebSocket Connections`

**Labels:** `P1`, `security`, `websocket`, `authentication`

**Description:**
```markdown
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
- No authorization checks for WebSocket events

## Tasks
- [ ] Design WebSocket authentication flow
- [ ] Implement JWT validation on WebSocket connection
- [ ] Add token refresh mechanism for long-lived connections
- [ ] Implement authorization checks for WebSocket events
- [ ] Add connection authentication middleware
- [ ] Handle token expiration gracefully
- [ ] Add reconnection with authentication
- [ ] Implement rate limiting per authenticated user
- [ ] Add logging for authentication events
- [ ] Write authentication tests
- [ ] Document WebSocket authentication flow

## Technical Requirements
- JWT library (jsonwebtoken)
- Token validation middleware
- Socket.io authentication hooks
- Token refresh strategy
- Secure token transmission

## Deliverables
- [ ] JWT validation on WebSocket handshake
- [ ] Authorization middleware for events
- [ ] Token refresh mechanism
- [ ] Authentication test suite
- [ ] WebSocket authentication documentation
- [ ] Client-side authentication example

## Acceptance Criteria
- [ ] Unauthenticated connections rejected
- [ ] Valid JWT tokens accepted
- [ ] Expired tokens rejected with clear error
- [ ] Token refresh works seamlessly
- [ ] Authorization enforced on all events
- [ ] All authentication tests pass
- [ ] No security vulnerabilities identified
- [ ] Documentation complete

## Dependencies
None - but relates to API Gateway implementation

## Related Files
- `src/api/websocket/` or `src/api/WebSocketServer.ts`
- `src/api/middleware/AuthMiddleware.ts`
- `src/api/APIGateway.ts`

## Resources
- [Socket.io Authentication](https://socket.io/docs/v4/middlewares/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
```

---

### Issue R1.2: CORS Configuration Fix

**Title:** `[P1] Fix and Harden CORS Configuration for Production`

**Labels:** `P1`, `security`, `api`, `cors`

**Description:**
```markdown
## Overview
Fix CORS configuration to properly restrict cross-origin requests while enabling legitimate clients in production.

## Priority
**P1 - High** - Security risk and potential production issues

## Problem Statement
Current CORS configuration may have issues:
- Overly permissive origins (e.g., `*`)
- Missing credentials support
- Incorrect allowed methods/headers
- Lack of environment-specific configuration
- No origin validation

## Tasks
- [ ] Audit current CORS configuration
- [ ] Define allowed origins per environment
- [ ] Configure environment-specific CORS settings
- [ ] Implement origin validation logic
- [ ] Set appropriate allowed methods (GET, POST, etc.)
- [ ] Set appropriate allowed headers
- [ ] Configure credentials support (if needed)
- [ ] Add preflight request handling
- [ ] Test CORS with different origins
- [ ] Document CORS configuration
- [ ] Add CORS configuration examples

## Technical Requirements
- Express CORS middleware or equivalent
- Environment-based configuration
- Origin whitelist management
- Secure defaults

## Deliverables
- [ ] Production-ready CORS configuration
- [ ] Environment-specific settings
- [ ] Origin validation logic
- [ ] CORS test suite
- [ ] CORS configuration documentation
- [ ] Security review report

## Acceptance Criteria
- [ ] Only whitelisted origins allowed in production
- [ ] Development environment has relaxed CORS
- [ ] Preflight requests handled correctly
- [ ] Credentials work when needed
- [ ] No overly permissive settings
- [ ] All CORS tests pass
- [ ] Security review passed
- [ ] Documentation complete

## Dependencies
None - but critical for API Gateway security

## Related Files
- `src/api/APIGateway.ts`
- `src/api/server.ts`
- `.env.example`
- `SETUP.md`

## Resources
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
```

---

### Issue R1.3: Resource-Scoped Authorization

**Title:** `[P1] Implement Resource-Scoped Authorization for API Endpoints`

**Labels:** `P1`, `security`, `authorization`, `api`

**Description:**
```markdown
## Overview
Implement fine-grained, resource-scoped authorization to ensure users can only access and modify their own resources.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Current authorization may lack resource-level checks:
- Users might access other users' data
- No ownership validation on resources
- Missing role-based access control (RBAC)
- No attribute-based access control (ABAC)
- Potential privilege escalation risks

## Tasks
- [ ] Design resource-scoped authorization model
- [ ] Implement ownership validation middleware
- [ ] Add role-based access control (RBAC)
- [ ] Add attribute-based access control (ABAC) if needed
- [ ] Protect agent CRUD endpoints
- [ ] Protect wallet endpoints
- [ ] Protect knowledge base endpoints
- [ ] Implement permission checking utilities
- [ ] Add authorization tests for all endpoints
- [ ] Document authorization model
- [ ] Perform security audit

## Technical Requirements
- Authorization middleware
- Resource ownership validation
- Role/permission system
- Database queries for ownership checks
- Efficient authorization checks

## Deliverables
- [ ] Resource-scoped authorization middleware
- [ ] Ownership validation logic
- [ ] RBAC implementation (if applicable)
- [ ] Authorization test suite
- [ ] Security audit report
- [ ] Authorization documentation

## Acceptance Criteria
- [ ] Users can only access their own resources
- [ ] Unauthorized access attempts blocked
- [ ] Role-based permissions enforced
- [ ] All authorization tests pass
- [ ] No authorization bypass vulnerabilities
- [ ] Performance impact < 50ms per request
- [ ] Security audit passed
- [ ] Documentation complete

## Dependencies
None - critical security feature

## Related Files
- `src/api/middleware/AuthMiddleware.ts`
- `src/api/routes/`
- `src/api/APIGateway.ts`

## Resources
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Resource-Based Authorization Patterns](https://auth0.com/docs/manage-users/access-control)
```

---

### Issue R1.4: Production Login Hardening

**Title:** `[P1] Harden Production Login and Authentication System`

**Labels:** `P1`, `security`, `authentication`, `production`

**Description:**
```markdown
## Overview
Implement production-grade login hardening including rate limiting, brute force protection, and secure session management.

## Priority
**P1 - High** - Essential for production security

## Problem Statement
Current login system may lack production-grade security:
- No rate limiting on login attempts
- Missing brute force protection
- Weak password requirements
- No account lockout mechanism
- Missing login monitoring/alerting
- Vulnerable to credential stuffing

## Tasks
- [ ] Implement rate limiting for login endpoints
- [ ] Add brute force protection (account lockout)
- [ ] Enforce strong password requirements
- [ ] Add failed login attempt logging
- [ ] Implement account lockout after N failed attempts
- [ ] Add CAPTCHA for suspicious login attempts (optional)
- [ ] Implement secure session management
- [ ] Add login monitoring and alerting
- [ ] Configure JWT expiration and refresh
- [ ] Add multi-factor authentication support (future)
- [ ] Document security measures
- [ ] Perform security testing

## Technical Requirements
- Rate limiting middleware (express-rate-limit)
- Redis for distributed rate limiting (if needed)
- Password validation library
- Failed attempt tracking
- Secure JWT configuration

## Deliverables
- [ ] Rate limiting on login endpoints
- [ ] Brute force protection mechanism
- [ ] Strong password enforcement
- [ ] Account lockout implementation
- [ ] Login monitoring system
- [ ] Security test suite
- [ ] Security documentation

## Acceptance Criteria
- [ ] Login rate limited (e.g., 5 attempts per 15 minutes)
- [ ] Account locked after N failed attempts
- [ ] Strong passwords enforced
- [ ] Failed attempts logged
- [ ] JWT tokens expire appropriately
- [ ] All security tests pass
- [ ] Penetration testing completed
- [ ] Documentation complete

## Dependencies
None - critical security feature

## Related Files
- `src/api/routes/auth.ts` or equivalent
- `src/api/middleware/`
- `src/api/APIGateway.ts`

## Resources
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
```

---

### Issue R1.5: Agent CRUD Implementation

**Title:** `[P1] Complete Agent CRUD API Implementation`

**Labels:** `P1`, `api`, `feature`, `agents`

**Description:**
```markdown
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
- Incomplete documentation

## Tasks
- [ ] Implement POST /agents - Create new agent
- [ ] Implement GET /agents - List agents (with pagination)
- [ ] Implement GET /agents/:id - Get agent by ID
- [ ] Implement PUT /agents/:id - Update agent
- [ ] Implement PATCH /agents/:id - Partial update agent
- [ ] Implement DELETE /agents/:id - Delete agent
- [ ] Add request validation for all endpoints
- [ ] Add error handling and status codes
- [ ] Implement pagination for list endpoint
- [ ] Add filtering and sorting options
- [ ] Write integration tests for all endpoints
- [ ] Generate OpenAPI/Swagger documentation
- [ ] Add usage examples

## Technical Requirements
- RESTful API design principles
- Request validation (express-validator or similar)
- Consistent error responses
- Pagination support
- Database integration

## Deliverables
- [ ] Complete CRUD endpoints for agents
- [ ] Request validation on all endpoints
- [ ] Pagination and filtering
- [ ] Integration test suite
- [ ] OpenAPI/Swagger spec
- [ ] API documentation with examples

## Acceptance Criteria
- [ ] All CRUD operations functional
- [ ] Proper HTTP status codes returned
- [ ] Request validation works correctly
- [ ] Error messages are clear and helpful
- [ ] Pagination works correctly
- [ ] All integration tests pass
- [ ] API documentation complete
- [ ] Swagger UI accessible

## Dependencies
- Issue #R1.3 (Resource-scoped authorization) - should be implemented

## Related Files
- `src/api/routes/agents.ts` or equivalent
- `src/database/repository.ts`
- `src/api/APIGateway.ts`

## Resources
- [REST API Best Practices](https://restfulapi.net/)
- [Express Validation](https://express-validator.github.io/docs/)
```

---

### Issue R1.6: API Input Validation

**Title:** `[P1] Implement Comprehensive API Input Validation`

**Labels:** `P1`, `security`, `api`, `validation`

**Description:**
```markdown
## Overview
Implement comprehensive input validation for all API endpoints to prevent injection attacks, data corruption, and security vulnerabilities.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Current API may lack proper input validation:
- Missing validation on request parameters
- SQL injection vulnerabilities
- NoSQL injection risks
- XSS vulnerabilities
- Command injection risks
- Data type mismatches
- Missing sanitization

## Tasks
- [ ] Audit all API endpoints for validation gaps
- [ ] Implement validation for all POST endpoints
- [ ] Implement validation for all PUT/PATCH endpoints
- [ ] Implement validation for query parameters
- [ ] Add input sanitization
- [ ] Validate data types and formats
- [ ] Add length and size constraints
- [ ] Implement whitelist validation where possible
- [ ] Add custom validation rules
- [ ] Test validation with malicious inputs
- [ ] Document validation rules
- [ ] Add validation examples

## Technical Requirements
- Validation library (express-validator, joi, or zod)
- Input sanitization
- Type checking
- Error message formatting
- SQL injection prevention

## Deliverables
- [ ] Validation middleware for all endpoints
- [ ] Input sanitization rules
- [ ] Validation test suite (including negative tests)
- [ ] Security audit report
- [ ] Validation documentation

## Acceptance Criteria
- [ ] All API inputs validated
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Invalid inputs rejected with clear errors
- [ ] All validation tests pass
- [ ] No security vulnerabilities in audit
- [ ] Performance impact < 20ms per request
- [ ] Documentation complete

## Dependencies
- Issue #R1.5 (Agent CRUD) - should validate new endpoints

## Related Files
- `src/api/routes/`
- `src/api/middleware/`
- `src/api/validators/` (new directory)

## Resources
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Express Validator](https://express-validator.github.io/docs/)
```

---

### Issue R1.7: Swagger Generation Fix

**Title:** `[P1] Fix Swagger/OpenAPI Documentation Generation`

**Labels:** `P1`, `documentation`, `api`, `swagger`

**Description:**
```markdown
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
- No error response examples
- Swagger UI not accessible or broken

## Tasks
- [ ] Audit current Swagger/OpenAPI spec
- [ ] Update all endpoint descriptions
- [ ] Document all request parameters
- [ ] Document all response schemas
- [ ] Add request/response examples
- [ ] Document authentication/authorization
- [ ] Add error response documentation
- [ ] Configure Swagger UI
- [ ] Add try-it-out functionality
- [ ] Generate spec from code annotations (if not already)
- [ ] Validate OpenAPI spec
- [ ] Add Swagger UI to API server
- [ ] Document how to update Swagger docs

## Technical Requirements
- OpenAPI 3.0+ specification
- Swagger UI integration
- JSDoc annotations or similar
- swagger-jsdoc or swagger-ui-express
- Valid JSON/YAML spec

## Deliverables
- [ ] Complete OpenAPI 3.0 specification
- [ ] Swagger UI accessible at /api-docs
- [ ] All endpoints documented
- [ ] Request/response examples
- [ ] Authentication documentation
- [ ] Swagger update guide

## Acceptance Criteria
- [ ] All endpoints documented in Swagger
- [ ] Schemas accurate and up-to-date
- [ ] Examples provided for all endpoints
- [ ] Swagger UI loads without errors
- [ ] Try-it-out functionality works
- [ ] Authentication documented
- [ ] OpenAPI spec validates
- [ ] Documentation complete

## Dependencies
- Issue #R1.5 (Agent CRUD) - new endpoints to document

## Related Files
- `src/api/swagger.ts` or equivalent
- `src/api/APIGateway.ts`
- `swagger.json` or `openapi.yaml`

## Resources
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
```

---

### Issue R1.8: Dashboard Type Alignment

**Title:** `[P1] Fix Dashboard TypeScript Type Alignment Issues`

**Labels:** `P1`, `typescript`, `dashboard`, `types`

**Description:**
```markdown
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
- Lack of shared type definitions

## Tasks
- [ ] Audit dashboard TypeScript types
- [ ] Compare dashboard types with API response types
- [ ] Create shared type definitions
- [ ] Update dashboard types to match API
- [ ] Fix all type errors in dashboard code
- [ ] Remove unnecessary type casting
- [ ] Add type validation at runtime (if needed)
- [ ] Generate types from OpenAPI spec (if possible)
- [ ] Add type tests
- [ ] Document type definitions
- [ ] Configure strict TypeScript mode

## Technical Requirements
- Shared TypeScript types package or file
- Type generation from OpenAPI spec (optional)
- Strict TypeScript configuration
- Type validation library (zod or similar, optional)

## Deliverables
- [ ] Shared type definitions
- [ ] Updated dashboard types
- [ ] All TypeScript errors fixed
- [ ] Type generation script (if applicable)
- [ ] Type test suite
- [ ] Type documentation

## Acceptance Criteria
- [ ] Dashboard builds without TypeScript errors
- [ ] Types match API responses exactly
- [ ] No `any` types used
- [ ] No unsafe type casting
- [ ] All type tests pass
- [ ] Strict mode enabled
- [ ] Documentation complete

## Dependencies
- Issue #R1.7 (Swagger) - can generate types from spec

## Related Files
- `dashboard/src/types/`
- `src/api/types/`
- `dashboard/tsconfig.json`

## Resources
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [OpenAPI TypeScript Generator](https://github.com/ferdikoomen/openapi-typescript-codegen)
```

---

### Issue R1.9: Dashboard CORS and Security Hardening

**Title:** `[P1] Harden Dashboard Security and CORS Configuration`

**Labels:** `P1`, `security`, `dashboard`, `cors`

**Description:**
```markdown
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
- CSRF vulnerabilities

## Tasks
- [ ] Configure proper CORS for dashboard
- [ ] Implement Content Security Policy (CSP)
- [ ] Set secure cookie attributes (httpOnly, secure, sameSite)
- [ ] Add security headers (helmet.js)
- [ ] Implement CSRF protection
- [ ] Add XSS protection
- [ ] Configure HTTPS redirect
- [ ] Add security headers tests
- [ ] Perform security audit
- [ ] Document security measures

## Technical Requirements
- Helmet.js or equivalent
- CSP configuration
- Secure cookie settings
- CSRF token implementation
- HTTPS enforcement

## Deliverables
- [ ] Secure CORS configuration
- [ ] CSP implementation
- [ ] Secure cookie settings
- [ ] Security headers middleware
- [ ] CSRF protection
- [ ] Security test suite
- [ ] Security documentation

## Acceptance Criteria
- [ ] CORS restricted to dashboard domain
- [ ] CSP blocks unauthorized scripts
- [ ] Cookies have secure attributes
- [ ] All security headers present
- [ ] CSRF protection working
- [ ] All security tests pass
- [ ] Security audit passed
- [ ] Documentation complete

## Dependencies
- Issue #R1.2 (CORS fix) - related but dashboard-specific

## Related Files
- `dashboard/src/`
- `src/api/APIGateway.ts`
- `.env.example`

## Resources
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
```

---

## P1 - Wallet Security (2 Issues)

---

### Issue R2.1: Encryption Key Enforcement

**Title:** `[P1] Enforce Wallet Encryption Key Requirement`

**Labels:** `P1`, `security`, `wallet`, `encryption`

**Description:**
```markdown
## Overview
Enforce mandatory encryption key configuration for wallet storage to prevent unencrypted wallet data.

## Priority
**P1 - High** - Critical security vulnerability

## Problem Statement
Wallet encryption may be optional or poorly enforced:
- Wallets stored without encryption
- Missing encryption key validation
- Weak encryption keys accepted
- No key rotation mechanism
- Plaintext private keys in storage

## Tasks
- [ ] Make WALLET_ENCRYPTION_KEY environment variable required
- [ ] Validate encryption key strength (length, entropy)
- [ ] Reject weak or missing encryption keys
- [ ] Implement key validation on startup
- [ ] Add encryption key rotation support (future)
- [ ] Encrypt all existing wallets
- [ ] Add encryption tests
- [ ] Document encryption requirements
- [ ] Add setup validation script

## Technical Requirements
- AES-256 encryption
- Strong key requirements (min 32 bytes)
- Environment variable validation
- Encrypted storage verification

## Deliverables
- [ ] Encryption key enforcement
- [ ] Key strength validation
- [ ] Wallet encryption verification
- [ ] Migration script for existing wallets
- [ ] Encryption test suite
- [ ] Security documentation

## Acceptance Criteria
- [ ] Application fails to start without encryption key
- [ ] Weak encryption keys rejected
- [ ] All wallets encrypted at rest
- [ ] No plaintext private keys in storage
- [ ] All encryption tests pass
- [ ] Migration completed successfully
- [ ] Documentation complete

## Dependencies
None - critical security fix

## Related Files
- `src/wallet/WalletManager.ts`
- `src/wallet/encryption.ts` (if exists)
- `.env.example`
- `SETUP.md`

## Resources
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [Wallet Encryption Best Practices](https://en.bitcoin.it/wiki/Wallet_encryption)
```

---

### Issue R2.2: Mnemonic Return Protection

**Title:** `[P1] Protect Mnemonic Phrases from API Responses`

**Labels:** `P1`, `security`, `wallet`, `api`

**Description:**
```markdown
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
- Compliance violations (data protection)

## Tasks
- [ ] Audit all wallet-related API endpoints
- [ ] Remove mnemonic from all API responses
- [ ] Add mnemonic masking in logs
- [ ] Implement secure mnemonic display (one-time view only)
- [ ] Add mnemonic encryption in database
- [ ] Warn users about mnemonic backup requirements
- [ ] Add mnemonic security tests
- [ ] Document secure mnemonic handling
- [ ] Perform security audit

## Technical Requirements
- Response filtering/transformation
- Log sanitization
- Database encryption for mnemonics
- One-time display mechanism (optional)

## Deliverables
- [ ] Mnemonics removed from API responses
- [ ] Log masking implementation
- [ ] Secure mnemonic display (if applicable)
- [ ] Security test suite
- [ ] Mnemonic migration (if needed)
- [ ] Security documentation

## Acceptance Criteria
- [ ] No mnemonics in API responses
- [ ] Mnemonics masked in logs
- [ ] Mnemonics encrypted in database
- [ ] Users warned about backup requirements
- [ ] All security tests pass
- [ ] Security audit passed
- [ ] Documentation complete

## Dependencies
- Issue #R2.1 (Encryption key) - related security feature

## Related Files
- `src/wallet/WalletManager.ts`
- `src/api/routes/wallet.ts` (if exists)
- `src/database/models/` (if applicable)

## Resources
- [BIP39 Mnemonic Security](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Wallet Security Best Practices](https://www.ledger.com/academy/hardwarewallet/best-practices-when-using-a-hardware-wallet)
```

---

## P2 - HAAP, Contracts, Documentation (5 Issues)

---

### Issue R3.1: HAAP Token ID Generation

**Title:** `[P2] Implement Deterministic HAAP Token ID Generation`

**Labels:** `P2`, `haap`, `feature`, `tokens`

**Description:**
```markdown
## Overview
Implement deterministic and collision-resistant token ID generation for HAAP attestation tokens.

## Priority
**P2 - Medium** - Important for HAAP protocol integrity

## Problem Statement
HAAP token ID generation may have issues:
- Non-deterministic token IDs
- Potential collisions
- No versioning support
- Missing token uniqueness guarantees
- Difficult to verify token authenticity

## Tasks
- [ ] Design deterministic token ID generation algorithm
- [ ] Implement collision-resistant hashing
- [ ] Add version prefix to token IDs
- [ ] Include agent DID in token ID
- [ ] Add timestamp to token ID
- [ ] Implement uniqueness validation
- [ ] Add token ID verification function
- [ ] Test token ID generation at scale
- [ ] Document token ID format
- [ ] Add token ID examples

## Technical Requirements
- Cryptographic hash function (SHA-256)
- Deterministic algorithm
- Collision resistance
- Version compatibility

## Deliverables
- [ ] Token ID generation function
- [ ] Token ID verification function
- [ ] Uniqueness validation
- [ ] Token ID test suite
- [ ] Token ID format documentation

## Acceptance Criteria
- [ ] Token IDs are deterministic
- [ ] No collisions in 1M generated tokens
- [ ] Token IDs include version prefix
- [ ] Token IDs verifiable
- [ ] All tests pass
- [ ] Documentation complete

## Dependencies
None - HAAP protocol enhancement

## Related Files
- `src/haap/HAAPProtocol.ts`
- `src/haap/token.ts` (if exists)

## Resources
- [UUID Generation Best Practices](https://www.ietf.org/rfc/rfc4122.txt)
- [Cryptographic Hash Functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
```

---

### Issue R3.2: HAAP Persistent Storage

**Title:** `[P2] Implement Persistent Storage for HAAP Tokens`

**Labels:** `P2`, `haap`, `database`, `storage`

**Description:**
```markdown
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
- Missing verification history

## Tasks
- [ ] Design HAAP token database schema
- [ ] Create haap_tokens table
- [ ] Implement token insertion on issuance
- [ ] Add token query endpoints
- [ ] Implement token revocation mechanism
- [ ] Add token verification logging
- [ ] Create database indexes for performance
- [ ] Add token expiration handling
- [ ] Write database migration script
- [ ] Test token storage and retrieval
- [ ] Document token storage schema

## Technical Requirements
- PostgreSQL table design
- Efficient indexing
- Token expiration support
- Revocation mechanism

## Deliverables
- [ ] HAAP token database schema
- [ ] Token storage implementation
- [ ] Token query functions
- [ ] Token revocation mechanism
- [ ] Database migration script
- [ ] Storage test suite
- [ ] Schema documentation

## Acceptance Criteria
- [ ] Tokens persisted to database
- [ ] Tokens queryable by agent DID
- [ ] Revocation mechanism works
- [ ] Expired tokens handled correctly
- [ ] Query performance < 100ms
- [ ] All storage tests pass
- [ ] Migration tested
- [ ] Documentation complete

## Dependencies
None - HAAP protocol enhancement

## Related Files
- `database/schema.sql`
- `src/haap/HAAPProtocol.ts`
- `src/database/repository.ts`

## Resources
- [Database Indexing Best Practices](https://use-the-index-luke.com/)
- [Token Storage Patterns](https://auth0.com/docs/secure/tokens/token-storage)
```

---

### Issue R3.3: Contract DID Registration Protection

**Title:** `[P2] Add DID Registration Protection to Smart Contracts`

**Labels:** `P2`, `smart-contracts`, `security`, `did`

**Description:**
```markdown
## Overview
Add protection mechanisms to smart contracts to prevent unauthorized DID registration and DID hijacking.

## Priority
**P2 - Medium** - Security enhancement for smart contracts

## Problem Statement
Smart contract DID registration may lack protection:
- No ownership verification
- DID hijacking possible
- Missing signature validation
- No registration limits
- Vulnerable to spam attacks

## Tasks
- [ ] Add signature verification for DID registration
- [ ] Implement ownership proof requirement
- [ ] Add rate limiting to prevent spam
- [ ] Implement DID uniqueness checks
- [ ] Add DID transfer/update protection
- [ ] Implement access control
- [ ] Add event logging for auditing
- [ ] Write contract tests for protection
- [ ] Gas optimization
- [ ] Document protection mechanisms
- [ ] Audit contract security

## Technical Requirements
- Solidity access control
- Signature verification (ECDSA)
- Rate limiting mechanisms
- Event logging
- Gas-efficient implementation

## Deliverables
- [ ] Protected DID registration function
- [ ] Signature verification
- [ ] Rate limiting implementation
- [ ] Contract test suite
- [ ] Gas optimization report
- [ ] Security audit report
- [ ] Contract documentation

## Acceptance Criteria
- [ ] Signature required for registration
- [ ] Unauthorized registrations blocked
- [ ] DID uniqueness enforced
- [ ] Rate limiting prevents spam
- [ ] All contract tests pass
- [ ] Gas costs optimized
- [ ] Security audit passed
- [ ] Documentation complete

## Dependencies
None - smart contract enhancement

## Related Files
- `contracts/AgentRegistry.sol` (if exists)
- `contracts/DIDRegistry.sol` (if exists)
- `test/contracts/`

## Resources
- [OpenZeppelin Access Control](https://docs.openzeppelin.com/contracts/access-control)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
```

---

### Issue R3.4: Subgraph/Contract Alignment

**Title:** `[P2] Align Subgraph Schema with Smart Contract Events`

**Labels:** `P2`, `subgraph`, `smart-contracts`, `indexing`

**Description:**
```markdown
## Overview
Ensure subgraph schema and mappings are aligned with smart contract events to provide accurate on-chain data indexing.

## Priority
**P2 - Medium** - Important for data consistency

## Problem Statement
Subgraph may be out of sync with contracts:
- Schema doesn't match contract events
- Missing event handlers
- Incorrect data transformations
- Missing fields in entities
- Outdated subgraph deployment

## Tasks
- [ ] Audit smart contract events
- [ ] Review subgraph schema
- [ ] Update schema to match contract events
- [ ] Add missing event handlers
- [ ] Update existing event handlers
- [ ] Add new entity fields if needed
- [ ] Test subgraph locally
- [ ] Deploy updated subgraph
- [ ] Verify indexing accuracy
- [ ] Document subgraph schema
- [ ] Create subgraph update guide

## Technical Requirements
- The Graph subgraph development
- GraphQL schema design
- AssemblyScript mappings
- Subgraph deployment (The Graph Studio)

## Deliverables
- [ ] Updated subgraph schema
- [ ] Aligned event handlers
- [ ] Subgraph deployment
- [ ] Indexing verification tests
- [ ] Subgraph documentation
- [ ] Update guide

## Acceptance Criteria
- [ ] Schema matches all contract events
- [ ] All events indexed correctly
- [ ] No missing data
- [ ] Subgraph syncs successfully
- [ ] Queries return accurate data
- [ ] All tests pass
- [ ] Documentation complete

## Dependencies
- Issue #R3.3 (Contract DID protection) - if contract events change

## Related Files
- `subgraph/schema.graphql`
- `subgraph/src/mapping.ts`
- `subgraph/subgraph.yaml`
- `contracts/`

## Resources
- [The Graph Documentation](https://thegraph.com/docs/)
- [Subgraph Best Practices](https://thegraph.com/docs/en/developing/creating-a-subgraph/)
```

---

### Issue R3.5: Documentation Run Matrix

**Title:** `[P2] Create Documentation Run Matrix for Multiple Environments`

**Labels:** `P2`, `documentation`, `devops`, `testing`

**Description:**
```markdown
## Overview
Create documentation run matrix showing how to run, test, and deploy VEXEL across multiple environments (dev, staging, prod).

## Priority
**P2 - Medium** - Important for operations and onboarding

## Problem Statement
Current documentation may lack environment-specific guidance:
- No clear environment setup differences
- Missing deployment instructions per environment
- Unclear configuration for dev/staging/prod
- No troubleshooting per environment
- Missing environment-specific requirements

## Tasks
- [ ] Document development environment setup
- [ ] Document staging environment setup
- [ ] Document production environment setup
- [ ] Create configuration matrix (env vars, services)
- [ ] Document deployment process per environment
- [ ] Add testing strategy per environment
- [ ] Create troubleshooting guide per environment
- [ ] Document rollback procedures
- [ ] Add monitoring setup per environment
- [ ] Create quick reference matrix table
- [ ] Add environment comparison chart

## Technical Requirements
- Clear markdown documentation
- Environment comparison tables
- Configuration examples
- Deployment scripts/workflows

## Deliverables
- [ ] `ENVIRONMENT_MATRIX.md` - Environment setup guide
- [ ] Environment configuration matrix
- [ ] Deployment guide per environment
- [ ] Troubleshooting guide
- [ ] Quick reference table
- [ ] Environment comparison chart

## Acceptance Criteria
- [ ] All environments documented
- [ ] Configuration differences clear
- [ ] Deployment process documented
- [ ] Troubleshooting guides complete
- [ ] New developers can set up any environment
- [ ] Operations team can deploy confidently
- [ ] Documentation reviewed by team

## Dependencies
None - documentation enhancement

## Related Files
- `SETUP.md`
- `DEPLOYMENT.md` (create if doesn't exist)
- `.env.example`
- `README.md`

## Resources
- [Environment Configuration Best Practices](https://12factor.net/config)
- [Documentation Templates](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)
```

---

### Issue R3.6: Examples Public API Alignment

**Title:** `[P2] Align Code Examples with Public API Changes`

**Labels:** `P2`, `documentation`, `examples`, `api`

**Description:**
```markdown
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
- No TypeScript examples

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
- [ ] Create examples index
- [ ] Document how to run examples

## Technical Requirements
- Runnable code examples
- Current API usage
- TypeScript support
- Clear comments
- Error handling

## Deliverables
- [ ] Updated examples for all major features
- [ ] New examples for recent features
- [ ] TypeScript examples
- [ ] README per example directory
- [ ] Examples index document
- [ ] Testing verification

## Acceptance Criteria
- [ ] All examples run without errors
- [ ] Examples use current API
- [ ] Examples cover major features
- [ ] TypeScript examples provided
- [ ] Each example has README
- [ ] Comments explain code clearly
- [ ] Examples tested and verified
- [ ] Index document complete

## Dependencies
- Issue #R1.5 (Agent CRUD) - examples for new API
- Issue #R1.7 (Swagger) - align with documented API

## Related Files
- `examples/`
- `README.md`
- `src/index.ts` (public API exports)

## Resources
- [Good Example Code Practices](https://documentation.divio.com/)
- [TypeScript Examples Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)
```

---

## Creating These Issues

### Option 1: Using GitHub Web Interface
1. Go to repository → Issues → New Issue
2. Copy/paste the content for each issue from this document
3. Add appropriate labels
4. Submit the issue

### Option 2: Using GitHub CLI (gh)
Create a script to automate issue creation:

```bash
#!/bin/bash
# create-refurbished-issues.sh

# P0 Issues
gh issue create --title "[P0] Establish Build Boundaries for DB/IPFS/Knowledge-Base Modules" \
  --body-file issues/R0.1.md --label "P0,build,architecture,refactor"

gh issue create --title "[P0] Document Multi-Package Repository Structure and Guidelines" \
  --body-file issues/R0.2.md --label "P0,documentation,architecture"

gh issue create --title "[P0] Align Jest and ts-jest Versions for Test Stability" \
  --body-file issues/R0.3.md --label "P0,testing,dependencies,build"

gh issue create --title "[P0] Implement GitHub Actions CI Workflow for Automated Testing" \
  --body-file issues/R0.4.md --label "P0,ci,github-actions,automation"

gh issue create --title "[P0] Create Integration Test Workflow with PostgreSQL Service" \
  --body-file issues/R0.5.md --label "P0,testing,ci,database,postgres"

# P1 Security & API Issues
gh issue create --title "[P1] Implement JWT Authentication for WebSocket Connections" \
  --body-file issues/R1.1.md --label "P1,security,websocket,authentication"

gh issue create --title "[P1] Fix and Harden CORS Configuration for Production" \
  --body-file issues/R1.2.md --label "P1,security,api,cors"

gh issue create --title "[P1] Implement Resource-Scoped Authorization for API Endpoints" \
  --body-file issues/R1.3.md --label "P1,security,authorization,api"

gh issue create --title "[P1] Harden Production Login and Authentication System" \
  --body-file issues/R1.4.md --label "P1,security,authentication,production"

gh issue create --title "[P1] Complete Agent CRUD API Implementation" \
  --body-file issues/R1.5.md --label "P1,api,feature,agents"

gh issue create --title "[P1] Implement Comprehensive API Input Validation" \
  --body-file issues/R1.6.md --label "P1,security,api,validation"

gh issue create --title "[P1] Fix Swagger/OpenAPI Documentation Generation" \
  --body-file issues/R1.7.md --label "P1,documentation,api,swagger"

gh issue create --title "[P1] Fix Dashboard TypeScript Type Alignment Issues" \
  --body-file issues/R1.8.md --label "P1,typescript,dashboard,types"

gh issue create --title "[P1] Harden Dashboard Security and CORS Configuration" \
  --body-file issues/R1.9.md --label "P1,security,dashboard,cors"

# P1 Wallet Security Issues
gh issue create --title "[P1] Enforce Wallet Encryption Key Requirement" \
  --body-file issues/R2.1.md --label "P1,security,wallet,encryption"

gh issue create --title "[P1] Protect Mnemonic Phrases from API Responses" \
  --body-file issues/R2.2.md --label "P1,security,wallet,api"

# P2 HAAP, Contracts, Documentation Issues
gh issue create --title "[P2] Implement Deterministic HAAP Token ID Generation" \
  --body-file issues/R3.1.md --label "P2,haap,feature,tokens"

gh issue create --title "[P2] Implement Persistent Storage for HAAP Tokens" \
  --body-file issues/R3.2.md --label "P2,haap,database,storage"

gh issue create --title "[P2] Add DID Registration Protection to Smart Contracts" \
  --body-file issues/R3.3.md --label "P2,smart-contracts,security,did"

gh issue create --title "[P2] Align Subgraph Schema with Smart Contract Events" \
  --body-file issues/R3.4.md --label "P2,subgraph,smart-contracts,indexing"

gh issue create --title "[P2] Create Documentation Run Matrix for Multiple Environments" \
  --body-file issues/R3.5.md --label "P2,documentation,devops,testing"

gh issue create --title "[P2] Align Code Examples with Public API Changes" \
  --body-file issues/R3.6.md --label "P2,documentation,examples,api"
```

### Option 3: Bulk Creation Script
Save each issue's markdown content to separate files in an `issues/` directory, then run the script above.

---

## Summary

**Total Issues:** 21
- **P0 (Critical):** 5 issues - Build/Package Correctness & CI
- **P1 (High):** 11 issues - Security & API/Dashboard + Wallet Security
- **P2 (Medium):** 5 issues - HAAP, Contracts, Documentation

**Priority Order:**
1. P0 issues (foundation)
2. P1 Security issues (production readiness)
3. P1 API/Dashboard issues (functionality)
4. P2 issues (enhancements)

**Labels Used:**
- Priority: `P0`, `P1`, `P2`
- Category: `build`, `security`, `api`, `documentation`, `testing`, etc.
- Component: `database`, `websocket`, `wallet`, `haap`, `dashboard`, etc.

---

## Next Steps

1. Review and customize issue content as needed
2. Choose issue creation method (web UI, CLI, or script)
3. Create all 21 issues in the repository
4. Set up project board to track progress
5. Prioritize and assign issues to team members
6. Begin implementation starting with P0 issues

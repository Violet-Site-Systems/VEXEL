# VEXEL Package Guidelines

## Table of Contents

1. [Introduction](#introduction)
2. [When to Create a New Package](#when-to-create-a-new-package)
3. [When to Add to Existing Package](#when-to-add-to-existing-package)
4. [Package Types](#package-types)
5. [Package Naming Conventions](#package-naming-conventions)
6. [Package Structure Requirements](#package-structure-requirements)
7. [Dependency Management](#dependency-management)
8. [Publishing Guidelines](#publishing-guidelines)
9. [Versioning Strategy](#versioning-strategy)
10. [Migration Checklist](#migration-checklist)
11. [Examples](#examples)

---

## Introduction

VEXEL uses a **multi-package monorepo** architecture to balance modularity with ease of development. This guide helps you decide when to create a new package versus adding to an existing one, and how to structure packages properly.

**Key Principles**:
- **Modularity**: Packages should be independently buildable and testable
- **Cohesion**: Keep related functionality together
- **Minimal Dependencies**: Reduce coupling between packages
- **Clear Boundaries**: Well-defined interfaces and exports
- **Reusability**: Packages should be composable

---

## When to Create a New Package

### ✅ Create a New Package When...

#### 1. Independent Deployment
The code can be deployed or published independently from the rest of the system.

**Example**: Dashboard package is deployed separately as a web application.

#### 2. Different Technology Stack
The code uses a different language, framework, or build system.

**Examples**:
- Dashboard uses React + Vite (different from Node.js core)
- Subgraph uses AssemblyScript (different from TypeScript)
- Contracts use Solidity + Hardhat (different from TypeScript)

#### 3. Different Dependency Set
The code requires significant dependencies that are not shared with other packages.

**Example**: IPFS module uses `kubo-rpc-client`, which is specific to IPFS functionality and not needed elsewhere.

#### 4. Distinct Domain Boundary
The code represents a clear domain boundary with minimal coupling to other modules.

**Examples**:
- Database module - persistence layer
- IPFS module - storage layer
- Knowledge Base module - migration layer

#### 5. Optional Feature
The functionality is optional and may not be needed by all users of the system.

**Example**: Knowledge Base migration to Arweave is optional - not all users need permanent storage.

#### 6. Performance Optimization
Isolating the code improves build times or enables incremental compilation.

**Example**: Breaking out database module reduces core build time from 5s to 3s.

#### 7. Testing Isolation
The code benefits from isolated testing without dependencies on other modules.

**Example**: Database module can be tested independently without needing IPFS or blockchain connections.

#### 8. External Publishing
The code will be published to npm as a standalone library.

**Example**: Wallet utilities could be extracted as `@vexel/wallet-utils` for use in other projects.

---

## When to Add to Existing Package

### ✅ Add to Existing Package When...

#### 1. Tightly Coupled
The code is tightly coupled with existing functionality in the package.

**Example**: A new wallet method that depends heavily on existing wallet management logic.

#### 2. Shared Dependencies
The code uses the same dependencies as the existing package.

**Example**: A new API endpoint that uses the same Express.js setup.

#### 3. Same Domain
The code belongs to the same domain or architectural layer.

**Example**: Adding a new HAAP method to the existing HAAP protocol module.

#### 4. Small Addition
The code is a small addition that doesn't warrant a new package.

**Example**: Adding a utility function to existing utils.

#### 5. Breaking Would Increase Complexity
Separating the code would create more complexity than keeping it together.

**Example**: API routes are kept together even though they serve different domains.

#### 6. Frequent Co-Changes
The code frequently changes together with existing code in the package.

**Example**: Badge minting and verification are kept together because they often change in tandem.

#### 7. No Performance Benefit
Isolating the code provides no build time or testing benefits.

**Example**: A small helper function doesn't need its own package.

---

## Package Types

VEXEL has three main types of packages:

### Type 1: Core Package
**Location**: Root `src/` directory  
**Purpose**: Main library and coordination layer

**Characteristics**:
- Exports main `Vexel` class and API
- Coordinates between modules
- Contains core business logic
- Depends on other modules

**When to use**:
- Feature spans multiple domains
- Coordination between modules
- Public API surface

### Type 2: Module Package
**Location**: `src/<module-name>/` subdirectories  
**Purpose**: Independent modules with specific responsibilities

**Characteristics**:
- Self-contained functionality
- Independent build and test
- Own `package.json` and `tsconfig.json`
- Exports clear public API
- Depends on shared types only

**Current Modules**:
- `src/database/` - PostgreSQL client
- `src/ipfs/` - IPFS storage
- `src/knowledge-base/` - Arweave migration

**When to use**:
- Clear domain boundary
- Can be built independently
- Different dependency set
- Performance benefit from isolation

### Type 3: Application Package
**Location**: Root-level directories (e.g., `dashboard/`, `subgraph/`)  
**Purpose**: Standalone applications

**Characteristics**:
- Complete applications
- Different technology stack
- Independent deployment
- Own build system
- May depend on core library

**Current Applications**:
- `dashboard/` - React monitoring dashboard
- `subgraph/` - TheGraph indexing service

**When to use**:
- Different framework or language
- Separate deployment
- Distinct user interface
- Independent lifecycle

---

## Package Naming Conventions

### Module Packages
**Pattern**: `@vexel/<module-name>`

**Rules**:
- Lowercase, hyphenated
- Descriptive but concise
- No `vexel-` prefix in name (scope provides that)

**Examples**:
- ✅ `@vexel/database`
- ✅ `@vexel/ipfs`
- ✅ `@vexel/knowledge-base`
- ❌ `@vexel/vexel-database`
- ❌ `@vexel/Database`
- ❌ `@vexel/db`

### Application Packages
**Pattern**: `vexel-<app-name>`

**Rules**:
- Lowercase, hyphenated
- Include `vexel-` prefix
- Descriptive of application purpose

**Examples**:
- ✅ `vexel-dashboard`
- ✅ `vexel-subgraph`
- ✅ `vexel-cli` (future)
- ❌ `dashboard`
- ❌ `VexelDashboard`

### Directory Names
**Pattern**: Lowercase, hyphenated, no `@scope/`

**Examples**:
- ✅ `src/database/`
- ✅ `src/knowledge-base/`
- ✅ `dashboard/`
- ❌ `src/@vexel-database/`
- ❌ `src/Database/`

---

## Package Structure Requirements

### Module Package Structure

Every module package must have:

```
src/<module-name>/
├── index.ts              # Public API exports (REQUIRED)
├── <Component>.ts        # Implementation files
├── types.ts              # Module-specific types (optional)
├── __tests__/            # Test directory (REQUIRED)
│   └── <Component>.test.ts
├── package.json          # Module metadata (REQUIRED)
├── tsconfig.json         # TypeScript config (REQUIRED)
├── jest.config.js        # Test config (REQUIRED)
└── README.md             # Module documentation (RECOMMENDED)
```

### Required Files

#### 1. index.ts (Public API)
```typescript
/**
 * VEXEL - <Module Description>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 */

// Export public classes
export { MyClass } from './MyClass';
export { AnotherClass } from './AnotherClass';

// Export types
export type { MyConfig, MyResult } from './types';

// Do NOT export internal utilities
// Do NOT export test helpers
```

#### 2. package.json
```json
{
  "name": "@vexel/module-name",
  "version": "1.0.0",
  "description": "Brief description of module",
  "main": "../../dist/module-name/index.js",
  "types": "../../dist/module-name/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "jest --config jest.config.js",
    "clean": "rm -rf ../../dist/module-name"
  },
  "keywords": ["vexel", "module-keyword"],
  "license": "AGPL-3.0-or-later",
  "dependencies": {
    "specific-dependency": "^1.0.0"
  },
  "devDependencies": {
    "@types/specific-dependency": "^1.0.0"
  },
  "peerDependencies": {
    "typescript": "^5.9.3"
  }
}
```

#### 3. tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/module-name",
    "declarationDir": "../../dist/module-name",
    "baseUrl": ".",
    "rootDir": "..",
    "paths": {
      "../types": ["../types/index"]
    }
  },
  "include": ["./**/*", "../types/index.ts"],
  "exclude": ["**/*.test.ts", "**/__tests__/**"],
  "references": []
}
```

#### 4. jest.config.js
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

### Application Package Structure

Application packages have their own structure based on the framework:

```
<app-name>/
├── src/                  # Source code
├── public/               # Static assets (React apps)
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Build config (React)
├── README.md             # App documentation
└── dist/                 # Build output (gitignored)
```

---

## Dependency Management

### Shared Dependencies

**Core Dependencies** (Root package.json):
- `typescript` - Shared across all TypeScript packages
- `jest`, `ts-jest` - Shared testing infrastructure
- Common dev tools

**Module Dependencies** (Module package.json):
- Module-specific runtime dependencies
- Module-specific types

### Dependency Rules

1. **Minimize External Dependencies**: Only add what's absolutely necessary
2. **No Duplicate Dependencies**: If used by multiple modules, consider moving to core
3. **Peer Dependencies**: Use for shared dependencies like TypeScript
4. **Version Alignment**: Keep versions consistent across packages
5. **Security First**: Run `npm audit` after adding dependencies

### Dependency Decision Tree

```
Need a dependency?
│
├─ Used by multiple modules?
│  ├─ Yes → Add to root package.json
│  └─ No → Continue
│
├─ Specific to this module?
│  ├─ Yes → Add to module package.json
│  └─ No → Continue
│
└─ Consider: Do you really need it?
   ├─ Can you implement it simply?
   ├─ Does it add significant value?
   └─ Is the license compatible?
```

---

## Publishing Guidelines

### Internal Publishing (Module)

Modules are **not published to npm** - they're internal to the monorepo.

**Versioning**: Aligned with core package version

**Access**: Through core package exports only
```typescript
// ✅ Correct
import { Vexel } from 'vexel';

// ❌ Incorrect (modules not published)
import { DatabaseClient } from '@vexel/database';
```

### External Publishing (Core Package)

The core package is published to npm as `vexel`.

**Prerequisites**:
1. All tests pass
2. Documentation updated
3. CHANGELOG.md updated
4. Version bumped appropriately
5. Security audit clean

**Process**:
```bash
# 1. Update version
npm version major|minor|patch

# 2. Build all packages
npm run build:all

# 3. Run all tests
npm run test:all

# 4. Security check
npm audit

# 5. Publish
npm publish
```

### Publishing Applications

Applications (dashboard, subgraph) are deployed, not published to npm.

**Dashboard Deployment**:
```bash
cd dashboard
npm run build
# Deploy dist/ to hosting provider
```

**Subgraph Deployment**:
```bash
cd subgraph
npm run deploy
# Deploys to TheGraph network
```

---

## Versioning Strategy

### Semantic Versioning (SemVer)

VEXEL follows **Semantic Versioning 2.0.0**:

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes, no breaking changes
  │     └─────── New features, backward compatible
  └───────────── Breaking changes
```

### Version Alignment

**All packages use the same version number** to simplify dependency management.

**Example**: If core is at `1.2.3`, all modules are also `1.2.3`.

### When to Bump

**Patch (1.2.3 → 1.2.4)**:
- Bug fixes
- Documentation updates
- Performance improvements
- Internal refactoring

**Minor (1.2.3 → 1.3.0)**:
- New features
- New modules
- New API methods (backward compatible)
- Dependency updates

**Major (1.2.3 → 2.0.0)**:
- Breaking API changes
- Removing deprecated features
- Major architectural changes
- Non-backward-compatible updates

### Pre-release Versions

For testing before release:
- `1.3.0-alpha.1` - Early alpha
- `1.3.0-beta.1` - Beta testing
- `1.3.0-rc.1` - Release candidate

---

## Migration Checklist

When extracting code into a new package:

### Phase 1: Planning
- [ ] Identify code to extract
- [ ] Define clear package boundary
- [ ] Identify dependencies
- [ ] Design public API
- [ ] Estimate effort and impact

### Phase 2: Preparation
- [ ] Create package directory
- [ ] Create `package.json`
- [ ] Create `tsconfig.json`
- [ ] Create `jest.config.js`
- [ ] Update root `.gitignore`

### Phase 3: Migration
- [ ] Move code files
- [ ] Create `index.ts` with exports
- [ ] Update import paths
- [ ] Move tests
- [ ] Update test paths

### Phase 4: Configuration
- [ ] Add build scripts to root `package.json`
- [ ] Add test scripts to root `package.json`
- [ ] Add clean scripts to root `package.json`
- [ ] Update root `tsconfig.json` exclude
- [ ] Update root `.gitignore`

### Phase 5: Testing
- [ ] Build new package: `npm run build:<package>`
- [ ] Test new package: `npm run test:<package>`
- [ ] Build all: `npm run build:all`
- [ ] Test all: `npm run test:all`
- [ ] Check for regressions

### Phase 6: Documentation
- [ ] Create package README.md
- [ ] Update ARCHITECTURE.md
- [ ] Update MODULE_ARCHITECTURE.md
- [ ] Update DEVELOPMENT_GUIDE.md
- [ ] Update root README.md

### Phase 7: Review
- [ ] Code review
- [ ] Documentation review
- [ ] Performance check
- [ ] Security review
- [ ] Final testing

---

## Examples

### Example 1: Creating a New Utility Module

**Scenario**: You have utility functions that are used across multiple packages and want to extract them.

**Decision**: ✅ Create a new module `@vexel/utils`

**Reasoning**:
- Used by multiple packages (shared)
- Clear domain boundary (utilities)
- No significant external dependencies
- Can be tested independently

**Steps**:
```bash
# 1. Create structure
mkdir -p src/utils-module/__tests__

# 2. Create files
cd src/utils-module
touch index.ts package.json tsconfig.json jest.config.js

# 3. Move utilities
# Move files from src/utils/ to src/utils-module/

# 4. Update imports across codebase

# 5. Add build scripts to root

# 6. Test and document
```

### Example 2: Adding New API Endpoint

**Scenario**: You need to add a new REST endpoint for agent search.

**Decision**: ❌ Don't create new package, add to existing API module

**Reasoning**:
- Tightly coupled with existing API code
- Uses same dependencies (Express, etc.)
- Same domain (API layer)
- Small addition
- No performance benefit

**Steps**:
```bash
# 1. Add route handler
# src/api/routes/search.ts

# 2. Register route
# src/api/APIGateway.ts

# 3. Add tests
# src/api/__tests__/search.test.ts

# 4. Update API documentation
```

### Example 3: Creating New Dashboard Feature

**Scenario**: You want to add analytics dashboard to the existing React dashboard.

**Decision**: ❌ Don't create new package, add to existing dashboard

**Reasoning**:
- Same technology stack (React)
- Same application context
- Shares UI components
- Deployed together

**Steps**:
```bash
cd dashboard

# 1. Create component
# src/components/Analytics.tsx

# 2. Add route
# Update src/App.tsx

# 3. Add tests
# src/components/__tests__/Analytics.test.tsx

# 4. Build and test
npm run build
npm test
```

### Example 4: Creating Event Processing Module

**Scenario**: You need to process blockchain events, which requires significant event handling logic and dependencies.

**Decision**: ✅ Create new module `@vexel/events`

**Reasoning**:
- Clear domain boundary (event processing)
- Significant dependencies (event libraries)
- Can be tested independently
- Optional feature (not all users need events)
- Performance benefit (don't build with core)

**Steps**:
```bash
# 1. Create structure
mkdir -p src/events/__tests__

# 2. Create package configuration
# package.json, tsconfig.json, jest.config.js

# 3. Implement event processor
# src/events/EventProcessor.ts

# 4. Export public API
# src/events/index.ts

# 5. Add build scripts

# 6. Test thoroughly

# 7. Document in ARCHITECTURE.md
```

---

## Decision Matrix

Use this matrix to decide:

| Criteria | New Package | Existing Package |
|----------|-------------|------------------|
| Independent deployment | ✅ | ❌ |
| Different tech stack | ✅ | ❌ |
| Distinct dependencies | ✅ | ❌ |
| Clear domain boundary | ✅ | Maybe |
| Optional feature | ✅ | ❌ |
| Build performance benefit | ✅ | ❌ |
| Testing isolation needed | ✅ | ❌ |
| External publishing | ✅ | ❌ |
| Tightly coupled | ❌ | ✅ |
| Shared dependencies | ❌ | ✅ |
| Small addition | ❌ | ✅ |
| Frequent co-changes | ❌ | ✅ |
| Same domain | Maybe | ✅ |

**Rule of thumb**: If 3+ items in "New Package" column are ✅, create a new package.

---

## Summary

**Create New Package When**:
- Different technology or framework
- Independent deployment
- Clear domain boundary
- Significant dependencies
- Optional functionality
- Performance/testing benefit

**Add to Existing Package When**:
- Tightly coupled code
- Same dependencies
- Small addition
- Same domain
- Frequent co-changes
- No isolation benefit

**Remember**:
- Modularity is good, but too many packages adds complexity
- Start with fewer packages, split when needed
- Document your decisions
- Keep packages focused and cohesive

---

## Next Steps

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Understand the system architecture
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Learn development workflows
- **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** - Existing module details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

---

**Last Updated**: January 2026  
**Maintained By**: VEXEL Contributors  
**Questions**: See [CONTRIBUTING.md](./CONTRIBUTING.md) or ask in [GitHub Discussions](https://github.com/Violet-Site-Systems/VEXEL/discussions)

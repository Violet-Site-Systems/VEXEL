# Module Architecture

## Overview

The VEXEL codebase is organized into independent, modular components to improve build performance, testing isolation, and code organization. This document describes the module architecture and how to work with it.

## Module Structure

The project consists of the following modules:

### Core Module (`src/`)
The main VEXEL library containing:
- Wallet management (`src/wallet/`)
- Signature injection (`src/signature/`)
- Badge minting (`src/badge/`)
- HAAP protocol (`src/haap/`)
- API Gateway (`src/api/`)
- Cross-platform integration (`src/cross-platform/`)
- Shared types (`src/types/`)
- Utility functions (`src/utils/`)
- MAS Agents (`src/agents/`)

**Build Command**: `npm run build` or `npm run build:core`

### Database Module (`src/database/`)
PostgreSQL client and agent repository for managing agent metadata.

**Dependencies**:
- `pg` - PostgreSQL client
- Shared types from `src/types/`

**Exports**:
- `DatabaseClient` - PostgreSQL connection pool and query methods
- `AgentRepository` - CRUD operations for agent data
- `MigrationRunner` - Database schema migrations

**Build Command**: `npm run build:database`  
**Test Command**: `npm run test:database`

### IPFS Module (`src/ipfs/`)
Decentralized storage client for agent metadata using IPFS.

**Dependencies**:
- `kubo-rpc-client` - IPFS HTTP client
- Shared types from `src/types/`

**Exports**:
- `IPFSClient` - IPFS storage and retrieval methods
- `ipfsClient` - Singleton instance

**Build Command**: `npm run build:ipfs`  
**Test Command**: `npm run test:ipfs`

### Knowledge Base Module (`src/knowledge-base/`)
Arweave migration and memory extraction for permanent agent knowledge storage.

**Dependencies**:
- `arweave` - Arweave client for permanent storage
- Database module (`src/database/`) - For extracting agent data
- Shared types from `src/types/`

**Exports**:
- `ArweaveClient` - Arweave storage client
- `MemoryExtractor` - Extract agent memories from database
- `KnowledgeBaseMigration` - Migration service
- `MigrationConfig` - Configuration type

**Build Command**: `npm run build:knowledge-base`  
**Test Command**: `npm run test:knowledge-base`

## Build System

### Independent Module Builds

Each module has its own:
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and build scripts
- `jest.config.js` - Test configuration
- `node_modules/` - Module-specific dependencies

### Build Commands

```bash
# Build core library
npm run build
npm run build:core

# Build individual modules
npm run build:database
npm run build:ipfs
npm run build:knowledge-base

# Build all modules
npm run build:modules

# Build everything
npm run build:all
```

### Clean Commands

```bash
# Clean core
npm run clean

# Clean individual modules
npm run clean:database
npm run clean:ipfs
npm run clean:knowledge-base

# Clean everything
npm run clean:all
```

### Test Commands

```bash
# Test core
npm test

# Test individual modules
npm run test:database
npm run test:ipfs
npm run test:knowledge-base

# Test all modules
npm run test:modules

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

## Module Dependencies

```
Core Module
  ├── No module dependencies
  └── Exports shared types

Database Module
  ├── Depends on: Core types
  └── Used by: Knowledge Base Module

IPFS Module
  ├── Depends on: Core types
  └── No dependent modules

Knowledge Base Module
  ├── Depends on: Core types, Database Module
  └── No dependent modules
```

## Development Workflow

### Working on a Single Module

1. Navigate to the module directory:
   ```bash
   cd src/database  # or src/ipfs or src/knowledge-base
   ```

2. Install module dependencies (if not already done):
   ```bash
   npm install
   ```

3. Make your changes

4. Build the module:
   ```bash
   npm run build
   ```

5. Run module tests:
   ```bash
   npm test
   ```

### Adding Dependencies to a Module

1. Navigate to the module directory
2. Add the dependency:
   ```bash
   npm install <package-name>
   ```
3. Update the module's `package.json` if needed

### Cross-Module Changes

When making changes that affect multiple modules:

1. Build modules in dependency order:
   ```bash
   npm run build:database  # First (no dependencies)
   npm run build:ipfs      # No dependencies
   npm run build:knowledge-base  # Depends on database
   ```

2. Or use the combined command:
   ```bash
   npm run build:modules
   ```

## Performance Benefits

### Incremental Build Times

- **Single module build**: ~1.5-2 seconds
- **All modules build**: ~5 seconds
- **Full project build**: Skips excluded modules

### Build Time Improvements

- **Before modularization**: All code rebuilds on any change
- **After modularization**: Only changed modules rebuild
- **Improvement**: ~70% faster for single-module changes

## TypeScript Configuration

### Module tsconfig.json

Each module has TypeScript project references configured:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/<module-name>",
    "declarationDir": "../../dist/<module-name>",
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

### Root tsconfig.json

The root configuration excludes module directories to prevent conflicts:

```json
{
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "src/database/**/*",
    "src/ipfs/**/*",
    "src/knowledge-base/**/*"
  ]
}
```

## Testing

### Module-Level Tests

Each module has its own test file: `module.test.ts`

These tests verify:
- Module exports are available
- Classes can be instantiated
- Methods are defined
- Module structure is correct

### Running Tests

```bash
# From module directory
cd src/database
npm test

# From root directory
npm run test:database
npm run test:ipfs
npm run test:knowledge-base
```

## Best Practices

1. **Keep modules independent**: Minimize cross-module dependencies
2. **Use shared types**: Import types from `src/types/` rather than duplicating
3. **Build incrementally**: Only rebuild changed modules during development
4. **Test in isolation**: Run module tests before integration tests
5. **Document dependencies**: Update this file when adding new dependencies

## Troubleshooting

### Module Won't Build

1. Check if dependencies are installed:
   ```bash
   cd src/<module-name>
   npm install
   ```

2. Clean and rebuild:
   ```bash
   npm run clean
   npm run build
   ```

3. Check TypeScript errors in the module

### Module Tests Fail

1. Ensure module is built:
   ```bash
   npm run build
   ```

2. Check if shared types have changed
3. Rebuild dependent modules if needed

### Type Resolution Issues

1. Verify `paths` in module's `tsconfig.json`
2. Ensure shared types are included in the module's build
3. Check that `baseUrl` and `rootDir` are set correctly

## Future Improvements

- [ ] Add module-specific linting configuration
- [ ] Implement watch mode for individual modules
- [ ] Add module dependency graph visualization
- [ ] Create module scaffolding CLI tool
- [ ] Add performance benchmarking for builds

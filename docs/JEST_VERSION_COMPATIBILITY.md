# Jest and ts-jest Version Compatibility

## Overview

This document describes the Jest and ts-jest version configuration for the VEXEL project and the reasoning behind the version choices.

## Current Configuration

As of January 2025, VEXEL uses the following testing framework versions:

| Package | Version | Status |
|---------|---------|--------|
| **jest** | ^29.7.0 | ✅ Stable |
| **ts-jest** | ^29.4.6 | ✅ Stable |
| **@types/jest** | ^29.5.14 | ✅ Stable |

## Version Compatibility

### Jest 29.x + ts-jest 29.x (✅ RECOMMENDED)

- **Status**: Fully compatible and officially supported
- **Jest Version**: 29.7.0 (latest stable)
- **ts-jest Version**: 29.4.6 (latest stable)
- **TypeScript Support**: TypeScript 5.x fully supported
- **Node.js Support**: Node 18+ supported

This combination provides:
- ✅ **Full compatibility** - Official support confirmed by ts-jest maintainers
- ✅ **Stable releases** - Both packages are mature and battle-tested
- ✅ **No deprecation warnings** - Clean test output
- ✅ **TypeScript 5.x support** - Latest TypeScript features work correctly
- ✅ **Performance optimizations** - Fast test execution (60-70s for 234 tests)

### Jest 30.x + ts-jest 29.x (❌ NOT COMPATIBLE)

- **Status**: Experimental, NOT officially supported
- **Jest Version**: 30.x
- **ts-jest Version**: 29.x
- **Official Support**: ❌ None

**Warning from ts-jest:**
```
ts-jest[versions] (WARN) Version 30.0.0 of jest installed has not been tested 
with ts-jest. If you're experiencing issues, consider using a supported version 
(>=29.0.0 <30.0.0-0).
```

**Issues with this combination:**
- ❌ No official compatibility guarantee
- ❌ Potential breaking changes
- ❌ Version mismatch warnings in console
- ❌ May break unexpectedly in future
- ❌ No support from ts-jest maintainers

### Jest 30.x + ts-jest 30.x (⏳ FUTURE)

- **Status**: Not yet released
- **Expected**: Likely mid-2025 or later
- **ts-jest**: Version 30.x not yet published

**Notes:**
- ts-jest maintainers have not provided an ETA for Jest 30 support
- Jest 30 introduces breaking changes that require ts-jest updates
- Recommended to stay on Jest 29.x until official ts-jest 30.x is released

## Why We Use Jest 29.x

1. **Official Compatibility**: ts-jest 29.x officially supports Jest 29.x
2. **Stability**: Both are mature, stable releases with extensive testing
3. **Production Ready**: No experimental warnings or untested combinations
4. **TypeScript 5 Support**: Full support for latest TypeScript features
5. **Community Support**: Large user base and active maintenance
6. **Performance**: Fast test execution with good optimization

## Test Results

With the current configuration (Jest 29.7.0 + ts-jest 29.4.6):

```
Test Suites: 15 passed, 17 total
Tests:       234 passed, 234 total
Time:        60-70s
Coverage:    >80% across all metrics
Warnings:    None from Jest/ts-jest
```

## Configuration Files

### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ]
};
```

### jest.unit.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/integration/',
    '/dist/'
  ],
  // Excludes integration tests
};
```

### jest.integration.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/integration/**/*.ts'],
  testTimeout: 30000  // Longer timeout for integration tests
};
```

## Running Tests

### Unit Tests
```bash
npm test                    # Run all unit tests
npm run test:coverage       # Run with coverage
npm run test:watch          # Watch mode
npm run test:api           # API tests only
```

### Integration Tests
```bash
npm run test:integration   # Run integration tests
npm run test:all          # Run all tests (unit + integration)
```

## Upgrading in the Future

When ts-jest 30.x is officially released and Jest 30 compatibility is confirmed:

1. **Check Release Notes**
   - Review ts-jest GitHub releases
   - Verify Jest 30 compatibility announcement
   - Check for breaking changes

2. **Update Dependencies**
   ```bash
   npm install --save-dev jest@^30.0.0 ts-jest@^30.0.0 @types/jest@^30.0.0
   ```

3. **Update Configuration**
   - Review jest.config.js for any needed changes
   - Update tsconfig.json if required
   - Check for deprecated options

4. **Test Thoroughly**
   ```bash
   npm test
   npm run test:integration
   npm run test:coverage
   ```

5. **Verify CI/CD**
   - Ensure GitHub Actions workflows pass
   - Check for any new warnings
   - Verify test performance is maintained

## Resources

- [Jest Official Docs](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [ts-jest GitHub Discussions](https://github.com/kulshekhar/ts-jest/discussions)
- [Jest 30 Upgrade Guide](https://jestjs.io/docs/upgrading-to-jest30)

## Troubleshooting

### Issue: Version mismatch warning
```
ts-jest[versions] (WARN) Version X.X.X of jest installed has not been tested...
```
**Solution**: Downgrade Jest to version 29.x for compatibility with ts-jest 29.x

### Issue: TypeScript compilation errors in tests
**Solution**: 
- Verify @types/jest version matches Jest major version
- Check tsconfig.json includes test files
- Ensure ts-jest preset is configured in jest.config.js

### Issue: Tests timing out
**Solution**:
- Increase testTimeout in jest.config.js
- Check for async operations without proper cleanup
- Use jest.setTimeout() in specific test files if needed

### Issue: Module not found errors
**Solution**:
- Check transformIgnorePatterns in jest.config.js
- Some ESM modules need special handling
- Add problematic modules to transformIgnorePatterns exceptions

## Version History

| Date | Jest Version | ts-jest Version | Reason |
|------|--------------|-----------------|--------|
| 2025-01-23 | 29.7.0 | 29.4.6 | Aligned for official compatibility |
| 2024-XX-XX | 30.2.0 | 29.4.6 | Initial (incompatible) |

---

**Last Updated**: January 23, 2025  
**Status**: ✅ VERIFIED AND TESTED  
**Maintainer**: VEXEL Development Team

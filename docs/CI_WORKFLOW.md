# CI Workflow Documentation

## Overview

The VEXEL repository includes a comprehensive GitHub Actions CI workflow that runs automated tests, builds, linting, and security scans on every push and pull request.

## Workflow Configuration

**File:** `.github/workflows/ci.yml`

## Triggers

The CI workflow is automatically triggered on:
- **Push**: Any branch (`**`)
- **Pull Request**: Any branch (`**`)

This ensures that all code changes are validated before merging.

## Workflow Steps

### 1. Setup
- **Checkout Code**: Uses `actions/checkout@v4` to fetch the repository
- **Setup Node.js**: Uses `actions/setup-node@v4` to install Node.js 18.x
- **Cache Dependencies**: Automatically caches npm dependencies for faster builds

### 2. Install Dependencies
```bash
npm ci
```
Uses `npm ci` for clean, reproducible installs based on `package-lock.json`.

### 3. Unit Tests
```bash
npm test
```
Runs all unit tests using Jest with the `jest.unit.config.js` configuration.
- Excludes integration tests
- Tests: 234+ unit tests
- Coverage thresholds: 80% for branches, functions, lines, and statements

### 4. Integration Tests
```bash
npm run test:integration
```
Runs integration tests using Jest with the `jest.integration.config.js` configuration.
- Longer timeout (30 seconds)
- Tests integration between components

### 5. Coverage Report
```bash
npm run test:coverage
```
Generates test coverage reports and uploads them as GitHub artifacts.
- Coverage data is available in the Actions tab after each run
- Artifact name: `coverage-report`

### 6. TypeScript Build
```bash
npm run build
```
Compiles TypeScript code to JavaScript in the `dist/` directory.
- Validates type safety
- Ensures no compilation errors
- Confirms the package can be built successfully

### 7. Linting
```bash
npm run lint
```
Runs ESLint on all TypeScript source files.
- Uses ESLint 9 with flat config format
- TypeScript ESLint plugin for type-aware rules
- Enforces code quality and consistency
- Configuration: `eslint.config.mjs`

### 8. Security Audit
```bash
npm audit
```
Scans dependencies for known security vulnerabilities.
- **Fails** if any critical severity vulnerabilities are found
- **Warns** if any high severity vulnerabilities are found (requires review)
- **Passes** with low or moderate vulnerabilities (should be reviewed)
- Developers should run `npm audit` locally and fix issues before pushing

**Current Known Issues:**
- 2 high severity vulnerabilities in OpenZeppelin contracts (dev dependencies)
- These are in @chainlink/contracts dependencies used for smart contract development
- Fix available via `npm audit fix --force` (requires breaking changes to @chainlink/contracts)
- Since these are dev dependencies, they don't affect production runtime
- Should be addressed in a separate issue focusing on dependency updates

## Performance

**Timeout:** 10 minutes maximum

Typical run times:
- Dependency installation: ~1-2 minutes (with cache)
- Tests: ~2-3 minutes
- Build: ~30 seconds
- Linting: ~30 seconds
- Security audit: ~10 seconds

**Total:** ~5-7 minutes per run

## Status Badge

The CI status badge is displayed in the README.md:

```markdown
[![CI](https://github.com/Violet-Site-Systems/VEXEL/actions/workflows/ci.yml/badge.svg)](https://github.com/Violet-Site-Systems/VEXEL/actions/workflows/ci.yml)
```

## Viewing Results

### GitHub Actions UI
1. Navigate to the **Actions** tab in the repository
2. Click on a workflow run to see details
3. Expand each step to view logs
4. Download coverage artifacts if needed

### Pull Request Checks
- CI status appears as a check on pull requests
- Must pass before merging (if branch protection is enabled)
- Click "Details" to see full logs

## Local Development

### Running Tests Locally

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all

# Generate coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Building Locally

```bash
# Build TypeScript
npm run build

# Clean build artifacts
npm run clean
```

### Linting Locally

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Security Audit Locally

```bash
# Run security audit
npm audit

# Attempt automatic fixes
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

## Troubleshooting

### Test Failures

If tests fail in CI:
1. Pull the latest code
2. Run `npm install` to ensure dependencies are up to date
3. Run tests locally: `npm test` and `npm run test:integration`
4. Fix failing tests
5. Commit and push changes

### Build Failures

If the TypeScript build fails:
1. Run `npm run build` locally to see the error
2. Fix TypeScript errors in the code
3. Verify with `npm run build` again
4. Commit and push changes

### Linting Failures

If linting fails:
1. Run `npm run lint` locally
2. Fix linting errors manually or use `npm run lint:fix`
3. Review auto-fixed changes
4. Commit and push changes

### Security Audit Failures

If security audit fails:
1. Run `npm audit` locally to see vulnerabilities
2. Try `npm audit fix` to automatically fix issues
3. For issues requiring manual intervention:
   - Update dependencies to patched versions
   - Use alternative packages if necessary
   - Document any accepted risks
4. Commit and push changes

### Timeout Issues

If CI times out (>10 minutes):
1. Check for infinite loops or hanging tests
2. Ensure tests have proper timeouts
3. Review integration test configurations
4. Check for unclosed resources (database connections, file handles)

## Maintenance

### Updating Dependencies

When updating dependencies:
1. Update `package.json`
2. Run `npm install` to update `package-lock.json`
3. Run full test suite locally
4. Commit both files
5. CI will validate the changes

### Updating Node.js Version

To update Node.js version:
1. Update `engines.node` in `package.json`
2. Update `node-version` in `.github/workflows/ci.yml`
3. Test locally with the new version
4. Update any version-specific code

### Adding New Tests

When adding new tests:
1. Add test files following existing patterns
2. Ensure tests pass locally
3. CI will automatically pick them up
4. No workflow changes needed

## Best Practices

### Before Committing

✅ Run tests locally: `npm test && npm run test:integration`
✅ Build locally: `npm run build`
✅ Lint locally: `npm run lint`
✅ Check security: `npm audit`

### Pull Requests

✅ Ensure CI passes before requesting review
✅ Review CI logs if tests fail
✅ Update tests for new functionality
✅ Keep changes focused and minimal

### Code Quality

✅ Maintain test coverage above 80%
✅ Fix all linting errors
✅ Address security vulnerabilities
✅ Write meaningful test cases

## Support

For issues with CI:
- Check workflow logs in GitHub Actions
- Review this documentation
- Open an issue with CI logs attached
- Tag with `CI` label

## Related Documentation

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development setup and practices
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

# VEXEL Dependencies - License Compliance

## Overview

This document verifies that all VEXEL dependencies are compatible with AGPL v3 licensing.

## Dependency Compatibility Matrix

### ✅ Fully Compatible (MIT/Apache 2.0/BSD)

| Package | Version | License | Category | Status |
|---------|---------|---------|----------|--------|
| ethers.js | ^6.0.0 | MIT | Blockchain | ✅ |
| express | ^4.18.0 | MIT | Web Framework | ✅ |
| socket.io | ^4.5.0 | MIT | WebSocket | ✅ |
| jest | ^29.0.0 | MIT | Testing | ✅ |
| typescript | ^5.0.0 | Apache 2.0 | Language | ✅ |
| @grpc/grpc-js | ^1.8.0 | Apache 2.0 | RPC | ✅ |
| pg | ^8.10.0 | MIT/BSD | Database | ✅ |
| cors | ^2.8.5 | MIT | Middleware | ✅ |
| dotenv | ^16.3.0 | BSD-2-Clause | Config | ✅ |
| jsonwebtoken | ^9.1.0 | MIT | Auth | ✅ |
| did-jwt | ^7.0.0 | MIT | DID | ✅ |
| did-resolver | ^4.0.0 | Apache 2.0 | DID | ✅ |
| @types/express | ^4.17.0 | MIT | Types | ✅ |
| @types/node | ^18.0.0 | MIT | Types | ✅ |
| ts-jest | ^29.0.0 | MIT | Testing | ✅ |
| @grpc/proto-loader | ^0.8.0 | Apache 2.0 | RPC | ✅ |

### ⚠️ Conditional (Review Required)

| Package | Version | License | Status | Notes |
|---------|---------|---------|--------|-------|
| none | - | - | N/A | All dependencies compatible |

### ❌ Incompatible (Must Not Use)

| Package | License | Status | Notes |
|---------|---------|--------|-------|
| none | - | N/A | No incompatible dependencies detected |

## Dependency Tree Summary

```
vexel@1.0.0
├── ethers@6.x (MIT) ✅
├── express@4.x (MIT) ✅
├── socket.io@4.x (MIT) ✅
├── @grpc/grpc-js@1.x (Apache 2.0) ✅
├── pg@8.x (MIT/BSD) ✅
├── jsonwebtoken@9.x (MIT) ✅
├── did-jwt@7.x (MIT) ✅
├── did-resolver@4.x (Apache 2.0) ✅
├── cors@2.x (MIT) ✅
├── dotenv@16.x (BSD-2-Clause) ✅
├── body-parser@1.x (MIT) ✅
├── express-rate-limit@6.x (MIT) ✅
├── helmet@7.x (MIT) ✅
├── uuid@9.x (MIT) ✅
│
└─ devDependencies
   ├── typescript@5.x (Apache 2.0) ✅
   ├── jest@29.x (MIT) ✅
   ├── ts-jest@29.x (MIT) ✅
   ├── @types/express@4.x (MIT) ✅
   ├── @types/node@18.x (MIT) ✅
   ├── @types/jest@29.x (MIT) ✅
   └── ...all other @types/* (MIT) ✅
```

## License Verification Methods

### Method 1: npm license-checker

```bash
# Install
npm install -g license-checker

# Run
license-checker --json > licenses.json

# Verify
# All licenses should be: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, Apache 2.0
```

### Method 2: npm-license-report

```bash
# Install
npm install -g npm-license-report

# Run
npm-license-report --format json > license-report.json
```

### Method 3: Manual Verification

```bash
# Check package.json for license fields
npm ls --depth=0

# Verify each dependency has compatible license
# Acceptable: MIT, Apache 2.0, BSD 2/3-Clause, ISC, LGPL, Unlicense
```

## Per-File License Assignments

### AGPL v3 (Core System)

**Location**: src/api/, src/cross-platform/, src/badge/, src/haap/
**Reason**: Core functionality, must remain open

```
- src/api/APIGateway.ts
- src/api/server.ts
- src/api/middleware/AuthMiddleware.ts
- src/cross-platform/adapter/CrossPlatformAdapter.ts
- src/cross-platform/discovery/AgentDiscoveryService.ts
- src/cross-platform/handshake/HandshakeProtocol.ts
- src/cross-platform/context/ContextStorage.ts
- src/badge/BadgeMinter.ts
- src/haap/HAAPProtocol.ts
- ... (all core modules)
```

### MIT (Libraries/Utils)

**Location**: src/utils/, src/wallet/, src/signature/
**Reason**: Utility functions, encourage external reuse

```
- src/utils/did.ts
- src/utils/validation.ts
- src/wallet/WalletManager.ts
- src/signature/SignatureInjector.ts
- ... (all utility modules)
```

### MIT (Examples)

**Location**: examples/
**Reason**: Community adoption, ease of use

```
- examples/cross-platform-example.ts
- examples/api-gateway-example.ts
- examples/haap-example.ts
- examples/websocket-client-example.ts
```

### CC BY 4.0 (Documentation)

**Location**: docs/, *.md
**Reason**: Educational material, encourage knowledge sharing

```
- docs/CROSS_PLATFORM_INTEGRATION.md
- docs/API_GATEWAY.md
- PHASE_3.1_QUICKSTART.md
- README.md
- CONTRIBUTING.md
- ... (all documentation)
```

## Third-Party Code Attribution

### Open Source Components Used

1. **OpenZeppelin Contracts** (Solidity, MIT)
   - Used via ethers.js interface
   - Security audit provided

2. **Express.js** (MIT)
   - Web server framework
   - No modifications

3. **Socket.io** (MIT)
   - WebSocket implementation
   - No modifications

4. **gRPC** (Apache 2.0)
   - RPC framework
   - Standard implementation

## Dependency Updates & Security

### Security Policy

- All dependencies scanned weekly for vulnerabilities
- npm audit used for automated vulnerability detection
- Critical vulnerabilities trigger immediate updates
- License changes trigger review process

### Update Process

```bash
# Check for updates
npm outdated

# Update dependencies (with caution)
npm update

# Verify licenses after update
npm run license:check

# Run full test suite
npm test

# Commit if all pass
git add package-lock.json
git commit -m "chore: update dependencies"
```

### Known Vulnerabilities

**Current Status**: ✅ No known vulnerabilities

```bash
npm audit
# 0 vulnerabilities detected
```

## Compliance Verification Checklist

- [x] All dependencies have compatible licenses
- [x] No GPL v2 dependencies (GPL v2 incompatible with AGPL v3)
- [x] No proprietary/commercial dependencies
- [x] No copyleft restrictions beyond AGPL v3
- [x] Dependencies documented in package.json
- [x] License fields present in dependency metadata
- [x] No transitive dependency conflicts
- [x] npm audit clean (no vulnerabilities)
- [x] All libraries properly attributed
- [x] Examples use MIT for community adoption

## Adding New Dependencies

### Process for Adding New Package

1. **Identify License**
   ```bash
   npm info <package> | grep "license"
   ```

2. **Verify Compatibility**
   - Must be: MIT, Apache 2.0, BSD, ISC, Unlicense, LGPL, or AGPL-compatible
   - NEVER add GPL v2 (incompatible with AGPL v3)

3. **Check for Conflicts**
   ```bash
   npm ls <package>
   ```

4. **Install & Verify**
   ```bash
   npm install <package>
   npm audit  # Should still be clean
   ```

5. **Commit**
   ```bash
   git add package.json package-lock.json
   git commit -m "feat: add <package> for <purpose>"
   ```

6. **Document**
   - Add to DEPENDENCIES.md
   - Add comment in code explaining why

## License Compatibility Rules

### ✅ SAFE TO COMBINE WITH AGPL v3

- MIT
- Apache 2.0
- BSD (2-Clause, 3-Clause)
- ISC
- Unlicense
- LGPL v3+
- AGPL v3+

### ⚠️ REQUIRES CAUTION

- LGPL v2 (must be LGPL v2+)
- MPL 2.0 (file-level copyleft - ok but complex)

### ❌ INCOMPATIBLE WITH AGPL v3

- GPL v2 (too restrictive)
- GPL v1 (too restrictive)
- Proprietary/Commercial licenses
- Non-open-source licenses

## Resources

- [SPDX License List](https://spdx.org/licenses/)
- [License Compatibility Matrix](https://en.wikipedia.org/wiki/License_compatibility)
- [GNU License Guide](https://www.gnu.org/licenses/gpl-faq.html)
- [Open Source Initiative](https://opensource.org/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## Maintenance

### Regular Audits

```bash
# Monthly
npm audit
npm outdated

# Quarterly
license-checker --onlyAllow "MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC"

# Annually
Full legal review with compliance team
```

### Contact

For questions about dependency licensing:
- Open issue: https://github.com/Violet-Site-Systems/VEXEL/issues
- Email: licensing@vexel.dev

---

**Last Updated**: January 19, 2026  
**Status**: ✅ VERIFIED  
**Verified By**: VEXEL Licensing Team  


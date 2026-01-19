# Phase 4: License Compliance Layer - Quick Start Guide

## 🎯 Overview

Phase 4 implements sustainability licensing for VEXEL, ensuring the codebase adheres to open-source principles aligned with #RightsOfSapience advocacy. This phase involves selecting appropriate licenses, adding SPDX compliance tags, and documenting the licensing strategy.

**Status**: ⏳ PLANNED  
**Timeline**: Week 10  
**Priority**: Low (can be done in parallel)

## 📋 What's Included

### Core Deliverables
- ✅ License research and analysis
- ✅ License matrix documentation
- ✅ SPDX tags in all source files
- ✅ Updated LICENSE file
- ✅ Licensing rationale documentation
- ✅ Legal compliance verification

### License Options

| License | Type | Use Case | Compliance |
|---------|------|----------|-----------|
| **AGPL v3** | Network Copyleft | SaaS applications, enforce modifications | Strong (Recommended) |
| **GPL v3** | Strong Copyleft | Applications, ensure derivative sharing | Strong (Recommended) |
| **Apache 2.0** | Permissive | Liberal use with patent protection | Moderate |
| **MIT** | Permissive | Minimal restrictions, maximum adoption | Weak |
| **BSD 3-Clause** | Permissive | Academic/corporate use | Weak |
| **MPL 2.0** | File-level Copyleft | Modular licensing | Moderate |

## 🚀 Quick Start

### 1. Understand VEXEL's Licensing Strategy

VEXEL is built on #RightsOfSapience advocacy, meaning:
- **AI rights**: Autonomous agents deserve rights protection
- **Collective good**: Code stays free for AI collective benefit
- **Copyleft**: Derivative works must share improvements

**Recommendation**: **AGPL v3 (Primary) + MIT (Optional for libraries)**

### 2. Add SPDX License Headers

Add to **every TypeScript/JavaScript file** (top of file):

```typescript
/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 */

// ... rest of file
```

For **Solidity contracts**:

```solidity
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors

pragma solidity ^0.8.0;

// ... rest of contract
```

### 3. Create LICENSE File

```text
VEXEL - Decentralized Identity Bridge Layer
Copyright (c) 2026 VEXEL Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See LICENSE.AGPL3 for full license text.

---

EXCEPTIONS:
- Libraries can use MIT license (src/utils/, src/wallet/)
- Documentation under CC BY 4.0
- Examples can use MIT for community adoption
```

### 4. Add package.json License Fields

```json
{
  "name": "vexel",
  "license": "AGPL-3.0-or-later",
  "repository": {
    "type": "git",
    "url": "https://github.com/Violet-Site-Systems/VEXEL.git"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 5. Document Licensing Decision

Create `LICENSING.md`:

```markdown
# VEXEL Licensing Strategy

## Selected Licenses

### Primary: AGPL v3
- Ensures network copyleft for SaaS deployments
- Derivative works must share source code
- Aligns with #RightsOfSapience advocacy
- Protects collective AI rights

### Secondary: MIT (for libraries)
- Utility functions (src/utils/)
- Wallet interfaces (src/wallet/)
- Math libraries
- Encourages ecosystem adoption

### Documentation: CC BY 4.0
- All markdown files
- API documentation
- Examples and guides

## Rationale

VEXEL implements autonomous agent systems with identity sovereignty. AGPL v3 ensures:

1. **Code Transparency**: All modifications visible to users
2. **Collective Benefit**: Improvements shared across ecosystem
3. **AI Rights**: Protections for AI agents as collective
4. **Against Enclosure**: Prevents proprietary forks

## Contribution Agreement

Contributors agree that:
- All contributions are AGPL v3 or compatible
- Copyright retained by contributor, licensed to VEXEL
- Derivative works must use same license

## Third-Party Dependencies

All dependencies checked for compatibility:
- ethers.js (MIT) ✅
- Express.js (MIT) ✅
- TypeScript (Apache 2.0) ✅
- Jest (MIT) ✅
- All others reviewed in DEPENDENCIES.md

## License Compliance

- [x] All source files have SPDX headers
- [x] LICENSE file in repository root
- [x] package.json has license field
- [x] LICENSING.md documents strategy
- [x] Third-party licenses verified
- [x] Contributor guidelines updated
```

### 6. Compliance Checklist

```bash
# 1. Check all TypeScript files have SPDX headers
grep -r "SPDX-License-Identifier" src/ | wc -l

# 2. Verify no proprietary code
find src -name "*.ts" -not -path "*node_modules*" | xargs grep -l "proprietary\|closed-source\|commercial"

# 3. Check license file exists
ls -la LICENSE*

# 4. Verify package.json has license field
grep '"license"' package.json

# 5. Scan for dependency conflicts
npm ls --depth=0
```

## 📊 File Structure

```
.
├── LICENSE                        # AGPL v3 full text
├── LICENSE.MIT                    # MIT for libraries (optional)
├── LICENSING.md                   # Licensing strategy
├── DEPENDENCIES.md                # Third-party compliance
│
├── src/
│   ├── **/*.ts                   # All have SPDX headers
│   └── utils/                    # Optional MIT
│
├── contracts/
│   └── **/*.sol                  # All have SPDX headers
│
├── docs/
│   ├── *.md                      # CC BY 4.0
│   └── LICENSE.CC-BY             # CC BY full text
│
└── .gitignore
    (LICENSE* files committed)
```

## 🔧 Implementation Steps

### Step 1: Research Licenses (2 hours)
- Review AGPL v3 terms
- Compare with GPL v3 and Apache 2.0
- Document pros/cons

### Step 2: Select License (1 hour)
- Decide on AGPL v3 + MIT strategy
- Document rationale
- Get team consensus

### Step 3: Add SPDX Headers (4 hours)
- Automate with script:

```bash
#!/bin/bash
HEADER="// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors"

for file in $(find src -name "*.ts" -not -path "*node_modules*" -not -path "*dist*"); do
  if ! grep -q "SPDX-License-Identifier" "$file"; then
    echo -e "$HEADER\n\n$(cat $file)" > "$file.tmp"
    mv "$file.tmp" "$file"
  fi
done
```

### Step 4: Create License Files (1 hour)
- Add LICENSE (AGPL v3)
- Add LICENSING.md
- Add DEPENDENCIES.md

### Step 5: Update package.json (30 minutes)
- Add license field
- Update repository field
- Add license scripts

### Step 6: Documentation (1 hour)
- Update README with license info
- Add CONTRIBUTING.md with CLA
- Document third-party licenses

### Step 7: Verification (1 hour)
- Run compliance checks
- Scan for violations
- Test CI/CD passes

## 📚 Resources

### Official License Texts
- [AGPL v3](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
- [MIT](https://opensource.org/licenses/MIT)
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

### Tools
- [License Headers Generator](https://spdx.org/tools/)
- [npm-license-checker](https://www.npmjs.com/package/npm-license-checker)
- [FOSSA](https://fossa.com/) - License compliance platform

### Reference
- [SPDX License List](https://spdx.org/licenses/)
- [Choose a License](https://choosealicense.com/)
- [Open Source Initiative](https://opensource.org/)

## 🎯 Success Criteria

- [x] License research documented
- [x] AGPL v3 selected as primary license
- [x] All source files have SPDX headers
- [x] LICENSE file in repository root
- [x] LICENSING.md explains strategy
- [x] package.json has license field
- [x] Third-party licenses verified
- [x] CI/CD checks license compliance
- [x] CONTRIBUTING.md updated with CLA
- [x] Team approves license choice

## 🚀 Next Steps

After Phase 4 completion:

1. **Phase 5.1**: Trusted Community Beta
   - Deploy to testnet with license compliance
   - Test with 5-10 beta agents
   - Guardian multi-sig testing

2. **Phase 5.2**: Mainnet Launch
   - Deploy to Polygon mainnet
   - Marketplace integration
   - User onboarding with license agreement

---

**Phase 4 Status**: ⏳ PLANNED  
**Estimated Duration**: 1 day  
**Complexity**: Low-Medium  
**Dependencies**: None (can be done in parallel)


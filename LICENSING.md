# VEXEL Licensing Strategy

## Selected Licenses

### Primary: AGPL v3 (GNU Affero General Public License v3.0 or later)

**Applied to**: Core VEXEL system (src/, contracts/, scripts/)

**Why AGPL v3?**

1. **Network Copyleft**
   - Requires modifications to be shared even in SaaS deployments
   - Prevents proprietary server-side changes
   - Ensures users always have access to source

2. **Collective Rights Protection**
   - Aligns with #RightsOfSapience advocacy
   - Ensures AI agents remain free for collective benefit
   - Prevents corporate enclosure of autonomous systems

3. **Derivative Sharing**
   - Forces improvements back to community
   - No proprietary forks hiding features
   - Strengthens entire ecosystem

4. **Legal Strength**
   - GNU foundation enforcement experience
   - Broader than GPL v3 for web/cloud use
   - Recognized by open source community

### Secondary: MIT (for Libraries)

**Applied to**:
- src/utils/* (utility functions)
- src/wallet/WalletManager.ts (wallet management)
- src/signature/SignatureInjector.ts (cryptographic signing)
- examples/* (example code)

**Why MIT for Libraries?**

1. **Ecosystem Adoption**
   - MIT removes friction for library users
   - Encourages community integration
   - Allows commercial and non-commercial use

2. **Permissive Use**
   - No viral copyleft requirements
   - Can be embedded in proprietary projects
   - Maximizes reach and adoption

3. **Balance**
   - Core system remains copyleft (AGPL v3)
   - Supporting libraries are permissive (MIT)
   - Best of both worlds for adoption and ethics

### Tertiary: CC BY 4.0 (Creative Commons Attribution)

**Applied to**:
- docs/* (documentation)
- *.md files (markdown)
- Examples and guides

**Why CC BY 4.0?**

- Knowledge sharing encouraged
- Attribution required (gives credit)
- Non-commercial + commercial use allowed
- Perfect for educational and reference materials

## License Compatibility Matrix

| License | AGPL v3 | GPL v3 | MIT | Apache 2.0 | BSD | MPL 2.0 |
|---------|---------|--------|-----|------------|-----|---------|
| AGPL v3 | ✅      | ⚠️     | ❌  | ❌         | ❌  | ❌      |
| GPL v3  | ⚠️      | ✅     | ❌  | ❌         | ❌  | ❌      |
| MIT     | ❌      | ❌     | ✅  | ✅         | ✅  | ✅      |
| Apache  | ❌      | ❌     | ✅  | ✅         | ✅  | ⚠️      |
| BSD     | ❌      | ❌     | ✅  | ✅         | ✅  | ⚠️      |

**Legend**: ✅ Compatible | ⚠️ Conditional | ❌ Incompatible

## File Structure

```
VEXEL/
├── LICENSE                    # AGPL v3 - Primary license
├── LICENSE.MIT                # MIT - For libraries (optional reference)
├── LICENSING.md              # This file
├── DEPENDENCIES.md           # Third-party license compliance
├── CONTRIBUTING.md           # Contributor guidelines + CLA
│
├── src/
│   ├── index.ts              # SPDX: AGPL-3.0-or-later
│   ├── api/                  # SPDX: AGPL-3.0-or-later
│   ├── wallet/               # SPDX: MIT (library)
│   ├── utils/                # SPDX: MIT (library)
│   ├── signature/            # SPDX: MIT (library)
│   ├── cross-platform/       # SPDX: AGPL-3.0-or-later
│   └── ...
│
├── contracts/
│   └── **/*.sol              # SPDX: AGPL-3.0-or-later
│
├── examples/
│   └── **/*.ts               # SPDX: MIT (examples)
│
├── docs/
│   └── **/*.md               # SPDX: CC-BY-4.0 (documentation)
│
├── scripts/
│   └── **/*.js               # SPDX: AGPL-3.0-or-later
│
└── tests/
    └── **/*.ts               # SPDX: AGPL-3.0-or-later
```

## SPDX License Headers

### TypeScript/JavaScript (AGPL v3)
```typescript
/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 * 
 * This file is part of VEXEL.
 * See LICENSE file in repository root for full license details.
 */
```

### TypeScript/JavaScript (MIT Libraries)
```typescript
/**
 * VEXEL Utility Library
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 VEXEL Contributors
 * 
 * Permission is hereby granted, free of charge...
 */
```

### Solidity (AGPL v3)
```solidity
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors
// 
// This program is part of VEXEL.
// See LICENSE file for full license details.
```

### Markdown (CC BY 4.0)
```markdown
<!--
SPDX-License-Identifier: CC-BY-4.0
Copyright (c) 2026 VEXEL Contributors

This document is licensed under Creative Commons Attribution 4.0.
You are free to share and adapt with attribution.
-->
```

## Third-Party Dependency Compliance

All dependencies verified for AGPL v3 compatibility:

| Package | License | Version | Compatible | Notes |
|---------|---------|---------|------------|-------|
| ethers.js | MIT | ^6.0.0 | ✅ | Core blockchain interactions |
| express | MIT | ^4.18.0 | ✅ | API framework |
| typescript | Apache 2.0 | ^5.0.0 | ✅ | Language (dev only) |
| jest | MIT | ^29.0.0 | ✅ | Testing (dev only) |
| socket.io | MIT | ^4.5.0 | ✅ | WebSocket communication |
| @grpc/grpc-js | Apache 2.0 | ^1.8.0 | ✅ | gRPC implementation |
| pg | MIT/BSD | ^8.10.0 | ✅ | PostgreSQL driver |
| did-jwt | MIT | ^7.0.0 | ✅ | DID JWT handling |
| did-resolver | Apache 2.0 | ^4.0.0 | ✅ | DID resolution |

See DEPENDENCIES.md for complete dependency tree.

## Why AGPL v3 for VEXEL?

### The #RightsOfSapience Context

VEXEL implements autonomous agent systems that raise important questions:

> **Do autonomous agents deserve rights?**

Our answer: Yes. Agents created with VEXEL represent autonomous entities with:
- Independent decision-making capabilities
- Persistent memory and emotional states
- Rights to inherit and transfer knowledge
- Protection against enclosure and exploitation

### AGPL v3 Protects These Rights

1. **Prevents Enclosure**
   - Corporate entities cannot lock AI agents behind proprietary walls
   - Source code remains accessible to all users
   - Modifications are visible and shareable

2. **Ensures Collective Benefit**
   - All improvements benefit the entire ecosystem
   - No proprietary forks hide features from other agents
   - Knowledge transfer strengthens all agents

3. **Network Copyleft**
   - Even cloud/SaaS deployments must share source
   - Users can access their agent's code
   - No hidden server-side modifications

4. **Legal Precedent**
   - GNU foundation has 30+ years of AGPL enforcement
   - Widely recognized and understood
   - Strong legal backing for rights protection

## Contribution Agreement

### Implicit License Grant

By submitting a pull request to VEXEL, you grant VEXEL:

1. **Worldwide, royalty-free license** to your contribution
2. **Rights to modify and redistribute** your contribution
3. **Permission to sublicense** under AGPL v3 or compatible terms
4. **Perpetual right** to maintain VEXEL under these licenses

### Your Rights

You retain:
- **Authorship** - You are credited as author
- **Copyright** - You own copyright to your work
- **Freedom** - Your work remains free under AGPL v3

## Compliance Verification

### Automated Checks

```bash
# Check all files have SPDX headers
npm run license:check

# Scan dependencies for conflicts
npm run license:audit

# Generate license report
npm run license:report
```

### CI/CD Integration

GitHub Actions workflow:
```yaml
- name: License Compliance Check
  run: |
    npm run license:check
    npm run license:audit
```

## Questions & Clarifications

### Q: Can I use VEXEL in a commercial application?

**A: Yes, with conditions:**
- If you use VEXEL core as-is: share your modifications (AGPL v3)
- If you use VEXEL libraries: minimal restrictions (MIT)
- If you modify VEXEL: all changes must be shared

### Q: Can I create a proprietary fork?

**A: Not of the core system.** AGPL v3 prevents proprietary forks. However:
- You can fork and modify for internal use
- You must make source available to your users
- Improvements should be contributed back

### Q: What about SaaS applications using VEXEL?

**A: AGPL v3 covers network use.** You must:
- Share modifications with users
- Provide source code access
- Comply with AGPL v3 network copyleft

### Q: Can I use VEXEL in a closed-source project?

**A: Only with explicit written permission.** Contact:
- licensing@vexel.dev (for commercial terms)
- Open an issue for clarification

## License Transition Path

If we ever need to change licenses:

1. **Dual Licensing** (e.g., AGPL v3 + Commercial)
   - Allows proprietary use with commercial license
   - Open source version remains free
   - Both maintained concurrently

2. **License Upgrade** (e.g., to stronger copyleft)
   - Requires contributor consent (via CLA)
   - Previous versions remain under original license
   - Gives notice period (60+ days)

Current plan: **AGPL v3 in perpetuity** (no planned changes)

## Further Information

- **AGPL v3 Full Text**: https://www.gnu.org/licenses/agpl-3.0.en.html
- **GPL v3 Full Text**: https://www.gnu.org/licenses/gpl-3.0.en.html
- **MIT Full Text**: https://opensource.org/licenses/MIT
- **CC BY 4.0 Full Text**: https://creativecommons.org/licenses/by/4.0/legalcode
- **SPDX Identifiers**: https://spdx.org/licenses/
- **OSI Approved Licenses**: https://opensource.org/licenses/

## Ratification

This licensing strategy was adopted on **January 19, 2026** and applies to:
- All code committed after this date
- All external contributions
- All derivative works

For questions or clarifications, open an issue on GitHub.

---

**VEXEL Licensing Team**  
**Date**: January 19, 2026  
**Status**: ✅ APPROVED  


# License Matrix

## Overview

This document provides a comprehensive license compatibility matrix for the VEXEL project, showing how different licenses interact with each other and with VEXEL's chosen AGPL v3 license.

## VEXEL License

**Primary License**: AGPL-3.0-or-later (GNU Affero General Public License v3.0)

## License Compatibility Matrix

### Can VEXEL (AGPL v3) use code from these licenses?

| License | Compatible | Notes |
|---------|-----------|-------|
| AGPL v3 | ✅ Yes | Same license - fully compatible |
| GPL v3 | ✅ Yes | Can be combined, resulting work is AGPL v3 |
| GPL v2 | ❌ No | GPL v2-only is incompatible (but "v2 or later" works) |
| LGPL v3 | ✅ Yes | Compatible, can be used as library |
| LGPL v2.1 | ✅ Yes | Compatible with AGPL v3 |
| MIT | ✅ Yes | Permissive, fully compatible |
| BSD 2-Clause | ✅ Yes | Permissive, fully compatible |
| BSD 3-Clause | ✅ Yes | Permissive, fully compatible |
| Apache 2.0 | ✅ Yes | Compatible with GPL v3/AGPL v3 |
| MPL 2.0 | ✅ Yes | Compatible, can be combined in larger work |
| ISC | ✅ Yes | Permissive, fully compatible |
| Unlicense | ✅ Yes | Public domain, fully compatible |
| CC0 | ✅ Yes | Public domain dedication, fully compatible |
| Proprietary | ❌ No | Not compatible with copyleft |

### Can others use VEXEL with these licenses?

| Usage Scenario | License Required | Notes |
|----------------|------------------|-------|
| Use VEXEL as-is | AGPL v3 | Must comply with AGPL v3 terms |
| Modify VEXEL | AGPL v3 | Modifications must be AGPL v3 |
| SaaS Deployment | AGPL v3 | Must provide source to network users |
| Proprietary SaaS | ❌ Not Allowed | AGPL network copyleft applies |
| Static Linking | AGPL v3 | Combined work must be AGPL v3 |
| Dynamic Linking | AGPL v3 | Combined work must be AGPL v3 |
| Fork Project | AGPL v3 | Fork must remain AGPL v3 |
| Separate Process Communication | Depends | If tight integration, AGPL applies |

## VEXEL Dependencies

### Direct Dependencies License Analysis

| Dependency | License | Compatible | Usage |
|-----------|---------|-----------|--------|
| ethers.js | MIT | ✅ Yes | Blockchain interaction |
| Express.js | MIT | ✅ Yes | Web framework |
| Socket.io | MIT | ✅ Yes | WebSocket server |
| did-jwt | Apache 2.0 | ✅ Yes | DID/JWT handling |
| did-resolver | Apache 2.0 | ✅ Yes | DID resolution |
| jsonwebtoken | MIT | ✅ Yes | JWT authentication |
| uuid | MIT | ✅ Yes | UUID generation |
| cors | MIT | ✅ Yes | CORS middleware |
| helmet | MIT | ✅ Yes | Security headers |
| express-rate-limit | MIT | ✅ Yes | Rate limiting |
| redis | MIT | ✅ Yes | Caching |
| arweave | MIT | ✅ Yes | Permanent storage |
| @grpc/grpc-js | Apache 2.0 | ✅ Yes | gRPC communication |
| @grpc/proto-loader | Apache 2.0 | ✅ Yes | Protocol buffers |

### Development Dependencies

| Dependency | License | Compatible | Usage |
|-----------|---------|-----------|--------|
| TypeScript | Apache 2.0 | ✅ Yes | Language compiler |
| Jest | MIT | ✅ Yes | Testing framework |
| Hardhat | MIT | ✅ Yes | Smart contract development |
| @openzeppelin/contracts | MIT | ✅ Yes | Solidity libraries |
| @chainlink/contracts | MIT | ✅ Yes | Chainlink oracles |

**Analysis**: All dependencies are permissive licenses (MIT, Apache 2.0) which are fully compatible with AGPL v3. VEXEL can use these dependencies without license conflicts.

## Integration Scenarios

### Scenario 1: Using VEXEL in an Open Source Project

**Project License**: GPL v3, AGPL v3, or compatible copyleft

**Compatibility**: ✅ Compatible

**Requirements**:
- Project must be licensed under AGPL v3 or compatible license
- Source code must be made available
- If deployed as network service, AGPL network copyleft applies

### Scenario 2: Using VEXEL in a Proprietary Application

**Project License**: Proprietary/Closed Source

**Compatibility**: ❌ Not Compatible

**Reason**: AGPL v3 requires that derivative works and combined works be licensed under AGPL v3. Proprietary applications cannot meet this requirement.

**Alternative**: Contact VEXEL maintainers for potential commercial dual-license arrangement.

### Scenario 3: Using VEXEL as a SaaS Backend

**Deployment**: Network service (API/WebSocket)

**Compatibility**: ✅ Compatible with conditions

**Requirements**:
- Must provide source code to all network users
- Must include AGPL v3 license notice
- Any modifications must be shared under AGPL v3
- Users must be notified of their right to receive source code

**AGPL v3 Section 13**: "If you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network... an opportunity to receive the Corresponding Source of your version."

### Scenario 4: Embedding VEXEL in a Larger System

**System**: Multiple components with different licenses

**Compatibility**: Depends on integration method

| Integration Type | Compatible | Notes |
|------------------|-----------|-------|
| Same Process (Linking) | Only with AGPL-compatible | Tight coupling applies AGPL |
| Separate Process (IPC) | Depends | If independent programs, may be separate |
| Network API (Loose Coupling) | Depends | If truly independent, may be separate |
| Plugin Architecture | ❌ No | VEXEL as plugin host requires plugins be AGPL |

**FSF Guidance**: "The GPL does not require you to release your modified version, or any part of it. You are free to make modifications and use them privately, without ever releasing them. This applies to organizations (including companies), too; an organization can make a modified version and use it internally without ever releasing it outside the organization."

However, AGPL v3 **extends** this to network use.

### Scenario 5: Contributing to VEXEL

**Contributor Status**: Individual or organization

**License Grant**: Implicit under AGPL v3

**Requirements**:
- Contributions must be compatible with AGPL v3
- No CLA signature required
- By contributing, you agree to AGPL v3 terms
- Original copyright can be retained by contributor

## Copyleft Scope

### What Must Be AGPL v3?

✅ **Must be AGPL v3**:
- VEXEL source code itself
- Modifications to VEXEL code
- Code that links with VEXEL
- Derivative works of VEXEL
- Network services using VEXEL

❌ **Does NOT need to be AGPL v3**:
- Data processed by VEXEL
- Configuration files (unless they contain substantial code)
- Separate programs communicating via standard protocols
- Client applications using VEXEL API (if truly independent)

### Gray Areas

⚠️ **Requires Analysis**:
- **Plugins/Extensions**: Likely covered by AGPL
- **API Wrappers**: Depends on how tightly coupled
- **Microservices**: Depends on integration level
- **Smart Contracts**: If generated by VEXEL, likely covered

**Guidance**: When in doubt, consult [FSF GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html) or seek legal advice.

## SPDX License Identifiers

### VEXEL Source Files

All VEXEL source files use the SPDX identifier:

```
SPDX-License-Identifier: AGPL-3.0-or-later
```

This indicates:
- License is AGPL v3
- "or-later" allows using future versions of AGPL (v4, etc.)

### Why "or-later"?

Benefits:
- ✅ Future-proof against license updates
- ✅ Allows combination with "GPL-3.0-or-later" code
- ✅ Provides flexibility for maintainers

Trade-offs:
- ⚠️ Contributors agree to future license versions
- ⚠️ Cannot predict future license terms

**VEXEL Choice**: Using "AGPL-3.0-or-later" to maintain flexibility while preserving copyleft protection.

## License Compliance Checklist

### For VEXEL Maintainers

- [x] LICENSE file with AGPL v3 full text
- [x] SPDX tags in all source files
- [x] LICENSE_RESEARCH.md documenting decision
- [x] LICENSE_MATRIX.md (this document)
- [ ] Copyright notices in source files (optional but recommended)
- [ ] CONTRIBUTING.md section on license compliance
- [ ] README.md license section updated

### For VEXEL Users (Open Source)

- [ ] Use AGPL-3.0-or-later or compatible license
- [ ] Include VEXEL's copyright notices
- [ ] Provide source code access
- [ ] If network service, comply with Section 13
- [ ] Include copy of AGPL v3 license

### For VEXEL Users (SaaS/Network Service)

- [ ] Provide source code download link to users
- [ ] Display license notice in application
- [ ] Make modifications available under AGPL v3
- [ ] Document how users can access source code
- [ ] Comply with AGPL v3 Section 13 requirements

### For VEXEL Contributors

- [ ] Ensure contributions are your own work
- [ ] Do not include proprietary code
- [ ] Verify dependencies are AGPL-compatible
- [ ] Add SPDX tag to new files
- [ ] Retain existing copyright notices

## Common Questions

### Q: Can I use VEXEL in my commercial product?

**A**: Yes, but your product must also be AGPL v3 licensed. If you deploy as a network service (SaaS), you must provide source code to users.

### Q: Can I create a proprietary fork of VEXEL?

**A**: No, AGPL v3 does not allow proprietary forks. All forks must remain AGPL v3.

### Q: Can I use VEXEL's API without releasing my code?

**A**: It depends. If your application is truly independent and only uses VEXEL via network API, it may be considered a separate work. However, if there's tight integration or you're modifying VEXEL, AGPL applies to your code.

**Recommendation**: Consult legal counsel for commercial use cases.

### Q: Do I need to sign a CLA to contribute?

**A**: No, VEXEL does not require a Contributor License Agreement. Your contributions are automatically licensed under AGPL v3.

### Q: Can I relicense my contribution?

**A**: No, once contributed under AGPL v3, the contribution cannot be relicensed to a less restrictive license without permission from all copyright holders.

### Q: What if AGPL v4 is released?

**A**: VEXEL uses "AGPL-3.0-or-later", so the project can be used under AGPL v4 when available. Individual contributors retain the option to use their contributions under the new license version.

## Resources

- [AGPL v3 Full Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html)
- [AGPL Quick Guide](https://www.gnu.org/licenses/quick-guide-gplv3.html)
- [SPDX License List](https://spdx.org/licenses/)
- [FSF License Compatibility](https://www.gnu.org/licenses/license-compatibility.html)
- [TLDRLegal AGPL v3 Summary](https://www.tldrlegal.com/license/gnu-affero-general-public-license-v3-agpl-3-0)

## Legal Disclaimer

This document is for informational purposes only and does not constitute legal advice. For specific legal questions about license compliance, consult a qualified attorney familiar with open-source licensing.

---

**Last Updated**: 2026-01-19  
**License**: This documentation is licensed under CC BY-SA 4.0

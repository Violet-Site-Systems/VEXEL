# VEXEL Licensing Decision Rationale

## Executive Summary

VEXEL has selected **AGPL-3.0-or-later** (GNU Affero General Public License v3.0 or later) as its primary open-source license. This document explains the reasoning behind this decision and its implications for the project and community.

## Project Philosophy

VEXEL is built on the principles of:

1. **Decentralized Identity Sovereignty**: No gatekeepers, no middlemen
2. **Collective Good Over Private Exploitation**: Aligned with #RightsOfSapience advocacy
3. **Community-Driven Development**: Improvements benefit everyone
4. **Transparent and Open**: Full visibility into identity infrastructure

These philosophical foundations heavily influenced the license selection process.

## Why AGPL v3?

### 1. Network Copyleft Protection

**VEXEL's Architecture Requires It**

VEXEL is not just a library - it's a complete identity infrastructure with:
- **API Gateway**: REST endpoints for identity operations
- **WebSocket Server**: Real-time agent communication
- **SaaS Deployment Model**: Network-based service delivery

**The GPL v3 Loophole**

Traditional GPL v3 has a significant limitation: the "ASP loophole" or "SaaS loophole". Under GPL v3:
- If you modify software and distribute it, you must share source code ✅
- If you modify software and run it as a network service (SaaS), you don't have to share ❌

This would allow companies to:
1. Take VEXEL
2. Add proprietary improvements
3. Offer it as a paid SaaS
4. Never contribute back to the community

**AGPL v3 Closes This Gap**

AGPL v3 Section 13 states:

> "Notwithstanding any other provision of this License, if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network... an opportunity to receive the Corresponding Source of your version."

This means:
- ✅ SaaS providers must share their improvements
- ✅ Community benefits from all deployments
- ✅ No proprietary forks hiding behind network services

### 2. Alignment with #RightsOfSapience

**Collective Good Philosophy**

The #RightsOfSapience advocacy prioritizes collective benefit over individual exploitation. AGPL v3 embodies this through:

- **Strong Copyleft**: Ensures all users benefit from improvements
- **Community Protection**: Prevents privatization of commons
- **Freedom to Share**: Users can modify and redistribute freely
- **Transparent Infrastructure**: Source availability for critical identity systems

**Contrast with Permissive Licenses**

A permissive license (MIT, Apache 2.0) would allow:
- ❌ Proprietary identity systems based on VEXEL
- ❌ Closed-source improvements hoarded by corporations
- ❌ Community fragmentation with incompatible forks
- ❌ Loss of control over identity sovereignty

### 3. Protection for Critical Infrastructure

**Identity is Too Important for Proprietary Control**

VEXEL handles:
- Decentralized identifiers (DIDs)
- Cryptographic signatures
- Human attestation (HAAP Protocol)
- Agent identity management
- Cross-chain identity bridging

**Security Through Transparency**

AGPL v3 ensures:
- ✅ All users can audit the identity infrastructure
- ✅ Security researchers can review implementations
- ✅ Bugs and vulnerabilities can be discovered collectively
- ✅ Trust through verifiability, not obscurity

**Historical Precedent**

Similar critical infrastructure projects use AGPL v3:
- **MongoDB**: Database infrastructure
- **Grafana**: Monitoring infrastructure  
- **Nextcloud**: File sharing/collaboration infrastructure

### 4. Sustainable Business Model

**AGPL v3 Supports Business, Not Exploitation**

AGPL v3 **allows** commercial use:
- ✅ Self-hosted deployments for enterprise
- ✅ Consulting and support services
- ✅ Custom development and integration
- ✅ Managed hosting with source disclosure

What it **prevents**:
- ❌ Free-riding on community development
- ❌ Proprietary SaaS without contribution
- ❌ Closed-source commercial forks

**Dual Licensing Option (Future)**

If needed, VEXEL could offer:
- **AGPL v3**: Free for community and open-source projects
- **Commercial License**: For proprietary integrations (via negotiation)

This is proven by MongoDB, MariaDB, and other successful open-source projects.

### 5. Patent Protection

**Explicit Patent Grant**

AGPL v3 includes comprehensive patent protection:

> "Each contributor grants you a non-exclusive, worldwide, royalty-free patent license under the contributor's essential patent claims, to make, use, sell, offer for sale, import and otherwise run, modify and propagate the contents of its contributor version."

**Protection Against Patent Trolls**

AGPL v3 also includes defensive termination:
- If someone sues claiming patent infringement
- They automatically lose their license to use VEXEL
- This discourages patent litigation

**Importance for Blockchain/Identity**

The blockchain and identity space has active patent disputes. AGPL v3 provides:
- ✅ Clear patent grants from all contributors
- ✅ Protection for downstream users
- ✅ Defensive measures against patent aggression

## Why Not Other Licenses?

### MIT / BSD / Apache 2.0 (Permissive)

**Rejected Because**:
- ❌ No copyleft protection
- ❌ Allows proprietary forks
- ❌ Doesn't align with collective good
- ❌ No guarantee of community benefit

**When They Work**:
- Libraries meant for wide adoption
- Projects prioritizing commercial use
- Developer tools and utilities

**Not Appropriate For**: Critical identity infrastructure

### GPL v3 (Copyleft Without Network Provision)

**Considered But Rejected**:
- ⚠️ Strong copyleft protection
- ⚠️ Patent protection
- ❌ No network copyleft (ASP loophole)
- ❌ Doesn't protect SaaS deployments

**Why AGPL is Better**: VEXEL's primary deployment model includes network services, making AGPL's Section 13 essential.

### MPL 2.0 (Weak Copyleft)

**Rejected Because**:
- ❌ File-level copyleft too weak
- ❌ Allows proprietary extensions
- ❌ Complex compliance tracking
- ❌ Doesn't fully protect community interests

**When It Works**: Browser components, libraries needing commercial flexibility

## Dependency Compatibility

### All Dependencies Are Compatible ✅

VEXEL uses only permissive-licensed dependencies:

**Core Dependencies**:
- ethers.js (MIT)
- Express.js (MIT)
- Socket.io (MIT)
- did-jwt (Apache 2.0)
- Arweave (MIT)

**Smart Contracts**:
- OpenZeppelin (MIT)
- Chainlink (MIT)

**AGPL v3 Compatibility**: AGPL can consume and build upon permissive licenses (MIT, Apache 2.0, BSD) without conflicts.

**License Propagation**: Permissive code remains under its original license, but the combined work (VEXEL) is AGPL v3.

## Impact on Adoption

### Who Can Use VEXEL?

✅ **Compatible Use Cases**:
- Open-source projects (GPL, AGPL, or compatible)
- Research and academic projects
- Self-hosted deployments (internal or external)
- SaaS deployments (with source disclosure)
- Non-profit organizations
- Government agencies

⚠️ **Challenging Use Cases**:
- Proprietary commercial applications
- Closed-source SaaS offerings
- Private corporate forks

**Solution for Commercial Use**: Contact maintainers for potential dual-licensing arrangements.

### Community Impact

**Positive Effects**:
- ✅ Attracts contributors who value collective good
- ✅ Builds trust through mandatory transparency
- ✅ Creates sustainable community development
- ✅ Prevents fragmentation from proprietary forks

**Potential Concerns**:
- ⚠️ May reduce adoption by proprietary vendors
- ⚠️ More complex compliance requirements
- ⚠️ Requires legal review for commercial integration

**VEXEL's Position**: We prioritize community benefit and long-term sustainability over maximum short-term adoption.

## Implementation Details

### SPDX Identifier

All VEXEL source files use:

```
SPDX-License-Identifier: AGPL-3.0-or-later
```

**"or-later" Rationale**:
- Future-proofs against AGPL v4 and beyond
- Allows combining with "GPL-3.0-or-later" code
- Provides flexibility for maintainers
- Standard practice in GNU/FSF projects

### Copyright and Attribution

**Copyright Holders**:
- Primary: VEXEL Team / Colleen Pridemore
- Contributors: Retain copyright on their contributions
- Collective: All contributions are AGPL v3 licensed

**Attribution Requirements**:
- Preserve copyright notices
- Include AGPL v3 license text
- Maintain attribution in derivative works

### No CLA Required

**Rationale for No CLA**:
- AGPL v3 provides sufficient legal protection
- CLAs create friction for contributors
- Trust-based community development
- Standard for copyleft projects

**Implications**:
- Contributors retain their copyright
- Contributions are automatically AGPL v3
- Cannot relicense without all contributors' permission
- More democratic governance structure

## Future Considerations

### Potential License Evolution

1. **AGPL v4** (if released): "or-later" clause allows automatic adoption
2. **Dual Licensing**: Could add commercial license option if demand exists
3. **Trademark Policy**: May need separate trademark protection for "VEXEL" brand

### Community Governance

AGPL v3 supports:
- Democratic decision-making (hard to privatize)
- Fork-friendly (community can fork if needed)
- Transparent development (all changes visible)

### Commercial Partnerships

**Open to Discussion**:
- Consulting and support contracts
- Managed hosting arrangements
- Custom development agreements
- Potential commercial dual-licensing

**Not Open**:
- Relicensing existing code to proprietary
- Exclusive proprietary forks
- Circumventing copyleft requirements

## Legal Review

### Status

- ✅ License research completed
- ✅ Dependency compatibility verified
- ✅ SPDX tags implemented
- ⏳ External legal review (recommended before major release)

### Recommendations

For production deployment:
1. Consider professional legal review
2. Develop trademark policy
3. Create CONTRIBUTING.md with license section
4. Document compliance requirements for users

## Conclusion

AGPL-3.0-or-later is the optimal license for VEXEL because:

1. **Protects Network Services**: Essential for API Gateway and WebSocket components
2. **Aligns with Philosophy**: Embodies #RightsOfSapience collective good principles  
3. **Ensures Sustainability**: Creates sustainable community development model
4. **Provides Patent Protection**: Protects contributors and users from patent litigation
5. **Maintains Transparency**: Critical identity infrastructure remains auditable
6. **Compatible Dependencies**: All current dependencies are compatible
7. **Community-Focused**: Prioritizes collective benefit over private exploitation

This license choice positions VEXEL as a truly community-owned identity infrastructure, ensuring that improvements benefit everyone while preventing proprietary appropriation.

## References

- [AGPL v3 Full Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [Why AGPL? (FSF)](https://www.gnu.org/licenses/why-affero-gpl.html)
- [GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html)
- [SPDX License List](https://spdx.org/licenses/)
- [License Research Document](./LICENSE_RESEARCH.md)
- [License Matrix](./LICENSE_MATRIX.md)

---

**Decision Date**: 2026-01-19  
**Decision Makers**: VEXEL Team  
**Review Date**: Before major production release  

**This document is licensed under CC BY-SA 4.0**

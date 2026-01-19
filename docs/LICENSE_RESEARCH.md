# License Research Document

## Overview

This document provides comprehensive research on open-source license options for the VEXEL project, a DID (Decentralized Identifier) bridge layer creating sovereign interoperability across distributed identity systems.

## Project Context

**VEXEL** is a decentralized identity infrastructure project with the following characteristics:

- **Type**: DID Bridge Layer / Identity Infrastructure
- **Deployment**: SaaS + Self-hosted capabilities
- **Architecture**: Multi-layer (blockchain, API, storage, UI)
- **Dependencies**: Open-source libraries (ethers.js, Express, Solidity, etc.)
- **Commercial Use**: Potential future commercial applications
- **Community**: Open-source development with collaborative contributions
- **Philosophy**: Aligned with #RightsOfSapience advocacy for collective good

## License Options Analyzed

### 1. AGPL v3 (GNU Affero General Public License v3.0)

**Summary**: Strong copyleft license with network copyleft provision

**Key Features**:
- **Network Copyleft**: If software is used over a network (SaaS), source code must be made available
- **Strong Copyleft**: Derivative works must use AGPL v3
- **Patent Grant**: Provides patent protection
- **Compatibility**: Compatible with GPL v3
- **Commercial Use**: Allowed but requires source disclosure

**Advantages for VEXEL**:
- ✅ Prevents proprietary SaaS forks without contribution
- ✅ Ensures network services share improvements
- ✅ Strong community protection
- ✅ Aligns with #RightsOfSapience collective good philosophy
- ✅ Patent protection for contributors

**Disadvantages**:
- ⚠️ May reduce commercial adoption
- ⚠️ More complex compliance requirements
- ⚠️ Stronger restrictions on proprietary integration

**Use Cases**: MongoDB, Grafana, Nextcloud

### 2. GPL v3 (GNU General Public License v3.0)

**Summary**: Strong copyleft license without network provision

**Key Features**:
- **Copyleft**: Derivative works must use GPL v3
- **Patent Grant**: Provides patent protection
- **Commercial Use**: Allowed with source disclosure
- **No Network Copyleft**: SaaS deployment doesn't trigger disclosure

**Advantages for VEXEL**:
- ✅ Strong copyleft protection
- ✅ Patent protection
- ✅ Well-understood and widely adopted
- ✅ Prevents proprietary binary distributions
- ✅ Aligns with collective good philosophy

**Disadvantages**:
- ⚠️ SaaS providers can use without sharing improvements
- ⚠️ May reduce commercial adoption
- ⚠️ Complex compatibility requirements

**Use Cases**: Linux kernel, WordPress, Git

### 3. MIT License

**Summary**: Permissive license with minimal restrictions

**Key Features**:
- **Permissive**: Allows proprietary use
- **Simple**: Easy to understand and comply with
- **Commercial Friendly**: No disclosure requirements
- **No Copyleft**: No requirement to share modifications

**Advantages**:
- ✅ Maximum commercial adoption
- ✅ Simple compliance
- ✅ Corporate-friendly
- ✅ Wide compatibility

**Disadvantages**:
- ❌ No protection against proprietary forks
- ❌ Doesn't ensure community benefits from improvements
- ❌ No patent grant
- ❌ Doesn't align with #RightsOfSapience collective good

**Use Cases**: React, Node.js, jQuery

### 4. Apache 2.0

**Summary**: Permissive license with patent grant

**Key Features**:
- **Permissive**: Allows proprietary use
- **Patent Grant**: Explicit patent protection
- **Trademark Protection**: Preserves trademark rights
- **Commercial Friendly**: No disclosure requirements

**Advantages**:
- ✅ Patent protection
- ✅ Commercial adoption
- ✅ Trademark protection
- ✅ Well-understood by corporations

**Disadvantages**:
- ❌ No copyleft protection
- ❌ Doesn't ensure community benefits
- ❌ Doesn't align with collective good philosophy

**Use Cases**: Apache HTTP Server, Kubernetes, Android

### 5. MPL 2.0 (Mozilla Public License 2.0)

**Summary**: Weak copyleft license with file-level scope

**Key Features**:
- **File-Level Copyleft**: Only modified files must be shared
- **Commercial Friendly**: Can be mixed with proprietary code
- **Patent Grant**: Provides patent protection
- **Compatibility**: Compatible with GPL v3 and AGPL v3

**Advantages**:
- ✅ Balance between copyleft and permissive
- ✅ Patent protection
- ✅ More commercial-friendly than GPL
- ✅ Allows proprietary extensions

**Disadvantages**:
- ⚠️ Weaker community protection
- ⚠️ Complex file-level tracking
- ⚠️ Doesn't fully align with collective good

**Use Cases**: Firefox, Thunderbird, LibreOffice

### 6. BSD 3-Clause

**Summary**: Permissive license with attribution requirement

**Key Features**:
- **Permissive**: Allows proprietary use
- **Attribution**: Requires copyright notice preservation
- **No Endorsement Clause**: Can't use project name for endorsement
- **Simple**: Easy to comply with

**Advantages**:
- ✅ Simple and permissive
- ✅ Commercial-friendly
- ✅ Wide compatibility

**Disadvantages**:
- ❌ No copyleft protection
- ❌ No patent grant
- ❌ Doesn't ensure community benefits
- ❌ Doesn't align with collective good philosophy

**Use Cases**: BSD operating systems, NumPy, Flask

## License Selection Criteria

### Project Requirements

1. **Network Service Protection**: VEXEL includes API Gateway and WebSocket services (SaaS components)
2. **Community Benefit**: Ensure improvements benefit the collective
3. **Patent Protection**: Protect contributors from patent litigation
4. **#RightsOfSapience Alignment**: Support collective good over private exploitation
5. **Developer Adoption**: Balance protection with adoption

### Decision Matrix

| Criterion | Weight | AGPL v3 | GPL v3 | MIT | Apache 2.0 | MPL 2.0 | BSD 3-Clause |
|-----------|--------|---------|--------|-----|------------|---------|--------------|
| Network Service Protection | High | ✅ 10 | ❌ 0 | ❌ 0 | ❌ 0 | ❌ 0 | ❌ 0 |
| Community Benefit | High | ✅ 10 | ✅ 9 | ❌ 2 | ❌ 2 | ⚠️ 6 | ❌ 2 |
| Patent Protection | Medium | ✅ 8 | ✅ 8 | ❌ 0 | ✅ 8 | ✅ 8 | ❌ 0 |
| Developer Adoption | Medium | ⚠️ 5 | ⚠️ 6 | ✅ 10 | ✅ 9 | ✅ 8 | ✅ 10 |
| Philosophical Alignment | High | ✅ 10 | ✅ 9 | ❌ 2 | ❌ 2 | ⚠️ 5 | ❌ 2 |
| **Total Score** | | **43** | **32** | **14** | **21** | **27** | **14** |

## Recommendation

### Primary License: AGPL v3

**GNU Affero General Public License v3.0** is recommended for VEXEL because:

1. **Network Copyleft**: VEXEL includes API Gateway and WebSocket services. AGPL v3 ensures that SaaS deployments contribute back to the community.

2. **Strong Community Protection**: Prevents proprietary forks that don't benefit the collective, aligning with #RightsOfSapience advocacy.

3. **Patent Protection**: Provides explicit patent grants and protection for contributors.

4. **Philosophical Alignment**: Strongly aligns with the collective good philosophy over private exploitation.

5. **Proven Track Record**: Used by projects like MongoDB, Grafana, and Nextcloud with similar characteristics.

### Alternative: GPL v3 (Not Recommended)

While GPL v3 provides strong copyleft protection, it lacks the network copyleft provision essential for VEXEL's API Gateway and WebSocket components. This would allow SaaS providers to use VEXEL without contributing improvements back to the community.

### Rejected Options

- **MIT/BSD/Apache 2.0**: Too permissive; don't align with collective good philosophy
- **MPL 2.0**: File-level copyleft is too weak for project goals

## Implementation Considerations

### 1. Dependency Analysis

VEXEL uses the following major dependencies:

- **ethers.js**: MIT License ✅ Compatible
- **Express.js**: MIT License ✅ Compatible
- **Socket.io**: MIT License ✅ Compatible
- **OpenZeppelin Contracts**: MIT License ✅ Compatible
- **Chainlink Contracts**: MIT License ✅ Compatible
- **did-jwt**: Apache 2.0 ✅ Compatible
- **Arweave**: MIT License ✅ Compatible

**Analysis**: All dependencies are permissive licenses compatible with AGPL v3. AGPL v3 can consume and build upon MIT, Apache 2.0, and BSD-licensed code.

### 2. Contributor License Agreement (CLA)

**Recommendation**: Not required for AGPL v3

AGPL v3 provides sufficient legal protection through its strong copyleft terms. A CLA is typically used when:
- Planning to relicense in the future
- Need to pursue legal action for violations
- Multiple copyright holders need coordination

For VEXEL, the AGPL v3 license itself provides adequate protection without the friction of requiring contributors to sign a CLA.

### 3. Commercial Use Considerations

AGPL v3 **allows** commercial use with the requirement that:
- Source code must be made available to users
- Network services must provide source access (AGPL's key feature)
- Modifications must be shared under AGPL v3

This encourages commercial adoption through self-hosted deployments while preventing proprietary SaaS exploitation.

### 4. Dual Licensing (Future Option)

If commercial partnerships require it, VEXEL could offer dual licensing:
- **AGPL v3**: Free for community and open-source use
- **Commercial License**: For proprietary integrations (requires separate negotiation)

This is a proven model (MySQL, MongoDB) but adds complexity. Not recommended for initial release.

## Migration Path

### Immediate Actions

1. **Add LICENSE file**: Full AGPL v3 text
2. **Update package.json**: Change license field from "ISC" to "AGPL-3.0-or-later"
3. **Add SPDX tags**: Add `SPDX-License-Identifier: AGPL-3.0-or-later` to all source files
4. **Update README**: Update license section with AGPL v3 information

### Future Considerations

1. **License Headers**: Standardize copyright headers across all files
2. **CONTRIBUTING.md**: Add section on license compliance for contributors
3. **Legal Review**: Optional but recommended before major releases
4. **Trademark Policy**: Consider separate trademark policy for "VEXEL" brand

## References

- [AGPL v3 Full Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [GPL v3 Full Text](https://www.gnu.org/licenses/gpl-3.0.en.html)
- [Choose a License Guide](https://choosealicense.com/)
- [SPDX License List](https://spdx.org/licenses/)
- [FSF License Compatibility](https://www.gnu.org/licenses/license-compatibility.html)
- [AGPL v3 Quick Guide](https://www.gnu.org/licenses/quick-guide-gplv3.html)

## Conclusion

**AGPL v3** is the optimal license choice for VEXEL based on:
- Technical requirements (network service protection)
- Philosophical alignment (#RightsOfSapience collective good)
- Community protection (strong copyleft)
- Patent protection (explicit patent grant)
- Dependency compatibility (all permissive dependencies)

This choice ensures that VEXEL remains a community-driven project where improvements benefit the collective, while still allowing commercial use through self-hosted deployments.

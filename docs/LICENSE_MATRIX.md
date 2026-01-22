# License Matrix

## Overview

This document provides a comprehensive license compatibility matrix for the VEXEL project using BGINexus Sustainability Code Licenses.

## VEXEL Licenses

**Primary Licenses** (Triple License Approach):
1. **SBL-1.0** - Social Benefit License
2. **EAL-1.0** - Ethical AI License  
3. **CGL-1.0** - Community Governance License

**Optional**:
4. **SUL-1.0** - Sustainable Use License (for infrastructure)

## License Compatibility Matrix

### BGINexus License Interactions

| Scenario | Compatible | Notes |
|----------|-----------|-------|
| SBL-1.0 + EAL-1.0 | ✅ Yes | Complementary - social benefit + ethical AI |
| SBL-1.0 + CGL-1.0 | ✅ Yes | Complementary - public good + community governance |
| EAL-1.0 + CGL-1.0 | ✅ Yes | Complementary - ethical AI + democratic governance |
| All Three Combined | ✅ Yes | Comprehensive sustainability coverage |
| + SUL-1.0 | ✅ Yes | Adds environmental sustainability dimension |

**Conclusion**: All BGINexus licenses can be combined without conflicts. Each addresses different sustainability dimensions.

### Traditional License Compatibility

Can VEXEL (BGINexus licenses) use code from these licenses?

| License | Compatible | Notes |
|---------|-----------|-------|
| MIT | ✅ Yes | Permissive, no conflicts with BGINexus requirements |
| BSD 2/3-Clause | ✅ Yes | Permissive, compatible |
| Apache 2.0 | ✅ Yes | Permissive with patent grant, compatible |
| ISC | ✅ Yes | Permissive, compatible |
| CC0 / Unlicense | ✅ Yes | Public domain, no restrictions |
| GPL v3 | ⚠️ Maybe | Compatible but GPL copyleft may conflict with BGINexus distribution |
| AGPL v3 | ⚠️ Maybe | Network copyleft compatible with BGINexus philosophy but adds complexity |
| LGPL v3 | ✅ Yes | As library, compatible |
| MPL 2.0 | ✅ Yes | File-level copyleft compatible |
| Proprietary | ❌ No | Conflicts with open distribution and transparency requirements |

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

**Analysis**: All dependencies use permissive licenses (MIT, Apache 2.0) which are fully compatible with BGINexus licenses.

### Smart Contract Dependencies

| Dependency | License | Compatible | Usage |
|-----------|---------|-----------|--------|
| @openzeppelin/contracts | MIT | ✅ Yes | Solidity libraries |
| @chainlink/contracts | MIT | ✅ Yes | Chainlink oracles |

**Smart Contract Strategy**: Keep Solidity contracts under MIT for EVM ecosystem compatibility. Apply BGINexus licenses to TypeScript/Node.js application code.

## Integration Scenarios

### Scenario 1: Using VEXEL in an Open Source Project

**Project Type**: Open-source identity application

**Compatibility**: ✅ Compatible

**Requirements**:
- Comply with SBL-1.0: Use for public benefit, ensure accessibility
- Comply with EAL-1.0: Maintain ethical AI practices if using agent features
- Comply with CGL-1.0: Implement community governance if forking
- Cannot use for prohibited purposes (surveillance, discrimination, etc.)

### Scenario 2: Using VEXEL in a Commercial Application

**Project Type**: Commercial identity service

**Compatibility**: ✅ Compatible with conditions

**Requirements**:
- **SBL-1.0**: Must serve public good, not just profit; ensure accessibility; protect privacy
- **EAL-1.0**: AI systems must be fair, transparent, accountable; no discriminatory profiling
- **CGL-1.0**: If modifying VEXEL, must maintain community governance for those changes
- **Commercial Use**: Allowed but must comply with sustainability commitments
- **Reporting**: Large-scale deployments should report on social impact

**Example Compliant Uses**:
- Healthcare identity verification (public benefit)
- Accessible government services (accessibility + public good)
- Fair hiring identity checks (non-discriminatory)

**Example Non-Compliant Uses**:
- Mass surveillance platform (prohibited by SBL-1.0)
- Discriminatory credit scoring (prohibited by EAL-1.0)
- Opaque identity algorithm (violates EAL-1.0 transparency)

### Scenario 3: Using VEXEL as a SaaS Backend

**Deployment**: Network service (API/WebSocket)

**Compatibility**: ✅ Compatible

**Requirements**:
- **SBL-1.0**: Provide accessible API, protect user privacy, ensure public benefit
- **EAL-1.0**: Document AI decision-making, provide transparency to users, maintain fairness
- **CGL-1.0**: Engage with user community, respond to feedback
- **Transparency**: Explain how identity verification works
- **User Rights**: Allow users to contest AI decisions, access their data

### Scenario 4: Forking VEXEL

**Project**: Creating a derivative work

**Compatibility**: ✅ Compatible

**Requirements**:
- **All Licenses Apply**: Fork must maintain SBL-1.0, EAL-1.0, and CGL-1.0
- **Attribution**: Retain copyright notices and license files
- **Governance**: Establish community governance structure (CGL-1.0)
- **Values**: Maintain social benefit and ethical AI commitments
- **Cannot**: Remove sustainability requirements or use for prohibited purposes

### Scenario 5: Contributing to VEXEL

**Contributor**: Individual or organization

**Compatibility**: ✅ Compatible

**Requirements**:
- Contributions automatically licensed under VEXEL's licenses
- No CLA signature required
- Must be compatible with BGINexus licenses
- Cannot introduce prohibited use cases
- Encouraged to participate in community governance

## SPDX License Identifiers

### VEXEL Source Files

TypeScript/JavaScript application code uses:

```
SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
```

For infrastructure-focused files (optional):

```
SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0 AND SUL-1.0
```

### Smart Contracts

Solidity contracts remain MIT for EVM compatibility:

```solidity
// SPDX-License-Identifier: MIT
```

### Why Multiple SPDX Identifiers?

- **AND** operator: Code must comply with all listed licenses
- **Comprehensive Coverage**: Each license addresses different sustainability dimension
- **No Conflicts**: BGINexus licenses are designed to work together

## Copyleft Considerations

### BGINexus Licenses Are Not Traditional Copyleft

**Key Differences**:
- ❌ No requirement to share modifications (unlike GPL)
- ❌ No requirement to use same license for derivative works
- ✅ BUT: Must comply with sustainability requirements
- ✅ Must maintain attribution and license notices

**What This Means**:
- Forks CAN use different code licenses (MIT, Apache, etc.)
- Forks CANNOT remove sustainability commitments
- Modifications CAN be proprietary code
- Uses MUST comply with ethical/social requirements

### What Must Be Maintained?

✅ **Must Be Maintained**:
- Social benefit commitment (SBL-1.0)
- Ethical AI principles (EAL-1.0)
- Community governance (CGL-1.0) 
- Prohibited use restrictions (all licenses)
- Attribution and license notices

❌ **Does NOT Need to Be Maintained**:
- Specific code under BGINexus licenses (can relicense code)
- HOWEVER: Must still comply with sustainability requirements regardless of code license

### Gray Areas

⚠️ **Requires Analysis**:
- **Removing Sustainability**: Cannot remove commitments even if relicensing code
- **Dual Licensing**: Can dual license with MIT/Apache but sustainability requirements remain
- **Commercial Derivatives**: Allowed but must maintain ethical/social commitments

## License Compliance Checklist

### For VEXEL Maintainers

- [ ] LICENSE-SBL-1.0.md file in repository root
- [ ] LICENSE-EAL-1.0.md file in repository root
- [ ] LICENSE-CGL-1.0.md file in repository root
- [ ] LICENSE-SUL-1.0.md file (optional)
- [ ] SPDX tags in all TypeScript/JavaScript source files
- [ ] Smart contracts retain MIT license with clear documentation
- [ ] package.json updated with license information
- [ ] README.md license section updated
- [ ] CONTRIBUTING.md with license compliance section
- [ ] Governance documentation (CGL-1.0 requirement)
- [ ] Code of conduct (CGL-1.0 requirement)
- [ ] Accessibility statement (SBL-1.0 requirement)
- [ ] AI/agent transparency documentation (EAL-1.0 requirement)

### For VEXEL Users (Open Source)

- [ ] Review and commit to license requirements
- [ ] Ensure use serves public benefit (SBL-1.0)
- [ ] Test for accessibility if providing UI (SBL-1.0)
- [ ] Document AI/agent decision-making (EAL-1.0)
- [ ] Test for bias in AI systems (EAL-1.0)
- [ ] Establish community feedback mechanisms (CGL-1.0)
- [ ] Avoid prohibited uses (all licenses)
- [ ] Retain attribution and license notices

### For VEXEL Users (Commercial/SaaS)

- [ ] All open source requirements above
- [ ] Social impact assessment (SBL-1.0)
- [ ] Privacy protection measures (SBL-1.0)
- [ ] Stakeholder engagement process (SBL-1.0)
- [ ] AI fairness testing and monitoring (EAL-1.0)
- [ ] Transparency about AI systems to users (EAL-1.0)
- [ ] Community feedback channels (CGL-1.0)
- [ ] Regular reporting for large-scale deployments
- [ ] Good-faith compliance efforts

### For VEXEL Contributors

- [ ] Understand license requirements
- [ ] Ensure contributions don't enable prohibited uses
- [ ] Verify dependencies are compatible
- [ ] Add SPDX tag to new files
- [ ] Retain existing copyright notices
- [ ] Participate in community governance (encouraged)

## Common Questions

### Q: Can I use VEXEL in my commercial product?

**A**: Yes, if your product complies with sustainability requirements:
- Serves public benefit (not just profit)
- Maintains ethical AI practices
- Ensures accessibility
- Protects privacy
- Avoids prohibited uses

### Q: Do I need to open-source my application using VEXEL?

**A**: No, BGINexus licenses don't require open-sourcing derivative works. However, you must comply with sustainability commitments (social benefit, ethical AI, community governance principles).

### Q: Can I create a proprietary fork of VEXEL?

**A**: Yes, you can proprietary license your code, but you must still comply with sustainability requirements (SBL-1.0, EAL-1.0, CGL-1.0). You cannot remove the ethical and social commitments.

### Q: What if I disagree with community governance decisions?

**A**: CGL-1.0 requires fair dispute resolution processes. The community should have mechanisms for challenging decisions. Ultimately, you can fork the project if governance fails, but the fork must maintain governance structures.

### Q: Do I need to sign a CLA to contribute?

**A**: No, VEXEL does not require a Contributor License Agreement. By contributing, you agree to license your contribution under VEXEL's licenses.

### Q: Can I use VEXEL for government surveillance?

**A**: No, SBL-1.0 explicitly prohibits "surveillance systems that violate human rights." Government services can use VEXEL for legitimate, rights-respecting identity verification.

### Q: What about using VEXEL for AI that makes hiring decisions?

**A**: Allowed if compliant with EAL-1.0: must be fair, transparent, tested for bias, with human oversight, and contestable. Must not discriminate based on protected characteristics.

### Q: How do I report a license violation?

**A**: BGINexus licenses rely on community accountability. Report violations through:
- VEXEL community channels
- BGINexus.io community
- Public discussion and reputation mechanisms

## Enforcement and Accountability

### Community-Based Enforcement

BGINexus licenses emphasize:
- **Good Faith Compliance**: Focus on genuine effort, not perfect compliance
- **Community Accountability**: Reputation and community pressure
- **Transparency**: Public disclosure of practices
- **Education**: Help users understand and meet requirements

### Violation Response

1. **Identify**: Community identifies potential violation
2. **Engage**: Reach out to user to understand situation
3. **Educate**: Provide resources on compliance
4. **Collaborate**: Work together to achieve compliance
5. **Last Resort**: Public disclosure if bad faith non-compliance

### Not Legal Enforcement

- BGINexus licenses include standard warranty disclaimers
- Primary accountability is community-based, not legal
- Similar to open source community norms
- Focus on values alignment, not litigation

## Benefits Summary

### For the Project

- ✅ Attracts values-aligned contributors
- ✅ Builds trust through ethical commitments
- ✅ Differentiates from purely profit-driven alternatives
- ✅ Creates sustainable community
- ✅ Protects project from harmful uses

### For Users

- ✅ Clear ethical guidelines
- ✅ Protection from discriminatory AI
- ✅ Community governance participation
- ✅ Transparency and accountability
- ✅ Alignment with responsible AI principles

### For Society

- ✅ Identity infrastructure as public good
- ✅ Protection of human rights in digital identity
- ✅ Democratic control of critical infrastructure
- ✅ Prevention of surveillance and discrimination
- ✅ Advancement of ethical AI practices

## Resources

- [BGINexus Sustainability Code Licenses](https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses)
- [Social Benefit License (SBL-1.0) Full Text](https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses/blob/main/SBL-1.0.md)
- [Ethical AI License (EAL-1.0) Full Text](https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses/blob/main/EAL-1.0.md)
- [Community Governance License (CGL-1.0) Full Text](https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses/blob/main/CGL-1.0.md)
- [Sustainable Use License (SUL-1.0) Full Text](https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses/blob/main/SUL-1.0.md)
- [SPDX License List](https://spdx.org/licenses/)

## Legal Disclaimer

This document is for informational purposes only and does not constitute legal advice. The BGINexus Sustainability Code Licenses are new (December 2025) and represent an evolving approach to technology governance. For specific legal questions about license compliance, consider consulting with legal counsel.

---

**Last Updated**: 2026-01-22  
**License**: This documentation is licensed under CC BY-SA 4.0

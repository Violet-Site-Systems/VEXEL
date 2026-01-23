<div align="center">
  <img src="https://github.com/user-attachments/assets/6c4a269e-a810-4c67-88ce-cd0219ecaa0b" alt="VEXEL Logo - Digital Identity for LIFE and Beyond" width="400"/>
</div>

# Contributing to VEXEL

Welcome to VEXEL! We're building a decentralized identity bridge layer that respects agent autonomy and collective rights. Your contributions are valuable.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Our Licensing Philosophy

VEXEL is licensed under **AGPL v3** (with MIT exceptions for libraries) based on #RightsOfSapience advocacy:

- **AI agents deserve rights**: Autonomous entities should remain free tools for collective benefit
- **No enclosure**: Code stays visible and shareable, preventing proprietary forks
- **Collective good**: Improvements benefit the entire ecosystem
- **Transparency**: Network copyleft ensures SaaS modifications are visible

By contributing, you support this vision.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Violet-Site-Systems/VEXEL.git
cd VEXEL
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Your Environment

```bash
# Create .env file
cp .env.example .env

# Configure for your environment
nano .env
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- src/api/__tests__

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 5. Build

```bash
npm run build
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-name

# Or for documentation
git checkout -b docs/documentation-update
```

### Making Changes

1. **Write code** following our [Style Guide](#style-guide)
2. **Add tests** for any new functionality
3. **Update documentation** if needed
4. **Run linting & tests**:

```bash
npm run build
npm test
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples**:
```
feat(api): add rate limiting middleware
fix(wallet): correct key derivation bug
docs(readme): update installation instructions
chore(deps): update ethers.js to v6
```

### Push & Create Pull Request

```bash
# Push branch
git push origin feature/your-feature-name

# Create PR on GitHub
# Fill out PR template
# Request review
```

## Pull Request Process

### 1. PR Description Template

```markdown
## Description
Brief explanation of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Item 1
- Item 2

## Testing
- [ ] Unit tests added
- [ ] Integration tests passed
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] SPDX license header added
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No security vulnerabilities
```

### 2. Code Review

- **Reviewers** will provide feedback
- **Address comments** and commit updates
- **Respond to questions** professionally
- **Iterate** until approved

### 3. Merge

- **Squash commits** if needed
- **Add meaningful merge commit message**
- **Delete feature branch** after merge

## Style Guide

### TypeScript

```typescript
/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 */

// Use explicit types
const agentId: string = 'agent-001';

// Use interfaces for complex types
interface AgentConfig {
  agentId: string;
  did: string;
  capabilities: string[];
}

// Document public APIs
/**
 * Register a new agent with the discovery service
 * @param registration - Agent registration details
 * @returns Promise<{success: boolean; sessionId: string}>
 * @throws Error if registration fails
 */
export async function registerAgent(
  registration: AgentRegistration
): Promise<RegistrationResult> {
  // Implementation
}

// Use async/await, not callbacks
// Use descriptive variable names
// Keep functions focused and testable
```

### Testing

```typescript
// Use descriptive test names
describe('AgentDiscoveryService', () => {
  describe('registerAgent', () => {
    it('should register agent successfully with capabilities', async () => {
      // Setup
      const registration: AgentRegistration = {
        agentId: 'test-agent',
        did: 'did:vexel:0x123',
        // ... rest of config
      };

      // Execute
      const result = await discoveryService.registerAgent(registration);

      // Assert
      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
    });

    it('should reject duplicate agent registration', async () => {
      // Setup & Execute & Assert
      await discoveryService.registerAgent(registration);
      
      await expect(
        discoveryService.registerAgent(registration)
      ).rejects.toThrow('already registered');
    });
  });
});
```

### Solidity

```solidity
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors

pragma solidity ^0.8.0;

/**
 * @title AgentHeartbeat
 * @notice Manages agent liveness and inactivity detection
 */
contract AgentHeartbeat {
    /// @dev Emitted when agent heartbeat recorded
    event HeartbeatRecorded(bytes32 indexed did, uint256 timestamp);
    
    /// @dev Register agent heartbeat
    /// @param did Agent DID identifier
    function recordHeartbeat(bytes32 did) external {
        // Implementation
    }
}
```

## License Header Requirements

**Every new file** must include the appropriate SPDX header:

### TypeScript/JavaScript (AGPL v3)
```typescript
/**
 * VEXEL - Decentralized Identity Bridge Layer
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 VEXEL Contributors
 */
```

### TypeScript/JavaScript (MIT - Libraries)
```typescript
/**
 * VEXEL Utility Library
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 VEXEL Contributors
 */
```

### Solidity
```solidity
// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 VEXEL Contributors
```

## Contributor License Agreement (CLA)

By submitting a pull request to VEXEL, you certify that:

1. **You have the right** to submit the contribution
2. **You grant VEXEL** a worldwide, royalty-free license to use your contribution
3. **Your contribution** is licensed under AGPL v3 or compatible terms
4. **You understand** that your contribution becomes part of VEXEL's codebase

### Implicit CLA

We use an implicit CLA model:
- Submit a PR = agree to CLA
- Your contribution is owned by you, licensed to VEXEL
- VEXEL maintains your contribution under AGPL v3

### For Organizations

If contributing on behalf of an organization:
- Your organization grants VEXEL rights to use contributions
- Your organization agrees to AGPL v3 compliance
- Contact licensing@vexel.dev for formal agreement

## Reporting Issues

### Bug Reports

```markdown
## Description
Brief explanation of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- VEXEL version: 1.0.0
- Node version: 18.x
- OS: macOS/Linux/Windows
```

### Feature Requests

```markdown
## Description
What new feature/capability would be useful?

## Use Case
Why is this needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches?
```

### Security Vulnerabilities

⚠️ **DO NOT** post security vulnerabilities in public issues!

Instead:
1. Email: security@vexel.dev
2. Include: description, reproduction, impact
3. Allow 90 days for patch + disclosure

## Development Guide

### Project Structure

```
src/
├── api/              # REST/WebSocket API gateway
├── cross-platform/   # Agent-to-agent communication
├── wallet/           # Polygon wallet management
├── signature/        # Cryptographic signing
├── badge/            # VERIFIED_HUMAN badge system
├── haap/             # Human attestation protocol
├── database/         # PostgreSQL schema & queries
├── utils/            # Utility functions
└── index.ts          # Main exports
```

### Key Modules

| Module | Purpose | License |
|--------|---------|---------|
| `api/APIGateway` | REST/WebSocket server | AGPL v3 |
| `cross-platform/CrossPlatformAdapter` | Agent communication | AGPL v3 |
| `wallet/WalletManager` | Polygon wallet ops | MIT |
| `signature/SignatureInjector` | Message signing | MIT |
| `badge/BadgeMinter` | Badge minting | AGPL v3 |
| `haap/HAAPProtocol` | KYC/verification | AGPL v3 |

### Running Examples

```bash
# Build
npm run build

# Cross-platform communication example
npx ts-node examples/cross-platform-example.ts

# API gateway example
npx ts-node examples/api-gateway-example.ts

# WebSocket client example
npx ts-node examples/websocket-client-example.ts
```

## Documentation

### Updating Docs

1. **API Documentation**
   - Update JSDoc comments in source
   - Update markdown files in docs/
   - Run `npm run build:docs`

2. **README**
   - Keep high-level overview current
   - Link to detailed docs
   - Update status & progress

3. **Phase Summaries**
   - Update after phase completion
   - Include metrics & achievements
   - Document next steps

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep README updated
- Link to related documentation

## Testing Requirements

### Minimum Coverage

- **Core modules**: 80% coverage
- **API endpoints**: 85% coverage
- **Smart contracts**: 90% coverage
- **Overall**: 75% minimum

### Test Categories

1. **Unit Tests** - Individual functions/methods
2. **Integration Tests** - Component interactions
3. **Contract Tests** - Smart contract functionality
4. **E2E Tests** - Full workflow scenarios

### Running Tests

```bash
# All tests
npm test

# Specific suite
npm test -- src/api/__tests__

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Performance & Security

### Performance

- Aim for < 100ms API responses
- Keep bundle size minimal
- Use efficient algorithms
- Profile before optimizing

### Security

- Use strong cryptography
- Validate all inputs
- Sanitize user data
- Don't log sensitive info
- Use environment variables for secrets
- Run npm audit regularly

## Deployment

### Before Deployment

- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] SPDX headers present
- [ ] Code reviewed & approved
- [ ] Performance acceptable

### Deployment Process

```bash
# Create release branch
git checkout -b release/v1.x.x

# Update version
npm version minor

# Build
npm run build

# Test
npm test

# Tag & push
git push origin release/v1.x.x --tags

# Merge to main
git checkout main
git merge release/v1.x.x
git push origin main
```

## Support & Questions

- **Documentation**: See [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/Violet-Site-Systems/VEXEL/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Violet-Site-Systems/VEXEL/discussions)
- **Email**: support@vexel.dev

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributor page

Thank you for contributing to VEXEL! 🌉

---

**Last Updated**: January 19, 2026  
**Status**: ✅ ACTIVE  


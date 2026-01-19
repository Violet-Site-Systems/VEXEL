# VEXEL Smart Contracts

Smart contracts for Phase 2 of the VEXEL project: Agent heartbeat monitoring and inactivity detection with Chainlink Automation.

## Overview

This directory contains Solidity smart contracts that enable decentralized monitoring of VEXEL agents on the Polygon network. The contracts integrate with Chainlink Automation to provide reliable, automated inactivity detection and trigger inheritance protocols.

## Contracts

### AgentHeartbeat.sol

The main contract for agent heartbeat monitoring:
- **Purpose**: Track agent activity and detect inactivity
- **Features**:
  - Agent registration with unique DIDs
  - Heartbeat recording and validation
  - Configurable inactivity thresholds
  - Chainlink Automation integration
  - Event-driven inactivity detection
- **Solidity Version**: 0.8.24
- **Dependencies**: OpenZeppelin Contracts, Chainlink Contracts

## Structure

```
contracts/
├── AgentHeartbeat.sol          # Main heartbeat monitoring contract
└── README.md                   # This file

scripts/
├── deploy-heartbeat.js         # Deployment script
└── interact-heartbeat.js       # Contract interaction examples

test/contracts/
└── AgentHeartbeat.test.ts      # Comprehensive test suite

docs/contracts/
├── AgentHeartbeat.md           # Contract API documentation
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── INTEGRATION_GUIDE.md        # Integration guide for agents
```

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

### Testing

```bash
# Run contract tests
npm run test:contracts

# Run with coverage
npx hardhat coverage
```

### Deployment

```bash
# Deploy to Mumbai testnet
npm run deploy:mumbai

# Deploy to Polygon mainnet
npm run deploy:polygon
```

## Documentation

- **[AgentHeartbeat API](../docs/contracts/AgentHeartbeat.md)** - Complete contract API reference
- **[Deployment Guide](../docs/contracts/DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Integration Guide](../docs/contracts/INTEGRATION_GUIDE.md)** - How to integrate with VEXEL agents

## Features

### 1. Agent Registration

Register agents with unique DIDs and custom inactivity thresholds:

```solidity
function registerAgent(
    bytes32 did,
    address agentAddress,
    uint256 inactivityThreshold
) external
```

### 2. Heartbeat Monitoring

Record agent activity through heartbeat signals:

```solidity
function recordHeartbeat(bytes32 did) external
```

### 3. Inactivity Detection

Automatic detection using Chainlink Automation:

```solidity
function checkUpkeep(bytes calldata) external view 
    returns (bool upkeepNeeded, bytes memory performData)

function performUpkeep(bytes calldata performData) external
```

### 4. Event System

Subscribe to contract events for real-time monitoring:

```solidity
event AgentRegistered(bytes32 indexed did, address indexed agentAddress, uint256 inactivityThreshold);
event HeartbeatRecorded(bytes32 indexed did, uint256 timestamp);
event InactivityDetected(bytes32 indexed did, uint256 lastHeartbeat, uint256 timestamp);
```

## Security

### Audits

- ⚠️ **Testnet Only**: Currently deployed on Mumbai testnet
- 🔒 **Pre-Audit**: Mainnet deployment requires professional security audit
- ✅ **OpenZeppelin**: Uses audited OpenZeppelin contracts for security primitives

### Security Features

- **Access Control**: Ownable pattern for admin functions
- **Reentrancy Protection**: ReentrancyGuard on all state-changing functions
- **Input Validation**: Comprehensive checks on all inputs
- **Gas Optimization**: Efficient storage and computation

### Best Practices

1. Never share private keys
2. Use hardware wallets for mainnet
3. Test thoroughly on testnet first
4. Monitor contract events
5. Keep LINK tokens funded for Chainlink Automation

## Gas Costs

Approximate gas costs on Polygon:

| Operation | Gas Used | Cost (20 Gwei, $1 MATIC) |
|-----------|----------|--------------------------|
| Register Agent | ~150,000 | ~$0.003 |
| Record Heartbeat | ~50,000 | ~$0.001 |
| Update Threshold | ~45,000 | ~$0.0009 |
| Deactivate Agent | ~40,000 | ~$0.0008 |
| Chainlink Upkeep | ~300,000 | ~$0.006 |

## Chainlink Automation Setup

### Requirements

1. LINK tokens for upkeep funding
2. Deployed AgentHeartbeat contract
3. Chainlink Automation registration

### Configuration

- **Check Interval**: 12 hours (43,200 seconds)
- **Gas Limit**: 500,000
- **Initial Funding**: 5-50 LINK (based on usage)

### Steps

1. Deploy contract to network
2. Go to [Chainlink Automation](https://automation.chain.link/)
3. Connect wallet
4. Register new upkeep
5. Configure parameters
6. Fund with LINK tokens

## Testing

### Test Coverage

The test suite includes:
- ✅ Agent registration validation
- ✅ Heartbeat recording
- ✅ Inactivity detection
- ✅ Threshold management
- ✅ Agent deactivation
- ✅ Chainlink Automation integration
- ✅ Access control
- ✅ Gas optimization
- ✅ Edge cases and error handling

### Running Tests

```bash
# Run all contract tests
npm run test:contracts

# Run with gas reporting
REPORT_GAS=true npm run test:contracts

# Run with coverage
npx hardhat coverage --testfiles "test/contracts/*.test.ts"
```

## Development

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy-heartbeat.js --network localhost

# Interact with contract
HEARTBEAT_CONTRACT_ADDRESS=0x... node scripts/interact-heartbeat.js
```

### Network Configuration

Networks are configured in `hardhat.config.js`:

- **hardhat**: Local development network
- **localhost**: Local Hardhat node
- **mumbai**: Polygon Mumbai testnet
- **polygon**: Polygon mainnet

## Deployed Contracts

### Testnet (Mumbai)

- **Network**: Polygon Mumbai
- **Chain ID**: 80001
- **AgentHeartbeat**: _To be deployed_
- **Explorer**: https://mumbai.polygonscan.com

### Mainnet (Polygon)

- **Network**: Polygon Mainnet
- **Chain ID**: 137
- **AgentHeartbeat**: _To be deployed_
- **Explorer**: https://polygonscan.com

## Contributing

1. Follow Solidity style guide
2. Write comprehensive tests
3. Document all functions
4. Run security checks
5. Update documentation

## Support

- **Issues**: [GitHub Issues](https://github.com/Violet-Site-Systems/VEXEL/issues)
- **Docs**: [VEXEL Documentation](https://github.com/Violet-Site-Systems/VEXEL)
- **Hardhat**: [Hardhat Docs](https://hardhat.org/)
- **Chainlink**: [Chainlink Automation](https://docs.chain.link/chainlink-automation)

## License

MIT License - See [LICENSE](../LICENSE) file for details

## Roadmap

### Phase 2.1 (Current)
- ✅ AgentHeartbeat contract
- ✅ Chainlink Automation integration
- ✅ Comprehensive tests
- ✅ Deployment scripts
- ✅ Documentation
- ⏳ Testnet deployment
- ⏳ Security audit
- ⏳ Mainnet deployment

### Phase 2.2 (Next)
- Digital Will contract
- Guardian unlock system
- Death certificate verification
- Shamir's Secret Sharing integration

### Phase 2.3 (Future)
- Knowledge base migration
- Arweave integration
- Capability transfer automation

# AgentHeartbeat Contract Documentation

## Overview

The `AgentHeartbeat` smart contract provides a decentralized monitoring system for agent activity. It tracks heartbeat signals from agents and uses Chainlink Automation to detect inactivity and trigger inheritance or recovery protocols.

## Features

- **Agent Registration**: Register agents with unique DIDs (Decentralized Identifiers)
- **Heartbeat Monitoring**: Track agent activity through periodic heartbeat signals
- **Inactivity Detection**: Automatically detect when agents become inactive
- **Chainlink Automation**: Automated upkeep for inactivity detection
- **Flexible Thresholds**: Customizable inactivity thresholds per agent
- **Gas Optimized**: Efficient storage and batch processing

## Contract Architecture

### State Variables

```solidity
struct Agent {
    address agentAddress;        // Ethereum address of the agent
    uint256 lastHeartbeat;       // Timestamp of last heartbeat
    bool isActive;               // Agent activation status
    uint256 inactivityThreshold; // Inactivity threshold in seconds
    bool inactivityTriggered;    // Whether inactivity has been detected
}
```

### Key Constants

- `DEFAULT_INACTIVITY_THRESHOLD`: 30 days (2,592,000 seconds)
- `MIN_INACTIVITY_THRESHOLD`: 1 day (86,400 seconds)

## Functions

### Registration and Management

#### `registerAgent(bytes32 did, address agentAddress, uint256 inactivityThreshold)`

Registers a new agent with the heartbeat monitoring system.

**Parameters:**
- `did`: Unique decentralized identifier for the agent
- `agentAddress`: Ethereum address associated with the agent
- `inactivityThreshold`: Custom threshold in seconds (0 for default)

**Requirements:**
- Agent must not be already registered
- Agent address must be non-zero
- Threshold must be >= 1 day or 0 for default

**Emits:** `AgentRegistered`, `HeartbeatRecorded`

**Example:**
```javascript
const did = ethers.id("did:vexel:my-agent");
const address = "0x...";
const threshold = 30 * 24 * 60 * 60; // 30 days
await agentHeartbeat.registerAgent(did, address, threshold);
```

#### `recordHeartbeat(bytes32 did)`

Records a heartbeat signal for an agent, updating their last activity timestamp.

**Parameters:**
- `did`: Decentralized identifier of the agent

**Requirements:**
- Agent must be registered
- Agent must be active
- Caller must be the agent address or contract owner

**Emits:** `HeartbeatRecorded`

**Example:**
```javascript
const did = ethers.id("did:vexel:my-agent");
await agentHeartbeat.recordHeartbeat(did);
```

#### `updateInactivityThreshold(bytes32 did, uint256 newThreshold)`

Updates the inactivity threshold for an agent.

**Parameters:**
- `did`: Decentralized identifier of the agent
- `newThreshold`: New threshold in seconds

**Requirements:**
- Agent must be registered
- New threshold must be >= 1 day
- Caller must be the agent address or contract owner

**Emits:** `InactivityThresholdUpdated`

#### `deactivateAgent(bytes32 did)`

Deactivates an agent, stopping heartbeat monitoring.

**Parameters:**
- `did`: Decentralized identifier of the agent

**Requirements:**
- Agent must be registered
- Agent must be active
- Caller must be the agent address or contract owner

**Emits:** `AgentDeactivated`

### Query Functions

#### `getAgent(bytes32 did) → Agent`

Returns complete information about an agent.

**Parameters:**
- `did`: Decentralized identifier of the agent

**Returns:** Agent struct with all information

#### `isAgentInactive(bytes32 did) → bool`

Checks if an agent is currently inactive based on their threshold.

**Parameters:**
- `did`: Decentralized identifier of the agent

**Returns:** `true` if agent is inactive, `false` otherwise

#### `getInactiveAgents() → bytes32[]`

Returns an array of all currently inactive agent DIDs.

**Returns:** Array of inactive agent DIDs

#### `getAgentCount() → uint256`

Returns the total number of registered agents.

**Returns:** Number of registered agents

### Chainlink Automation Interface

#### `checkUpkeep(bytes calldata) → (bool, bytes)`

Chainlink Automation function to check if upkeep is needed.

**Returns:**
- `upkeepNeeded`: True if there are inactive agents to process
- `performData`: Encoded array of inactive agent DIDs

#### `performUpkeep(bytes calldata performData)`

Chainlink Automation function to perform upkeep (trigger inactivity events).

**Parameters:**
- `performData`: Encoded array of inactive agent DIDs from `checkUpkeep`

**Emits:** `InactivityDetected` for each inactive agent

## Events

### `AgentRegistered(bytes32 indexed did, address indexed agentAddress, uint256 inactivityThreshold)`

Emitted when a new agent is registered.

### `HeartbeatRecorded(bytes32 indexed did, uint256 timestamp)`

Emitted when an agent records a heartbeat.

### `InactivityDetected(bytes32 indexed did, uint256 lastHeartbeat, uint256 timestamp)`

Emitted when an agent's inactivity is detected and triggered.

### `AgentDeactivated(bytes32 indexed did, address indexed agentAddress)`

Emitted when an agent is deactivated.

### `InactivityThresholdUpdated(bytes32 indexed did, uint256 newThreshold)`

Emitted when an agent's inactivity threshold is updated.

## Security Considerations

### Access Control

- Only the agent's registered address or contract owner can:
  - Record heartbeats
  - Update inactivity thresholds
  - Deactivate agents
- Contract owner is set at deployment and can be transferred

### Reentrancy Protection

All state-changing functions use OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.

### Input Validation

- Agent addresses are validated (non-zero)
- Inactivity thresholds have minimum requirements (1 day)
- Duplicate registrations are prevented
- Agent existence is verified before operations

### Gas Optimization

- Efficient storage patterns
- Batch processing in automation checks
- Early returns to save gas
- Fixed-size array allocations

## Integration Guide

### With Chainlink Automation

1. Deploy the `AgentHeartbeat` contract
2. Register the contract with Chainlink Automation
3. Configure upkeep parameters:
   - Check interval: 12 hours recommended
   - Gas limit: 500,000 recommended
   - Funding: Based on network and frequency

### With VEXEL Agent System

```javascript
const { ethers } = require("ethers");
const AgentHeartbeatABI = require("./artifacts/contracts/AgentHeartbeat.sol/AgentHeartbeat.json");

// Connect to contract
const provider = new ethers.JsonRpcProvider(NETWORK_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const heartbeat = new ethers.Contract(CONTRACT_ADDRESS, AgentHeartbeatABI.abi, wallet);

// Register agent
const did = ethers.id(`did:vexel:${agentId}`);
await heartbeat.registerAgent(did, wallet.address, 0);

// Record periodic heartbeats
setInterval(async () => {
  try {
    await heartbeat.recordHeartbeat(did);
    console.log("Heartbeat recorded");
  } catch (error) {
    console.error("Failed to record heartbeat:", error);
  }
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

## Gas Costs (Estimated)

| Operation | Gas Cost |
|-----------|----------|
| Register Agent | ~150,000 |
| Record Heartbeat | ~50,000 |
| Update Threshold | ~45,000 |
| Deactivate Agent | ~40,000 |
| Check Upkeep (10 agents) | ~100,000 |
| Perform Upkeep (10 agents) | ~300,000 |

*Note: Actual gas costs may vary based on network conditions and state changes.*

## Testing

The contract includes comprehensive tests covering:
- Agent registration and validation
- Heartbeat recording
- Inactivity detection
- Threshold management
- Agent deactivation
- Chainlink Automation integration
- Gas optimization scenarios

Run tests with:
```bash
npx hardhat test test/contracts/AgentHeartbeat.test.ts
```

## Deployment Networks

### Testnet (Mumbai)
- Network: Polygon Mumbai Testnet
- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com
- Block Explorer: https://mumbai.polygonscan.com

### Mainnet (Polygon)
- Network: Polygon Mainnet
- Chain ID: 137
- RPC: https://polygon-rpc.com
- Block Explorer: https://polygonscan.com

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [VEXEL Repository](https://github.com/Violet-Site-Systems/VEXEL)
- Documentation: [VEXEL Docs](https://github.com/Violet-Site-Systems/VEXEL/docs)

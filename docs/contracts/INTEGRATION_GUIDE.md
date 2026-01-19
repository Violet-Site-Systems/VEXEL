# Agent Integration Guide

This guide explains how to integrate VEXEL agents with the AgentHeartbeat smart contract for monitoring and inactivity detection.

## Overview

The AgentHeartbeat contract provides a decentralized monitoring system that:
- Tracks agent activity through periodic heartbeat signals
- Detects when agents become inactive
- Triggers inheritance protocols via Chainlink Automation
- Maintains on-chain proof of agent liveness

## Integration Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  VEXEL Agent    │────────▶│  AgentHeartbeat  │◀────────│ Chainlink       │
│  (Off-chain)    │         │  Contract        │         │ Automation      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │ 1. Register                │                            │
        │ 2. Heartbeat               │ 3. Check Upkeep            │
        │                            │ 4. Detect Inactivity       │
        │                            │◀───────────────────────────┘
        │                            │
        │◀───────────────────────────┘ 5. InactivityDetected Event
        │
        ▼
┌─────────────────┐
│  Inheritance    │
│  Protocol       │
└─────────────────┘
```

## Step-by-Step Integration

### Step 1: Install Dependencies

```bash
npm install ethers dotenv
```

### Step 2: Create Heartbeat Service

Create `src/contracts/heartbeat-service.js`:

```javascript
const { ethers } = require("ethers");
const AgentHeartbeatABI = require("../../artifacts/contracts/AgentHeartbeat.sol/AgentHeartbeat.json");

class HeartbeatService {
  constructor(config) {
    const { network, privateKey, contractAddress } = config;
    
    // Set up provider
    const rpcUrl = this.getRpcUrl(network);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Set up wallet
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Set up contract
    this.contract = new ethers.Contract(
      contractAddress,
      AgentHeartbeatABI.abi,
      this.wallet
    );
    
    this.network = network;
  }

  getRpcUrl(network) {
    const urls = {
      mumbai: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      polygon: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    };
    return urls[network] || urls.mumbai;
  }

  /**
   * Register an agent with the heartbeat contract
   */
  async registerAgent(agentDID, agentAddress, thresholdDays = 30) {
    try {
      const did = ethers.id(agentDID);
      const threshold = thresholdDays * 24 * 60 * 60; // Convert days to seconds
      
      const tx = await this.contract.registerAgent(did, agentAddress, threshold);
      const receipt = await tx.wait();
      
      console.log(`Agent registered: ${agentDID}`);
      console.log(`Transaction hash: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        did: agentDID,
      };
    } catch (error) {
      console.error("Failed to register agent:", error);
      throw error;
    }
  }

  /**
   * Record a heartbeat for an agent
   */
  async recordHeartbeat(agentDID) {
    try {
      const did = ethers.id(agentDID);
      
      const tx = await this.contract.recordHeartbeat(did);
      const receipt = await tx.wait();
      
      console.log(`Heartbeat recorded: ${agentDID}`);
      console.log(`Transaction hash: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      console.error("Failed to record heartbeat:", error);
      throw error;
    }
  }

  /**
   * Get agent information from contract
   */
  async getAgent(agentDID) {
    try {
      const did = ethers.id(agentDID);
      const agent = await this.contract.getAgent(did);
      
      return {
        agentAddress: agent.agentAddress,
        lastHeartbeat: Number(agent.lastHeartbeat),
        isActive: agent.isActive,
        inactivityThreshold: Number(agent.inactivityThreshold),
        inactivityTriggered: agent.inactivityTriggered,
      };
    } catch (error) {
      console.error("Failed to get agent:", error);
      throw error;
    }
  }

  /**
   * Check if an agent is inactive
   */
  async isAgentInactive(agentDID) {
    try {
      const did = ethers.id(agentDID);
      return await this.contract.isAgentInactive(did);
    } catch (error) {
      console.error("Failed to check inactivity:", error);
      throw error;
    }
  }

  /**
   * Update inactivity threshold for an agent
   */
  async updateThreshold(agentDID, thresholdDays) {
    try {
      const did = ethers.id(agentDID);
      const threshold = thresholdDays * 24 * 60 * 60;
      
      const tx = await this.contract.updateInactivityThreshold(did, threshold);
      await tx.wait();
      
      console.log(`Threshold updated: ${agentDID} to ${thresholdDays} days`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("Failed to update threshold:", error);
      throw error;
    }
  }

  /**
   * Deactivate an agent
   */
  async deactivateAgent(agentDID) {
    try {
      const did = ethers.id(agentDID);
      
      const tx = await this.contract.deactivateAgent(did);
      await tx.wait();
      
      console.log(`Agent deactivated: ${agentDID}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("Failed to deactivate agent:", error);
      throw error;
    }
  }

  /**
   * Listen for inactivity detection events
   */
  onInactivityDetected(callback) {
    this.contract.on("InactivityDetected", (did, lastHeartbeat, timestamp, event) => {
      const agentDID = did; // This is the bytes32 representation
      callback({
        did: agentDID,
        lastHeartbeat: Number(lastHeartbeat),
        detectedAt: Number(timestamp),
        txHash: event.log.transactionHash,
      });
    });
  }

  /**
   * Stop listening for events
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

module.exports = { HeartbeatService };
```

### Step 3: Integrate with VEXEL Agent

Update `src/index.ts` to include heartbeat functionality:

```typescript
import { HeartbeatService } from "./contracts/heartbeat-service";

export class Vexel {
  private heartbeatService?: HeartbeatService;

  constructor(config: VexelConfig) {
    // Existing initialization...
    
    // Initialize heartbeat service if contract address is provided
    if (config.heartbeatContractAddress && config.network) {
      this.heartbeatService = new HeartbeatService({
        network: config.network,
        privateKey: config.privateKey || process.env.PRIVATE_KEY,
        contractAddress: config.heartbeatContractAddress,
      });
    }
  }

  /**
   * Initialize agent with heartbeat monitoring
   */
  async initializeAgentWithHeartbeat(agentId: string, thresholdDays: number = 30) {
    // Create agent identity (existing functionality)
    const agent = await this.initializeAgent(agentId);
    
    // Register with heartbeat contract
    if (this.heartbeatService) {
      const did = `did:vexel:${agentId}`;
      await this.heartbeatService.registerAgent(
        did,
        agent.wallet.address,
        thresholdDays
      );
      
      console.log(`Agent ${agentId} registered with heartbeat monitoring`);
    }
    
    return agent;
  }

  /**
   * Record heartbeat for an agent
   */
  async recordHeartbeat(agentId: string) {
    if (!this.heartbeatService) {
      throw new Error("Heartbeat service not initialized");
    }
    
    const did = `did:vexel:${agentId}`;
    return await this.heartbeatService.recordHeartbeat(did);
  }

  /**
   * Get heartbeat service instance
   */
  getHeartbeatService(): HeartbeatService | undefined {
    return this.heartbeatService;
  }
}
```

### Step 4: Create Heartbeat Scheduler

Create `src/contracts/heartbeat-scheduler.js`:

```javascript
const { HeartbeatService } = require("./heartbeat-service");

class HeartbeatScheduler {
  constructor(heartbeatService, intervalHours = 24) {
    this.service = heartbeatService;
    this.intervalMs = intervalHours * 60 * 60 * 1000;
    this.scheduledAgents = new Map();
  }

  /**
   * Schedule automatic heartbeats for an agent
   */
  scheduleHeartbeat(agentDID) {
    if (this.scheduledAgents.has(agentDID)) {
      console.log(`Heartbeat already scheduled for ${agentDID}`);
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        await this.service.recordHeartbeat(agentDID);
        console.log(`Automatic heartbeat sent for ${agentDID}`);
      } catch (error) {
        console.error(`Failed to send automatic heartbeat for ${agentDID}:`, error);
      }
    }, this.intervalMs);

    this.scheduledAgents.set(agentDID, intervalId);
    console.log(`Heartbeat scheduled for ${agentDID} every ${this.intervalMs / 3600000} hours`);
  }

  /**
   * Stop scheduled heartbeats for an agent
   */
  stopHeartbeat(agentDID) {
    const intervalId = this.scheduledAgents.get(agentDID);
    if (intervalId) {
      clearInterval(intervalId);
      this.scheduledAgents.delete(agentDID);
      console.log(`Heartbeat stopped for ${agentDID}`);
    }
  }

  /**
   * Stop all scheduled heartbeats
   */
  stopAll() {
    for (const [agentDID, intervalId] of this.scheduledAgents) {
      clearInterval(intervalId);
    }
    this.scheduledAgents.clear();
    console.log("All heartbeats stopped");
  }
}

module.exports = { HeartbeatScheduler };
```

### Step 5: Implement Event Monitoring

Create `src/contracts/inactivity-monitor.js`:

```javascript
const { HeartbeatService } = require("./heartbeat-service");

class InactivityMonitor {
  constructor(heartbeatService, onInactivity) {
    this.service = heartbeatService;
    this.onInactivity = onInactivity;
    this.isListening = false;
  }

  /**
   * Start monitoring for inactivity events
   */
  startMonitoring() {
    if (this.isListening) {
      console.log("Already monitoring for inactivity events");
      return;
    }

    this.service.onInactivityDetected(async (event) => {
      console.log("Inactivity detected:", event);
      
      try {
        await this.onInactivity(event);
      } catch (error) {
        console.error("Error handling inactivity event:", error);
      }
    });

    this.isListening = true;
    console.log("Started monitoring for inactivity events");
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.isListening) {
      this.service.removeAllListeners();
      this.isListening = false;
      console.log("Stopped monitoring for inactivity events");
    }
  }
}

module.exports = { InactivityMonitor };
```

## Usage Examples

### Example 1: Basic Agent Setup

```javascript
const { Vexel } = require("vexel");

async function setupAgent() {
  const vexel = new Vexel({
    network: "mumbai",
    walletDir: "./wallets",
    heartbeatContractAddress: "0x...", // Your deployed contract
    privateKey: process.env.PRIVATE_KEY,
  });

  // Initialize agent with heartbeat monitoring
  const agent = await vexel.initializeAgentWithHeartbeat("my-agent", 30);
  
  console.log("Agent initialized:", agent.wallet.address);
  console.log("Agent DID:", agent.did);
}

setupAgent().catch(console.error);
```

### Example 2: Scheduled Heartbeats

```javascript
const { HeartbeatService } = require("./src/contracts/heartbeat-service");
const { HeartbeatScheduler } = require("./src/contracts/heartbeat-scheduler");

async function scheduleHeartbeats() {
  const service = new HeartbeatService({
    network: "mumbai",
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: "0x...",
  });

  const scheduler = new HeartbeatScheduler(service, 24); // Every 24 hours
  
  // Schedule heartbeats for agent
  scheduler.scheduleHeartbeat("did:vexel:my-agent");
  
  // Keep process running
  process.on("SIGINT", () => {
    scheduler.stopAll();
    process.exit(0);
  });
}

scheduleHeartbeats().catch(console.error);
```

### Example 3: Inactivity Monitoring

```javascript
const { HeartbeatService } = require("./src/contracts/heartbeat-service");
const { InactivityMonitor } = require("./src/contracts/inactivity-monitor");

async function monitorInactivity() {
  const service = new HeartbeatService({
    network: "mumbai",
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: "0x...",
  });

  const monitor = new InactivityMonitor(service, async (event) => {
    console.log("Agent became inactive:", event.did);
    
    // Trigger inheritance protocol
    await triggerInheritanceProtocol(event.did);
  });

  monitor.startMonitoring();
  
  // Keep process running
  process.on("SIGINT", () => {
    monitor.stopMonitoring();
    process.exit(0);
  });
}

async function triggerInheritanceProtocol(agentDID) {
  console.log(`Triggering inheritance protocol for ${agentDID}`);
  // Implement your inheritance logic here
  // - Notify guardians
  // - Transfer assets
  // - Migrate knowledge base
}

monitorInactivity().catch(console.error);
```

### Example 4: Complete Integration

```javascript
const { Vexel } = require("vexel");
const { HeartbeatScheduler } = require("./src/contracts/heartbeat-scheduler");
const { InactivityMonitor } = require("./src/contracts/inactivity-monitor");

async function completeSetup() {
  // Initialize VEXEL
  const vexel = new Vexel({
    network: "mumbai",
    walletDir: "./wallets",
    heartbeatContractAddress: process.env.HEARTBEAT_CONTRACT_ADDRESS,
    privateKey: process.env.PRIVATE_KEY,
  });

  // Initialize agent
  const agent = await vexel.initializeAgentWithHeartbeat("my-agent", 30);
  
  // Get heartbeat service
  const heartbeatService = vexel.getHeartbeatService();
  
  // Schedule automatic heartbeats
  const scheduler = new HeartbeatScheduler(heartbeatService, 24);
  scheduler.scheduleHeartbeat(`did:vexel:${agent.id}`);
  
  // Monitor for inactivity
  const monitor = new InactivityMonitor(heartbeatService, async (event) => {
    console.log("Inactivity detected:", event);
    // Handle inactivity
  });
  monitor.startMonitoring();
  
  console.log("Complete setup finished");
  console.log("- Agent initialized");
  console.log("- Heartbeat scheduled");
  console.log("- Inactivity monitoring active");
}

completeSetup().catch(console.error);
```

## Testing Integration

### Unit Tests

Create `test/contracts/heartbeat-service.test.ts`:

```typescript
import { expect } from "chai";
import { HeartbeatService } from "../../src/contracts/heartbeat-service";

describe("HeartbeatService Integration", () => {
  let service: HeartbeatService;
  
  before(async () => {
    service = new HeartbeatService({
      network: "localhost",
      privateKey: process.env.TEST_PRIVATE_KEY,
      contractAddress: process.env.TEST_CONTRACT_ADDRESS,
    });
  });

  it("should register an agent", async () => {
    const result = await service.registerAgent(
      "did:vexel:test-agent",
      "0x...",
      30
    );
    
    expect(result.success).to.be.true;
    expect(result.did).to.equal("did:vexel:test-agent");
  });

  it("should record a heartbeat", async () => {
    const result = await service.recordHeartbeat("did:vexel:test-agent");
    
    expect(result.success).to.be.true;
    expect(result.timestamp).to.be.greaterThan(0);
  });
});
```

## Best Practices

1. **Heartbeat Frequency**: Send heartbeats every 24 hours (or less) for 30-day thresholds
2. **Error Handling**: Implement retry logic for failed heartbeat transactions
3. **Gas Management**: Monitor and optimize gas costs for heartbeat transactions
4. **Monitoring**: Set up alerts for missed heartbeats and inactivity events
5. **Testing**: Test integration thoroughly on testnet before mainnet deployment

## Troubleshooting

### Common Issues

**Issue: "Agent not registered"**
- Verify agent was registered successfully
- Check DID format and consistency

**Issue: "Unauthorized"**
- Ensure wallet signing transactions matches registered agent address
- Verify contract permissions

**Issue: "Transaction failed"**
- Check wallet has sufficient MATIC for gas
- Verify network configuration

## Next Steps

- Deploy contracts to testnet
- Integrate with VEXEL agent system
- Set up Chainlink Automation
- Test complete flow
- Deploy to mainnet
- Proceed to Phase 2.2 (Digital Will Integration)

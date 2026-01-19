# Smart Contract Deployment Guide

This guide provides step-by-step instructions for deploying the AgentHeartbeat smart contract to Polygon networks.

## Prerequisites

### Required Tools
- Node.js v16+ and npm
- Hardhat development environment
- A wallet with MATIC tokens (for gas fees)
- RPC endpoint (Alchemy, Infura, or public RPC)
- (Optional) Polygonscan API key for contract verification

### Environment Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Create `.env` file**:
```bash
cp .env.example .env
```

3. **Configure environment variables**:
```env
# Deployment wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Network RPC URLs
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com

# Block explorer API key for verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Optional: Enable gas reporting
REPORT_GAS=false
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

## Testnet Deployment (Mumbai)

### Step 1: Get Testnet MATIC

Get free testnet MATIC from the Mumbai faucet:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://mumbaifaucet.com/)

Recommended amount: 1-2 MATIC for testing

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript types
- Create artifacts in `./artifacts/`

### Step 3: Deploy to Mumbai

```bash
npx hardhat run scripts/deploy-heartbeat.js --network mumbai
```

Expected output:
```
Deploying AgentHeartbeat contract...
AgentHeartbeat deployed to: 0x...
Waiting for block confirmations...
Verifying contract on block explorer...
Contract verified successfully!

=== Deployment Summary ===
Network: mumbai
Contract Address: 0x...
Deployer: 0x...
==========================
```

**Save the contract address** - you'll need it for integration and mainnet deployment.

### Step 4: Verify Deployment

Check the contract on Mumbai Polygonscan:
```
https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
```

Verify that:
- ✓ Contract is deployed
- ✓ Source code is verified (green checkmark)
- ✓ Contract owner is set correctly

### Step 5: Test Contract Interactions

```bash
# Set the contract address
export HEARTBEAT_CONTRACT_ADDRESS=0x...

# Run interaction script
npx hardhat run scripts/interact-heartbeat.js --network mumbai
```

This will:
1. Register a test agent
2. Display agent information
3. Show total agent count

### Step 6: Set Up Chainlink Automation (Optional)

1. Go to [Chainlink Automation Mumbai](https://automation.chain.link/)
2. Connect your wallet
3. Click "Register New Upkeep"
4. Select "Custom logic"
5. Enter contract address
6. Configure:
   - Name: "VEXEL Agent Heartbeat Monitor"
   - Gas limit: 500,000
   - Check interval: 43200 (12 hours)
   - Starting balance: 5 LINK
7. Register and fund the upkeep

## Mainnet Deployment (Polygon)

⚠️ **Before deploying to mainnet:**
- Complete thorough testing on Mumbai testnet
- Perform security audit of smart contracts
- Ensure wallet has sufficient MATIC (5-10 MATIC recommended)
- Double-check all configuration parameters

### Step 1: Security Checklist

- [ ] All tests pass with >95% coverage
- [ ] Security audit completed (no critical issues)
- [ ] Gas optimization verified
- [ ] Access control verified
- [ ] Emergency procedures documented
- [ ] Monitoring system ready

### Step 2: Deploy to Mainnet

```bash
npx hardhat run scripts/deploy-heartbeat.js --network polygon
```

### Step 3: Verify Contract

The deployment script automatically verifies the contract. If manual verification is needed:

```bash
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
```

### Step 4: Set Up Mainnet Chainlink Automation

1. Go to [Chainlink Automation Polygon](https://automation.chain.link/)
2. Follow the same steps as testnet but with mainnet LINK tokens
3. Recommended settings:
   - Gas limit: 500,000
   - Check interval: 43200 (12 hours)
   - Starting balance: 50 LINK (adjust based on usage)

### Step 5: Monitor Deployment

Set up monitoring for:
- Contract balance
- Upkeep performance
- Agent registrations
- Inactivity triggers
- Gas costs

## Post-Deployment

### Update Documentation

Update the following with your contract addresses:

1. **README.md**:
```markdown
## Deployed Contracts

### Polygon Mumbai Testnet
- AgentHeartbeat: 0x...

### Polygon Mainnet
- AgentHeartbeat: 0x...
```

2. **Integration Code**:
```javascript
const HEARTBEAT_ADDRESSES = {
  mumbai: "0x...",
  polygon: "0x...",
};
```

### Integration with VEXEL

Update the VEXEL agent system to interact with the deployed contract:

```javascript
// src/contracts/heartbeat.js
const { ethers } = require("ethers");
const AgentHeartbeatABI = require("../artifacts/contracts/AgentHeartbeat.sol/AgentHeartbeat.json");

class HeartbeatService {
  constructor(network, privateKey) {
    const rpcUrl = network === "polygon" 
      ? process.env.POLYGON_RPC_URL 
      : process.env.MUMBAI_RPC_URL;
    
    const contractAddress = network === "polygon"
      ? "0x..." // Mainnet address
      : "0x..."; // Mumbai address

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddress,
      AgentHeartbeatABI.abi,
      this.wallet
    );
  }

  async registerAgent(agentDID, agentAddress, threshold = 0) {
    const did = ethers.id(agentDID);
    const tx = await this.contract.registerAgent(did, agentAddress, threshold);
    await tx.wait();
    return tx.hash;
  }

  async recordHeartbeat(agentDID) {
    const did = ethers.id(agentDID);
    const tx = await this.contract.recordHeartbeat(did);
    await tx.wait();
    return tx.hash;
  }

  async getAgent(agentDID) {
    const did = ethers.id(agentDID);
    return await this.contract.getAgent(did);
  }
}

module.exports = { HeartbeatService };
```

### Monitoring Setup

Create a monitoring script to track contract health:

```javascript
// scripts/monitor-heartbeat.js
const { ethers } = require("ethers");

async function monitor() {
  // Connect to contract
  const contract = new ethers.Contract(ADDRESS, ABI, provider);

  // Monitor events
  contract.on("AgentRegistered", (did, address, threshold) => {
    console.log("New agent registered:", { did, address, threshold });
  });

  contract.on("InactivityDetected", (did, lastHeartbeat, timestamp) => {
    console.log("Inactivity detected:", { did, lastHeartbeat, timestamp });
    // Trigger inheritance protocol
  });

  // Periodic health checks
  setInterval(async () => {
    const agentCount = await contract.getAgentCount();
    const inactiveAgents = await contract.getInactiveAgents();
    console.log(`Total agents: ${agentCount}, Inactive: ${inactiveAgents.length}`);
  }, 60 * 60 * 1000); // Every hour
}

monitor().catch(console.error);
```

## Troubleshooting

### Common Issues

**Issue: "Insufficient funds for gas"**
- Solution: Ensure wallet has enough MATIC tokens

**Issue: "Nonce too low"**
- Solution: Reset MetaMask account or wait for pending transactions

**Issue: "Contract verification failed"**
- Solution: Manually verify using Polygonscan UI or check compiler version

**Issue: "Transaction reverted"**
- Solution: Check contract requirements and input parameters

### Gas Price Issues

If deployment fails due to gas prices:

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 50000000000, // 50 Gwei (adjust as needed)
    },
  },
};
```

### Get Help

- Check Hardhat documentation: https://hardhat.org/
- Polygon documentation: https://docs.polygon.technology/
- Chainlink Automation: https://docs.chain.link/chainlink-automation
- VEXEL GitHub Issues: https://github.com/Violet-Site-Systems/VEXEL/issues

## Security Best Practices

1. **Private Key Management**
   - Use hardware wallets for mainnet
   - Never commit private keys to version control
   - Use environment variables or key management services

2. **Contract Security**
   - Conduct professional audit before mainnet
   - Use OpenZeppelin contracts for standard functionality
   - Implement emergency pause mechanisms

3. **Monitoring**
   - Set up alerts for contract events
   - Monitor gas costs and optimize
   - Track Chainlink Automation health

4. **Upgrades**
   - Document all contract changes
   - Test thoroughly before deployment
   - Consider proxy patterns for upgradability

## Cost Estimates

### Deployment Costs (approximate)

| Network | Contract Deployment | Verification | Total |
|---------|-------------------|--------------|-------|
| Mumbai (Testnet) | Free (testnet MATIC) | Free | $0 |
| Polygon (Mainnet) | ~0.5-1 MATIC | Free | ~$0.50-1.00 |

### Operational Costs

| Operation | Gas Cost | MATIC Cost* | Frequency |
|-----------|----------|-------------|-----------|
| Agent Registration | ~150,000 | ~0.003 | Once per agent |
| Heartbeat | ~50,000 | ~0.001 | Daily |
| Chainlink Upkeep | ~300,000 | ~0.006 | Per trigger |

*Costs based on 20 Gwei gas price and $1 MATIC price (adjust for current rates)

## Next Steps

After successful deployment:

1. ✓ Test all contract functions
2. ✓ Set up Chainlink Automation
3. ✓ Integrate with VEXEL agent system
4. ✓ Configure monitoring and alerts
5. ✓ Document deployment addresses
6. ✓ Update project documentation
7. ✓ Proceed to Phase 2.2 (Digital Will Integration)

## Appendix

### Network Configuration

```javascript
// networks.config.js
module.exports = {
  mumbai: {
    chainId: 80001,
    rpc: "https://rpc-mumbai.maticvigil.com",
    explorer: "https://mumbai.polygonscan.com",
    faucet: "https://faucet.polygon.technology/",
  },
  polygon: {
    chainId: 137,
    rpc: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
};
```

### Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with coverage
npx hardhat coverage

# Deploy to local network
npx hardhat run scripts/deploy-heartbeat.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-heartbeat.js --network mumbai

# Deploy to mainnet
npx hardhat run scripts/deploy-heartbeat.js --network polygon

# Verify contract
npx hardhat verify --network polygon CONTRACT_ADDRESS

# Clean build artifacts
npx hardhat clean
```

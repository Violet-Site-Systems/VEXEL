# VEXEL DID Integration - Setup and API Guide

## Overview

This documentation provides comprehensive guidance on setting up and using the VEXEL DID Integration system for Copilot agents on the Polygon network.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
4. [Security Best Practices](#security-best-practices)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js 16+ or TypeScript 4.5+
- NPM or Yarn package manager

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

## Quick Start

### Initialize VEXEL

```typescript
import { Vexel } from 'vexel';

const vexel = new Vexel({
  network: 'polygon-mumbai',  // or 'polygon' for mainnet
  walletDir: './wallets',      // optional: directory for wallet storage
  badgeContractAddress: '0x...' // optional: deployed badge contract address
});
```

### Create an Agent Identity

```typescript
const agentId = 'my-copilot-agent-001';

// Initialize agent with wallet, DID, and badge
const agentSetup = await vexel.initializeAgent(agentId);

console.log('Agent Address:', agentSetup.wallet.address);
console.log('Agent DID:', agentSetup.did);
console.log('Badge Token ID:', agentSetup.badge.tokenId);
```

## API Reference

### Vexel Class

Main class providing integrated DID functionality.

#### Constructor

```typescript
new Vexel(config?: VexelConfig)
```

**Parameters:**
- `config.network`: Network to use ('polygon' or 'polygon-mumbai')
- `config.walletDir`: Directory for wallet storage (default: './wallets')
- `config.badgeContractAddress`: Smart contract address for badge minting

#### initializeAgent(agentId: string)

Creates a complete agent identity with wallet, DID, and VERIFIED_HUMAN badge.

**Returns:**
```typescript
{
  agentId: string;
  wallet: WalletInfo;
  badge: MintedBadge;
  did: string;
}
```

### WalletManager

Manages Polygon wallet creation and operations.

#### createWallet(agentId: string)

Creates a new encrypted wallet for an agent.

```typescript
const walletInfo = await vexel.walletManager.createWallet(agentId);
```

**Returns:** `WalletInfo` with address, public key, and mnemonic.

#### loadWallet(agentId: string)

Loads an existing wallet from encrypted storage.

```typescript
const wallet = await vexel.walletManager.loadWallet(agentId);
```

#### getBalance(agentId: string)

Gets the balance of an agent's wallet in ETH/MATIC.

```typescript
const balance = await vexel.walletManager.getBalance(agentId);
console.log(`Balance: ${balance} MATIC`);
```

#### walletExists(agentId: string)

Checks if a wallet exists for an agent.

```typescript
const exists = vexel.walletManager.walletExists(agentId);
```

### SignatureInjector

Handles cryptographic signatures for agent authentication.

#### signMessage(agentId: string, message: string)

Signs a message with the agent's private key.

```typescript
const signatureData = await vexel.signatureInjector.signMessage(
  agentId,
  'Hello, VEXEL!'
);
```

**Returns:** `SignatureData` with message, signature, address, and timestamp.

#### verifySignature(message: string, signature: string, expectedAddress: string)

Verifies a signed message.

```typescript
const isValid = vexel.signatureInjector.verifySignature(
  message,
  signature,
  address
);
```

#### signTransaction(agentId: string, transaction: TransactionRequest)

Signs a transaction for on-chain execution.

```typescript
const signedTx = await vexel.signatureInjector.signTransaction(agentId, {
  to: '0x...',
  value: '0.1',
  data: '0x...',
  gasLimit: '21000'
});
```

#### injectSignature(agentId: string, payload: any)

Injects a cryptographic signature into any payload for authentication.

```typescript
const authenticatedPayload = await vexel.signatureInjector.injectSignature(
  agentId,
  { action: 'update', data: 'some data' }
);
```

### BadgeMinter

Manages VERIFIED_HUMAN badge creation and minting.

#### mintVerifiedHumanBadge(agentId: string, metadata?: BadgeMetadata)

Mints a VERIFIED_HUMAN badge for an authenticated agent.

```typescript
const badge = await vexel.badgeMinter.mintVerifiedHumanBadge(agentId, {
  name: 'Verified Human Agent',
  description: 'This agent is backed by a verified human',
  attributes: [
    { trait_type: 'Level', value: 1 },
    { trait_type: 'Type', value: 'Copilot' }
  ]
});
```

#### hasBadge(agentId: string)

Checks if an agent has a VERIFIED_HUMAN badge.

```typescript
const hasBadge = await vexel.badgeMinter.hasBadge(agentId);
```

#### setContractAddress(address: string)

Sets the smart contract address after deployment.

```typescript
vexel.badgeMinter.setContractAddress('0x...');
```

### DID Utilities

W3C-compliant DID document creation and management.

#### createDIDDocument(address: string, publicKey: string)

Creates a W3C-compliant DID document.

```typescript
import { createDIDDocument } from 'vexel';

const didDoc = createDIDDocument(walletAddress, publicKey);
```

#### validateDID(did: string)

Validates DID format compliance.

```typescript
import { validateDID } from 'vexel';

const isValid = validateDID('did:vexel:0x...');
```

#### extractAddressFromDID(did: string)

Extracts Ethereum address from a VEXEL DID.

```typescript
import { extractAddressFromDID } from 'vexel';

const address = extractAddressFromDID('did:vexel:0x...');
```

## Security Best Practices

### Wallet Encryption

Wallets are encrypted using AES-256 encryption with a password derived from the agent ID and a base key. In production:

1. **Use Environment Variables**: Store the encryption key in environment variables
   ```bash
   export WALLET_ENCRYPTION_KEY="your-secure-key-here"
   ```

2. **Use Hardware Security Modules (HSM)**: For production deployments, integrate with HSM or secure enclaves

3. **Implement Key Rotation**: Regularly rotate encryption keys

### Key Management

- Never commit wallet files to version control (already in `.gitignore`)
- Store wallets in a secure location with proper file permissions
- Use multi-sig wallets for high-value operations
- Implement backup and recovery procedures

### Network Security

- Use private RPC endpoints in production (not public ones)
- Implement rate limiting for API calls
- Monitor for unusual transaction patterns
- Use Polygon mainnet for production, Mumbai testnet for development

## Examples

### Example 1: Complete Agent Setup

```typescript
import { Vexel } from 'vexel';

async function setupAgent() {
  const vexel = new Vexel({ network: 'polygon-mumbai' });
  
  // Create agent identity
  const agent = await vexel.initializeAgent('agent-001');
  
  // Sign a message
  const signature = await vexel.signatureInjector.signMessage(
    'agent-001',
    'I am a verified agent'
  );
  
  // Verify the signature
  const isValid = vexel.signatureInjector.verifySignature(
    signature.message,
    signature.signature,
    agent.wallet.address
  );
  
  console.log('Agent initialized:', agent);
  console.log('Signature valid:', isValid);
}
```

### Example 2: Transaction Signing

```typescript
async function sendTransaction(vexel: Vexel, agentId: string) {
  const transaction = {
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    value: '0.01',
    gasLimit: '21000'
  };
  
  const receipt = await vexel.signatureInjector.signAndSendTransaction(
    agentId,
    transaction
  );
  
  console.log('Transaction hash:', receipt?.hash);
}
```

### Example 3: Payload Authentication

```typescript
async function authenticatePayload(vexel: Vexel, agentId: string) {
  const payload = {
    action: 'update_status',
    status: 'active',
    timestamp: Date.now()
  };
  
  const authenticated = await vexel.signatureInjector.injectSignature(
    agentId,
    payload
  );
  
  // Send authenticated payload to API
  await fetch('https://api.example.com/agent/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authenticated)
  });
}
```

## Troubleshooting

### Common Issues

#### "Wallet not found for agent"

**Cause:** Wallet hasn't been created for the agent.

**Solution:**
```typescript
const walletInfo = await vexel.walletManager.createWallet(agentId);
```

#### Network Connection Errors

**Cause:** Unable to connect to Polygon RPC endpoint.

**Solution:** Configure a reliable RPC provider:
```typescript
const vexel = new Vexel({
  network: 'polygon',
  // Consider using Alchemy, Infura, or QuickNode
});
```

#### "Contract not deployed"

**Cause:** Badge contract address not set or invalid.

**Solution:**
```typescript
vexel.badgeMinter.setContractAddress('0xYourContractAddress');
```

#### Insufficient Gas Errors

**Cause:** Wallet doesn't have enough MATIC for gas fees.

**Solution:** Fund the wallet with MATIC:
- Testnet: Use Mumbai faucet (https://faucet.polygon.technology/)
- Mainnet: Transfer MATIC to the wallet address

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Coverage Requirements

- Statements: >45%
- Branches: >35%
- Functions: >45%
- Lines: >45%

## Environment Variables

```bash
# Wallet encryption key (required in production)
WALLET_ENCRYPTION_KEY=your-secure-key

# RPC endpoint (optional, overrides default)
POLYGON_RPC_URL=https://your-rpc-endpoint.com

# Badge contract address (optional)
BADGE_CONTRACT_ADDRESS=0x...
```

## Next Steps

1. **Deploy Badge Smart Contract**: Deploy the VERIFIED_HUMAN badge contract to Polygon
2. **Integrate with HAAP Protocol**: Connect to the Human Attestation and Authentication Protocol
3. **Set up Database Layer**: Implement PostgreSQL schema and Subgraph integration
4. **Production Deployment**: Configure production keys and HSM integration

## Support

For issues or questions:
- GitHub Issues: https://github.com/Violet-Site-Systems/VEXEL/issues
- Documentation: See PROJECT_DOCUMENTATION.md

## License

To be determined in Phase 4 (See Issue 4.1)

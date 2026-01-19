#!/usr/bin/env node

/**
 * Example CLI script demonstrating VEXEL DID Integration
 * 
 * Usage: node examples/demo.js <agent-id>
 */

const { Vexel } = require('../dist/index');

async function main() {
  const agentId = process.argv[2] || 'demo-agent-001';
  
  console.log('🚀 VEXEL DID Integration Demo\n');
  console.log(`Initializing agent: ${agentId}\n`);
  
  // Initialize VEXEL with Mumbai testnet
  const vexel = new Vexel({
    network: 'polygon-mumbai',
    walletDir: './demo-wallets'
  });
  
  try {
    // Initialize agent (creates wallet, DID, and badge)
    console.log('⏳ Creating agent identity...');
    const agent = await vexel.initializeAgent(agentId);
    
    console.log('\n✅ Agent initialized successfully!\n');
    console.log('📋 Agent Details:');
    console.log(`   Agent ID: ${agent.agentId}`);
    console.log(`   Wallet Address: ${agent.wallet.address}`);
    console.log(`   DID: ${agent.did}`);
    console.log(`   Badge Token ID: ${agent.badge.tokenId}`);
    console.log(`   Badge Type: ${agent.badge.badgeType}\n`);
    
    // Sign a message
    console.log('🔐 Signing a message...');
    const message = `Hello from ${agentId}!`;
    const signature = await vexel.signatureInjector.signMessage(agentId, message);
    
    console.log(`   Message: "${message}"`);
    console.log(`   Signature: ${signature.signature.substring(0, 20)}...`);
    console.log(`   Signer: ${signature.address}\n`);
    
    // Verify the signature
    console.log('✓ Verifying signature...');
    const isValid = vexel.signatureInjector.verifySignature(
      message,
      signature.signature,
      agent.wallet.address
    );
    console.log(`   Signature valid: ${isValid ? '✅ Yes' : '❌ No'}\n`);
    
    // Check if agent has badge
    console.log('🏅 Checking badge status...');
    const hasBadge = await vexel.badgeMinter.hasBadge(agentId);
    console.log(`   Has VERIFIED_HUMAN badge: ${hasBadge ? '✅ Yes' : '❌ No'}\n`);
    
    console.log('🎉 Demo completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

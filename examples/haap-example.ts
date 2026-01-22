// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * HAAP Protocol Example
 * 
 * This example demonstrates the complete Human Attestation and Authentication Protocol flow:
 * KYC → DID → Badge → Attestation Token
 */

import { Vexel, HAAPProtocol, KYCProvider } from '../src';

async function main() {
  console.log('🚀 HAAP Protocol Example\n');

  // Initialize VEXEL with HAAP support
  const vexel = new Vexel({
    network: 'polygon-mumbai',
    walletDir: './wallets',
    haapTokenExpiryDays: 365
  });

  console.log('📋 Step 1: Initializing human user with complete HAAP flow...');
  
  // Execute complete HAAP flow for a user
  const result = await vexel.initializeHuman(
    'alice_user_001',
    'alice@example.com'
  );

  console.log('\n✅ HAAP Flow Completed Successfully!\n');
  
  // Display results
  console.log('📝 Results:');
  console.log('─'.repeat(60));
  console.log(`User ID: ${result.userId}`);
  console.log(`DID: ${result.did}`);
  console.log(`Badge Token ID: ${result.badge.tokenId.substring(0, 20)}...`);
  console.log(`Badge TX Hash: ${result.badge.transactionHash}`);
  console.log(`Attestation Token ID: ${result.attestationToken.tokenId}`);
  console.log(`Token Issued: ${result.attestationToken.issuedAt.toISOString()}`);
  console.log(`Token Expires: ${result.attestationToken.expiresAt?.toISOString()}`);
  console.log(`Token Signature: ${result.attestationToken.signature.substring(0, 30)}...`);
  console.log('─'.repeat(60));

  // Validate the attestation token
  console.log('\n🔍 Step 2: Validating attestation token...');
  const validation = await vexel.haapProtocol.validateToken(
    result.attestationToken.tokenId
  );

  if (validation.valid) {
    console.log('✅ Token is valid!');
    console.log(`   - User: ${validation.token?.userId}`);
    console.log(`   - DID: ${validation.token?.did}`);
  } else {
    console.log('❌ Token validation failed:', validation.reason);
  }

  // Check if user has valid attestation
  console.log('\n🔐 Step 3: Checking user attestation status...');
  const hasAttestation = await vexel.haapProtocol.hasValidAttestation(result.userId);
  console.log(`Has valid attestation: ${hasAttestation ? '✅ Yes' : '❌ No'}`);

  // Get DID for user
  const userDID = vexel.haapProtocol.getDIDForUser(result.userId);
  console.log(`User DID: ${userDID}`);

  // Direct HAAP Protocol usage
  console.log('\n🔧 Advanced: Direct HAAPProtocol usage');
  console.log('─'.repeat(60));
  
  const result2 = await vexel.haapProtocol.executeHAAPFlow(
    'bob_user_002',
    'bob@example.com',
    KYCProvider.MOCK
  );

  console.log(`User: ${result2.userId}`);
  console.log(`KYC Status: ${result2.kycVerification.status}`);
  console.log(`KYC Provider: ${result2.kycVerification.provider}`);
  console.log(`DID: ${result2.did}`);
  
  // Get KYC service and check verification
  const kycService = vexel.haapProtocol.getKYCService();
  const isVerified = kycService.isUserVerified(result2.userId);
  console.log(`KYC Verified: ${isVerified ? '✅ Yes' : '❌ No'}`);

  console.log('\n✨ Example completed successfully!');
  console.log('\nℹ️  Note: This example uses MockKYCProvider for testing.');
  console.log('   In production, integrate with Persona, Onfido, or Veriff.');
}

// Handle errors
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

# HAAP Protocol Documentation

## Overview

The **Human Attestation and Authentication Protocol (HAAP)** is a comprehensive system for verifying human identity and issuing cryptographically-signed attestation tokens. HAAP implements a complete flow from KYC verification through DID assignment to badge minting and attestation token generation.

## Architecture

### Components

1. **KYC Service** - Manages Know Your Customer verification
2. **DID Assignment** - Creates decentralized identifiers for verified humans
3. **Badge Minting** - Issues on-chain verification badges
4. **Attestation Tokens** - Generates cryptographically-signed tokens

### Flow Diagram

```
User Registration
      ↓
KYC Verification (Persona/Onfido/Veriff)
      ↓
DID Creation (did:vexel:address)
      ↓
Badge Minting (ERC-721)
      ↓
Attestation Token Generation
      ↓
Token Validation
```

## Quick Start

### Installation

```typescript
import { Vexel, HAAPProtocol, KYCProvider } from 'vexel';

// Initialize VEXEL with HAAP support
const vexel = new Vexel({
  network: 'polygon-mumbai',
  walletDir: './wallets',
  haapTokenExpiryDays: 365
});
```

### Basic Usage

```typescript
// Execute complete HAAP flow for a user
const result = await vexel.initializeHuman(
  'user_12345',
  'user@example.com'
);

console.log('User DID:', result.did);
console.log('Badge Token ID:', result.badge.tokenId);
console.log('Attestation Token:', result.attestationToken.tokenId);
```

## API Reference

### HAAPProtocol

The main class for executing the HAAP flow.

#### Constructor

```typescript
new HAAPProtocol(config: HAAPConfig)
```

**Parameters:**
- `config.walletManager` - WalletManager instance
- `config.badgeMinter` - BadgeMinter instance
- `config.kycService` - Optional KYC service (defaults to MockKYCProvider)
- `config.tokenExpiryDays` - Token expiry duration (default: 365 days)

#### executeHAAPFlow()

Execute the complete HAAP flow: KYC → DID → Badge → Token

```typescript
async executeHAAPFlow(
  userId: string,
  email: string,
  provider?: KYCProvider,
  metadata?: Record<string, any>
): Promise<HAAPFlowResult>
```

**Parameters:**
- `userId` - Unique user identifier
- `email` - User's email address
- `provider` - KYC provider (default: MOCK)
- `metadata` - Optional metadata for KYC verification

**Returns:** `HAAPFlowResult` containing:
- `success` - Boolean indicating success
- `userId` - User identifier
- `did` - Generated DID
- `kycVerification` - KYC verification details
- `badge` - Badge information
- `attestationToken` - Attestation token details

**Example:**

```typescript
const result = await haapProtocol.executeHAAPFlow(
  'user_001',
  'user001@example.com',
  KYCProvider.MOCK
);

console.log('DID:', result.did);
// Output: did:vexel:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

#### validateToken()

Validate a human attestation token.

```typescript
async validateToken(tokenId: string): Promise<TokenValidationResult>
```

**Parameters:**
- `tokenId` - Token identifier to validate

**Returns:** `TokenValidationResult` containing:
- `valid` - Boolean indicating if token is valid
- `token` - Token details (if found)
- `reason` - Reason for invalidity (if applicable)

**Example:**

```typescript
const validation = await haapProtocol.validateToken('haap_12345_xyz');

if (validation.valid) {
  console.log('Token is valid for user:', validation.token.userId);
} else {
  console.log('Token invalid:', validation.reason);
}
```

#### hasValidAttestation()

Check if a user has a valid attestation.

```typescript
async hasValidAttestation(userId: string): Promise<boolean>
```

**Example:**

```typescript
const isValid = await haapProtocol.hasValidAttestation('user_001');
console.log('User has valid attestation:', isValid);
```

#### getDIDForUser()

Get the DID for a user.

```typescript
getDIDForUser(userId: string): string | undefined
```

### KYCService

Manages KYC verification for human users.

#### Constructor

```typescript
new KYCService(provider?: IKYCProvider)
```

**Parameters:**
- `provider` - Optional KYC provider (defaults to MockKYCProvider)

#### initiateVerification()

Start KYC verification for a user.

```typescript
async initiateVerification(
  request: KYCVerificationRequest
): Promise<KYCVerificationResult>
```

**Example:**

```typescript
const result = await kycService.initiateVerification({
  userId: 'user_001',
  email: 'user@example.com',
  provider: KYCProvider.PERSONA
});

console.log('Verification status:', result.status);
// Output: APPROVED
```

#### isUserVerified()

Check if a user is verified.

```typescript
isUserVerified(userId: string): boolean
```

## KYC Providers

### Built-in Providers

1. **MockKYCProvider** - For testing and development
2. **Persona** - Production KYC provider (implementation required)
3. **Onfido** - Production KYC provider (implementation required)
4. **Veriff** - Production KYC provider (implementation required)

### Implementing a Custom Provider

```typescript
import { IKYCProvider, KYCProvider, KYCVerificationRequest, KYCVerificationResult, KYCStatus } from 'vexel';

class PersonaKYCProvider implements IKYCProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): KYCProvider {
    return KYCProvider.PERSONA;
  }

  async verify(request: KYCVerificationRequest): Promise<KYCVerificationResult> {
    // Implement Persona API integration
    const response = await fetch('https://api.withpersona.com/v1/inquiries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            'reference-id': request.userId,
            'email-address': request.email
          }
        }
      })
    });

    const data = await response.json();

    return {
      id: `kyc_${Date.now()}`,
      userId: request.userId,
      status: data.data.attributes.status === 'completed' 
        ? KYCStatus.APPROVED 
        : KYCStatus.PENDING,
      provider: KYCProvider.PERSONA,
      verificationId: data.data.id,
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      metadata: data.data.attributes
    };
  }

  async checkStatus(verificationId: string): Promise<KYCStatus> {
    // Implement status check
    const response = await fetch(
      `https://api.withpersona.com/v1/inquiries/${verificationId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const data = await response.json();
    const status = data.data.attributes.status;

    switch (status) {
      case 'completed':
        return KYCStatus.APPROVED;
      case 'failed':
        return KYCStatus.REJECTED;
      default:
        return KYCStatus.PENDING;
    }
  }
}

// Use custom provider
const personaProvider = new PersonaKYCProvider(process.env.PERSONA_API_KEY);
const kycService = new KYCService(personaProvider);
const haapProtocol = new HAAPProtocol({
  walletManager,
  badgeMinter,
  kycService
});
```

## Types

### KYCStatus

Enum representing KYC verification status:
- `PENDING` - Verification initiated but not complete
- `IN_PROGRESS` - Verification in progress
- `APPROVED` - Verification approved
- `REJECTED` - Verification rejected
- `EXPIRED` - Verification expired

### KYCProvider

Enum for supported KYC providers:
- `PERSONA` - Persona identity verification
- `ONFIDO` - Onfido verification
- `VERIFF` - Veriff verification
- `MOCK` - Mock provider for testing

### HumanAttestationToken

```typescript
interface HumanAttestationToken {
  tokenId: string;           // Unique token identifier
  did: string;               // User's DID
  userId: string;            // User identifier
  kycVerificationId: string; // KYC verification reference
  badgeTokenId: string;      // Badge token ID
  issuedAt: Date;           // Token issue date
  expiresAt?: Date;         // Token expiry date
  signature: string;        // Cryptographic signature
}
```

## Security Considerations

### Token Security

1. **Signature Verification** - All tokens are cryptographically signed
2. **Expiration** - Tokens have configurable expiry dates
3. **KYC Validation** - Tokens are linked to verified KYC records

### Best Practices

1. **Secure Storage** - Store attestation tokens securely
2. **Regular Validation** - Validate tokens before granting access
3. **KYC Provider Selection** - Use reputable KYC providers in production
4. **Key Management** - Secure wallet private keys
5. **Network Security** - Use secure RPC endpoints

### Production Checklist

- [ ] Replace MockKYCProvider with production provider
- [ ] Set `WALLET_ENCRYPTION_KEY` environment variable
- [ ] Configure production RPC endpoints
- [ ] Deploy badge smart contract
- [ ] Set up proper file permissions
- [ ] Configure KYC provider API keys
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts

## Testing

### Running Tests

```bash
# Run all HAAP tests
npm test -- src/haap

# Run with coverage
npm test -- src/haap --coverage
```

### Test Coverage

- **KYCService**: 18 tests covering verification, status checks, and provider management
- **HAAPProtocol**: 13 tests covering complete flow, token validation, and edge cases

### Example Test

```typescript
import { HAAPProtocol, KYCProvider } from 'vexel';

describe('HAAP Flow', () => {
  it('should complete full HAAP flow', async () => {
    const result = await haapProtocol.executeHAAPFlow(
      'test_user',
      'test@example.com',
      KYCProvider.MOCK
    );

    expect(result.success).toBe(true);
    expect(result.did).toMatch(/^did:vexel:0x[a-fA-F0-9]{40}$/);
    expect(result.attestationToken).toBeDefined();
  });
});
```

## Error Handling

### Common Errors

1. **KYC Verification Failed**
   ```typescript
   Error: KYC verification failed with status: REJECTED
   ```
   Solution: Review KYC requirements and retry verification

2. **Token Expired**
   ```typescript
   { valid: false, reason: 'Token expired' }
   ```
   Solution: Request new attestation token

3. **Invalid Signature**
   ```typescript
   { valid: false, reason: 'Invalid signature' }
   ```
   Solution: Token may be tampered, request new token

## Privacy & Compliance

### GDPR Compliance

1. **Data Minimization** - Only collect necessary user data
2. **Right to Erasure** - Implement user data deletion
3. **Data Portability** - Allow users to export their data
4. **Consent Management** - Track user consent for data processing

### Data Handling

- User emails are only used for KYC verification
- Metadata is stored encrypted
- DID addresses do not contain personal information
- Token signatures ensure authenticity without exposing private keys

## Support & Resources

- [OpenZeppelin ERC-721 Documentation](https://docs.openzeppelin.com/contracts/erc721)
- [ERC-1155 Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [W3C DID Specification](https://www.w3.org/TR/did-core/)
- [Persona API Documentation](https://docs.withpersona.com/)
- [Onfido API Documentation](https://documentation.onfido.com/)
- [Veriff API Documentation](https://developers.veriff.com/)

## Changelog

### Version 1.0.0 (Phase 1.3)

- Initial HAAP protocol implementation
- KYC service with provider abstraction
- Human attestation token minting
- Token validation system
- MockKYCProvider for testing
- Comprehensive test suite (31 tests)
- Complete documentation

## License

To be determined in Phase 4. One or more of the Sustainability Code Licenses will be chosen:
https://github.com/Violet-Site-Systems/BGINEXUS-Sustainability-Code-Licenses

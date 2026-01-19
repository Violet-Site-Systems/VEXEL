# Sentinel Agent - Integration Guide

## Overview

The Sentinel Agent is the security guardian of the VEXEL MAS. It provides:

- **Cryptographic Operations**: Sign/verify messages with Ed25519 and ECDSA
- **Key Management**: Generate, import, export, rotate, and revoke keys
- **Policy Enforcement**: Role-based (RBAC) and attribute-based (ABAC) access control
- **Security Monitoring**: Anomaly detection, failed auth tracking, and alerting

## Quick Start

### 1. Initialize the Sentinel Agent

```typescript
import { SentinelAgent } from '@vexel/agents/sentinel';

const sentinel = new SentinelAgent({
  keyRotationDays: 90,
  maxFailedAttempts: 5,
  lockoutDuration: 900, // 15 minutes
  enableMonitoring: true,
  alertWebhookUrl: 'https://your-webhook.com/alerts', // optional
});
```

### 2. Generate a Key Pair

```typescript
const result = await sentinel.generateKeyPair('agent-123', 'Ed25519');
if (result.success) {
  console.log('Key generated:', result.keyId);
  const publicKey = sentinel.getPublicKey(result.keyId);
}
```

### 3. Sign a Message

```typescript
const signature = await sentinel.sign('Hello World', 'agent-123');
console.log('Signature:', signature.signature);
```

### 4. Verify a Signature

```typescript
const publicKey = sentinel.getPublicKey('agent-123');
const verification = await sentinel.verify(signature, publicKey!);
console.log('Valid:', verification.isValid);
```

## Integration with APIGateway

### Setup

```typescript
import { APIGateway } from '@vexel/api';
import { SentinelAgent, createSentinelRoutes, createSentinelMiddleware } from '@vexel/agents/sentinel';

const sentinel = new SentinelAgent();
const gateway = new APIGateway();

// Add Sentinel middleware
const middleware = createSentinelMiddleware(sentinel);
gateway.app.use(middleware.verifySignature);
gateway.app.use(middleware.trackFailedAuth);

// Add Sentinel routes
const routes = createSentinelRoutes(sentinel);
gateway.app.use('/api', routes);
```

### Available Endpoints

**Key Management:**
- `POST /security/keys/generate` - Generate new key pair
- `POST /security/keys/rotate` - Rotate an existing key
- `POST /security/keys/revoke` - Revoke a key

**Cryptographic Operations:**
- `POST /security/sign` - Sign a message
- `POST /security/verify` - Verify a signature

**Security & Monitoring:**
- `GET /security/alerts` - Get active security alerts
- `POST /security/alerts/:alertId/acknowledge` - Acknowledge an alert
- `GET /security/metrics` - Get security metrics

## Policy Enforcement

### Define Policies

```typescript
import { PolicyRule } from '@vexel/agents/sentinel';

const rules: PolicyRule[] = [
  {
    id: 'agent-read',
    name: 'Allow agents to read data',
    principal: 'agent:*',
    resource: 'data:read',
    action: 'allow',
    createdAt: new Date(),
  },
  {
    id: 'deny-admin',
    name: 'Deny user admin access',
    principal: 'user:*',
    resource: 'admin:*',
    action: 'deny',
    createdAt: new Date(),
  },
];
```

### Evaluate Access

```typescript
const context = {
  principal: 'agent:123',
  resource: 'data:read',
  action: 'allow',
  context: { ip: '192.168.1.1' },
};

const result = await sentinel.evaluatePolicy(context);
if (result.allowed) {
  // Grant access
} else {
  // Deny access: result.reason
}
```

## Security Monitoring

### Track Failed Attempts

```typescript
// Record a failed authentication attempt
sentinel.recordFailedAttempt('user:123');

// Check if user is locked out
if (sentinel.isUserLockedOut('user:123')) {
  // Deny access and show lockout message
}

// Clear failed attempts after successful authentication
sentinel.clearFailedAttempts('user:123');
```

### Security Alerts

```typescript
// Get active alerts
const alerts = sentinel.getActiveAlerts();

// Acknowledge an alert
sentinel.acknowledgeAlert(alert.id);

// Get metrics
const metrics = sentinel.getSecurityMetrics();
console.log('Total alerts:', metrics.alertCount);
console.log('Failed auth attempts:', metrics.failedAuthAttempts);
```

## Key Rotation

### Automatic Rotation

```typescript
// Get keys due for rotation
const keysToRotate = sentinel.getKeysForRotation();

for (const key of keysToRotate) {
  const { newKeyId, success } = await sentinel.rotateKey(key.id);
  if (success) {
    console.log(`Key rotated: ${key.id} → ${newKeyId}`);
  }
}
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `defaultCurve` | `secp256k1` | Default cryptographic curve |
| `defaultKDF` | `PBKDF2` | Key derivation function |
| `keyRotationDays` | `90` | Days before key rotation recommended |
| `sessionTokenTTL` | `86400` | Session token lifetime (seconds) |
| `maxFailedAttempts` | `5` | Failed attempts before lockout |
| `lockoutDuration` | `900` | Lockout duration (seconds) |
| `enableMonitoring` | `true` | Enable security monitoring |
| `alertWebhookUrl` | - | Webhook URL for alert notifications |

## Test Coverage

The Sentinel Agent includes 28 comprehensive tests:

- ✅ Key Generation & Management (5 tests)
- ✅ Cryptographic Operations (3 tests)
- ✅ Policy Enforcement (5 tests)
- ✅ Security Monitoring (11 tests)
- ✅ Integration Tests (4 tests)
- ✅ Configuration Tests (2 tests)

Run tests:
```bash
npm test -- src/agents/sentinel/__tests__/sentinel.test.ts
```

## Next Steps

After Sentinel is integrated, continue with:

1. **Bridge Agent** - Protocol translation and API normalization
2. **Sovereign Agent** - User consent and privacy management
3. **Prism Agent** - Identity unification and data harmonization
4. **Maestro Agent** - System orchestration and coordination

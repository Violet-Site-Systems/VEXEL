// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import { Vexel } from './index';
import * as path from 'path';
import * as fs from 'fs';

describe('Vexel Integration', () => {
  const testWalletDir = path.join(__dirname, '../test-wallets-integration');
  let vexel: Vexel;
  const testAgentId = 'integration-test-agent';

  beforeAll(() => {
    vexel = new Vexel({
      network: 'polygon-mumbai',
      walletDir: testWalletDir
    });
  });

  afterAll(() => {
    if (fs.existsSync(testWalletDir)) {
      fs.rmSync(testWalletDir, { recursive: true, force: true });
    }
  });

  describe('initializeAgent', () => {
    it('should initialize a complete agent with wallet, badge, and DID', async () => {
      const agentSetup = await vexel.initializeAgent(testAgentId);
      
      expect(agentSetup).toBeDefined();
      expect(agentSetup.agentId).toBe(testAgentId);
      expect(agentSetup.wallet).toBeDefined();
      expect(agentSetup.wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(agentSetup.badge).toBeDefined();
      expect(agentSetup.badge.badgeType).toBe('VERIFIED_HUMAN');
      expect(agentSetup.did).toMatch(/^did:vexel:0x[a-fA-F0-9]{40}$/);
    });

    it('should have accessible wallet manager', () => {
      expect(vexel.walletManager).toBeDefined();
    });

    it('should have accessible signature injector', () => {
      expect(vexel.signatureInjector).toBeDefined();
    });

    it('should have accessible badge minter', () => {
      expect(vexel.badgeMinter).toBeDefined();
    });
  });

  describe('integrated workflow', () => {
    const workflowAgentId = 'workflow-agent';

    beforeAll(async () => {
      await vexel.initializeAgent(workflowAgentId);
    });

    it('should sign a message with initialized agent', async () => {
      const message = 'Test message from integrated workflow';
      const signature = await vexel.signatureInjector.signMessage(workflowAgentId, message);
      
      expect(signature).toBeDefined();
      expect(signature.signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
    });

    it('should verify agent has badge', async () => {
      const hasBadge = await vexel.badgeMinter.hasBadge(workflowAgentId);
      expect(hasBadge).toBe(true);
    });

    it('should retrieve wallet info', async () => {
      const walletInfo = await vexel.walletManager.getWalletInfo(workflowAgentId);
      expect(walletInfo).toBeDefined();
      expect(walletInfo.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

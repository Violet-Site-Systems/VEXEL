import { BadgeMinter } from './BadgeMinter';
import { WalletManager } from '../wallet/WalletManager';
import * as path from 'path';
import * as fs from 'fs';

describe('BadgeMinter', () => {
  const testWalletDir = path.join(__dirname, '../../../test-wallets-badge');
  let walletManager: WalletManager;
  let badgeMinter: BadgeMinter;
  const testAgentId = 'badge-test-agent';

  beforeAll(async () => {
    walletManager = new WalletManager({
      network: 'polygon-mumbai',
      walletDir: testWalletDir
    });
    
    badgeMinter = new BadgeMinter(walletManager);
    await walletManager.createWallet(testAgentId);
  });

  afterAll(() => {
    if (fs.existsSync(testWalletDir)) {
      fs.rmSync(testWalletDir, { recursive: true, force: true });
    }
  });

  describe('mintVerifiedHumanBadge', () => {
    it('should mint a VERIFIED_HUMAN badge', async () => {
      const badge = await badgeMinter.mintVerifiedHumanBadge(testAgentId);
      
      expect(badge).toBeDefined();
      expect(badge.tokenId).toBeDefined();
      expect(badge.owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(badge.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(badge.badgeType).toBe('VERIFIED_HUMAN');
      expect(badge.timestamp).toBeGreaterThan(0);
    });

    it('should mint badge with custom metadata', async () => {
      const metadata = {
        name: 'Custom Badge',
        description: 'Custom description',
        attributes: [
          { trait_type: 'Level', value: 1 }
        ]
      };
      
      const badge = await badgeMinter.mintVerifiedHumanBadge(testAgentId, metadata);
      
      expect(badge).toBeDefined();
      expect(badge.badgeType).toBe('VERIFIED_HUMAN');
    });

    it('should generate unique token IDs', async () => {
      const agent1 = 'badge-agent-1';
      const agent2 = 'badge-agent-2';
      
      await walletManager.createWallet(agent1);
      await walletManager.createWallet(agent2);
      
      const badge1 = await badgeMinter.mintVerifiedHumanBadge(agent1);
      const badge2 = await badgeMinter.mintVerifiedHumanBadge(agent2);
      
      expect(badge1.tokenId).not.toBe(badge2.tokenId);
    });
  });

  describe('hasBadge', () => {
    it('should return true for agent with wallet (simulation mode)', async () => {
      const hasBadge = await badgeMinter.hasBadge(testAgentId);
      expect(hasBadge).toBe(true);
    });

    it('should return false for agent without wallet', async () => {
      const hasBadge = await badgeMinter.hasBadge('non-existent-agent');
      expect(hasBadge).toBe(false);
    });
  });

  describe('setContractAddress', () => {
    it('should set contract address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      badgeMinter.setContractAddress(address);
      
      expect(badgeMinter.getContractAddress()).toBe(address);
    });
  });

  describe('getContractAddress', () => {
    it('should return default contract address', () => {
      const newBadgeMinter = new BadgeMinter(walletManager);
      expect(newBadgeMinter.getContractAddress()).toBe('0x0000000000000000000000000000000000000000');
    });

    it('should return custom contract address', () => {
      const customAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const newBadgeMinter = new BadgeMinter(walletManager, customAddress);
      
      expect(newBadgeMinter.getContractAddress()).toBe(customAddress);
    });
  });

  describe('mintBadgeOnChain', () => {
    it('should throw error when contract not deployed', async () => {
      try {
        await badgeMinter.mintBadgeOnChain(testAgentId, 'ipfs://test');
        // If we get here without error, fail the test
        expect(true).toBe(false);
      } catch (error: any) {
        // Should throw contract not deployed error or network error
        expect(
          error.message.includes('Contract not deployed') || 
          error.message.includes('ENOTFOUND') ||
          error.message.includes('network')
        ).toBe(true);
      }
    });
  });
});

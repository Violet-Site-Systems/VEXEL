import { WalletManager } from './WalletManager';
import * as fs from 'fs';
import * as path from 'path';

describe('WalletManager', () => {
  const testWalletDir = path.join(__dirname, '../../../test-wallets');
  let walletManager: WalletManager;
  const testAgentId = 'test-agent-001';

  beforeAll(() => {
    walletManager = new WalletManager({
      network: 'polygon-mumbai',
      walletDir: testWalletDir
    });
  });

  afterAll(() => {
    // Clean up test wallets
    if (fs.existsSync(testWalletDir)) {
      fs.rmSync(testWalletDir, { recursive: true, force: true });
    }
  });

  describe('createWallet', () => {
    it('should create a new wallet for an agent', async () => {
      const walletInfo = await walletManager.createWallet(testAgentId);
      
      expect(walletInfo).toBeDefined();
      expect(walletInfo.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(walletInfo.publicKey).toMatch(/^0x[a-fA-F0-9]{130}$/);
      expect(walletInfo.mnemonic).toBeDefined();
      expect(walletInfo.mnemonic?.split(' ').length).toBe(12);
    });

    it('should save wallet to filesystem', async () => {
      const walletPath = path.join(testWalletDir, `${testAgentId}.json`);
      expect(fs.existsSync(walletPath)).toBe(true);
    });

    it('should create different wallets for different agents', async () => {
      const agent1 = 'agent-001';
      const agent2 = 'agent-002';
      
      const wallet1 = await walletManager.createWallet(agent1);
      const wallet2 = await walletManager.createWallet(agent2);
      
      expect(wallet1.address).not.toBe(wallet2.address);
      expect(wallet1.publicKey).not.toBe(wallet2.publicKey);
    });
  });

  describe('loadWallet', () => {
    const loadTestAgentId = 'load-test-agent';

    beforeAll(async () => {
      await walletManager.createWallet(loadTestAgentId);
    });

    it('should load an existing wallet', async () => {
      const wallet = await walletManager.loadWallet(loadTestAgentId);
      expect(wallet).toBeDefined();
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should throw error for non-existent wallet', async () => {
      await expect(walletManager.loadWallet('non-existent-agent'))
        .rejects
        .toThrow('Wallet not found for agent: non-existent-agent');
    });

    it('should load wallet with correct address', async () => {
      const walletInfo = await walletManager.getWalletInfo(loadTestAgentId);
      const wallet = await walletManager.loadWallet(loadTestAgentId);
      
      expect(await wallet.getAddress()).toBe(walletInfo.address);
    });
  });

  describe('getWalletInfo', () => {
    const infoTestAgentId = 'info-test-agent';

    beforeAll(async () => {
      await walletManager.createWallet(infoTestAgentId);
    });

    it('should return wallet information', async () => {
      const info = await walletManager.getWalletInfo(infoTestAgentId);
      
      expect(info).toBeDefined();
      expect(info.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(info.publicKey).toMatch(/^0x[a-fA-F0-9]{130}$/);
      expect(info.mnemonic).toBeUndefined(); // Should not expose mnemonic
    });
  });

  describe('walletExists', () => {
    const existsTestAgentId = 'exists-test-agent';

    beforeAll(async () => {
      await walletManager.createWallet(existsTestAgentId);
    });

    it('should return true for existing wallet', () => {
      expect(walletManager.walletExists(existsTestAgentId)).toBe(true);
    });

    it('should return false for non-existent wallet', () => {
      expect(walletManager.walletExists('non-existent-agent')).toBe(false);
    });
  });

  describe('getBalance', () => {
    const balanceTestAgentId = 'balance-test-agent';

    beforeAll(async () => {
      await walletManager.createWallet(balanceTestAgentId);
    });

    it('should return balance as string', async () => {
      try {
        const balance = await walletManager.getBalance(balanceTestAgentId);
        expect(typeof balance).toBe('string');
        expect(balance).toBe('0.0'); // New wallet should have 0 balance
      } catch (error: any) {
        // Network error is expected in test environment
        if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('getProvider', () => {
    it('should return a provider instance', () => {
      const provider = walletManager.getProvider();
      expect(provider).toBeDefined();
    });
  });
});

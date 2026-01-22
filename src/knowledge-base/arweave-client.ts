// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as dotenv from 'dotenv';
import { createHash } from 'crypto';
import { gzipSync, gunzipSync } from 'zlib';

dotenv.config();

/**
 * Arweave transaction tag interface
 */
interface ArweaveTag {
  get(name: string, options: { decode: boolean; string: boolean }): string;
}

/**
 * Arweave client for permanent storage of agent knowledge bases
 */
export class ArweaveClient {
  private arweave: Arweave;
  private wallet?: JWKInterface;

  constructor(walletKey?: JWKInterface) {
    // Initialize Arweave client
    this.arweave = Arweave.init({
      host: process.env.ARWEAVE_HOST || 'arweave.net',
      port: parseInt(process.env.ARWEAVE_PORT || '443'),
      protocol: process.env.ARWEAVE_PROTOCOL || 'https',
    });

    this.wallet = walletKey;
  }

  /**
   * Set wallet for transactions
   */
  setWallet(walletKey: JWKInterface): void {
    this.wallet = walletKey;
  }

  /**
   * Generate a new Arweave wallet
   */
  async generateWallet(): Promise<JWKInterface> {
    return await this.arweave.wallets.generate();
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not set');
    }
    return await this.arweave.wallets.jwkToAddress(this.wallet);
  }

  /**
   * Get wallet balance in AR
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || (await this.getWalletAddress());
    const balance = await this.arweave.wallets.getBalance(addr);
    return this.arweave.ar.winstonToAr(balance);
  }

  /**
   * Compress data using gzip
   */
  private compressData(data: string): Buffer {
    return gzipSync(Buffer.from(data, 'utf-8'));
  }

  /**
   * Decompress data using gzip
   */
  private decompressData(data: Buffer): string {
    return gunzipSync(data).toString('utf-8');
  }

  /**
   * Create a data hash for verification
   */
  private createDataHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Store data on Arweave with compression
   */
  async storeData(
    data: Record<string, any>,
    tags?: Array<{ name: string; value: string }>,
    compress: boolean = true
  ): Promise<{ txId: string; dataSize: number; compressedSize: number; dataHash: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not set. Please set a wallet before storing data.');
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const dataHash = this.createDataHash(jsonString);
      const dataSize = Buffer.byteLength(jsonString, 'utf-8');

      let dataToStore: Buffer;
      let compressedSize: number;

      if (compress) {
        dataToStore = this.compressData(jsonString);
        compressedSize = dataToStore.length;
      } else {
        dataToStore = Buffer.from(jsonString, 'utf-8');
        compressedSize = dataSize;
      }

      // Create transaction
      const transaction = await this.arweave.createTransaction(
        { data: dataToStore },
        this.wallet
      );

      // Add tags
      transaction.addTag('Content-Type', 'application/json');
      transaction.addTag('App-Name', 'VEXEL');
      transaction.addTag('App-Version', '1.0.0');
      transaction.addTag('Compressed', compress ? 'true' : 'false');
      transaction.addTag('Data-Hash', dataHash);

      if (tags) {
        tags.forEach((tag) => {
          transaction.addTag(tag.name, tag.value);
        });
      }

      // Sign and post transaction
      await this.arweave.transactions.sign(transaction, this.wallet);
      const response = await this.arweave.transactions.post(transaction);

      if (response.status !== 200) {
        throw new Error(`Failed to post transaction: ${response.status} ${response.statusText}`);
      }

      console.log('Data stored on Arweave:', transaction.id);
      console.log(`Original size: ${dataSize} bytes, Compressed size: ${compressedSize} bytes`);
      console.log(`Compression ratio: ${((1 - compressedSize / dataSize) * 100).toFixed(2)}%`);

      return {
        txId: transaction.id,
        dataSize,
        compressedSize,
        dataHash,
      };
    } catch (error) {
      console.error('Error storing data on Arweave:', error);
      throw new Error(`Failed to store data on Arweave: ${error}`);
    }
  }

  /**
   * Retrieve data from Arweave
   */
  async retrieveData(txId: string): Promise<Record<string, any>> {
    try {
      // Get transaction data
      const data = await this.arweave.transactions.getData(txId, {
        decode: true,
        string: false,
      });

      // Get transaction tags to check if data is compressed
      const transaction = await this.arweave.transactions.get(txId);
      const tagsData = transaction.get('tags') as unknown;
      const tagsArray = tagsData as ArweaveTag[];
      const tags = tagsArray.reduce((acc: Record<string, string>, tag: ArweaveTag) => {
        const name = tag.get('name', { decode: true, string: true });
        const value = tag.get('value', { decode: true, string: true });
        acc[name] = value;
        return acc;
      }, {});

      let jsonString: string;
      if (tags['Compressed'] === 'true') {
        jsonString = this.decompressData(Buffer.from(data as Uint8Array));
      } else {
        jsonString = Buffer.from(data as Uint8Array).toString('utf-8');
      }

      const parsedData = JSON.parse(jsonString);

      // Verify data hash if available
      if (tags['Data-Hash']) {
        const computedHash = this.createDataHash(jsonString);
        if (computedHash !== tags['Data-Hash']) {
          console.warn('Data hash mismatch! Data may be corrupted.');
        }
      }

      console.log('Retrieved data from Arweave:', txId);
      return parsedData;
    } catch (error) {
      console.error('Error retrieving data from Arweave:', error);
      throw new Error(`Failed to retrieve data from Arweave: ${error}`);
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string): Promise<{
    confirmed: boolean;
    confirmations?: number;
    blockHeight?: number;
  }> {
    try {
      const status = await this.arweave.transactions.getStatus(txId);
      return {
        confirmed: status.confirmed !== null,
        confirmations: status.confirmed?.number_of_confirmations,
        blockHeight: status.confirmed?.block_height,
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  /**
   * Estimate storage cost in AR
   */
  async estimateStorageCost(dataSize: number): Promise<string> {
    try {
      const price = await this.arweave.transactions.getPrice(dataSize);
      return this.arweave.ar.winstonToAr(price);
    } catch (error) {
      console.error('Error estimating storage cost:', error);
      throw new Error(`Failed to estimate storage cost: ${error}`);
    }
  }

  /**
   * Get transaction URL
   */
  getTransactionUrl(txId: string): string {
    return `https://arweave.net/${txId}`;
  }

  /**
   * Test Arweave connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const info = await this.arweave.network.getInfo();
      console.log('Arweave connection successful, network:', info.network);
      console.log('Current block height:', info.height);
      return true;
    } catch (error) {
      console.error('Arweave connection failed:', error);
      return false;
    }
  }
}

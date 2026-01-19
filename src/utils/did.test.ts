import { 
  createDIDDocument, 
  validateDID, 
  extractAddressFromDID,
  resolveDID 
} from './did';

describe('DID Utilities', () => {
  describe('createDIDDocument', () => {
    it('should create a valid DID document', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const publicKey = '0x04' + 'a'.repeat(128);
      
      const didDocument = createDIDDocument(address, publicKey);
      
      expect(didDocument).toBeDefined();
      expect(didDocument.id).toBe(`did:vexel:${address}`);
      expect(didDocument['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(didDocument.verificationMethod).toHaveLength(1);
      expect(didDocument.verificationMethod[0].ethereumAddress).toBe(address);
      expect(didDocument.verificationMethod[0].publicKeyHex).toBe(publicKey);
      expect(didDocument.created).toBeDefined();
      expect(didDocument.updated).toBeDefined();
    });

    it('should create DID document with verification method', () => {
      const address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const publicKey = '0x04' + 'b'.repeat(128);
      
      const didDocument = createDIDDocument(address, publicKey);
      const verificationMethod = didDocument.verificationMethod[0];
      
      expect(verificationMethod.id).toBe(`did:vexel:${address}#key-1`);
      expect(verificationMethod.type).toBe('EcdsaSecp256k1VerificationKey2019');
      expect(verificationMethod.controller).toBe(`did:vexel:${address}`);
    });

    it('should include authentication and assertion methods', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const publicKey = '0x04' + 'c'.repeat(128);
      
      const didDocument = createDIDDocument(address, publicKey);
      
      expect(didDocument.authentication).toHaveLength(1);
      expect(didDocument.assertionMethod).toHaveLength(1);
      expect(didDocument.authentication[0]).toBe(`did:vexel:${address}#key-1`);
      expect(didDocument.assertionMethod![0]).toBe(`did:vexel:${address}#key-1`);
    });
  });

  describe('validateDID', () => {
    it('should validate correct DID format', () => {
      expect(validateDID('did:vexel:0x1234567890123456789012345678901234567890')).toBe(true);
      expect(validateDID('did:ethr:0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')).toBe(true);
      expect(validateDID('did:web:example.com')).toBe(true);
    });

    it('should reject invalid DID format', () => {
      expect(validateDID('not-a-did')).toBe(false);
      expect(validateDID('did:')).toBe(false);
      expect(validateDID('did:method:')).toBe(false);
      expect(validateDID('did:METHOD:id')).toBe(false); // uppercase not allowed
      expect(validateDID('did:method:id with spaces')).toBe(false);
    });

    it('should accept various valid DID formats', () => {
      expect(validateDID('did:example:123456789abcdefghi')).toBe(true);
      expect(validateDID('did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH')).toBe(true);
      expect(validateDID('did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w')).toBe(true);
    });
  });

  describe('extractAddressFromDID', () => {
    it('should extract Ethereum address from VEXEL DID', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const did = `did:vexel:${address}`;
      
      const extracted = extractAddressFromDID(did);
      expect(extracted).toBe(address);
    });

    it('should throw error for non-VEXEL DID', () => {
      expect(() => extractAddressFromDID('did:ethr:0x1234567890123456789012345678901234567890'))
        .toThrow('Not a VEXEL DID');
    });

    it('should throw error for invalid Ethereum address', () => {
      expect(() => extractAddressFromDID('did:vexel:invalid-address'))
        .toThrow('Invalid Ethereum address in DID');
    });
  });

  describe('resolveDID', () => {
    it('should return null for unregistered DID', async () => {
      const result = await resolveDID('did:vexel:0x1234567890123456789012345678901234567890');
      expect(result).toBeNull();
    });

    it('should throw error for unsupported DID method', async () => {
      await expect(resolveDID('did:unsupported:identifier'))
        .rejects
        .toThrow('Only did:vexel method is supported');
    });
  });
});

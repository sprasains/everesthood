import { encryptSecret, decryptSecret } from './secrets';

describe('secrets encryption', () => {
  it('should encrypt and decrypt correctly', () => {
    const secret = 'test_secret_value';
    const encrypted = encryptSecret(secret);
    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('should fail to decrypt if tampered', () => {
    const secret = 'test_secret_value';
    const encrypted = encryptSecret(secret);
    // Tamper with ciphertext
    const tampered = { ...encrypted, ciphertext: encrypted.ciphertext.slice(0, -2) + '00' };
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('should fail with wrong key', () => {
    const secret = 'test_secret_value';
    const encrypted = encryptSecret(secret);
    // Use wrong keyId
    const wrongKey = { ...encrypted, keyId: 'wrong' };
    expect(() => decryptSecret(wrongKey)).toThrow();
  });
});

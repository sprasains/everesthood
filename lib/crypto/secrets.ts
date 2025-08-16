import crypto from 'crypto';

// Key rotation: keys = { keyId: Buffer }
const keys: Record<string, Buffer> = {
  'v1': Buffer.from(process.env.AGENT_CREDENTIAL_KEY_V1 || '', 'hex'),
  // Add more keys for rotation
};
const defaultKeyId = 'v1';

export function encryptSecret(plaintext: string, keyId: string = defaultKeyId): { keyId: string, iv: string, tag: string, ciphertext: string } {
  const key = keys[keyId];
  if (!key || key.length !== 32) throw new Error('Invalid encryption key');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    keyId,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: ciphertext.toString('hex'),
  };
}

export function decryptSecret({ keyId, iv, tag, ciphertext }: { keyId: string, iv: string, tag: string, ciphertext: string }): string {
  const key = keys[keyId];
  if (!key || key.length !== 32) throw new Error('Invalid decryption key');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final()
  ]);
  return plaintext.toString('utf8');
}

// Utility for key rotation
export function getActiveKeyId(): string {
  return defaultKeyId;
}

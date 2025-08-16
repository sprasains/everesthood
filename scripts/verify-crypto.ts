import { encryptSecret, decryptSecret } from '../lib/crypto/secrets';

const secret = 'super_secret_value';
console.log('Original:', secret);

const encrypted = encryptSecret(secret);
console.log('Encrypted:', encrypted);

const decrypted = decryptSecret(encrypted);
console.log('Decrypted:', decrypted);

if (decrypted === secret) {
  console.log('✅ Round-trip encryption/decryption successful');
} else {
  console.error('❌ Round-trip failed');
}

// Tamper test
try {
  const tampered = { ...encrypted, ciphertext: encrypted.ciphertext.slice(0, -2) + '00' };
  decryptSecret(tampered);
  console.error('❌ Tamper test failed: should not decrypt');
} catch (e) {
  console.log('✅ Tamper test passed:', e.message);
}

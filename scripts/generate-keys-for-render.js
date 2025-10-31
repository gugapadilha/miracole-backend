const crypto = require('crypto');

// Generate RSA key pair
console.log('Generating RSA key pair for Render environment variables...\n');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('========================================');
console.log('JWT_PRIVATE_KEY (copy this value):');
console.log('========================================');
console.log(privateKey);
console.log('\n');

console.log('========================================');
console.log('JWT_PUBLIC_KEY (copy this value):');
console.log('========================================');
console.log(publicKey);
console.log('\n');

console.log('✅ Keys generated! Copy the values above to your Render environment variables.');
console.log('📝 IMPORTANT: When pasting in Render, make sure to preserve all line breaks.\n');

// Also save to files for local use
const fs = require('fs');
const path = require('path');
const keysDir = path.join(__dirname, '../keys');

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

fs.writeFileSync(path.join(keysDir, 'jwt_private.pem'), privateKey, 'utf8');
fs.writeFileSync(path.join(keysDir, 'jwt_public.pem'), publicKey, 'utf8');

console.log('✅ Keys also saved to local ./keys/ directory for local development.\n');


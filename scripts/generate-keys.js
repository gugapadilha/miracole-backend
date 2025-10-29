const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../keys');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Generate RSA key pair
console.log('Generating RSA key pair...');

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

// Write private key
const privateKeyPath = path.join(keysDir, 'jwt_private.pem');
fs.writeFileSync(privateKeyPath, privateKey, 'utf8');
console.log('✅ Private key generated:', privateKeyPath);

// Write public key
const publicKeyPath = path.join(keysDir, 'jwt_public.pem');
fs.writeFileSync(publicKeyPath, publicKey, 'utf8');
console.log('✅ Public key generated:', publicKeyPath);

console.log('\n🎉 JWT keys generated successfully!');


/**
 * Generate an uppercase alphanumeric device code.
 */
function generateDeviceCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

module.exports = {
  generateDeviceCode
};



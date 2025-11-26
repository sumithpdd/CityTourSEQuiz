const crypto = require('crypto');

// Generate a random secret for NextAuth
const secret = crypto.randomBytes(32).toString('base64');

console.log('Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nYou can copy this value to your .env.local file');


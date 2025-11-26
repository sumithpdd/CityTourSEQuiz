const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read the service account JSON
const serviceAccountPath = path.join(__dirname, '..', 'citytoursequiz-service.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Generate a random secret for NextAuth
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const nextAuthSecret = generateSecret();

// Create .env.local content
const envContent = `# Firebase Client Configuration (Web App)
# Get these values from Firebase Console > Project Settings > General > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${serviceAccount.project_id}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${serviceAccount.project_id}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Firebase Service Account (Server-side)
# These are from the service account JSON file
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_CLIENT_ID=${serviceAccount.client_id}

# Next.js Secrets
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000
`;

// Write .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Created .env.local file!');
console.log('✅ Generated NEXTAUTH_SECRET automatically');
console.log('⚠️  Please update the following values from Firebase Console:');
console.log('   - NEXT_PUBLIC_FIREBASE_API_KEY');
console.log('   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
console.log('   - NEXT_PUBLIC_FIREBASE_APP_ID');
console.log('   - NEXT_PUBLIC_ADMIN_EMAILS (comma separated list of approved admin logins)');


#!/usr/bin/env node
/*
 Admin SDK smoke test: writes a test document to the `manga` collection using the Firebase Admin SDK.
 Usage:
   node scripts/smokeTestMangaAdmin.js --serviceAccount=./serviceAccount.json
 Or set the GOOGLE_APPLICATION_CREDENTIALS env variable and run without args.

 Notes:
 - This uses the Admin SDK and therefore bypasses security rules. Use only with a trusted service account.
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  args.forEach(a => {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v === undefined ? true : v;
    }
  });
  return out;
}

async function main() {
  const args = parseArgs();
  const serviceAccountPath = args.serviceAccount || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (serviceAccountPath) {
      const abs = path.resolve(process.cwd(), serviceAccountPath);
      if (!fs.existsSync(abs)) {
        console.error('Service account file not found at', abs);
        process.exit(1);
      }
      const serviceAccount = JSON.parse(fs.readFileSync(abs, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      // Try application default credentials
      try {
        admin.initializeApp();
      } catch (err) {
        console.error('No service account provided and Application Default Credentials not available.');
        console.error('Set --serviceAccount=./serviceAccount.json or set GOOGLE_APPLICATION_CREDENTIALS.');
        process.exit(1);
      }
    }

    const db = admin.firestore();
    console.log('Admin SDK initialized — writing test document to /manga');

    const res = await db.collection('manga').add({
      title: 'SMOKE TEST - ADMIN SDK',
      author: 'AdminSmokeScript',
      createdBy: 'admin-smoke-script',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      note: 'Remove this test doc'
    });

    console.log('Admin write succeeded. Document ID:', res.id);
    process.exit(0);
  } catch (err) {
    console.error('Admin smoke test failed:', err && (err.message || err));
    process.exit(2);
  }
}

main();
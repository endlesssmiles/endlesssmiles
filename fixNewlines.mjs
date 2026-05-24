import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, v] = l.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function fix() {
  for (const colName of ['gallery_photos', 'timeline_events', 'love_letters', 'future_plans']) {
    const snap = await getDocs(collection(db, colName));
    for (const d of snap.docs) {
      const data = d.data();
      let changed = false;
      const updates = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string' && v.includes('\\n')) {
          updates[k] = v.replaceAll('\\n', '\n');
          changed = true;
        }
      }
      if (changed) {
        await updateDoc(doc(db, colName, d.id), updates);
        console.log('Fixed:', colName, d.id);
      }
    }
  }
  console.log('All done!');
  process.exit(0);
}

fix();

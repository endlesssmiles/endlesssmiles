import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const backupContent = fs.readFileSync('db_cluster_new.backup', 'utf8');

function extractCopyBlock(tableName, columns) {
  const startTag = `COPY public.${tableName} (${columns.join(', ')}) FROM stdin;`;
  const startIndex = backupContent.indexOf(startTag);
  if (startIndex === -1) {
    console.warn(`Could not find COPY block for ${tableName}`);
    return [];
  }
  const startData = startIndex + startTag.length + 1;
  const endIndex = backupContent.indexOf('\\.', startData);
  const dataLines = backupContent.substring(startData, endIndex).trim().split('\n');
  
  return dataLines.filter(line => line.trim()).map(line => {
    const values = line.split('\t');
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i] === '\\N' ? null : values[i];
    });
    return obj;
  });
}

async function run() {
  try {
    const future_plans = extractCopyBlock('future_plans', ['id', 'title', 'description', 'icon', 'completed', 'created_at']);
    for (const plan of future_plans) {
      plan.completed = plan.completed === 't';
      plan.content = plan.content ? plan.content.replace(/\\n/g, '\n') : '';
      await setDoc(doc(db, 'future_plans', plan.id), plan);
    }
    console.log(`Migrated ${future_plans.length} future_plans`);

    const gallery_photos = extractCopyBlock('gallery_photos', ['id', 'image_url', 'caption', 'created_at']);
    for (const photo of gallery_photos) {
      await setDoc(doc(db, 'gallery_photos', photo.id), photo);
    }
    console.log(`Migrated ${gallery_photos.length} gallery_photos`);

    const love_letters = extractCopyBlock('love_letters', ['id', 'title', 'date', 'content', 'created_at']);
    for (const letter of love_letters) {
      if (letter.content) {
        letter.content = letter.content.replace(/\\n/g, '\n');
      }
      await setDoc(doc(db, 'love_letters', letter.id), letter);
    }
    console.log(`Migrated ${love_letters.length} love_letters`);

    const timeline_events = extractCopyBlock('timeline_events', ['id', 'title', 'date', 'description', 'image_url', 'created_at']);
    for (const event of timeline_events) {
      await setDoc(doc(db, 'timeline_events', event.id), event);
    }
    console.log(`Migrated ${timeline_events.length} timeline_events`);

    console.log('Data migration complete! 🎉');
    process.exit(0);
  } catch (error) {
    console.error("Error migrating data:", error);
    process.exit(1);
  }
}

run();

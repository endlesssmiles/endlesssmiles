import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// ─── Config ──────────────────────────────────────────────────────────────────
const CLOUD_NAME = 'dmgy0jlyv';
const UPLOAD_PRESET = 'hdj1yjod';
const STORAGE_ROOT = 'd:/endlesssmiles/storage_backup/nrwsuixffklgjtwltuzt';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

// ─── Upload a single file to Cloudinary ──────────────────────────────────────
async function uploadToCloudinary(filePath, folder) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `endlesssmiles/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed for ${fileName}: ${errText}`);
  }

  const data = await res.json();
  return data.secure_url;
}

// ─── Build a mapping of old Supabase filename → local file path ──────────────
function buildFileMap(folder) {
  const dirPath = path.join(STORAGE_ROOT, folder);
  const files = fs.readdirSync(dirPath);
  const map = {};
  for (const file of files) {
    map[file] = path.join(dirPath, file);
  }
  return map;
}

// ─── Main migration ─────────────────────────────────────────────────────────
async function run() {
  console.log('Starting image migration to Cloudinary...\n');

  // --- Timeline Events ---
  const timelineFileMap = buildFileMap('timeline');
  const timelineSnap = await getDocs(collection(db, 'timeline_events'));
  let timelineCount = 0;

  for (const docSnap of timelineSnap.docs) {
    const data = docSnap.data();
    const oldUrl = data.image_url || '';

    // Extract filename from the old Supabase URL
    const fileName = oldUrl.split('/').pop();
    const localPath = timelineFileMap[fileName];

    if (!localPath) {
      console.log(`  ⚠ Timeline "${data.title}" — file not found locally: ${fileName}`);
      continue;
    }

    console.log(`  📸 Uploading timeline: ${data.title} (${fileName})...`);
    const newUrl = await uploadToCloudinary(localPath, 'timeline');
    await updateDoc(doc(db, 'timeline_events', docSnap.id), { image_url: newUrl });
    console.log(`  ✅ Done → ${newUrl.substring(0, 60)}...`);
    timelineCount++;
  }

  // --- Gallery Photos ---
  const galleryFileMap = buildFileMap('gallery');
  const gallerySnap = await getDocs(collection(db, 'gallery_photos'));
  let galleryCount = 0;

  for (const docSnap of gallerySnap.docs) {
    const data = docSnap.data();
    const oldUrl = data.image_url || '';

    const fileName = oldUrl.split('/').pop();
    const localPath = galleryFileMap[fileName];

    if (!localPath) {
      console.log(`  ⚠ Gallery "${data.caption}" — file not found locally: ${fileName}`);
      continue;
    }

    console.log(`  🖼  Uploading gallery: ${data.caption} (${fileName})...`);
    const newUrl = await uploadToCloudinary(localPath, 'gallery');
    await updateDoc(doc(db, 'gallery_photos', docSnap.id), { image_url: newUrl });
    console.log(`  ✅ Done → ${newUrl.substring(0, 60)}...`);
    galleryCount++;
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Timeline: ${timelineCount} images uploaded`);
  console.log(`   Gallery:  ${galleryCount} images uploaded`);
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

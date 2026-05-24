import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  TimelineEvent,
  GalleryPhoto,
  LoveLetter,
  FuturePlan,
} from "@/types/supabase";

// ─── Helpers ────────────────────────────────────────────────────────────────

function tsToString(ts: Timestamp | string | null | undefined): string {
  if (!ts) return new Date().toISOString();
  if (typeof ts === "string") return ts;
  return ts.toDate().toISOString();
}

// ─── Timeline Events ─────────────────────────────────────────────────────────

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const q = query(collection(db, "timeline_events"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      date: data.date,
      description: data.description,
      image_url: data.image_url,
      year_section: data.year_section || "1st Year", // fallback for older events
      created_at: tsToString(data.created_at),
    } as TimelineEvent;
  });
}

export async function addTimelineEvent(
  event: Omit<TimelineEvent, "id" | "created_at">
) {
  const docRef = await addDoc(collection(db, "timeline_events"), {
    ...event,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteTimelineEvent(id: string) {
  await deleteDoc(doc(db, "timeline_events", id));
}

// ─── Gallery Photos ───────────────────────────────────────────────────────────

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const q = query(
    collection(db, "gallery_photos"),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      image_url: data.image_url,
      caption: data.caption,
      created_at: tsToString(data.created_at),
    } as GalleryPhoto;
  });
}

export async function addGalleryPhoto(
  photo: Omit<GalleryPhoto, "id" | "created_at">
) {
  const docRef = await addDoc(collection(db, "gallery_photos"), {
    ...photo,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteGalleryPhoto(id: string) {
  await deleteDoc(doc(db, "gallery_photos", id));
}

// ─── Love Letters ─────────────────────────────────────────────────────────────

export async function getLoveLetters(): Promise<LoveLetter[]> {
  const q = query(collection(db, "love_letters"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      date: data.date,
      content: data.content,
      created_at: tsToString(data.created_at),
    } as LoveLetter;
  });
}

export async function addLoveLetter(
  letter: Omit<LoveLetter, "id" | "created_at">
) {
  const docRef = await addDoc(collection(db, "love_letters"), {
    ...letter,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteLoveLetter(id: string) {
  await deleteDoc(doc(db, "love_letters", id));
}

// ─── Future Plans ─────────────────────────────────────────────────────────────

export async function getFuturePlans(): Promise<FuturePlan[]> {
  const snap = await getDocs(collection(db, "future_plans"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      completed: data.completed ?? false,
      created_at: tsToString(data.created_at),
    } as FuturePlan;
  });
}

export async function addFuturePlan(
  plan: Omit<FuturePlan, "id" | "created_at">
) {
  const docRef = await addDoc(collection(db, "future_plans"), {
    ...plan,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateFuturePlanStatus(
  id: string,
  completed: boolean
) {
  await updateDoc(doc(db, "future_plans", id), { completed });
}

export async function deleteFuturePlan(id: string) {
  await deleteDoc(doc(db, "future_plans", id));
}

// ─── Image Upload (Firebase Storage) ─────────────────────────────────────────

/**
 * Uploads a file to Cloudinary and returns its public download URL.
 * @param file  The File object from an <input type="file">
 * @param folder  Storage folder: "timeline" | "gallery"
 * @param onProgress  Optional callback receiving 0-100 progress %
 */
export async function uploadImage(
  file: File,
  folder: "timeline" | "gallery",
  onProgress?: (pct: number) => void
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing in .env.local");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", `endlesssmiles/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

/**
 * Deletes an image. With Cloudinary unsigned uploads, we cannot securely delete from the frontend.
 * So this is a no-op to prevent app errors. Images will just remain in the Cloudinary account.
 */
export async function deleteStorageImage(url: string): Promise<void> {
  return Promise.resolve();
}

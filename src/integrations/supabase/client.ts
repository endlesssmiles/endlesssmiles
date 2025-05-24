import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  FuturePlan,
  GalleryPhoto,
  TimelineEvent,
  LoveLetter,
  FuturePlanInsert,
  GalleryPhotoInsert,
  LoveLetterInsert,
} from "@/types/supabase";

const SUPABASE_URL = "https://nrwsuixffklgjtwltuzt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yd3N1aXhmZmtsZ2p0d2x0dXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjM2ODcsImV4cCI6MjA2Mjg5OTY4N30.Isn6dN3nn9tBFMaXUXlPEU6DmAzYPhgMO9RqFPuFM-E";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Supabase-Auth-Bypass": "true",
      },
    },
    db: {
      schema: "public",
    },
  }
);

// Type-safe mapping functions

export function mapFuturePlans(
  dbData: Database["public"]["Tables"]["future_plans"]["Row"][]
): FuturePlan[] {
  if (!dbData) return [];
  return dbData.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    completed: item.completed || false,
    created_at: item.created_at,
  }));
}

export function mapGalleryPhotos(
  dbData: Database["public"]["Tables"]["gallery_photos"]["Row"][]
): GalleryPhoto[] {
  if (!dbData) return [];
  return dbData.map((item) => ({
    id: item.id,
    image_url: item.image_url,
    caption: item.caption,
    created_at: item.created_at,
  }));
}

export function mapTimelineEvents(
  dbData: Database["public"]["Tables"]["timeline_events"]["Row"][]
): TimelineEvent[] {
  if (!dbData) return [];
  return dbData.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    description: item.description,
    image_url: item.image_url,
    created_at: item.created_at,
  }));
}

export function mapLoveLetters(
  dbData: Database["public"]["Tables"]["love_letters"]["Row"][]
): LoveLetter[] {
  if (!dbData) return [];
  return dbData.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    content: item.content,
    created_at: item.created_at,
  }));
}

// Upload image to gallery bucket
export async function uploadGalleryImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("gallery")
    .getPublicUrl(fileName);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL for uploaded image");
  }

  return publicUrlData.publicUrl;
}

// Delete gallery image from storage
export async function deleteGalleryImage(url: string): Promise<void> {
  if (url.includes("supabase.co/storage/v1/object/public/gallery/")) {
    const filePath = url.split("gallery/").pop();
    if (filePath) {
      await supabase.storage.from("gallery").remove([filePath]);
    }
  }
}

// CRUD Operations

export async function updateFuturePlan(id: string, completed: boolean) {
  return await supabase.from("future_plans").update({ completed }).eq("id", id);
}

export async function insertFuturePlan(plan: FuturePlanInsert) {
  return await supabase.from("future_plans").insert([plan]);
}

export async function insertGalleryPhoto(photo: GalleryPhotoInsert) {
  return await supabase.from("gallery_photos").insert([photo]);
}

export async function insertLoveLetter(letter: LoveLetterInsert) {
  return await supabase.from("love_letters").insert([letter]);
}

export async function deleteFuturePlan(id: string) {
  return await supabase.from("future_plans").delete().eq("id", id);
}

export async function deleteGalleryPhoto(id: string) {
  return await supabase.from("gallery_photos").delete().eq("id", id);
}

export async function deleteLoveLetter(id: string) {
  return await supabase.from("love_letters").delete().eq("id", id);
}

export async function deleteTimelineEvent(id: string) {
  return await supabase.from("timeline_events").delete().eq("id", id);
}

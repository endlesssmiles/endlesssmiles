
export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string;
  created_at?: string;
}

export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  created_at?: string;
}

export interface LoveLetter {
  id: string;
  title: string;
  date: string;
  content: string;
  created_at?: string;
}

export interface FuturePlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  created_at?: string;
}

// Additional type helpers
export type FuturePlanInsert = {
  title: string;
  description: string;
  icon: string;
  completed: boolean;
};

export type GalleryPhotoInsert = {
  image_url: string;
  caption: string;
};

export type LoveLetterInsert = {
  title: string;
  content: string;
  date: string;
};

// Type to help with Supabase filtering
export type IdFilterValue = string | number;

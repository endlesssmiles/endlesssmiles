
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { TimelineEvent, GalleryPhoto, LoveLetter, FuturePlan } from "@/types/supabase";

type TableName = 'timeline_events' | 'gallery_photos' | 'love_letters' | 'future_plans';
type TableRecord = TimelineEvent | GalleryPhoto | LoveLetter | FuturePlan;

// Helper function to fetch data from any table
export async function fetchDataFromTable<T extends TableRecord>(tableName: TableName): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      throw error;
    }

    return data as T[] || [];
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    toast({
      title: `Error fetching data`,
      description: "Please try again later or contact support.",
      variant: "destructive"
    });
    return [];
  }
}

// Add a new item to any table
export async function addItem<T extends TableRecord>(tableName: TableName, item: Omit<T, 'id' | 'created_at'>): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([item as any])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: "Success!",
      description: "Item added successfully.",
    });

    return data as T;
  } catch (error) {
    console.error(`Error adding item to ${tableName}:`, error);
    toast({
      title: "Error adding item",
      description: "Please try again later or contact support.",
      variant: "destructive"
    });
    return null;
  }
}

// Update an item in any table
export async function updateItem<T extends TableRecord>(tableName: TableName, id: string, updates: Partial<T>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .update(updates as any)
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast({
      title: "Success!",
      description: "Item updated successfully.",
    });

    return true;
  } catch (error) {
    console.error(`Error updating item in ${tableName}:`, error);
    toast({
      title: "Error updating item",
      description: "Please try again later or contact support.",
      variant: "destructive"
    });
    return false;
  }
}

// Delete an item from any table
export async function deleteItem(tableName: TableName, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast({
      title: "Success!",
      description: "Item deleted successfully.",
    });

    return true;
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    toast({
      title: "Error deleting item",
      description: "Please try again later or contact support.",
      variant: "destructive"
    });
    return false;
  }
}

import { useState, useEffect, ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, mapTimelineEvents } from "@/integrations/supabase/client";
import { TimelineEvent } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Timeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    description: "",
    image_url: "https://via.placeholder.com/800x600?text=Add+Your+Image",
  });

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        // Use mapping function to convert types
        const mappedEvents = mapTimelineEvents(data);
        setTimelineEvents(mappedEvents);
        // If we have events, ensure activeIndex is valid
        if (mappedEvents.length > 0 && activeIndex >= mappedEvents.length) {
          setActiveIndex(mappedEvents.length - 1);
        }
      }
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      toast({
        title: "Error fetching timeline events",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : timelineEvents.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < timelineEvents.length - 1 ? prev + 1 : 0));
  };

  const handleAddEvent = () => {
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      image_url: "https://via.placeholder.com/800x600?text=Add+Your+Image",
    });
    setSelectedFile(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setSelectedFile(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setNewEvent((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);

      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading to timeline bucket:", filePath);

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from("timeline")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("timeline")
        .getPublicUrl(filePath);
      console.log("Upload successful, public URL:", urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.description || !newEvent.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // If there's a selected file, upload it first
      let finalImageUrl = newEvent.image_url;
      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image upload failed",
            description: "Please try again or use an image URL.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("timeline_events").insert([
        {
          title: newEvent.title,
          date: newEvent.date,
          description: newEvent.description,
          image_url: finalImageUrl,
        },
      ]);

      if (error) {
        console.error("Error inserting event:", error);
        throw error;
      }

      toast({
        title: "Event added!",
        description: "Your timeline event has been added.",
      });

      // Refresh events and close modal
      await fetchTimelineEvents();
      closeModal();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error adding event",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (timelineEvents.length === 0) return;

    const eventToDelete = timelineEvents[activeIndex];

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("timeline_events")
        .delete()
        .eq("id", eventToDelete.id);

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }

      toast({
        title: "Event deleted",
        description: "The timeline event has been removed.",
      });

      // Close delete dialog
      setIsDeleteDialogOpen(false);

      // Refresh events
      await fetchTimelineEvents();

      // Update active index if needed
      if (activeIndex >= timelineEvents.length - 1 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading or no events, show loading state
  if (loading) {
    return (
      <section id="timeline" className="min-h-screen bg-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
            Our Love Story
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Loading our journey...
          </p>
        </div>
      </section>
    );
  }

  // If no timeline events found
  if (timelineEvents.length === 0) {
    return (
      <section id="timeline" className="min-h-screen bg-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
            Our Love Story
          </h2>
          <p className="text-center text-gray-600 mb-16">
            No timeline events yet. Start adding your journey!
          </p>
          <button
            onClick={handleAddEvent}
            className="bg-white px-6 py-3 rounded-full border border-love-200 text-love-600 hover:bg-love-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
          >
            <Plus size={16} />
            <span>Add First Memory</span>
          </button>
        </div>
      </section>
    );
  }

  const activeEvent = timelineEvents[activeIndex];

  return (
    <section id="timeline" className="min-h-screen bg-white py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
          Our Love Story
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Every moment with you is as precious as you are to me😘. Here's our
          journey so far...
        </p>

        <div className="relative max-w-5xl mx-auto">
          {/* Timeline bar */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-love-100 -translate-y-1/2 z-0">
            <div
              className="absolute left-0 h-full bg-love-400 transition-all duration-500"
              style={{
                width: `${(activeIndex / (timelineEvents.length - 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Timeline indicators */}
          <div className="hidden md:flex justify-between mb-12 relative z-10">
            {timelineEvents.map((event, index) => (
              <button
                key={event.id}
                onClick={() => setActiveIndex(index)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  index <= activeIndex ? "bg-love-500" : "bg-love-100"
                }`}
              >
                <span className="absolute whitespace-nowrap text-xs -top-8">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </button>
            ))}
          </div>

          {/* Card */}
          <Card className="bg-white border border-love-100 rounded-2xl shadow-soft overflow-hidden transition-all duration-500 animate-fade-in">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={activeEvent.image_url}
                    alt={activeEvent.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-1/2 flex flex-col justify-center">
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                    {activeEvent.title}
                  </h3>
                  <p className="text-love-500 font-medium mb-4">
                    {new Date(activeEvent.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600">{activeEvent.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-2 text-gray-600 hover:text-love-500 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="md:hidden text-sm text-gray-500">
              {activeIndex + 1} / {timelineEvents.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 text-gray-600 hover:text-love-500 transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Management buttons */}
          <div className="text-center mt-12 flex justify-center gap-4">
            <button
              onClick={handleAddEvent}
              className="bg-white px-6 py-3 rounded-full border border-love-200 text-love-600 hover:bg-love-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Memory</span>
            </button>

            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-white px-6 py-3 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Trash size={16} />
              <span>Delete This Memory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600">
              Add New Memory
            </DialogTitle>
            <DialogDescription>
              Fill in the details of your special moment together.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="block text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Memory title..."
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="block text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Describe this special moment..."
                className="w-full min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="block text-sm font-medium">
                Image
              </Label>

              <div className="flex flex-col gap-4">
                {/* Preview of selected image */}
                {newEvent.image_url && (
                  <div className="relative w-full h-40 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={newEvent.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* File upload button */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="image_upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Upload size={18} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Upload Image
                      </span>
                    </div>
                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </Label>

                  <p className="text-xs text-gray-500">
                    Or enter an image URL:
                  </p>

                  <Input
                    id="image_url"
                    name="image_url"
                    value={newEvent.image_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting || uploadingImage}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-love-500 hover:bg-love-600 transition-colors duration-300"
                disabled={isSubmitting || uploadingImage}
              >
                {isSubmitting || uploadingImage ? "Adding..." : "Add Memory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-rose-500 hover:bg-rose-600 transition-colors duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Timeline;

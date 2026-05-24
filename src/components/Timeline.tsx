import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Heart, Trash } from "lucide-react";
import {
  getTimelineEvents,
  addTimelineEvent,
  deleteTimelineEvent,
  uploadImage,
} from "@/lib/firebaseDB";
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
import { Progress } from "@/components/ui/progress";

const Timeline = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [targetSection, setTargetSection] = useState("1st Year");
  const [deletingEvent, setDeletingEvent] = useState<TimelineEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    image_url: "",
  });

  // Group events
  const groupedEvents = timelineEvents.reduce((acc, event) => {
    const section = event.year_section || "1st Year";
    if (!acc[section]) acc[section] = [];
    acc[section].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const sections = Object.keys(groupedEvents).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  // Touch handlers for mobile swipe
  const touchStartX = useRef<Record<string, number>>({});
  const touchEndX = useRef<Record<string, number>>({});

  const handleTouchStart = (e: React.TouchEvent, section: string) => {
    touchStartX.current[section] = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent, section: string) => {
    touchEndX.current[section] = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX.current[section] - touchEndX.current[section];
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) {
      handleNext(section);
    } else if (swipeDistance < -minSwipeDistance) {
      handlePrevious(section);
    }
  };

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      const data = await getTimelineEvents();
      setTimelineEvents(data);
      
      // Initialize active indices
      const initialIndices: Record<string, number> = {};
      const grouped = data.reduce((acc, event) => {
        const section = event.year_section || "1st Year";
        if (!acc[section]) acc[section] = [];
        acc[section].push(event);
        return acc;
      }, {} as Record<string, TimelineEvent[]>);
      
      Object.keys(grouped).forEach(section => {
        initialIndices[section] = 0;
      });
      setActiveIndices(initialIndices);
      
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

  const handlePrevious = (section: string) => {
    setActiveIndices((prev) => {
      const current = prev[section] || 0;
      const total = groupedEvents[section]?.length || 1;
      return { ...prev, [section]: current > 0 ? current - 1 : total - 1 };
    });
  };

  const handleNext = (section: string) => {
    setActiveIndices((prev) => {
      const current = prev[section] || 0;
      const total = groupedEvents[section]?.length || 1;
      return { ...prev, [section]: current < total - 1 ? current + 1 : 0 };
    });
  };

  const handleAddEventClick = (section: string) => {
    setTargetSection(section);
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      image_url: "",
    });
    setSelectedFile(null);
    setUploadProgress(null);
    setIsAddModalOpen(true);
  };

  const handleCreateNewSection = () => {
    const newSectionNum = sections.length + 1;
    const s = ["th", "st", "nd", "rd"];
    const v = newSectionNum % 100;
    const ordinal = newSectionNum + (s[(v - 20) % 10] || s[v] || s[0]);
    handleAddEventClick(`${ordinal} Year`);
  };

  const handleDeleteEventClick = (event: TimelineEvent) => {
    setDeletingEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setNewEvent((prev) => ({ ...prev, image_url: "" })); // Clear URL if file selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.date || !newEvent.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile && !newEvent.image_url) {
      toast({
        title: "Missing image",
        description: "Please provide either an image URL or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = newEvent.image_url;

      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage(selectedFile, "timeline", (pct) =>
            setUploadProgress(pct),
          );
        } catch (error) {
          toast({
            title: "Image upload failed",
            description: "Please try again or paste an image URL instead.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      await addTimelineEvent({
        title: newEvent.title,
        date: newEvent.date,
        description: newEvent.description,
        image_url: finalImageUrl || "https://placehold.co/800x600?text=Memory",
        year_section: targetSection,
      });

      toast({
        title: "Memory added! 💖",
        description: `Your memory has been saved to ${targetSection}.`,
      });

      await fetchTimelineEvents();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error adding memory",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    try {
      setIsSubmitting(true);
      await deleteTimelineEvent(deletingEvent.id, deletingEvent.image_url);

      toast({
        title: "Memory deleted",
        description: "The timeline event has been removed.",
      });

      setIsDeleteDialogOpen(false);
      
      const section = deletingEvent.year_section || "1st Year";
      
      await fetchTimelineEvents();

      // Adjust active index if we deleted the last item in the view
      setActiveIndices((prev) => {
        const currentIdx = prev[section] || 0;
        const remaining = (groupedEvents[section]?.length || 1) - 1; 
        if (currentIdx >= remaining && currentIdx > 0) {
          return { ...prev, [section]: currentIdx - 1 };
        }
        return prev;
      });
      setDeletingEvent(null);
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

  if (loading) {
    return (
      <section id="timeline" className="min-h-screen bg-section-alt py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-4">
            Our Love Story
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16">
            Loading our journey...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="min-h-screen bg-section-alt py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-4 text-shadow">
          Our Love Story
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          Every moment with you is as precious as you are to me😘. Here's
          our journey so far...
        </p>

        {sections.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              No timeline events yet. Start adding your journey!
            </p>
            <button
              onClick={() => handleAddEventClick("1st Year")}
              className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
            >
              <Plus size={16} />
              <span>Add First Memory</span>
            </button>
          </div>
        ) : (
          <div className="space-y-24">
            {sections.map((section) => {
              const events = groupedEvents[section];
              const activeIdx = activeIndices[section] || 0;
              const currentEvent = events[activeIdx];

              if (!currentEvent) return null;

              return (
                <div key={section} className="relative max-w-4xl mx-auto px-2 sm:px-0">
                  <h3 className="text-3xl font-serif font-bold text-love-500 dark:text-gold-300 mb-8 text-center sm:text-left pl-2">
                    {section}
                  </h3>
                  
                  {/* Main Card */}
                  <div className="relative">
                    <Card 
                      className="glass-strong border-none rounded-2xl md:rounded-3xl shadow-premium overflow-hidden transition-all duration-500 relative touch-pan-y"
                      onTouchStart={(e) => handleTouchStart(e, section)}
                      onTouchEnd={(e) => handleTouchEnd(e, section)}
                    >
                      <CardContent className="p-0">
                        <div className="md:flex flex-col md:flex-row">
                          {/* Image side */}
                          <div className="w-full md:w-1/2 relative">
                            <img
                              src={currentEvent.image_url}
                              alt={currentEvent.title}
                              className="w-full h-56 sm:h-72 md:h-[420px] object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://placehold.co/800x600?text=Memory";
                              }}
                            />
                            {/* Counter badge */}
                            <div className="absolute top-4 left-4 glass rounded-full px-4 py-1.5 text-sm font-medium text-love-600 dark:text-gold-300">
                              {activeIdx + 1} / {events.length}
                            </div>
                          </div>

                          {/* Text side */}
                          <div className="p-6 sm:p-8 md:p-10 w-full md:w-1/2 flex flex-col justify-center">
                            <p className="text-love-400 dark:text-gold-500 text-xs sm:text-sm font-medium uppercase tracking-widest mb-2 sm:mb-3">
                              {new Date(currentEvent.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-gold-100 mb-3 sm:mb-4 leading-snug">
                              {currentEvent.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                              {currentEvent.description}
                            </p>

                            {/* Navigation Dots */}
                            <div className="flex gap-2 mt-8 md:mt-12 flex-wrap">
                              {events.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveIndices(prev => ({ ...prev, [section]: idx }))}
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === activeIdx
                                      ? "w-8 bg-love-500 dark:bg-gold-400"
                                      : "w-2 bg-love-200 dark:bg-purple-800 hover:bg-love-300 dark:hover:bg-purple-700"
                                  }`}
                                  aria-label={`Go to slide ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Side navigation arrows */}
                    {events.length > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevious(section)}
                          className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass shadow-soft hover:shadow-premium flex items-center justify-center text-love-500 dark:text-gold-400 hover:text-love-600 dark:hover:text-gold-300 transition-all hover:scale-110 z-10 hidden sm:flex"
                        >
                          <ChevronLeft size={22} />
                        </button>
                        <button
                          onClick={() => handleNext(section)}
                          className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass shadow-soft hover:shadow-premium flex items-center justify-center text-love-500 dark:text-gold-400 hover:text-love-600 dark:hover:text-gold-300 transition-all hover:scale-110 z-10 hidden sm:flex"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Management buttons */}
                  <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => handleAddEventClick(section)}
                      className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add to {section}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEventClick(currentEvent)}
                      className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
                    >
                      <Trash size={16} />
                      <span>Delete Memory</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add New Section Button */}
            <div className="text-center mt-16 pt-8 border-t border-love-100 dark:border-purple-900/50">
               <button
                onClick={handleCreateNewSection}
                className="bg-love-50 dark:bg-purple-900/40 px-8 py-4 rounded-full border-2 border-love-200 dark:border-purple-700 text-love-600 dark:text-gold-400 hover:bg-love-100 dark:hover:bg-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center mx-auto space-x-3 font-medium text-lg"
              >
                <Plus size={20} />
                <span>Start New Year Section</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600">
              Add Memory to {targetSection}
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
                placeholder="Tell the story of this memory..."
                className="w-full min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="block text-sm font-medium">Image Options</Label>

              <div className="border border-border/50 rounded-md p-4 space-y-4 bg-muted/30">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="file-upload"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Option 1: Upload Image (Max 5MB)
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full cursor-pointer bg-background"
                    disabled={isSubmitting}
                  />
                  {uploadProgress !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-love-600 dark:text-love-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border/50"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase font-medium">
                    OR
                  </span>
                  <div className="flex-grow border-t border-border/50"></div>
                </div>

                {/* URL Paste */}
                <div className="space-y-2">
                  <Label
                    htmlFor="image_url"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Option 2: Paste Image URL
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={newEvent.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-background"
                    disabled={!!selectedFile || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-love-500 hover:bg-love-600 transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Save Memory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this timeline event? This action
              cannot be undone.
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

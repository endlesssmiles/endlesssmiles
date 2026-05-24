import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  Trash,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  uploadImage,
} from "@/lib/firebaseDB";
import { GalleryPhoto } from "@/types/supabase";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

const SLIDESHOW_INTERVAL = 4000; // 4 seconds per photo

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newPhoto, setNewPhoto] = useState({
    caption: "",
    image_url: "",
  });

  // Touch handlers for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (isSlideshow: boolean) => (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) {
      // Swipe left -> Next
      if (isSlideshow) {
        setSlideshowIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
        setSlideshowProgress(0);
      } else {
        setSelectedIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : 0,
        );
      }
    } else if (swipeDistance < -minSwipeDistance) {
      // Swipe right -> Previous
      if (isSlideshow) {
        setSlideshowIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
        setSlideshowProgress(0);
      } else {
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : photos.length - 1,
        );
      }
    }
  };

  // Slideshow state
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSlideshow = useCallback(() => {
    setSlideshowActive(false);
    setSlideshowPaused(false);
    setSlideshowProgress(0);
    if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  }, []);

  const startSlideshow = useCallback(() => {
    setSlideshowActive(true);
    setSlideshowIndex(0);
    setSlideshowPaused(false);
    setSlideshowProgress(0);
  }, []);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshowActive || slideshowPaused) {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    setSlideshowProgress(0);

    // Progress bar updates every 40ms
    const progressStep = 40;
    progressTimerRef.current = setInterval(() => {
      setSlideshowProgress((prev) => {
        const next = prev + (progressStep / SLIDESHOW_INTERVAL) * 100;
        return next >= 100 ? 100 : next;
      });
    }, progressStep);

    // Advance photo
    slideshowTimerRef.current = setInterval(() => {
      setSlideshowIndex((prev) => {
        if (prev >= photos.length - 1) {
          stopSlideshow();
          return 0;
        }
        setSlideshowProgress(0);
        return prev + 1;
      });
    }, SLIDESHOW_INTERVAL);

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [
    slideshowActive,
    slideshowPaused,
    slideshowIndex,
    photos.length,
    stopSlideshow,
  ]);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (!slideshowActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopSlideshow();
      if (e.key === " ") {
        e.preventDefault();
        setSlideshowPaused((p) => !p);
      }
      if (e.key === "ArrowRight") {
        setSlideshowIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
        setSlideshowProgress(0);
      }
      if (e.key === "ArrowLeft") {
        setSlideshowIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
        setSlideshowProgress(0);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slideshowActive, photos.length, stopSlideshow]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await getGalleryPhotos();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Error fetching gallery",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = () => {
    setNewPhoto({ caption: "", image_url: "" });
    setSelectedFile(null);
    setUploadProgress(null);
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPhoto((prev) => ({ ...prev, [name]: value }));
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
      setNewPhoto((prev) => ({ ...prev, image_url: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !newPhoto.image_url) {
      toast({
        title: "Missing image",
        description: "Please provide either an image URL or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = newPhoto.image_url;

      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage(selectedFile, "gallery", (pct) =>
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

      await addGalleryPhoto({
        caption: newPhoto.caption || "A beautiful memory",
        image_url: finalImageUrl,
      });

      toast({
        title: "Photo added! 📸",
        description: "Your gallery has been updated.",
      });

      await fetchPhotos();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding photo:", error);
      toast({
        title: "Error adding photo",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, photo: GalleryPhoto) => {
    e.stopPropagation();
    setPhotoToDelete(photo);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteGalleryPhoto(photoToDelete.id, photoToDelete.image_url);

      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your gallery.",
      });

      setIsDeleteDialogOpen(false);
      setPhotoToDelete(null);
      await fetchPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error deleting photo",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-20 px-4 bg-love-50 dark:bg-purple-950 min-h-screen">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-4">
            Our Special Memories
          </h2>
          <p className="text-center text-gray-600 mb-16">Loading gallery...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 px-4 bg-love-50 dark:bg-purple-950 min-h-screen transition-colors duration-500">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-4 text-shadow">
          Our Special Memories
        </h2>

        {photos.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto text-lg">
              No photos yet. Start building your gallery!
            </p>
            <button
              onClick={handleAddPhoto}
              className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
            >
              <Plus size={16} />
              <span>Add First Photo</span>
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Every photo tells a story of our journey together. Each smile,
              each moment, a treasure forever.
            </p>

            {/* Play Memories Button */}
            <div className="text-center mb-12">
              <button
                onClick={startSlideshow}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-love-500 to-love-400 dark:from-gold-600 dark:to-gold-500 hover:from-love-600 hover:to-love-500 dark:hover:from-gold-500 dark:hover:to-gold-400 text-white dark:text-[#1A0B2E] font-medium px-6 py-3 sm:px-8 sm:py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-glow hover:scale-105"
              >
                <Play
                  size={18}
                  className="group-hover:scale-110 transition-transform fill-white dark:fill-[#1A0B2E]"
                />
                <span>Play Memories</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2 aspect-square animate-fade-in bg-white dark:bg-purple-900 border border-transparent dark:border-purple-800/50"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Gallery memory"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/800x600?text=Photo";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white font-medium text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {photo.caption}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, photo)}
                    className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-[#1A0B2E]/80 backdrop-blur-sm rounded-full text-rose-500 dark:text-red-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-red-900/50 hover:scale-110 transition-all duration-300 shadow-sm"
                    aria-label="Delete photo"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button
                onClick={handleAddPhoto}
                className="bg-white dark:bg-purple-900/60 px-6 py-3 sm:px-8 sm:py-4 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2 text-base sm:text-lg font-medium"
              >
                <Plus size={20} />
                <span>Add More Photos</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Slideshow Overlay */}
      {slideshowActive &&
        photos[slideshowIndex] &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center overflow-hidden animate-fade-in"
            tabIndex={0}
            ref={(el) => el?.focus()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd(true)}
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-20">
              <div
                className="h-full bg-love-500 transition-all ease-linear"
                style={{
                  width: `${slideshowProgress}%`,
                  transitionDuration: slideshowPaused ? "0ms" : "40ms",
                }}
              />
            </div>

            {/* Controls Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white/80 font-medium tracking-widest text-sm uppercase">
                {slideshowIndex + 1} / {photos.length}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideshowPaused(!slideshowPaused);
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  {slideshowPaused ? (
                    <Play size={20} className="fill-white" />
                  ) : (
                    <Pause size={20} className="fill-white" />
                  )}
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopSlideshow();
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Side navigation arrows */}
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 z-20 opacity-60 md:opacity-50 md:hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setSlideshowIndex((prev) =>
                  prev > 0 ? prev - 1 : photos.length - 1,
                );
                setSlideshowProgress(0);
              }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Main Image with Ken Burns effect */}
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              onClick={() => setSlideshowPaused(!slideshowPaused)}
            >
              <img
                key={slideshowIndex} // Force re-render for animation
                src={photos[slideshowIndex].image_url}
                alt={photos[slideshowIndex].caption || "Slideshow memory"}
                className={`w-full h-full object-contain transition-all duration-1000 ${!slideshowPaused ? "animate-ken-burns" : ""}`}
              />
            </div>

            {/* Caption Overlay */}
            {photos[slideshowIndex].caption && (
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center pointer-events-none">
                <p className="text-white text-center font-medium text-xl md:text-2xl max-w-3xl animate-slide-up leading-relaxed text-shadow">
                  {photos[slideshowIndex].caption}
                </p>
              </div>
            )}

            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 z-20 opacity-60 md:opacity-50 md:hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setSlideshowIndex((prev) =>
                  prev < photos.length - 1 ? prev + 1 : 0,
                );
                setSlideshowProgress(0);
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>,
          document.body,
        )}

      {/* Image Lightbox with Navigation */}
      {selectedIndex !== null &&
        photos[selectedIndex] &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft")
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1,
                );
              if (e.key === "ArrowRight")
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0,
                );
              if (e.key === "Escape") setSelectedIndex(null);
            }}
            tabIndex={0}
            ref={(el) => el?.focus()}
          >
            {/* Close button */}
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={32} />
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-6 text-white/60 text-sm font-medium z-10">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Previous button */}
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 z-10 opacity-60 md:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1,
                );
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={photos[selectedIndex].image_url}
              alt={photos[selectedIndex].caption || "Expanded memory"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            {photos[selectedIndex].caption && (
              <p className="text-white/80 text-center mt-4 font-medium text-lg max-w-xl">
                {photos[selectedIndex].caption}
              </p>
            )}

            {/* Next button */}
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 md:bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 z-10 opacity-60 md:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0,
                );
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>,
          document.body,
        )}

      {/* Add Photo Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600 dark:text-gold-400">
              Add New Photo
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Upload a photo or paste a URL to add to your gallery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="block text-sm font-medium dark:text-gray-200">Image Options</Label>

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
                    value={newPhoto.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-background"
                    disabled={!!selectedFile || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="block text-sm font-medium">
                Caption (Optional)
              </Label>
              <Input
                id="caption"
                name="caption"
                value={newPhoto.caption}
                onChange={handleInputChange}
                placeholder="A beautiful memory..."
                className="w-full"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-love-500 hover:bg-love-600 dark:bg-love-500 dark:hover:bg-love-600 dark:text-[#1A0B2E] transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Add Photo"}
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
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
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

export default Gallery;

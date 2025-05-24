import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Heart,
  Plus,
  X,
  Upload,
  Link as LinkIcon,
  Image,
  Trash,
} from "lucide-react";
import {
  supabase,
  mapGalleryPhotos,
  insertGalleryPhoto,
  deleteGalleryPhoto,
  uploadGalleryImage,
  deleteGalleryImage,
} from "@/integrations/supabase/client";
import { GalleryPhoto, GalleryPhotoInsert } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Gallery = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"url" | "file">("url");
  const [newPhoto, setNewPhoto] = useState({
    image_url: "",
    caption: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => {
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setGalleryItems(mapGalleryPhotos(data));
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      toast({
        title: "Error fetching gallery photos",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setNewPhoto({ image_url: "", caption: "" });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadTab("url");
    setUploadError(null);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPhoto((prev) => ({ ...prev, [name]: value }));
    // Clear any previous errors
    if (uploadError) setUploadError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file.");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10485760) {
        setUploadError("Please select an image smaller than 10MB.");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (uploadTab === "url" && !newPhoto.image_url.trim()) {
      toast({
        title: "Missing image URL",
        description: "Please provide an image URL.",
        variant: "destructive",
      });
      return;
    }

    if (uploadTab === "file" && !selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }
    if (!newPhoto.caption.trim()) {
      toast({
        title: "Missing caption",
        description: "Please add a caption for your memory.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadError(null);

      let image_url = newPhoto.image_url;

      // Handle file upload
      if (uploadTab === "file" && selectedFile) {
        try {
          image_url = await uploadGalleryImage(selectedFile);
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError(
            error instanceof Error ? error.message : "Failed to upload image"
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Insert into database
      const newPhotoData: GalleryPhotoInsert = {
        image_url: image_url,
        caption: newPhoto.caption.trim(),
      };

      const { error: insertError } = await insertGalleryPhoto(newPhotoData);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save memory");
      }

      toast({
        title: "Memory added!",
        description: "Your special memory has been added to the gallery.",
      });

      // Refresh the gallery and close modal
      await fetchGalleryPhotos();
      closeModal();
    } catch (error) {
      console.error("Error adding memory:", error);
      toast({
        title: "Error adding memory",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    setSelectedPhotoId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePhoto = async () => {
    if (!selectedPhotoId) return;

    try {
      setIsSubmitting(true);

      const photoToDelete = galleryItems.find(
        (item) => item.id === selectedPhotoId
      );

      if (photoToDelete) {
        // Delete from storage if it's a stored file
        if (
          photoToDelete.image_url.includes(
            "supabase.co/storage/v1/object/public/gallery/"
          )
        ) {
          try {
            await deleteGalleryImage(photoToDelete.image_url);
          } catch (error) {
            console.error("Error deleting storage file:", error);
            // Continue with database deletion even if storage deletion fails
          }
        }

        // Delete from database
        const { error } = await deleteGalleryPhoto(selectedPhotoId);

        if (error) {
          throw error;
        }

        toast({
          title: "Memory deleted",
          description: "The photo has been removed from the gallery.",
        });

        // Refresh gallery
        await fetchGalleryPhotos();
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error deleting photo",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setSelectedPhotoId(null);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-20 px-4 bg-love-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4 transition-all duration-300">
            Our Special Memories
          </h2>
          <p className="text-center text-gray-600 mb-16">Loading memories...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 px-4 bg-love-50">
      <div className="container mx-auto">
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="w-full"
        >
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 transition-all duration-300 hover:scale-105">
              Our Special Memories
            </h2>
            <CollapsibleTrigger className="ml-4 p-2 rounded-full hover:bg-love-100 transition-all duration-300">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? (
                  <X size={24} className="text-love-500" />
                ) : (
                  <Plus size={24} className="text-love-500" />
                )}
              </motion.div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
                Every photo tells a story of our journey together. Each smile,
                each moment, a treasure forever.
              </p>

              <AnimatePresence>
                {galleryItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-gray-600 mb-16"
                  >
                    No memories yet. Start adding your special moments!
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {galleryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className="overflow-hidden border-love-100 bg-white shadow-soft hover:shadow-md transition-all duration-300 group"
                          onMouseEnter={() => setHoveredCard(item.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <CardContent className="p-0 relative overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.caption}
                              className="w-full h-64 object-cover transition-transform duration-500"
                              style={{
                                transform:
                                  hoveredCard === item.id
                                    ? "scale(1.05)"
                                    : "scale(1)",
                              }}
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  item.image_url
                                );
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 flex items-end p-6 group-hover:opacity-100">
                              <p className="text-white text-shadow">
                                {item.caption}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(item.id);
                              }}
                              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              aria-label="Delete photo"
                            >
                              <Trash size={16} />
                            </button>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center p-4">
                            <span className="text-sm text-gray-600">
                              Memory #{galleryItems.indexOf(item) + 1}
                            </span>
                            <Heart
                              size={18}
                              className={`${
                                hoveredCard === item.id
                                  ? "text-love-500 fill-love-500"
                                  : "text-gray-400"
                              } transition-colors duration-300`}
                            />
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mt-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleAddMemory}
                    className="bg-white px-6 py-3 rounded-full border border-love-200 text-love-600 hover:bg-love-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add More Memories</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Add Memory Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600">
              Add New Memory
            </DialogTitle>
            <DialogDescription>
              Add a special memory to your collection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Tabs
              value={uploadTab}
              onValueChange={(value) => setUploadTab(value as "url" | "file")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon size={16} />
                  <span>Image URL</span>
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload size={16} />
                  <span>Upload File</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-2 animate-fade-in">
                <Label
                  htmlFor="image_url"
                  className="block text-sm font-medium"
                >
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={newPhoto.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Paste a direct link to an image (e.g., from Unsplash, Imgur,
                  etc.)
                </p>
              </TabsContent>

              <TabsContent value="file" className="space-y-3 animate-fade-in">
                <div
                  className={`border-2 ${
                    uploadError ? "border-red-300" : "border-gray-300"
                  } border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-300`}
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-500">
                        {selectedFile?.name}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Image size={40} className="text-gray-400" />
                      <p className="text-sm font-medium">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or GIF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                )}
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                name="caption"
                value={newPhoto.caption}
                onChange={handleInputChange}
                placeholder="Write a short description about this memory..."
                className="w-full"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-love-500 hover:bg-love-600 transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Memory"}
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
        <AlertDialogContent className="animate-scale-in">
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
              onClick={confirmDeletePhoto}
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

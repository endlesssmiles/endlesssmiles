import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import {
  supabase,
  mapLoveLetters,
  insertLoveLetter,
  deleteLoveLetter,
} from "@/integrations/supabase/client";
import { LoveLetter, LoveLetterInsert } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const LettersSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLetter, setNewLetter] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
  });

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("love_letters")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setLetters(mapLoveLetters(data));
      }
    } catch (error) {
      console.error("Error fetching letters:", error);
      toast({
        title: "Error fetching letters",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : letters.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < letters.length - 1 ? prev + 1 : 0));
  };

  const handleAddLetter = () => {
    setNewLetter({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewLetter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLetter.title || !newLetter.content || !newLetter.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const letterData: LoveLetterInsert = {
        title: newLetter.title,
        content: newLetter.content,
        date: newLetter.date,
      };

      const { error } = await insertLoveLetter(letterData);

      if (error) {
        throw error;
      }

      toast({
        title: "Letter added!",
        description: "Your love letter has been added.",
      });

      // Refresh the letters
      await fetchLetters();

      // Close the modal
      closeModal();
    } catch (error) {
      console.error("Error adding letter:", error);
      toast({
        title: "Error adding letter",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLetter = async () => {
    if (letters.length === 0) return;

    const letterToDelete = letters[activeIndex];

    try {
      setIsSubmitting(true);

      const { error } = await deleteLoveLetter(letterToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Letter deleted",
        description: "The letter has been removed.",
      });

      // Close the delete dialog
      setIsDeleteDialogOpen(false);

      // Refresh the letters
      await fetchLetters();

      // Update active index if needed
      if (activeIndex >= letters.length - 1 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting letter:", error);
      toast({
        title: "Error deleting letter",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section id="letters" className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4 transition-all duration-300">
            Letters to You
          </h2>
          <p className="text-center text-gray-600 mb-16">Loading letters...</p>
        </div>
      </section>
    );
  }

  // If no letters found
  if (letters.length === 0) {
    return (
      <section id="letters" className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4 transition-all duration-300">
            Letters to You
          </h2>
          <p className="text-center text-gray-600 mb-16">
            No letters yet. Start writing your feelings!
          </p>
          <button
            onClick={handleAddLetter}
            className="bg-white px-6 py-3 rounded-full border border-love-200 text-love-600 hover:bg-love-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
          >
            <Plus size={16} />
            <span>Add First Letter</span>
          </button>
        </div>
      </section>
    );
  }

  const activeLetter = letters[activeIndex];

  return (
    <section id="letters" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4 transition-all duration-300 hover:scale-105">
          Letters to You
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Kuch Shabdh humare pyaar ke naam😚😚
        </p>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-love-50 border-none shadow-soft overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-love-700">
                  {activeLetter.title}
                </h3>
                <span className="text-love-500 font-medium">
                  {new Date(activeLetter.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="font-handwritten text-lg text-gray-700 whitespace-pre-line leading-relaxed overflow-auto max-h-[400px] animate-fade-in">
                {activeLetter.content}
              </div>
            </CardContent>
            <CardFooter className="bg-white p-4 flex justify-between">
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 text-gray-600 hover:text-love-500 transition-colors duration-300"
              >
                <ChevronLeft size={20} />
                <span>Previous Letter</span>
              </button>

              <div className="text-sm text-gray-500">
                {activeIndex + 1} of {letters.length}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 text-gray-600 hover:text-love-500 transition-colors duration-300"
              >
                <span>Next Letter</span>
                <ChevronRight size={20} />
              </button>
            </CardFooter>
          </Card>

          <div className="text-center mt-8 flex justify-center gap-4">
            <button
              onClick={handleAddLetter}
              className="bg-white px-6 py-3 rounded-full border border-love-200 text-love-600 hover:bg-love-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Letter</span>
            </button>

            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-white px-6 py-3 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
            >
              <Trash size={16} />
              <span>Delete This Letter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Letter Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600">
              Add New Letter
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="block text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={newLetter.title}
                onChange={handleInputChange}
                placeholder="Letter title..."
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
                value={newLetter.date}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="block text-sm font-medium">
                Letter Content
              </Label>
              <Textarea
                id="content"
                name="content"
                value={newLetter.content}
                onChange={handleInputChange}
                placeholder="Write your letter here..."
                className="w-full min-h-[200px]"
                required
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
                {isSubmitting ? "Adding..." : "Add Letter"}
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
            <AlertDialogTitle>Delete Letter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this letter? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLetter}
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

export default LettersSection;

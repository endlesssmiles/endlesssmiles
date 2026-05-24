import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import FloatingHearts from "./FloatingHearts";
import {
  getLoveLetters,
  addLoveLetter,
  deleteLoveLetter,
} from "@/lib/firebaseDB";
import { LoveLetter } from "@/types/supabase";
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
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const data = await getLoveLetters();
      setLetters(data);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      await addLoveLetter({
        title: newLetter.title,
        content: newLetter.content,
        date: newLetter.date,
      });

      toast({
        title: "Letter added! 💌",
        description: "Your love letter has been saved.",
      });

      await fetchLetters();
      setIsAddModalOpen(false);
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
      await deleteLoveLetter(letterToDelete.id);

      toast({
        title: "Letter deleted",
        description: "The letter has been removed.",
      });

      setIsDeleteDialogOpen(false);
      await fetchLetters();

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

  if (loading) {
    return (
      <section id="letters" className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
            Letters to You
          </h2>
          <p className="text-center text-gray-600 mb-16">Loading letters...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="letters" className="relative py-20 px-4 bg-white dark:bg-[#1A0B2E] transition-colors duration-500 overflow-hidden">
      <div className="container relative z-10 mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 mb-4 transition-all duration-300 hover:scale-105 text-shadow">
          Letters to You
        </h2>

        {letters.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto text-lg">
              No letters yet. Start writing your feelings!
            </p>
            <button
              onClick={handleAddLetter}
              className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
            >
              <Plus size={16} />
              <span>Add First Letter</span>
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
              Kuch Shabdh humare pyaar ke naam😚😚
            </p>

            <div className="max-w-3xl mx-auto">
              <Card className="bg-[#fdfaf6] dark:bg-[#2A1B38] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-none shadow-premium overflow-hidden transition-all duration-300">
                <CardContent className="p-8 sm:p-12 relative">
                  {/* Subtle inner shadow for paper depth */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-love-700 dark:text-gold-300">
                      {letters[activeIndex].title}
                    </h3>
                    <span className="text-sm sm:text-base text-love-500 dark:text-gold-500 font-medium whitespace-nowrap">
                      {new Date(letters[activeIndex].date).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="font-handwritten text-2xl sm:text-3xl text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed sm:leading-[1.8] overflow-auto max-h-[50vh] sm:max-h-[400px] animate-fade-in pr-4 relative z-10 font-medium">
                    {letters[activeIndex].content}
                  </div>
                </CardContent>
                <CardFooter className="bg-black/5 dark:bg-black/20 border-t border-black/10 dark:border-white/10 p-4 flex justify-between items-center text-sm sm:text-base relative z-10">
                  <button
                    onClick={handlePrevious}
                    className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-gold-400 transition-colors duration-300"
                  >
                    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Previous Letter</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {activeIndex + 1} of {letters.length}
                  </div>

                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-gold-400 transition-colors duration-300"
                  >
                    <span className="hidden sm:inline">Next Letter</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </CardFooter>
              </Card>

              <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                  onClick={handleAddLetter}
                  className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Write New Letter</span>
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
          </>
        )}
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
                {isSubmitting ? "Adding..." : "Add Letter"}
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

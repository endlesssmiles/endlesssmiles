import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Heart, Plus, Trash } from "lucide-react";
import FloatingHearts from "./FloatingHearts";
import {
  getFuturePlans,
  addFuturePlan,
  updateFuturePlanStatus,
  deleteFuturePlan,
} from "@/lib/firebaseDB";
import { FuturePlan } from "@/types/supabase";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

const FutureSection = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [plans, setPlans] = useState<FuturePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState<FuturePlan | null>(null);
  const [newDream, setNewDream] = useState({
    title: "",
    description: "",
    icon: "✨",
  });

  useEffect(() => {
    fetchFuturePlans();
  }, []);

  const fetchFuturePlans = async () => {
    try {
      setLoading(true);
      const data = await getFuturePlans();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching future plans:", error);
      toast({
        title: "Error fetching future plans",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateFuturePlanStatus(id, !currentStatus);
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, completed: !currentStatus } : plan,
        ),
      );
      toast({
        title: !currentStatus ? "Dream achieved! 🎉" : "Dream reset",
        description: !currentStatus
          ? "Congratulations on accomplishing this dream!"
          : "You can accomplish this again!",
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error updating plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, plan: FuturePlan) => {
    e.stopPropagation();
    setDreamToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDream = async () => {
    if (!dreamToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteFuturePlan(dreamToDelete.id);
      toast({
        title: "Dream removed",
        description: "Your future dream has been removed.",
      });
      setIsDeleteDialogOpen(false);
      setDreamToDelete(null);
      await fetchFuturePlans();
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast({
        title: "Error deleting dream",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewDream((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDream.title || !newDream.description || !newDream.icon) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addFuturePlan({
        title: newDream.title,
        description: newDream.description,
        icon: newDream.icon,
        completed: false,
      });

      toast({
        title: "Dream added! ✨",
        description: "Your future dream has been saved.",
      });
      setNewDream({ title: "", description: "", icon: "✨" });
      setIsAddModalOpen(false);
      await fetchFuturePlans();
    } catch (error) {
      console.error("Error adding dream:", error);
      toast({
        title: "Error adding dream",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="future" className="py-20 px-4 bg-love-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
            Our Future Together
          </h2>
          <p className="text-center text-gray-600 mb-16">Loading dreams...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="future" className="relative py-20 px-4 bg-love-50 dark:bg-purple-950 transition-colors duration-500 overflow-hidden">
      <div className="container relative z-10 mx-auto">
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-8 gap-3 sm:gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center text-love-600 dark:text-gold-400 text-shadow">
              Our Future Together
            </h2>
            <CollapsibleTrigger className="p-2 rounded-full hover:bg-love-100 transition-all duration-300">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? (
                  <ChevronUp className="text-love-500 dark:text-gold-400" />
                ) : (
                  <ChevronDown className="text-love-500 dark:text-gold-400" />
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
              <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
                Kuch Sapne, Kuch Khwaab... Jo sathmae dekhenge aur sathmae poora
                karenge🥳
              </p>

              <AnimatePresence>
                {plans.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-gray-600 dark:text-gray-400 mb-16"
                  >
                    No dreams added yet. Start planning your future together!
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className={`border-0 sm:border transition-all duration-300 cursor-pointer ${
                            plan.completed
                              ? "bg-love-100 dark:bg-purple-800 sm:border-love-300 sm:dark:border-gold-500/50"
                              : "bg-white dark:bg-purple-900 sm:border-love-100 sm:dark:border-purple-800"
                          } shadow-sm sm:shadow-md hover:shadow-lg relative`}
                        >
                          <CardContent className="p-6 flex items-start">
                            <div className="text-4xl mr-4">{plan.icon}</div>
                            <div className="flex-1">
                              <div
                                className="w-full"
                                onClick={() =>
                                  togglePlanStatus(plan.id, plan.completed)
                                }
                              >
                                <h3 className="font-serif font-bold text-lg text-gray-800 dark:text-gold-100 flex items-center">
                                  {plan.title}
                                  {plan.completed && (
                                    <Heart
                                      size={16}
                                      className="ml-2 text-love-500 fill-love-500 dark:text-gold-400 dark:fill-gold-400"
                                    />
                                  )}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                  {plan.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteClick(e, plan)}
                              className="text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-red-400 transition-colors ml-2"
                              aria-label="Delete dream"
                            >
                              <Trash size={18} />
                            </button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                <button
                  onClick={() => {
                    setNewDream({ title: "", description: "", icon: "✨" });
                    setIsAddModalOpen(true);
                  }}
                  className="bg-white dark:bg-purple-900/60 px-6 py-3 rounded-full border border-love-200 dark:border-purple-800 text-love-600 dark:text-gold-400 hover:bg-love-50 dark:hover:bg-purple-800 transition-colors duration-300 shadow-sm hover:shadow flex items-center justify-center mx-auto space-x-2"
                >
                  <Plus size={16} />
                  <span>Add A Dream</span>
                </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Add Dream Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-love-600">
              Add New Dream
            </DialogTitle>
            <DialogDescription>
              Add a dream or goal you'd like to achieve together in the future.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icon" className="block text-sm font-medium">
                Icon
              </Label>
              <Input
                id="icon"
                name="icon"
                value={newDream.icon}
                onChange={handleInputChange}
                placeholder="✨"
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500">
                Use an emoji like ✨, 🌟, 🏝️, 🏡, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="block text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={newDream.title}
                onChange={handleInputChange}
                placeholder="Our dream goal..."
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
                value={newDream.description}
                onChange={handleInputChange}
                placeholder="Describe this dream or goal..."
                className="w-full"
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
                className="bg-love-500 hover:bg-love-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Dream"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dream</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dream? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDream}
              className="bg-rose-500 hover:bg-rose-600"
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

export default FutureSection;

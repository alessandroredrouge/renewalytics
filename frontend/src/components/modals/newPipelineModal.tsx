import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; // For loading state

interface NewPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    countries: string[];
  }) => Promise<void>; // Returns promise for async handling
}

export const NewPipelineModal: React.FC<NewPipelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [countriesInput, setCountriesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setCountriesInput("");
    setIsSubmitting(false);
    setError(null);
  }, []);

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Pipeline name is required.");
      return;
    }

    // Basic parsing for comma-separated countries
    const countries = countriesInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, countries });
      handleClose(); // Close modal on successful submission
    } catch (err) {
      console.error("Failed to create pipeline:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use controlled component pattern for Dialog open state
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
    // We don't control opening from here, only closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Enter the details for your new project pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., UK Offshore Wind Pipeline"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="A brief description of the pipeline's focus"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="countries" className="text-right">
                Countries
              </Label>
              <Input
                id="countries"
                value={countriesInput}
                onChange={(e) => setCountriesInput(e.target.value)}
                className="col-span-3"
                placeholder="e.g., UK, Ireland (comma-separated)"
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="col-span-4 text-sm text-destructive text-center">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Pipeline"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

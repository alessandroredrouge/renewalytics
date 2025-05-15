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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Simplified ProjectCreateData Interface ---
// Only includes fields needed to create the project stub
export interface ProjectCreateData {
  pipeline_id: string; // Essential link
  name: string;
  description?: string | null;
  country?: string | null;
  location?: string | null;
  type_of_plant?: string[] | null;
  // Removed all technical and economic fields
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateData) => Promise<void>;
  pipelineId: string | null; // ID of the pipeline to associate the project with
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pipelineId,
}) => {
  // --- State for Simplified Form Fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [isBess, setIsBess] = useState(false);
  const [isPv, setIsPv] = useState(false);
  // Removed state for technical and economic fields

  // --- Control State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed activeTab state

  // Determine plant types based on checkboxes
  const typeOfPlant = [...(isBess ? ["BESS"] : []), ...(isPv ? ["PV"] : [])];

  // Reset form fields
  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setCountry("");
    setLocation("");
    setIsBess(false);
    setIsPv(false);
    // Removed reset for technical/economic fields
    setIsSubmitting(false);
    setError(null);
  }, []);

  // Close handler
  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  // Simplified Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pipelineId) {
      setError("Cannot create project without a selected pipeline.");
      return;
    }
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    // Optional: Add validation for type_of_plant if needed
    // if (typeOfPlant.length === 0) {
    //   setError("Please select at least one Project Type (BESS or PV).");
    //   return;
    // }

    // --- Create simplified project data object ---
    const projectData: ProjectCreateData = {
      pipeline_id: pipelineId,
      name: name.trim(),
      description: description.trim() || null,
      country: country.trim() || null,
      location: location.trim() || null,
      type_of_plant: typeOfPlant.length > 0 ? typeOfPlant : null,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(projectData);
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog open/close handler
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Disable modal interaction when closed or submitting
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        // className="sm:max-w-3xl max-h-[90vh] flex flex-col" // Revert size change
        className="sm:max-w-lg" // Make modal smaller
        onPointerDownOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Project Stub</DialogTitle>{" "}
            {/* Updated Title */}
            <DialogDescription>
              Enter the basic details for the new project within the selected
              pipeline. More details can be added later.
            </DialogDescription>
          </DialogHeader>

          {/* Removed Tabs - Directly show general fields */}
          <div className="flex-grow overflow-y-auto p-1 py-4 space-y-4">
            {/* --- General Fields --- */}
            <LabelledInput
              label="Project Name *"
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Site Alpha BESS"
              required
              disabled={isSubmitting}
            />
            <LabelledInput
              label="Country"
              id="proj-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., United Kingdom"
              disabled={isSubmitting}
            />
            <LabelledInput
              label="Location"
              id="proj-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Near Manchester, UK or Lat/Lon coords"
              disabled={isSubmitting}
            />
            <div>
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea
                id="proj-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief project description"
                disabled={isSubmitting}
              />
            </div>

            <fieldset className="border p-4 rounded">
              <legend className="text-sm font-medium px-1">Project Type</legend>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-bess"
                    checked={isBess}
                    onCheckedChange={(checked) => setIsBess(!!checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="type-bess">BESS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-pv"
                    checked={isPv}
                    onCheckedChange={(checked) => setIsPv(!!checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="type-pv">PV</Label>
                </div>
              </div>
            </fieldset>
            {/* Removed Technical and Economic fields/sections */}
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            {error && (
              <p className="text-sm text-destructive text-center mr-auto">
                Error: {error}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !pipelineId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for labelled inputs - Stays the same
interface LabelledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  label,
  id,
  unit,
  ...props
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center">
        <Input id={id} {...props} className={cn(unit && "rounded-r-none")} />
        {unit && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm h-10">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

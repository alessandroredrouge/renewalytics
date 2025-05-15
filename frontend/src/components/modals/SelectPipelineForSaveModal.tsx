import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getPipelines } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Folder } from "lucide-react";

// Interface for Pipeline data (could be shared in a types file)
interface PipelineData {
  pipeline_id: string;
  name: string;
  description: string;
  countries: string[];
}

interface SelectPipelineForSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPipelineSelect: (pipelineId: string) => void; // Callback with selected pipeline ID
}

export const SelectPipelineForSaveModal: React.FC<
  SelectPipelineForSaveModalProps
> = ({
  isOpen,
  onClose,
  onPipelineSelect,
}) => {
  const [pipelines, setPipelines] = useState<PipelineData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchPipelinesData();
      setSelectedPipelineId(""); // Reset selection when opening
    } else {
      // Clear data when closing to avoid showing stale list briefly
      setPipelines([]);
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen]);

  const fetchPipelinesData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPipelines = await getPipelines();
      setPipelines(fetchedPipelines);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load pipelines"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSave = () => {
    if (selectedPipelineId) {
      onPipelineSelect(selectedPipelineId);
      // onClose(); // Let the calling component close after handling the selection
    } else {
        setError("Please select a pipeline.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Sandbox Project</DialogTitle>
          <DialogDescription>
            Select the pipeline where you want to save this new project.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="pipeline-select-save"
              className="text-right col-span-1 text-sm font-medium"
            >
              Pipeline
            </label>
            {isLoading ? (
              <Skeleton className="h-10 w-full col-span-3" />
            ) : (
              <Select
                value={selectedPipelineId}
                onValueChange={setSelectedPipelineId}
                disabled={isLoading || !!error || pipelines.length === 0}
              >
                <SelectTrigger
                  id="pipeline-select-save"
                  className="col-span-3"
                >
                  <SelectValue placeholder="Select a pipeline..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Pipelines</SelectLabel>
                    {pipelines.map((pipeline) => (
                      <SelectItem
                        key={pipeline.pipeline_id}
                        value={pipeline.pipeline_id}
                      >
                         <div className="flex items-center">
                            <Folder size={14} className="mr-2 text-muted-foreground"/>
                            {pipeline.name}
                        </div>
                      </SelectItem>
                    ))}
                    {pipelines.length === 0 && !isLoading && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No pipelines found. Create one first.
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            disabled={!selectedPipelineId || isLoading}
          >
            Save Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

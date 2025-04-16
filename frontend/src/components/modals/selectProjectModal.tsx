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
import {
  getPipelines,
  getProjectsForPipeline,
  ProjectData,
} from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Match PipelineData structure used elsewhere
interface PipelineData {
  pipeline_id: string;
  name: string;
  description: string;
  countries: string[];
}

interface SelectProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (project: { id: string; name: string }) => void;
}

export const SelectProjectModal: React.FC<SelectProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectSelect,
}) => {
  const [pipelines, setPipelines] = useState<PipelineData[]>([]);
  const [isPipelinesLoading, setIsPipelinesLoading] = useState<boolean>(true);
  const [pipelinesError, setPipelinesError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Reset state when modal opens/closes or pipelines load
  useEffect(() => {
    if (isOpen) {
      // Reset selections and fetch pipelines when opening
      setSelectedPipelineId("");
      setSelectedProjectId("");
      setProjects([]);
      setProjectsError(null);
      fetchPipelinesData();
    } else {
      // Optionally clear data when closing to avoid stale data next time
      setPipelines([]);
      setProjects([]);
      setIsPipelinesLoading(true);
    }
  }, [isOpen]);

  // Fetch pipelines
  const fetchPipelinesData = async () => {
    setIsPipelinesLoading(true);
    setPipelinesError(null);
    try {
      const fetchedPipelines = await getPipelines();
      setPipelines(fetchedPipelines);
    } catch (err) {
      console.error(err);
      setPipelinesError(
        err instanceof Error ? err.message : "Failed to load pipelines"
      );
    } finally {
      setIsPipelinesLoading(false);
    }
  };

  // Fetch projects when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      fetchProjectsData(selectedPipelineId);
    } else {
      setProjects([]); // Clear projects if no pipeline is selected
      setSelectedProjectId(""); // Reset project selection
    }
  }, [selectedPipelineId]);

  const fetchProjectsData = async (pipelineId: string) => {
    setIsProjectsLoading(true);
    setProjectsError(null);
    setProjects([]); // Clear previous projects
    setSelectedProjectId(""); // Reset project selection
    try {
      const fetchedProjects = await getProjectsForPipeline(pipelineId);
      setProjects(fetchedProjects);
    } catch (err) {
      console.error(err);
      setProjectsError(
        err instanceof Error
          ? err.message
          : "Failed to load projects for this pipeline"
      );
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    // Project fetching is handled by the useEffect hook
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleConfirm = () => {
    const selectedProject = projects.find(
      (p) => p.project_id === selectedProjectId
    );
    if (selectedProject) {
      onProjectSelect({
        id: selectedProject.project_id,
        name: selectedProject.name,
      });
    } else {
      // Handle case where project isn't found (shouldn't happen if UI is correct)
      console.error("Selected project not found");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Project</DialogTitle>
          <DialogDescription>
            Choose a pipeline and then select the project you want to open.
          </DialogDescription>
        </DialogHeader>

        {pipelinesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Pipelines</AlertTitle>
            <AlertDescription>{pipelinesError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="pipeline-select"
              className="text-right col-span-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pipeline
            </label>
            {isPipelinesLoading ? (
              <Skeleton className="h-10 w-full col-span-3" />
            ) : (
              <Select
                value={selectedPipelineId}
                onValueChange={handlePipelineChange}
                disabled={
                  isPipelinesLoading ||
                  !!pipelinesError ||
                  pipelines.length === 0
                }
              >
                <SelectTrigger id="pipeline-select" className="col-span-3">
                  <SelectValue placeholder="Select a pipeline..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pipelines</SelectLabel>
                    {pipelines.map((pipeline) => (
                      <SelectItem
                        key={pipeline.pipeline_id}
                        value={pipeline.pipeline_id}
                      >
                        {pipeline.name}
                      </SelectItem>
                    ))}
                    {pipelines.length === 0 && !isPipelinesLoading && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No pipelines found.
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {projectsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Projects</AlertTitle>
              <AlertDescription>{projectsError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="project-select"
              className="text-right col-span-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Project
            </label>
            {isProjectsLoading ? (
              <Skeleton className="h-10 w-full col-span-3" />
            ) : (
              <Select
                value={selectedProjectId}
                onValueChange={handleProjectChange}
                disabled={
                  !selectedPipelineId ||
                  isProjectsLoading ||
                  !!projectsError ||
                  projects.length === 0
                }
              >
                <SelectTrigger id="project-select" className="col-span-3">
                  <SelectValue
                    placeholder={
                      selectedPipelineId
                        ? "Select a project..."
                        : "Select pipeline first..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.project_id}
                        value={project.project_id}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                    {selectedPipelineId &&
                      projects.length === 0 &&
                      !isProjectsLoading && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No projects found in this pipeline.
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
            onClick={handleConfirm}
            disabled={!selectedProjectId || isProjectsLoading}
          >
            Open Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

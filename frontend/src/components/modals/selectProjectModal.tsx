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
import { AlertCircle, PlusCircle } from "lucide-react";
import {
  useProjectData,
  ActiveProjectState,
} from "@/contexts/ProjectDataContext";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";

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

  const { setProjectData } = useProjectData();
  const { setView, setActiveProjectId } = useView();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSelectedPipelineId("");
      setSelectedProjectId("");
      setProjects([]);
      setProjectsError(null);
      fetchPipelinesData();
    } else {
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (selectedPipelineId) {
      fetchProjectsData(selectedPipelineId);
    } else {
      setProjects([]);
      setSelectedProjectId("");
    }
  }, [selectedPipelineId]);

  const fetchProjectsData = async (pipelineId: string) => {
    setIsProjectsLoading(true);
    setProjectsError(null);
    setProjects([]);
    setSelectedProjectId("");
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
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleConfirmOpenExisting = () => {
    const selectedProject = projects.find(
      (p) => p.project_id === selectedProjectId
    );
    if (selectedProject) {
      onProjectSelect({
        id: selectedProject.project_id,
        name: selectedProject.name,
      });
    } else {
      console.error("Selected project not found");
    }
  };

  const handleStartSandbox = () => {
    console.log("Starting Sandbox Project");

    const defaultSandboxState: ActiveProjectState = {
      project_id: null as any,
      pipeline_id: "",
      name: "New Sandbox Project",
      description: "Unsaved project. Fill in details and save.",
      country: null,
      location: null,
      type_of_plant: [],
      technology: null,
      hybrid: null,
      nominal_power_capacity: null,
      max_discharging_power: null,
      max_charging_power: null,
      nominal_energy_capacity: null,
      max_soc: null,
      min_soc: null,
      charging_efficiency: null,
      discharging_efficiency: null,
      calendar_lifetime: null,
      cycling_lifetime: null,
      capex_power: null,
      capex_energy: null,
      capex_tot: null,
      opex_power_yr: null,
      opex_energy_yr: null,
      opex_yr: null,
      revenue_streams: null,
      created_at: new Date().toISOString(),
    };

    setProjectData(defaultSandboxState);
    setView("project");
    setActiveProjectId("sandbox");
    navigate("/project-overview");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open or Start Project</DialogTitle>
          <DialogDescription>
            Select an existing project or start a new one in sandbox mode.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 border-b pb-6 mb-4">
          <h4 className="font-medium text-sm mb-2">Open Existing Project</h4>
          {pipelinesError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Pipelines</AlertTitle>
              <AlertDescription>{pipelinesError}</AlertDescription>
            </Alert>
          )}
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
            <Alert variant="destructive" className="mt-2">
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
          <Button
            className="w-full mt-2"
            onClick={handleConfirmOpenExisting}
            disabled={!selectedProjectId || isProjectsLoading}
          >
            Open Selected Project
          </Button>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Or Start New</h4>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleStartSandbox}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Start New Sandbox Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, X, Loader2, Save, Play } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { SelectProjectModal } from "@/components/modals/selectProjectModal";
import { SelectPipelineForSaveModal } from "@/components/modals/SelectPipelineForSaveModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProjectData } from "@/contexts/ProjectDataContext";
import {
  getProjectDetails,
  updateProject,
  createProject,
  ProjectData,
} from "@/lib/apiClient";
import { toast } from "sonner";

interface OpenedProject {
  id: string;
  name: string;
}

const Navbar = () => {
  const { setView, setActiveProjectId, activeProjectId, view } = useView();
  const { projectData, setProjectData, isSaved, markAsSaved, projectId } =
    useProjectData();
  const navigate = useNavigate();
  const [openedSavedProjects, setOpenedSavedProjects] = useState<
    OpenedProject[]
  >([]);
  const [localActiveViewId, setLocalActiveViewId] = useState<string | null>(
    activeProjectId
  );
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] =
    useState(false);
  const [isSelectPipelineModalOpen, setIsSelectPipelineModalOpen] =
    useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalActiveViewId(activeProjectId);
  }, [activeProjectId]);

  const handleGeneralViewClick = () => {
    setView("general");
    setActiveProjectId(null);
    setProjectData(null);
    navigate("/");
  };

  const activateProjectView = (projectId: string | null) => {
    setView("project");
    setActiveProjectId(projectId);
    if (projectId) {
      navigate("/project-overview");
    }
  };

  const handleSwitchToProjectTab = (projectId: string) => {
    if (projectId !== projectData?.project_id) {
      console.log(
        `Context project ${projectData?.project_id} differs from tab ${projectId}. Reloading...`
      );
      const projectToLoad = openedSavedProjects.find((p) => p.id === projectId);
      if (projectToLoad) {
        handleProjectSelect(projectToLoad);
      } else {
        console.error(
          "Attempted to switch to a tab not in openedSavedProjects"
        );
      }
    } else {
      activateProjectView(projectId);
      console.log(`Switched tab to existing loaded project: ${projectId}`);
    }
  };

  const handleSwitchToSandboxTab = () => {
    activateProjectView("sandbox");
    console.log("Switched tab to Sandbox");
  };

  const handleOpenProjectModal = () => {
    setIsSelectProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsSelectProjectModalOpen(false);
  };

  const handleProjectSelect = async (project: OpenedProject) => {
    setIsSelectProjectModalOpen(false);
    setIsLoadingProject(project.id);
    setLocalActiveViewId(project.id);

    if (!openedSavedProjects.some((p) => p.id === project.id)) {
      setOpenedSavedProjects([...openedSavedProjects, project]);
    }

    try {
      console.log(`Fetching details for project ID: ${project.id}`);
      const fetchedProjectDetails = await getProjectDetails(project.id);
      console.log("Fetched details:", fetchedProjectDetails);
      setProjectData(fetchedProjectDetails);
      activateProjectView(project.id);
    } catch (error) {
      console.error("Failed to load project details:", error);
      toast.error("Failed to load project details", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      setOpenedSavedProjects((prev) => prev.filter((p) => p.id !== project.id));
      if (localActiveViewId === project.id) {
        handleGeneralViewClick();
      }
    } finally {
      setIsLoadingProject(null);
    }
  };

  const handleCloseProjectTab = (
    projectIdToClose: string | null,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (projectIdToClose === "sandbox") {
      handleGeneralViewClick();
    } else if (projectIdToClose) {
      setOpenedSavedProjects(
        openedSavedProjects.filter((p) => p.id !== projectIdToClose)
      );
      if (localActiveViewId === projectIdToClose) {
        handleGeneralViewClick();
      }
    }
  };

  const handleSaveProject = async () => {
    if (isSaved || !projectData) {
      console.log("Project already saved or no data to save.");
      return;
    }
    if (isSaving) return;

    if (projectId && projectId !== "sandbox") {
      setIsSaving(true);
      console.log(`Attempting to update project ID: ${projectId}`);
      try {
        const updatedData = await updateProject(projectId, projectData);
        markAsSaved();
        toast.success("Project saved successfully!");
      } catch (error) {
        console.error("Failed to save project:", error);
        toast.error("Failed to save project", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsSaving(false);
      }
    } else if (projectId === "sandbox") {
      console.log(
        "Save clicked for Sandbox project. Opening pipeline selector."
      );
      setIsSelectPipelineModalOpen(true);
    } else {
      console.error("Save clicked but project state is inconsistent.");
      toast.error("Cannot save project: Invalid project state.");
    }
  };

  const handlePipelineSelectedForSave = async (selectedPipelineId: string) => {
    setIsSelectPipelineModalOpen(false);
    if (!projectData) {
      toast.error("Cannot save: No project data found.");
      return;
    }

    setIsSaving(true);
    console.log(
      `Attempting to save Sandbox project to pipeline: ${selectedPipelineId}`
    );

    const dataToCreate = {
      ...projectData,
      pipeline_id: selectedPipelineId,
      project_id: undefined,
    };
    if (!dataToCreate.name) {
      dataToCreate.name = "Untitled Sandbox Project";
    }

    try {
      const savedProject = await createProject(dataToCreate as ProjectData);
      toast.success("Sandbox project saved successfully!", {
        description: `Project Name: ${savedProject.name}`,
      });

      setProjectData(savedProject);
      setOpenedSavedProjects((prev) => [
        ...prev,
        { id: savedProject.project_id, name: savedProject.name },
      ]);
      setActiveProjectId(savedProject.project_id);
      setLocalActiveViewId(savedProject.project_id);
    } catch (error) {
      console.error("Failed to save sandbox project:", error);
      toast.error("Failed to save sandbox project", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSimulation = () => {
    console.log("Run Simulation button clicked.");
    toast.info("Run Simulation functionality not yet implemented.");
  };

  const isSandboxActive = activeProjectId === "sandbox";
  const showProjectButtons = view === "project" && activeProjectId !== null;

  return (
    <TooltipProvider delayDuration={100}>
      <header className="border-b bg-card h-16 flex items-center px-4 justify-between gap-4">
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Button
            variant={localActiveViewId === null ? "secondary" : "ghost"}
            className="font-medium ml-4 text-sm h-8 px-3 shrink-0"
            onClick={handleGeneralViewClick}
          >
            <LayoutDashboard size={16} className="mr-2" />
            General View
          </Button>
        </div>

        <div className="flex items-center flex-grow min-w-0 overflow-hidden">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide flex-grow">
            {isSandboxActive && (
              <Tooltip key="sandbox">
                <TooltipTrigger asChild>
                  <Button
                    variant={"secondary"}
                    className="font-medium text-sm h-8 px-3 relative group whitespace-nowrap shrink-0"
                    onClick={handleSwitchToSandboxTab}
                  >
                    <span>New Project*</span>
                    <button
                      onClick={(e) => handleCloseProjectTab("sandbox", e)}
                      className="absolute top-1/2 right-1 transform -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Close New Project`}
                    >
                      <X size={12} />
                    </button>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unsaved Sandbox Project</p>
                </TooltipContent>
              </Tooltip>
            )}

            {openedSavedProjects.map((project) => (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      localActiveViewId === project.id ? "secondary" : "ghost"
                    }
                    className="font-medium text-sm h-8 px-3 relative group whitespace-nowrap shrink-0"
                    onClick={() => handleSwitchToProjectTab(project.id)}
                    disabled={isLoadingProject === project.id}
                  >
                    {isLoadingProject === project.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    <span>{project.name}</span>
                    <button
                      onClick={(e) => handleCloseProjectTab(project.id, e)}
                      className="absolute top-1/2 right-1 transform -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label={`Close project ${project.name}`}
                      disabled={isLoadingProject === project.id}
                    >
                      <X size={12} />
                    </button>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {project.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "ml-2 h-8 w-8 shrink-0",
                  openedSavedProjects.length === 0 &&
                    !isSandboxActive &&
                    "animate-pulse-cta"
                )}
                onClick={handleOpenProjectModal}
              >
                <Plus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open or Start Project</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center flex-shrink-0">
          {showProjectButtons && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={!isSaved ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={handleSaveProject}
                    disabled={isSaving || (isSaved && !isSandboxActive)}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isSaving
                      ? "Saving..."
                      : isSaved && !isSandboxActive
                      ? "Project Saved"
                      : "Save Project"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRunSimulation}
                  >
                    <Play size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run Simulation</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <SelectProjectModal
          isOpen={isSelectProjectModalOpen}
          onClose={handleCloseProjectModal}
          onProjectSelect={handleProjectSelect}
        />
        <SelectPipelineForSaveModal
          isOpen={isSelectPipelineModalOpen}
          onClose={() => setIsSelectPipelineModalOpen(false)}
          onPipelineSelect={handlePipelineSelectedForSave}
        />
      </header>
    </TooltipProvider>
  );
};

export default Navbar;

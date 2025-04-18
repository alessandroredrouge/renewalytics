import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, X, Loader2 } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { SelectProjectModal } from "@/components/modals/selectProjectModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { getProjectDetails } from "@/lib/apiClient";
import { toast } from "sonner";

interface OpenedProject {
  id: string;
  name: string;
}

const Navbar = () => {
  const { setView, setActiveProjectId, activeProjectId, view } = useView();
  const { setProjectData } = useProjectData();
  const navigate = useNavigate();
  const [openedProjects, setOpenedProjects] = useState<OpenedProject[]>([]);
  const [activeView, setActiveView] = useState<string | "general">("general");
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] =
    useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState<string | null>(null);

  const handleGeneralViewClick = () => {
    setActiveView("general");
    setView("general");
    setActiveProjectId(null);
    setProjectData(null);
    navigate("/");
  };

  const activateProjectView = (projectId: string) => {
    setActiveView(projectId);
    setView("project");
    setActiveProjectId(projectId);
    navigate("/project-overview");
  };

  const handleSwitchToProjectTab = (projectId: string) => {
    activateProjectView(projectId);
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

    if (!openedProjects.some((p) => p.id === project.id)) {
      setOpenedProjects([...openedProjects, project]);
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
      setOpenedProjects((prev) => prev.filter((p) => p.id !== project.id));
      if (activeView === project.id) {
        handleGeneralViewClick();
      }
    } finally {
      setIsLoadingProject(null);
    }
  };

  const handleCloseProjectTab = (
    projectIdToClose: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setOpenedProjects(openedProjects.filter((p) => p.id !== projectIdToClose));

    if (activeView === projectIdToClose) {
      handleGeneralViewClick();
    }
  };

  const shouldPulse = openedProjects.length === 0;

  return (
    <TooltipProvider delayDuration={100}>
      <header className="border-b bg-card h-16 flex items-center px-4 justify-between">
        <div className="flex items-center flex-grow min-w-0">
          <SidebarTrigger />
          <Button
            variant={activeView === "general" ? "secondary" : "ghost"}
            className="font-medium ml-4 text-sm h-8 px-3 shrink-0"
            onClick={handleGeneralViewClick}
          >
            <LayoutDashboard size={16} className="mr-2" />
            General View
          </Button>

          <div className="flex items-center space-x-1 ml-1 overflow-x-auto scrollbar-hide">
            {openedProjects.map((project) => (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeView === project.id ? "secondary" : "ghost"}
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
                variant={shouldPulse ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "ml-2 h-8 w-8 shrink-0",
                  shouldPulse && "animate-pulse-cta"
                )}
                onClick={handleOpenProjectModal}
              >
                <Plus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open a project</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <SelectProjectModal
          isOpen={isSelectProjectModalOpen}
          onClose={handleCloseProjectModal}
          onProjectSelect={handleProjectSelect}
        />
      </header>
    </TooltipProvider>
  );
};

export default Navbar;

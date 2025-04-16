import React, { useContext, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, X } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { SelectProjectModal } from "@/components/modals/selectProjectModal";

interface OpenedProject {
  id: string;
  name: string;
}

const Navbar = () => {
  const { setView, setActiveProjectId } = useView();
  const [openedProjects, setOpenedProjects] = useState<OpenedProject[]>([]);
  const [activeView, setActiveView] = useState<string | "general">("general");
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] =
    useState(false);

  const handleGeneralViewClick = () => {
    setActiveView("general");
    setView("general");
    setActiveProjectId(null);
  };

  const handleProjectTabClick = (projectId: string) => {
    setActiveView(projectId);
    setView("project");
    setActiveProjectId(projectId);
  };

  const handleOpenProjectModal = () => {
    setIsSelectProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsSelectProjectModalOpen(false);
  };

  const handleProjectSelect = (project: OpenedProject) => {
    if (!openedProjects.some((p) => p.id === project.id)) {
      setOpenedProjects([...openedProjects, project]);
    }
    handleProjectTabClick(project.id);
    setIsSelectProjectModalOpen(false);
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

  return (
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
            <Button
              key={project.id}
              variant={activeView === project.id ? "secondary" : "ghost"}
              className="font-medium text-sm h-8 px-3 relative group whitespace-nowrap shrink-0"
              onClick={() => handleProjectTabClick(project.id)}
            >
              <span>{project.name}</span>
              <button
                onClick={(e) => handleCloseProjectTab(project.id, e)}
                className="absolute top-1/2 right-1 transform -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Close project ${project.name}`}
              >
                <X size={12} />
              </button>
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-8 w-8 shrink-0"
          onClick={handleOpenProjectModal}
        >
          <Plus size={18} />
        </Button>
      </div>

      <SelectProjectModal
        isOpen={isSelectProjectModalOpen}
        onClose={handleCloseProjectModal}
        onProjectSelect={handleProjectSelect}
      />
    </header>
  );
};

export default Navbar;

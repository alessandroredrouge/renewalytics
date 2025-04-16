import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  FileText,
  Filter,
  FolderPlus,
  MoreHorizontal,
  Search,
  SortAsc,
  Battery,
  Zap,
  Calendar,
  Star,
  Tag,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  getPipelines,
  createPipeline,
  createProject,
  getProjectsForPipeline,
  ProjectData,
} from "@/lib/apiClient";
import { NewPipelineModal } from "@/components/modals/newPipelineModal";
import {
  NewProjectModal,
  ProjectCreateData,
} from "@/components/modals/newProjectModal";
import { ProjectDetailsModal } from "@/components/modals/projectDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for Pipeline data
interface PipelineData {
  pipeline_id: string;
  name: string;
  description: string;
  countries: string[];
  // created_at: string; // Add if needed later
}

// Remove Sample Pipeline data
// const samplePipelines: PipelineData[] = [ ... ];

// Sample project data (remains for now, will be linked to selected pipeline later)
const sampleProjects = [
  {
    id: 1,
    name: "New York BESS Project",
    type: "BESS",
    description: "100MW / 400MWh Battery Energy Storage System in NYISO Zone J",
    progress: 65,
    status: "In Progress",
    lastUpdated: "2 days ago",
    createdAt: "Jan 15, 2023",
    owner: { name: "Sarah Chen", initials: "SC", avatar: "" },
    team: [
      { name: "Michael Rodriguez", initials: "MR", avatar: "" },
      { name: "Emma Wilson", initials: "EW", avatar: "" },
      { name: "James Kim", initials: "JK", avatar: "" },
    ],
    starred: true,
    tags: ["NYISO", "Utility Scale", "Zone J"],
  },
  {
    id: 2,
    name: "California Storage Project",
    type: "BESS",
    description: "50MW / 200MWh Battery Energy Storage System in CAISO",
    progress: 28,
    status: "In Progress",
    lastUpdated: "5 days ago",
    createdAt: "Mar 22, 2023",
    owner: { name: "Alex Johnson", initials: "AJ", avatar: "" },
    team: [
      { name: "Diego Martinez", initials: "DM", avatar: "" },
      { name: "Lisa Wong", initials: "LW", avatar: "" },
    ],
    starred: false,
    tags: ["CAISO", "Mid Scale", "Hybrid Ready"],
  },
  {
    id: 3,
    name: "Texas ERCOT Facility",
    type: "BESS",
    description: "150MW / 300MWh Battery Energy Storage System for ERCOT FCR",
    progress: 92,
    status: "Near Completion",
    lastUpdated: "Yesterday",
    createdAt: "Nov 10, 2022",
    owner: { name: "Robert Smith", initials: "RS", avatar: "" },
    team: [
      { name: "Jessica Huang", initials: "JH", avatar: "" },
      { name: "Tyler Johnson", initials: "TJ", avatar: "" },
      { name: "Maya Patel", initials: "MP", avatar: "" },
    ],
    starred: true,
    tags: ["ERCOT", "Utility Scale", "FCR"],
  },
  {
    id: 4,
    name: "PJM Regulation Project",
    type: "BESS",
    description: "25MW / 50MWh Battery Storage for PJM frequency regulation",
    progress: 15,
    status: "Just Started",
    lastUpdated: "1 week ago",
    createdAt: "Apr 05, 2023",
    owner: { name: "David Clark", initials: "DC", avatar: "" },
    team: [{ name: "Olivia Wilson", initials: "OW", avatar: "" }],
    starred: false,
    tags: ["PJM", "RegD", "Small Scale"],
  },
  {
    id: 5,
    name: "ISO-NE Solar + Storage",
    type: "Hybrid",
    description: "30MW Solar PV + 20MW / 80MWh BESS in Massachusetts",
    progress: 42,
    status: "In Progress",
    lastUpdated: "3 days ago",
    createdAt: "Feb 18, 2023",
    owner: { name: "Michelle Lee", initials: "ML", avatar: "" },
    team: [
      { name: "Brian Taylor", initials: "BT", avatar: "" },
      { name: "Sophia Rodriguez", initials: "SR", avatar: "" },
    ],
    starred: false,
    tags: ["ISO-NE", "Hybrid", "Solar+Storage"],
  },
];

const Pipeline = () => {
  // State for fetched pipelines, loading, and errors
  const [pipelines, setPipelines] = useState<PipelineData[]>([]);
  const [isPipelinesLoading, setIsPipelinesLoading] = useState<boolean>(true);
  const [pipelinesError, setPipelinesError] = useState<string | null>(null);

  const [pipelineProjects, setPipelineProjects] = useState<ProjectData[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // State for modal visibility
  const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Initialize selectedPipelineId to null, it will be set after data loads
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return pipelineProjects;
    }
    const term = searchTerm.toLowerCase();
    return pipelineProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        (project.description &&
          project.description.toLowerCase().includes(term)) ||
        (project.country && project.country.toLowerCase().includes(term)) ||
        (project.type_of_plant &&
          project.type_of_plant.some((type) =>
            type.toLowerCase().includes(term)
          )) ||
        (project.technology && project.technology.toLowerCase().includes(term))
    );
  }, [pipelineProjects, searchTerm]);

  // Add state for project details modal
  const [selectedProjectForDetails, setSelectedProjectForDetails] =
    useState<ProjectData | null>(null);

  // Fetch pipelines on component mount
  useEffect(() => {
    const loadPipelines = async () => {
      setIsPipelinesLoading(true);
      setPipelinesError(null);
      try {
        const fetchedPipelines = await getPipelines();
        setPipelines(fetchedPipelines);
        if (fetchedPipelines.length > 0) {
          setSelectedPipelineId(fetchedPipelines[0].pipeline_id);
        } else {
          setIsProjectsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setPipelinesError(
          err instanceof Error ? err.message : "Failed to load pipelines"
        );
        setIsProjectsLoading(false);
      } finally {
        setIsPipelinesLoading(false);
      }
    };

    loadPipelines();
  }, []);

  // Fetch projects when selectedPipelineId changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedPipelineId) {
        setPipelineProjects([]);
        setIsProjectsLoading(false);
        return;
      }

      setIsProjectsLoading(true);
      setProjectsError(null);
      try {
        const fetchedProjects = await getProjectsForPipeline(
          selectedPipelineId
        );
        setPipelineProjects(fetchedProjects);
      } catch (err) {
        console.error(err);
        setProjectsError(
          err instanceof Error
            ? err.message
            : "Failed to load projects for this pipeline"
        );
        setPipelineProjects([]);
      } finally {
        setIsProjectsLoading(false);
      }
    };

    loadProjects();
  }, [selectedPipelineId]);

  // Find the selected pipeline based on ID
  const selectedPipeline = useMemo(() => {
    return pipelines.find((p) => p.pipeline_id === selectedPipelineId) || null;
  }, [pipelines, selectedPipelineId]);

  // Handle pipeline selection change
  const handlePipelineChange = (pipelineId: string) => {
    setSearchTerm("");
    setPipelineProjects([]);
    setProjectsError(null);
    setIsProjectsLoading(true);
    setSelectedPipelineId(pipelineId);
  };

  // Filter handlers (simplified for demo)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Just Started":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Near Completion":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to refresh pipelines list
  const refreshPipelines = async () => {
    setIsPipelinesLoading(true);
    try {
      const fetchedPipelines = await getPipelines();
      setPipelines(fetchedPipelines);
      if (fetchedPipelines.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(fetchedPipelines[0].pipeline_id);
      }
    } catch (err) {
      console.error("Failed to refresh pipelines:", err);
      setPipelinesError(
        err instanceof Error ? err.message : "Failed to refresh pipelines"
      );
    } finally {
      setIsPipelinesLoading(false);
    }
  };

  // Function to refresh projects list for the *current* pipeline
  const refreshProjects = async () => {
    if (!selectedPipelineId) return;

    setIsProjectsLoading(true);
    setProjectsError(null);
    try {
      const fetchedProjects = await getProjectsForPipeline(selectedPipelineId);
      setPipelineProjects(fetchedProjects);
    } catch (err) {
      console.error("Failed to refresh projects:", err);
      setProjectsError(
        err instanceof Error ? err.message : "Failed to refresh projects"
      );
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Handle NEW PIPELINE submission
  const handlePipelineSubmit = async (data: {
    name: string;
    description: string;
    countries: string[];
  }) => {
    console.log("Submitting new pipeline:", data);
    await createPipeline(data);
    await refreshPipelines();
  };

  // Handle NEW PROJECT submission
  const handleProjectSubmit = async (data: ProjectCreateData) => {
    console.log("Submitting new project:", data);
    await createProject(data);
    await refreshProjects();
  };

  // Handle click on a project card/row to show details
  const handleProjectClick = (project: ProjectData) => {
    setSelectedProjectForDetails(project);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Loading State */}
      {isPipelinesLoading && (
        <div className="flex justify-center items-center p-10">
          <Skeleton className="h-8 w-64 mb-4" />
        </div>
      )}

      {/* Error State */}
      {pipelinesError && !isPipelinesLoading && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{pipelinesError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content - Only render if not loading and no error */}
      {!isPipelinesLoading && !pipelinesError && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedPipelineId ?? ""}
                  onValueChange={handlePipelineChange}
                >
                  <SelectTrigger className="w-full sm:w-[350px] text-lg font-semibold">
                    <SelectValue placeholder="Select a Pipeline..." />
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
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={() => setIsNewPipelineModalOpen(true)}
                >
                  <FolderPlus size={16} />
                  <span>New Pipeline</span>
                </Button>
              </div>

              {selectedPipeline && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedPipeline.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {selectedPipeline.countries.join(", ")}
                    </span>
                  </div>
                </div>
              )}
              {!selectedPipeline && (
                <p className="text-muted-foreground mt-1">
                  Select a pipeline to view its projects.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-shrink-0">
              {/* Action Buttons - Will be moved below */}
              {/* <Button ... /> */}
              {/* <Button ... /> */}
              {/* <Button ... /> */}
            </div>
          </div>

          {/* Project Filters, Search, and Actions (Only show if a pipeline is selected) */}
          {selectedPipeline && (
            <>
              <div className="space-y-4">
                {" "}
                {/* Wrap filters and actions */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative w-full md:flex-1">
                    {" "}
                    {/* Allow search to grow */}
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects by name, description, or tag..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {" "}
                    {/* Keep dropdowns together */}
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Project Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="bess">Battery Storage</SelectItem>
                        <SelectItem value="solar">Solar PV</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="just-started">
                          Just Started
                        </SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="near-completion">
                          Near Completion
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Moved Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Filter size={16} />
                    <span>Filter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <SortAsc size={16} />
                    <span>Sort</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsNewProjectModalOpen(true)}
                    disabled={!selectedPipelineId}
                  >
                    <FolderPlus size={16} />
                    <span>New Project</span>
                  </Button>
                </div>
              </div>

              {/* Project Loading State */}
              {isProjectsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="flex flex-col overflow-hidden">
                      <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Project Error State */}
              {projectsError && !isProjectsLoading && (
                <Card className="border-destructive bg-destructive/10">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Error Loading Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive">{projectsError}</p>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="grid" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredProjects.length} projects
                  </div>
                </div>

                <TabsContent value="grid" className="space-y-6">
                  {filteredProjects.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No projects found for this pipeline{" "}
                        {searchTerm ? "matching your search." : "."}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <Card
                          key={project.project_id}
                          className="flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleProjectClick(project)}
                        >
                          <CardHeader className="pb-2 flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg line-clamp-1">
                                {project.name}
                              </CardTitle>
                            </div>
                            <CardDescription className="flex items-center gap-1.5">
                              {project.type_of_plant?.includes("BESS") && (
                                <Battery className="h-3.5 w-3.5" />
                              )}
                              {project.type_of_plant?.includes("PV") && (
                                <Zap className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {project.type_of_plant?.join(" + ") || "N/A"}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {project.description ||
                                "No description provided."}
                            </p>

                            <div className="mt-auto pt-3 border-t flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {project.country || "N/A"}
                              </span>

                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(
                                    project.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="list" className="space-y-6">
                  {filteredProjects.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No projects found for this pipeline{" "}
                        {searchTerm ? "matching your search." : "."}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="th-cell">Project Name</th>
                                <th className="th-cell">Type</th>
                                <th className="th-cell hidden lg:table-cell">
                                  Country
                                </th>
                                <th className="th-cell hidden md:table-cell">
                                  Power (MW)
                                </th>
                                <th className="th-cell hidden md:table-cell">
                                  Energy (MWh)
                                </th>
                                <th className="th-cell hidden lg:table-cell">
                                  Created
                                </th>
                                <th className="th-cell">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredProjects.map((project) => (
                                <tr
                                  key={project.project_id}
                                  className="hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handleProjectClick(project)}
                                >
                                  <td className="td-cell">
                                    <div className="font-medium">
                                      {project.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground hidden sm:block">
                                      {project.description?.substring(0, 50) ||
                                        ""}
                                      ...
                                    </div>
                                  </td>
                                  <td className="td-cell">
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1.5"
                                    >
                                      {project.type_of_plant?.includes(
                                        "BESS"
                                      ) && <Battery className="h-3.5 w-3.5" />}
                                      {project.type_of_plant?.includes(
                                        "PV"
                                      ) && <Zap className="h-3.5 w-3.5" />}
                                      <span>
                                        {project.type_of_plant?.join(" + ") ||
                                          "N/A"}
                                      </span>
                                    </Badge>
                                  </td>
                                  <td className="td-cell hidden lg:table-cell">
                                    {project.country || "-"}
                                  </td>
                                  <td className="td-cell hidden md:table-cell">
                                    {project.nominal_power_capacity ?? "-"}
                                  </td>
                                  <td className="td-cell hidden md:table-cell">
                                    {project.nominal_energy_capacity ?? "-"}
                                  </td>
                                  <td className="td-cell hidden lg:table-cell text-sm">
                                    {new Date(
                                      project.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="td-cell">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          {!selectedPipeline && (
            <Card className="mt-6">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Please select a pipeline from the dropdown above to see its
                projects.
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Render the modals */}
      <NewPipelineModal
        isOpen={isNewPipelineModalOpen}
        onClose={() => setIsNewPipelineModalOpen(false)}
        onSubmit={handlePipelineSubmit}
      />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        pipelineId={selectedPipelineId}
      />
      {/* Render Project Details Modal */}
      <ProjectDetailsModal
        isOpen={Boolean(selectedProjectForDetails)}
        onClose={() => setSelectedProjectForDetails(null)}
        project={selectedProjectForDetails}
      />
    </div>
  );
};

// Helper CSS classes for table cells (optional, can inline)
const thCell = "text-left py-3 px-4 font-medium text-sm";
const tdCell = "py-3 px-4";

export default Pipeline;

import React, { useState } from "react";
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
} from "@/components/ui/select";

// Sample project data
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(sampleProjects);

  // Filter handlers (simplified for demo)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredProjects(sampleProjects);
      return;
    }

    const filtered = sampleProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(term.toLowerCase()) ||
        project.description.toLowerCase().includes(term.toLowerCase()) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(term.toLowerCase())
        )
    );

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-energy-blue">
            Project Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your energy projects
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
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
          <Button size="sm" asChild className="flex items-center gap-2">
            <Link to="/project-input">
              <FolderPlus size={16} />
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, type, or tag..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="just-started">Just Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="near-completion">Near Completion</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2 flex justify-between items-start">
                  <div>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">
                        {project.name}
                      </CardTitle>
                      {project.starred && (
                        <Star className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1.5">
                      {project.type === "BESS" ? (
                        <Battery className="h-3.5 w-3.5" />
                      ) : (
                        <Zap className="h-3.5 w-3.5" />
                      )}
                      <span>{project.type}</span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link
                          to="/project-overview"
                          className="flex items-center gap-2 w-full"
                        >
                          View Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Archive Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  <div className="space-y-3 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, i) => (
                        <Avatar
                          key={i}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarFallback className="text-[10px]">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.lastUpdated}
                      </div>

                      <Badge
                        className={`text-xs ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Project Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm hidden lg:table-cell">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm hidden md:table-cell">
                        Progress
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm hidden lg:table-cell">
                        Last Updated
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {project.starred && (
                              <Star className="h-3.5 w-3.5 text-yellow-500" />
                            )}
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-muted-foreground hidden sm:block">
                                {project.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1.5"
                          >
                            {project.type === "BESS" ? (
                              <Battery className="h-3.5 w-3.5" />
                            ) : (
                              <Zap className="h-3.5 w-3.5" />
                            )}
                            <span>{project.type}</span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {project.owner.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {project.owner.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={project.progress}
                              className="h-2 w-24"
                            />
                            <span className="text-xs font-medium">
                              {project.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm hidden lg:table-cell">
                          {project.lastUpdated}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to="/project-overview">
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Link
                                    to="/project-overview"
                                    className="flex items-center gap-2 w-full"
                                  >
                                    View Project
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Archive Project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pipeline;

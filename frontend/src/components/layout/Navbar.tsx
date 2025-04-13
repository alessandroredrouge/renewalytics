import React, { useContext } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Settings,
  User,
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useView } from "@/contexts/ViewContext";

const Navbar = () => {
  const { view, setView } = useView();

  const handleViewChange = (newView: "general" | "project") => {
    setView(newView);
  };

  return (
    <header className="border-b bg-card h-16 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <SidebarTrigger />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="font-montserrat text-xl font-bold ml-4 text-energy-blue hidden md:flex items-center gap-1 px-2"
            >
              {view === "general" ? (
                <>
                  <LayoutDashboard size={18} className="mr-1" /> General View
                </>
              ) : (
                <>
                  <FolderKanban size={18} className="mr-1" /> Project View
                </>
              )}
              <ChevronDown size={16} className="ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="ml-4 md:ml-0">
            <DropdownMenuLabel>Select View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleViewChange("general")}
              disabled={view === "general"}
            >
              <LayoutDashboard size={16} className="mr-2" />
              General View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleViewChange("project")}
              disabled={view === "project"}
            >
              <FolderKanban size={16} className="mr-2" />
              Project View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Documentation</DropdownMenuItem>
            <DropdownMenuItem>Tutorial</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>API Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;

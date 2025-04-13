import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Calculator,
  Database,
  Settings,
  Zap,
  DollarSign,
  LineChart,
  LayoutDashboard,
  FolderKanban,
  LayoutList,
  FolderGit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useView } from "@/contexts/ViewContext";

const AppSidebar = () => {
  const location = useLocation();
  const { view } = useView();

  const generalMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Pipeline",
      icon: FolderGit2,
      path: "/pipeline",
    },
    {
      title: "New Project",
      icon: Database,
      path: "/project-input",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const projectMenuItems = [
    {
      title: "Project Overview",
      icon: LayoutList,
      path: "/project-overview",
    },
    {
      title: "Dispatch Logic",
      icon: Zap,
      path: "/dispatch-logic",
    },
    {
      title: "Revenue Streams",
      icon: DollarSign,
      path: "/revenue-streams",
    },
    {
      title: "Financials",
      icon: Calculator,
      path: "/financials",
    },
    {
      title: "Scenarios",
      icon: BarChart3,
      path: "/scenarios",
    },
    {
      title: "Results",
      icon: LineChart,
      path: "/results",
    },
  ];

  const menuItems = view === "general" ? generalMenuItems : projectMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="px-2 py-6">
        <div className="flex items-center justify-center space-x-2 px-2">
          <div className="font-montserrat font-bold text-xl text-white">
            Renewalytics
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Link to={item.path} className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-4">
          <div className="text-xs text-sidebar-foreground/60 mb-2">
            Renewalytics
          </div>
          <div className="text-xs text-sidebar-foreground/60">
            Energy Revenue Forecasting Tool
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

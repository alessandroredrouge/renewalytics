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
} from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Project Input",
      icon: Database,
      path: "/project-input",
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
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

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

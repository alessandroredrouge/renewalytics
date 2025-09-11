import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "./Navbar";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
            <Outlet />
          </main>
          <footer className="py-3 px-6 text-center text-sm text-muted-foreground border-t">
            © {new Date().getFullYear()} Renewalytics - Energy Revenue
            Forecasting Tool
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

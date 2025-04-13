
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Battery, 
  Sun, 
  Zap,
  HelpCircle,
  Settings,
  User
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  return (
    <header className="border-b bg-card h-16 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <SidebarTrigger />
        <h1 className="font-montserrat text-xl font-bold ml-4 text-energy-blue hidden md:block">
          Renewalytics
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5 text-sm">
          <Battery className="h-4 w-4 text-energy-green" />
          <span className="font-medium">BESS Mode</span>
        </div>
        
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

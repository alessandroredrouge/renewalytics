
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, Zap, BarChart3, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-energy-blue">Renewalytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Revenue forecasting for renewable energy assets</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/project-input" className="flex items-center gap-2">
              <span>New Simulation</span>
              <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Battery className="h-5 w-5 text-energy-green" />
              <span>BESS Simulation</span>
            </CardTitle>
            <CardDescription>Battery Energy Storage System</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Simulate techno-economic feasibility for standalone BESS projects with customizable parameters.</p>
            <div className="mt-4">
              <Button variant="outline" asChild size="sm" className="w-full">
                <Link to="/project-input" className="flex items-center justify-center gap-2">
                  <span>Start Simulation</span>
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-energy-yellow" />
              <span>PV Simulation</span>
            </CardTitle>
            <CardDescription>Photovoltaic Solar Systems</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Coming soon - Simulate photovoltaic solar systems with detailed production and revenue forecasting.</p>
            <div className="mt-4">
              <Button variant="outline" disabled size="sm" className="w-full">
                <span>Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover opacity-70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-energy-teal" />
              <span>PV+BESS Simulation</span>
            </CardTitle>
            <CardDescription>Combined Solar and Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Coming soon - Analyze hybrid systems combining photovoltaic generation with battery storage.</p>
            <div className="mt-4">
              <Button variant="outline" disabled size="sm" className="w-full">
                <span>Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-energy-blue" />
              <span>Key Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="bg-energy-blue/10 p-1 rounded-full mt-0.5">
                  <Zap className="h-4 w-4 text-energy-blue" />
                </div>
                <div>
                  <p className="font-medium">Excel-like Interface</p>
                  <p className="text-sm text-muted-foreground">Input technical and market data with familiar spreadsheet controls</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-energy-green/10 p-1 rounded-full mt-0.5">
                  <Battery className="h-4 w-4 text-energy-green" />
                </div>
                <div>
                  <p className="font-medium">Dispatch Logic Configuration</p>
                  <p className="text-sm text-muted-foreground">Customize BESS operation with flexible dispatch strategies</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-energy-yellow/10 p-1 rounded-full mt-0.5">
                  <DollarSign className="h-4 w-4 text-energy-yellow" />
                </div>
                <div>
                  <p className="font-medium">Financial Analysis</p>
                  <p className="text-sm text-muted-foreground">Calculate IRR, NPV, and PBT based on simulated operations</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-energy-teal/10 p-1 rounded-full mt-0.5">
                  <BarChart3 className="h-4 w-4 text-energy-teal" />
                </div>
                <div>
                  <p className="font-medium">Scenario Comparison</p>
                  <p className="text-sm text-muted-foreground">Create what-if scenarios to test different market conditions</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-energy-yellow" />
              <span>Target Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Battery className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Project Developers</h3>
                  <p className="text-sm text-muted-foreground">Evaluate project feasibility and optimize configuration for maximum returns</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-energy-green/10 p-2 rounded-md">
                  <Zap className="h-5 w-5 text-energy-green" />
                </div>
                <div>
                  <h3 className="font-medium">Independent Power Producers</h3>
                  <p className="text-sm text-muted-foreground">Assess revenue potential across different market conditions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-energy-teal/10 p-2 rounded-md">
                  <DollarSign className="h-5 w-5 text-energy-teal" />
                </div>
                <div>
                  <h3 className="font-medium">Utilities</h3>
                  <p className="text-sm text-muted-foreground">Test scenarios for grid-scale storage deployment and valuation</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-energy-yellow/10 p-2 rounded-md">
                  <BarChart3 className="h-5 w-5 text-energy-yellow" />
                </div>
                <div>
                  <h3 className="font-medium">EPCs</h3>
                  <p className="text-sm text-muted-foreground">Support client projects with detailed techno-economic analysis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

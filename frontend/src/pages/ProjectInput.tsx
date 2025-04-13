
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Save, 
  ChevronRight,
  Clock,
  UploadCloud,
  Download
} from 'lucide-react';

const ProjectInput = () => {
  // State for basic project information
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-energy-blue">Project Input</h1>
          <p className="text-muted-foreground mt-1">Configure technical and market parameters for your energy project</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <UploadCloud size={16} />
            <span>Import Data</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button className="gap-2">
            <Save size={16} />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Project Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Project Information</CardTitle>
          <CardDescription>Basic details about your renewable energy project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <Label htmlFor="projectLocation">Location</Label>
                <Input 
                  id="projectLocation" 
                  value={projectLocation} 
                  onChange={(e) => setProjectLocation(e.target.value)} 
                  placeholder="Enter project location"
                />
              </div>
              
              <div>
                <Label htmlFor="projectDescription">Description</Label>
                <Input 
                  id="projectDescription" 
                  value={projectDescription} 
                  onChange={(e) => setProjectDescription(e.target.value)} 
                  placeholder="Brief project description"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-lg text-center mb-2">Project Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center">
                    <span className="font-medium">Battery Storage</span>
                    <span className="text-xs text-muted-foreground mt-1">BESS</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center opacity-60" disabled>
                    <span className="font-medium">Solar PV</span>
                    <span className="text-xs text-muted-foreground mt-1">Coming Soon</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Parameters */}
      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="technical" className="gap-2">
            <span>Technical Parameters</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-2">
            <Clock size={16} />
            <span>Market Data</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar size={16} />
            <span>Project Timeline</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Parameters</CardTitle>
              <CardDescription>Define the technical specifications of your system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="data-grid">
                <div className="grid grid-cols-4">
                  <div className="data-header">Parameter</div>
                  <div className="data-header">Value</div>
                  <div className="data-header">Unit</div>
                  <div className="data-header">Description</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="data-cell font-medium">Nominal Power</div>
                  <div className="data-cell">
                    <Input type="number" defaultValue="100" className="h-8" />
                  </div>
                  <div className="data-cell">MW</div>
                  <div className="data-cell text-sm text-muted-foreground">Maximum power output/input</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="data-cell font-medium">Energy Capacity</div>
                  <div className="data-cell">
                    <Input type="number" defaultValue="400" className="h-8" />
                  </div>
                  <div className="data-cell">MWh</div>
                  <div className="data-cell text-sm text-muted-foreground">Total energy storage capacity</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="data-cell font-medium">Round-Trip Efficiency</div>
                  <div className="data-cell">
                    <Input type="number" defaultValue="85" className="h-8" />
                  </div>
                  <div className="data-cell">%</div>
                  <div className="data-cell text-sm text-muted-foreground">Energy output/input ratio</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="data-cell font-medium">Degradation Rate</div>
                  <div className="data-cell">
                    <Input type="number" defaultValue="2" className="h-8" />
                  </div>
                  <div className="data-cell">% per year</div>
                  <div className="data-cell text-sm text-muted-foreground">Annual capacity loss</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="data-cell font-medium">Maximum DoD</div>
                  <div className="data-cell">
                    <Input type="number" defaultValue="90" className="h-8" />
                  </div>
                  <div className="data-cell">%</div>
                  <div className="data-cell text-sm text-muted-foreground">Maximum depth of discharge</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">Add Parameter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
              <CardDescription>Configure market prices and revenue components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select "Import Data" to upload hourly price forecasts or configure manual inputs</p>
                <Button variant="outline" className="mt-4 gap-2">
                  <UploadCloud size={16} />
                  <span>Import Market Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Define key dates and operational timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="data-grid">
                <div className="grid grid-cols-3">
                  <div className="data-header">Milestone</div>
                  <div className="data-header">Date</div>
                  <div className="data-header">Description</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="data-cell font-medium">Construction Start</div>
                  <div className="data-cell">
                    <Input type="date" defaultValue="2024-07-01" className="h-8" />
                  </div>
                  <div className="data-cell text-sm text-muted-foreground">Beginning of project construction</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="data-cell font-medium">Commercial Operation</div>
                  <div className="data-cell">
                    <Input type="date" defaultValue="2025-01-15" className="h-8" />
                  </div>
                  <div className="data-cell text-sm text-muted-foreground">Start of commercial operations</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="data-cell font-medium">End of Analysis Period</div>
                  <div className="data-cell">
                    <Input type="date" defaultValue="2045-01-15" className="h-8" />
                  </div>
                  <div className="data-cell text-sm text-muted-foreground">End of financial analysis period</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">Add Milestone</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild>
          <a href="/dispatch-logic" className="gap-2">
            <span>Continue to Dispatch Logic</span>
            <ChevronRight size={16} />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ProjectInput;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Battery, BatteryCharging, Zap, Settings, PlusCircle, LineChart, BarChart3, Info } from 'lucide-react';

const DispatchLogic = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Logic</h1>
          <p className="text-muted-foreground mt-1">Configure the battery system's operational behavior and charging/discharging parameters</p>
        </div>
        <Button className="gap-2">
          <PlusCircle size={16} />
          Save Logic Profile
        </Button>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Basic Settings
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="mr-2 h-4 w-4" />
            Advanced Logic
          </TabsTrigger>
          <TabsTrigger value="simulation">
            <BarChart3 className="mr-2 h-4 w-4" />
            Simulation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BatteryCharging className="mr-2 h-5 w-5 text-energy-blue" />
                Charging Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Charging Method</Label>
                    <Select defaultValue="price-based">
                      <SelectTrigger>
                        <SelectValue placeholder="Select charging method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-based">Price-Based Optimization</SelectItem>
                        <SelectItem value="fixed-schedule">Fixed Schedule</SelectItem>
                        <SelectItem value="peak-shaving">Peak Shaving</SelectItem>
                        <SelectItem value="frequency-response">Frequency Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum SOC (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[20]} max={100} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={20} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum SOC (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[90]} max={100} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={90} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Charging Hours</Label>
                    <Select defaultValue="off-peak">
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off-peak">Off-Peak Hours</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                        <SelectItem value="dynamic">Dynamic (Price-Based)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Charging Power Limit (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[100]} max={100} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={100} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="degradation-protection">Degradation Protection</Label>
                      <span className="text-sm text-muted-foreground">Optimize for battery lifespan</span>
                    </div>
                    <Switch id="degradation-protection" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="mr-2 h-5 w-5 text-energy-green" />
                Discharging Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Discharging Method</Label>
                    <Select defaultValue="price-trigger">
                      <SelectTrigger>
                        <SelectValue placeholder="Select discharging method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-trigger">Price Threshold Trigger</SelectItem>
                        <SelectItem value="fixed-schedule">Fixed Schedule</SelectItem>
                        <SelectItem value="peak-demand">Peak Demand Response</SelectItem>
                        <SelectItem value="grid-support">Grid Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum Price Threshold ($/MWh)</Label>
                    <Input type="number" defaultValue={150} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Discharging Power Limit (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[100]} max={100} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={100} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Discharging Hours</Label>
                    <Select defaultValue="peak">
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peak">Peak Hours</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                        <SelectItem value="dynamic">Dynamic (Price-Based)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Discharge Cutoff SOC (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[10]} max={100} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={10} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="grid-emergency">Grid Emergency Support</Label>
                      <span className="text-sm text-muted-foreground">Override normal rules during grid stress</span>
                    </div>
                    <Switch id="grid-emergency" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-energy-blue" />
                Advanced Dispatch Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted/50 p-4 mb-6">
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Advanced dispatch parameters allow fine-tuning of the battery's operational behavior. 
                    These settings affect the simulation results and financial outcomes.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Price Forecasting Method</Label>
                    <Select defaultValue="historical">
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="historical">Historical Pattern Matching</SelectItem>
                        <SelectItem value="ml">Machine Learning Model</SelectItem>
                        <SelectItem value="market">Market Forward Curves</SelectItem>
                        <SelectItem value="custom">Custom Forecasts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cycle Counting Method</Label>
                    <Select defaultValue="rainflow">
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainflow">Rainflow Algorithm</SelectItem>
                        <SelectItem value="ah">Ah-Throughput</SelectItem>
                        <SelectItem value="simplified">Simplified Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Optimization Horizon (Hours)</Label>
                    <Input type="number" defaultValue={24} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Rolling Forecast Update (Hours)</Label>
                    <Input type="number" defaultValue={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Price Threshold Sensitivity (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider defaultValue={[15]} max={50} step={1} className="flex-1" />
                      <Input type="number" className="w-16" defaultValue={15} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="reinforcement-learning">Use Reinforcement Learning</Label>
                      <span className="text-sm text-muted-foreground">Advanced AI-based optimization</span>
                    </div>
                    <Switch id="reinforcement-learning" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-energy-blue" />
                Simulation Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted/50 p-4 mb-6">
                <div className="flex flex-col space-y-4 items-center text-center p-8">
                  <LineChart className="h-16 w-16 text-muted-foreground/70" />
                  <h3 className="text-lg font-semibold">Simulation Results Not Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Run a simulation with the current dispatch logic settings to see predicted battery behavior 
                    and financial performance.
                  </p>
                  <Button className="mt-2">
                    Run Simulation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchLogic;

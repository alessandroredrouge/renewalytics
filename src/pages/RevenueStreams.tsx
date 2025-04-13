
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CircleDollarSign, 
  BarChart3, 
  LineChart, 
  PlusCircle, 
  DownloadCloud, 
  RefreshCcw,
  Battery,
  Zap,
  ShieldCheck
} from 'lucide-react';

const RevenueStreams = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Streams</h1>
          <p className="text-muted-foreground mt-1">Configure and analyze potential revenue sources for your battery storage system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <DownloadCloud size={16} />
            Export
          </Button>
          <Button className="gap-2">
            <PlusCircle size={16} />
            Add Revenue Stream
          </Button>
        </div>
      </div>

      <Tabs defaultValue="wholesale" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-4">
          <TabsTrigger value="wholesale">
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Wholesale Market
          </TabsTrigger>
          <TabsTrigger value="capacity">
            <Battery className="mr-2 h-4 w-4" />
            Capacity Market
          </TabsTrigger>
          <TabsTrigger value="ancillary">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Ancillary Services
          </TabsTrigger>
          <TabsTrigger value="summary">
            <BarChart3 className="mr-2 h-4 w-4" />
            Revenue Summary
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wholesale" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CircleDollarSign className="mr-2 h-5 w-5 text-energy-blue" />
                Wholesale Energy Market
              </CardTitle>
              <CardDescription>
                Configure parameters for trading energy in the wholesale electricity market
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Market Region</Label>
                    <Select defaultValue="caiso">
                      <SelectTrigger>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caiso">CAISO</SelectItem>
                        <SelectItem value="ercot">ERCOT</SelectItem>
                        <SelectItem value="pjm">PJM</SelectItem>
                        <SelectItem value="nyiso">NYISO</SelectItem>
                        <SelectItem value="miso">MISO</SelectItem>
                        <SelectItem value="spp">SPP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Price Data Source</Label>
                    <Select defaultValue="historical">
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="historical">Historical Data</SelectItem>
                        <SelectItem value="forecast">Price Forecast</SelectItem>
                        <SelectItem value="custom">Custom Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Trading Strategy</Label>
                    <Select defaultValue="arbitrage">
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arbitrage">Price Arbitrage</SelectItem>
                        <SelectItem value="peak-shaving">Peak Shaving</SelectItem>
                        <SelectItem value="mixed">Mixed Strategy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Price Threshold for Discharge ($/MWh)</Label>
                    <Input type="number" defaultValue={100} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Price Threshold for Charge ($/MWh)</Label>
                    <Input type="number" defaultValue={30} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Checkbox id="day-ahead" defaultChecked />
                      <Label htmlFor="day-ahead" className="text-sm cursor-pointer">Participate in Day-Ahead Market</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="real-time" defaultChecked />
                      <Label htmlFor="real-time" className="text-sm cursor-pointer">Participate in Real-Time Market</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Price Duration Curve</h3>
                  <Button variant="outline" size="sm" className="gap-1">
                    <RefreshCcw size={14} />
                    Update
                  </Button>
                </div>
                <div className="h-72 w-full bg-muted/50 rounded-md flex items-center justify-center">
                  <div className="text-center px-4">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground/70" />
                    <p className="text-sm text-muted-foreground mt-2">Price data visualization will appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="capacity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="mr-2 h-5 w-5 text-energy-green" />
                Capacity Market Revenue
              </CardTitle>
              <CardDescription>
                Configure capacity market participation and revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Capacity Market Type</Label>
                    <Select defaultValue="forward">
                      <SelectTrigger>
                        <SelectValue placeholder="Select market type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forward">Forward Capacity Market</SelectItem>
                        <SelectItem value="resource">Resource Adequacy</SelectItem>
                        <SelectItem value="demand">Demand Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contract Term (Years)</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="7">7 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Capacity Price ($/kW-year)</Label>
                    <Input type="number" defaultValue={80} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Eligible Capacity (% of nameplate)</Label>
                    <Input type="number" defaultValue={90} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Capacity Derating Factor (%)</Label>
                    <Input type="number" defaultValue={85} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Checkbox id="seasonal-adjust" defaultChecked />
                      <Label htmlFor="seasonal-adjust" className="text-sm cursor-pointer">Apply Seasonal Adjustment Factors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="performance-penalty" defaultChecked />
                      <Label htmlFor="performance-penalty" className="text-sm cursor-pointer">Include Performance Penalties</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Estimated Annual Capacity Revenue</h3>
                <div className="bg-muted/50 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Eligible Capacity</p>
                      <p className="text-2xl font-semibold">9.0 MW</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Revenue</p>
                      <p className="text-2xl font-semibold text-energy-green">$720,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ancillary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-energy-blue" />
                Ancillary Services Revenue
              </CardTitle>
              <CardDescription>
                Configure ancillary services participation and revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Service Type</TableHead>
                      <TableHead>Participation</TableHead>
                      <TableHead>Capacity Allocation (%)</TableHead>
                      <TableHead className="text-right">Price ($/MW-h)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Frequency Regulation</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={30} className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={25} className="w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Spinning Reserve</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={20} className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={12} className="w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Non-Spinning Reserve</TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={0} className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={8} className="w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Voltage Support</TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={0} className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={5} className="w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Black Start</TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={0} className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={3} className="w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="p-4 border rounded-md mt-6">
                  <h3 className="font-medium mb-2">Ancillary Services Configuration</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Market Region</Label>
                      <Select defaultValue="caiso">
                        <SelectTrigger>
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caiso">CAISO</SelectItem>
                          <SelectItem value="ercot">ERCOT</SelectItem>
                          <SelectItem value="pjm">PJM</SelectItem>
                          <SelectItem value="nyiso">NYISO</SelectItem>
                          <SelectItem value="miso">MISO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Price Data Source</Label>
                      <Select defaultValue="historical">
                        <SelectTrigger>
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="historical">Historical Data</SelectItem>
                          <SelectItem value="forecast">Price Forecast</SelectItem>
                          <SelectItem value="custom">Custom Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-energy-blue" />
                Revenue Summary
              </CardTitle>
              <CardDescription>
                Projected annual revenue breakdown across all configured revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center mb-6">
                <div className="text-center px-4">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/70" />
                  <p className="text-sm text-muted-foreground mt-2">Revenue summary chart will appear here</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Annual Revenue Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Revenue Stream</TableHead>
                      <TableHead>Annual Revenue ($)</TableHead>
                      <TableHead>Percentage of Total</TableHead>
                      <TableHead className="text-right">Revenue/MW ($/MW)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Wholesale Energy Market</TableCell>
                      <TableCell>$546,000</TableCell>
                      <TableCell>35%</TableCell>
                      <TableCell className="text-right">$54,600</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capacity Market</TableCell>
                      <TableCell>$720,000</TableCell>
                      <TableCell>46%</TableCell>
                      <TableCell className="text-right">$72,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Ancillary Services</TableCell>
                      <TableCell>$285,000</TableCell>
                      <TableCell>18%</TableCell>
                      <TableCell className="text-right">$28,500</TableCell>
                    </TableRow>
                    <TableRow className="font-medium bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell>$1,551,000</TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell className="text-right">$155,100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueStreams;

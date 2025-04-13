
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  LineChart, 
  Layers, 
  PlusCircle, 
  Copy,
  Save,
  Trash2,
  ArrowUpDown,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Scenarios = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenarios</h1>
          <p className="text-muted-foreground">
            Create and compare different project scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-9">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Scenario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Scenario</DialogTitle>
                <DialogDescription>
                  Create a new scenario to model different market conditions or operational strategies.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input id="scenario-name" placeholder="High Revenue Case" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario-base">Base Scenario</Label>
                  <Select defaultValue="base">
                    <SelectTrigger>
                      <SelectValue placeholder="Select base scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base Case</SelectItem>
                      <SelectItem value="conservative">Conservative Case</SelectItem>
                      <SelectItem value="optimistic">Optimistic Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario-desc">Description</Label>
                  <Input id="scenario-desc" placeholder="High wholesale price with aggressive arbitrage" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Scenario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Management</CardTitle>
          <CardDescription>
            Manage your different project scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Active</TableHead>
                  <TableHead>Scenario Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IRR</TableHead>
                  <TableHead>NPV</TableHead>
                  <TableHead>Payback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked
                        readOnly
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Base Case</TableCell>
                  <TableCell>Standard market conditions with default operational parameters</TableCell>
                  <TableCell>12.3%</TableCell>
                  <TableCell>$1.2M</TableCell>
                  <TableCell>7.2 yrs</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked
                        readOnly
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Conservative Case</TableCell>
                  <TableCell>Lower wholesale prices with moderate battery cycling</TableCell>
                  <TableCell>8.5%</TableCell>
                  <TableCell>$0.4M</TableCell>
                  <TableCell>9.8 yrs</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked
                        readOnly
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Optimistic Case</TableCell>
                  <TableCell>High wholesale price volatility with aggressive arbitrage</TableCell>
                  <TableCell>15.1%</TableCell>
                  <TableCell>$2.3M</TableCell>
                  <TableCell>5.5 yrs</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        readOnly
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">High Capacity Payment</TableCell>
                  <TableCell>Standard wholesale but increased capacity payments</TableCell>
                  <TableCell>14.2%</TableCell>
                  <TableCell>$1.9M</TableCell>
                  <TableCell>6.1 yrs</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="comparison">
            <BarChart3 className="mr-2 h-4 w-4" />
            Scenario Comparison
          </TabsTrigger>
          <TabsTrigger value="parameters">
            <Layers className="mr-2 h-4 w-4" />
            Parameter Variations
          </TabsTrigger>
          <TabsTrigger value="sensitivity">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sensitivity Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Scenario Comparison
                </div>
              </CardTitle>
              <CardDescription>
                Compare key metrics across selected scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-muted/30 h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <LineChart className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Scenario Comparison Chart</p>
                    <p className="text-sm text-muted-foreground">
                      Select metrics to visualize scenario comparisons
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">IRR Comparison</Button>
                    <Button variant="outline" size="sm">NPV Comparison</Button>
                    <Button variant="outline" size="sm">Revenue Breakdown</Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-medium">Metric Comparison</p>
                  <Select defaultValue="irr">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irr">Internal Rate of Return</SelectItem>
                      <SelectItem value="npv">Net Present Value</SelectItem>
                      <SelectItem value="payback">Payback Period</SelectItem>
                      <SelectItem value="lcoe">LCOE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scenario</TableHead>
                        <TableHead>Year 1</TableHead>
                        <TableHead>Year 5</TableHead>
                        <TableHead>Year 10</TableHead>
                        <TableHead>Year 15</TableHead>
                        <TableHead>Year 20</TableHead>
                        <TableHead>Average</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Base Case</TableCell>
                        <TableCell>12.3%</TableCell>
                        <TableCell>11.8%</TableCell>
                        <TableCell>10.5%</TableCell>
                        <TableCell>9.2%</TableCell>
                        <TableCell>8.1%</TableCell>
                        <TableCell className="font-medium">10.4%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Conservative Case</TableCell>
                        <TableCell>8.5%</TableCell>
                        <TableCell>8.2%</TableCell>
                        <TableCell>7.6%</TableCell>
                        <TableCell>6.9%</TableCell>
                        <TableCell>6.1%</TableCell>
                        <TableCell className="font-medium">7.5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Optimistic Case</TableCell>
                        <TableCell>15.1%</TableCell>
                        <TableCell>14.6%</TableCell>
                        <TableCell>13.8%</TableCell>
                        <TableCell>12.5%</TableCell>
                        <TableCell>11.2%</TableCell>
                        <TableCell className="font-medium">13.4%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-primary" />
                  Parameter Variations
                </div>
              </CardTitle>
              <CardDescription>
                Define parameter variations across scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Market Pricing Parameters</Label>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="mr-2 h-3 w-3" />
                      Add Variation
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Base Case</TableHead>
                          <TableHead>Conservative</TableHead>
                          <TableHead>Optimistic</TableHead>
                          <TableHead>High Capacity</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Wholesale Price ($/MWh)</TableCell>
                          <TableCell>45.00</TableCell>
                          <TableCell>38.00</TableCell>
                          <TableCell>55.00</TableCell>
                          <TableCell>45.00</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Price Volatility (%)</TableCell>
                          <TableCell>25</TableCell>
                          <TableCell>15</TableCell>
                          <TableCell>35</TableCell>
                          <TableCell>25</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Capacity Payment ($/kW-year)</TableCell>
                          <TableCell>75.00</TableCell>
                          <TableCell>60.00</TableCell>
                          <TableCell>90.00</TableCell>
                          <TableCell>120.00</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Technical Parameters</Label>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="mr-2 h-3 w-3" />
                      Add Variation
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Base Case</TableHead>
                          <TableHead>Conservative</TableHead>
                          <TableHead>Optimistic</TableHead>
                          <TableHead>High Capacity</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Battery Degradation (%/year)</TableCell>
                          <TableCell>2.0</TableCell>
                          <TableCell>2.5</TableCell>
                          <TableCell>1.5</TableCell>
                          <TableCell>2.0</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Round-Trip Efficiency (%)</TableCell>
                          <TableCell>85</TableCell>
                          <TableCell>82</TableCell>
                          <TableCell>88</TableCell>
                          <TableCell>85</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cycles per Day (avg)</TableCell>
                          <TableCell>1.0</TableCell>
                          <TableCell>0.8</TableCell>
                          <TableCell>1.2</TableCell>
                          <TableCell>1.0</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Financial Parameters</Label>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="mr-2 h-3 w-3" />
                      Add Variation
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Base Case</TableHead>
                          <TableHead>Conservative</TableHead>
                          <TableHead>Optimistic</TableHead>
                          <TableHead>High Capacity</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Discount Rate (%)</TableCell>
                          <TableCell>8.0</TableCell>
                          <TableCell>9.0</TableCell>
                          <TableCell>7.0</TableCell>
                          <TableCell>8.0</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Debt Interest Rate (%)</TableCell>
                          <TableCell>4.5</TableCell>
                          <TableCell>5.5</TableCell>
                          <TableCell>3.5</TableCell>
                          <TableCell>4.5</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ITC Value (%)</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Apply Parameter Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sensitivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-5 w-5 text-primary" />
                  Sensitivity Analysis
                </div>
              </CardTitle>
              <CardDescription>
                Analyze how changes in key parameters affect project outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="sensitivity-metric">Output Metric</Label>
                  <Select defaultValue="irr">
                    <SelectTrigger id="sensitivity-metric">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irr">Project IRR</SelectItem>
                      <SelectItem value="npv">NPV</SelectItem>
                      <SelectItem value="payback">Payback Period</SelectItem>
                      <SelectItem value="lcoe">LCOE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sensitivity-param">Input Parameter</Label>
                  <Select defaultValue="wholesale">
                    <SelectTrigger id="sensitivity-param">
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Wholesale Price</SelectItem>
                      <SelectItem value="capex">CAPEX</SelectItem>
                      <SelectItem value="capacity">Capacity Payment</SelectItem>
                      <SelectItem value="degradation">Battery Degradation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sensitivity-range">Parameter Range (%)</Label>
                  <div className="flex gap-4">
                    <Input id="sensitivity-range-min" placeholder="-30" className="w-24" />
                    <span className="flex items-center">to</span>
                    <Input id="sensitivity-range-max" placeholder="+30" className="w-24" />
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/30 h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <LineChart className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Sensitivity Analysis Chart</p>
                    <p className="text-sm text-muted-foreground">
                      Tornado chart showing impact of parameter variations on IRR
                    </p>
                  </div>
                  <Button>Run Sensitivity Analysis</Button>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="font-medium mb-3">Sensitivity Results</p>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>-30%</TableHead>
                        <TableHead>-20%</TableHead>
                        <TableHead>-10%</TableHead>
                        <TableHead>Base</TableHead>
                        <TableHead>+10%</TableHead>
                        <TableHead>+20%</TableHead>
                        <TableHead>+30%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Wholesale Price</TableCell>
                        <TableCell>7.1%</TableCell>
                        <TableCell>8.8%</TableCell>
                        <TableCell>10.6%</TableCell>
                        <TableCell className="font-medium">12.3%</TableCell>
                        <TableCell>14.0%</TableCell>
                        <TableCell>15.7%</TableCell>
                        <TableCell>17.4%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">CAPEX</TableCell>
                        <TableCell>18.2%</TableCell>
                        <TableCell>15.9%</TableCell>
                        <TableCell>14.0%</TableCell>
                        <TableCell className="font-medium">12.3%</TableCell>
                        <TableCell>10.9%</TableCell>
                        <TableCell>9.7%</TableCell>
                        <TableCell>8.6%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Capacity Payment</TableCell>
                        <TableCell>9.2%</TableCell>
                        <TableCell>10.2%</TableCell>
                        <TableCell>11.3%</TableCell>
                        <TableCell className="font-medium">12.3%</TableCell>
                        <TableCell>13.4%</TableCell>
                        <TableCell>14.4%</TableCell>
                        <TableCell>15.5%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm">
                    <Info className="mr-2 h-4 w-4" />
                    Analysis Details
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

export default Scenarios;

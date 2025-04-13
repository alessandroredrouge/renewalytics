
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  PlusCircle, 
  Info,
  FileText,
  Percent
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Financials = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
          <p className="text-muted-foreground">
            Configure financial parameters for your renewable energy project
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9">
            <FileText className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button className="h-9">
            <Calculator className="mr-2 h-4 w-4" />
            Run Financial Model
          </Button>
        </div>
      </div>

      <Tabs defaultValue="capital-costs">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
          <TabsTrigger value="capital-costs">
            <DollarSign className="mr-2 h-4 w-4" />
            Capital Costs
          </TabsTrigger>
          <TabsTrigger value="operating-costs">
            <BarChart3 className="mr-2 h-4 w-4" />
            Operating Costs
          </TabsTrigger>
          <TabsTrigger value="financing">
            <Percent className="mr-2 h-4 w-4" />
            Financing & Taxation
          </TabsTrigger>
          <TabsTrigger value="summary">
            <PieChart className="mr-2 h-4 w-4" />
            Financial Summary
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="capital-costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-primary" />
                  BESS Capital Expenditures
                </div>
              </CardTitle>
              <CardDescription>
                Enter all initial capital costs for your battery energy storage system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="battery-cost">Battery Cost ($/kWh)</Label>
                    <Input id="battery-cost" placeholder="250" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inverter-cost">Inverter Cost ($/kW)</Label>
                    <Input id="inverter-cost" placeholder="80" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bos-cost">Balance of System Cost ($)</Label>
                    <Input id="bos-cost" placeholder="500000" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="installation-cost">Installation Cost ($)</Label>
                    <Input id="installation-cost" placeholder="350000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engineering-cost">Engineering & Design Cost ($)</Label>
                    <Input id="engineering-cost" placeholder="200000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other-capex">Other CAPEX ($)</Label>
                    <Input id="other-capex" placeholder="100000" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="capex-notes">Notes</Label>
                <Textarea id="capex-notes" placeholder="Add any notes or assumptions about capital costs..." className="mt-2" />
              </div>

              <div className="mt-6">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Total CAPEX</p>
                        <p className="text-2xl font-bold">$3,850,000</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cost per kWh</p>
                        <p className="text-2xl font-bold">$385/kWh</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Replacement Costs</CardTitle>
              <CardDescription>
                Configure battery replacement schedules and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="replacement-year">Replacement Year</Label>
                  <Input id="replacement-year" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replacement-cost">Cost Reduction Factor (%)</Label>
                  <Input id="replacement-cost" placeholder="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operating-costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Operation & Maintenance
                </div>
              </CardTitle>
              <CardDescription>
                Enter all ongoing operational expenses for your BESS project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual-om">Annual O&M Fixed Cost ($/kW-year)</Label>
                    <Input id="annual-om" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variable-om">Variable O&M Cost ($/MWh)</Label>
                    <Input id="variable-om" placeholder="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Annual Insurance (% of CAPEX)</Label>
                    <Input id="insurance" placeholder="0.5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="land-lease">Annual Land Lease ($)</Label>
                    <Input id="land-lease" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-cost">Administrative Costs ($/year)</Label>
                    <Input id="admin-cost" placeholder="25000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="om-escalation">Annual Cost Escalation (%)</Label>
                    <Input id="om-escalation" placeholder="2.5" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="opex-notes">Notes</Label>
                <Textarea id="opex-notes" placeholder="Add any notes or assumptions about operational costs..." className="mt-2" />
              </div>

              <div className="mt-6">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Year 1 OPEX</p>
                        <p className="text-2xl font-bold">$165,000</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">20-year NPV of OPEX</p>
                        <p className="text-2xl font-bold">$2,453,215</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Percent className="mr-2 h-5 w-5 text-primary" />
                  Financing Parameters
                </div>
              </CardTitle>
              <CardDescription>
                Set up your project's capital structure and financing terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="debt-ratio">Debt Ratio (%)</Label>
                    <Input id="debt-ratio" placeholder="70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <Input id="interest-rate" placeholder="4.5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan-term">Loan Term (years)</Label>
                    <Input id="loan-term" placeholder="15" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="equity-irr">Target Equity IRR (%)</Label>
                    <Input id="equity-irr" placeholder="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount-rate">Discount Rate (%)</Label>
                    <Input id="discount-rate" placeholder="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-life">Project Life (years)</Label>
                    <Input id="project-life" placeholder="20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tax & Incentives</CardTitle>
              <CardDescription>
                Configure tax parameters and available incentives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Corporate Tax Rate (%)</Label>
                    <Input id="tax-rate" placeholder="21" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depreciation">Depreciation Schedule</Label>
                    <Select defaultValue="macrs-5">
                      <SelectTrigger>
                        <SelectValue placeholder="Select depreciation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="macrs-5">MACRS 5-Year</SelectItem>
                        <SelectItem value="macrs-7">MACRS 7-Year</SelectItem>
                        <SelectItem value="sl-10">Straight Line 10-Year</SelectItem>
                        <SelectItem value="sl-20">Straight Line 20-Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itc">Investment Tax Credit (%)</Label>
                    <Input id="itc" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ptc">Production Tax Credit ($/MWh)</Label>
                    <Input id="ptc" placeholder="0" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  Financial Summary
                </div>
              </CardTitle>
              <CardDescription>
                Key financial metrics for your BESS project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">Project IRR</p>
                      <p className="text-4xl font-bold text-primary">12.3%</p>
                      <p className="text-xs text-muted-foreground mt-2">Pre-tax, unlevered</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">Net Present Value</p>
                      <p className="text-4xl font-bold text-primary">$1.2M</p>
                      <p className="text-xs text-muted-foreground mt-2">8% discount rate</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">Payback Period</p>
                      <p className="text-4xl font-bold text-primary">7.2 yrs</p>
                      <p className="text-xs text-muted-foreground mt-2">Simple payback</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <p className="font-medium mb-3">Project Cash Flows</p>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>OPEX</TableHead>
                        <TableHead>CAPEX</TableHead>
                        <TableHead>Net Cash Flow</TableHead>
                        <TableHead>Cumulative</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>0</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$3,850,000</TableCell>
                        <TableCell className="text-destructive">-$3,850,000</TableCell>
                        <TableCell className="text-destructive">-$3,850,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>$750,000</TableCell>
                        <TableCell>$165,000</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$585,000</TableCell>
                        <TableCell className="text-destructive">-$3,265,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>$765,000</TableCell>
                        <TableCell>$169,125</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$595,875</TableCell>
                        <TableCell className="text-destructive">-$2,669,125</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>$780,300</TableCell>
                        <TableCell>$173,353</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$606,947</TableCell>
                        <TableCell className="text-destructive">-$2,062,178</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>$795,906</TableCell>
                        <TableCell>$177,687</TableCell>
                        <TableCell>$0</TableCell>
                        <TableCell>$618,219</TableCell>
                        <TableCell className="text-destructive">-$1,443,959</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="link" size="sm">View Full Cash Flow Table</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financials;

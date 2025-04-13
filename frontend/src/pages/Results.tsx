
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Filter, Share } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Sample data for demonstration
const monthlyData = [
  { name: 'Jan', revenue: 4000, dispatch: 2400 },
  { name: 'Feb', revenue: 3000, dispatch: 1398 },
  { name: 'Mar', revenue: 2000, dispatch: 9800 },
  { name: 'Apr', revenue: 2780, dispatch: 3908 },
  { name: 'May', revenue: 1890, dispatch: 4800 },
  { name: 'Jun', revenue: 2390, dispatch: 3800 },
  { name: 'Jul', revenue: 3490, dispatch: 4300 },
  { name: 'Aug', revenue: 4000, dispatch: 2400 },
  { name: 'Sep', revenue: 3000, dispatch: 1398 },
  { name: 'Oct', revenue: 2000, dispatch: 9800 },
  { name: 'Nov', revenue: 2780, dispatch: 3908 },
  { name: 'Dec', revenue: 1890, dispatch: 4800 },
];

const revenueStreams = [
  { name: 'Energy Arbitrage', value: 40 },
  { name: 'Frequency Regulation', value: 30 },
  { name: 'Capacity', value: 15 },
  { name: 'Demand Response', value: 10 },
  { name: 'Other', value: 5 },
];

const Results = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-energy-blue">Simulation Results</h1>
          <p className="text-muted-foreground mt-1">Analysis of BESS project financial and operational metrics</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share size={16} />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial KPIs</TabsTrigger>
          <TabsTrigger value="operational">Operational Data</TabsTrigger>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project IRR</CardTitle>
                <CardDescription>Internal Rate of Return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-energy-green">12.4%</div>
                <p className="text-sm text-muted-foreground mt-1">Above hurdle rate (10%)</p>
                <div className="w-full bg-muted h-2 rounded-full mt-3">
                  <div className="bg-energy-green h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project NPV</CardTitle>
                <CardDescription>Net Present Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-energy-blue">$3.2M</div>
                <p className="text-sm text-muted-foreground mt-1">Discount rate: 8%</p>
                <div className="w-full bg-muted h-2 rounded-full mt-3">
                  <div className="bg-energy-blue h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payback Period</CardTitle>
                <CardDescription>Simple Payback Period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-energy-yellow">7.3 years</div>
                <p className="text-sm text-muted-foreground mt-1">Target: 8 years</p>
                <div className="w-full bg-muted h-2 rounded-full mt-3">
                  <div className="bg-energy-yellow h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                <CardDescription>By Revenue Stream</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueStreams}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Revenue %" fill="#2F855A" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                <CardDescription>Project Year 1</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#1A365D" strokeWidth={2} />
                    <Line type="monotone" dataKey="dispatch" stroke="#2F855A" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 bg-muted font-medium text-sm">Metric</th>
                      <th className="text-right py-3 px-4 bg-muted font-medium text-sm">Value</th>
                      <th className="text-right py-3 px-4 bg-muted font-medium text-sm">Unit</th>
                      <th className="text-right py-3 px-4 bg-muted font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4 font-medium">Levelized Cost of Storage</td>
                      <td className="py-3 px-4 text-right">152.3</td>
                      <td className="py-3 px-4 text-right">$/MWh</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Good
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Annual Capacity Factor</td>
                      <td className="py-3 px-4 text-right">23.4</td>
                      <td className="py-3 px-4 text-right">%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Average
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Round-Trip Efficiency</td>
                      <td className="py-3 px-4 text-right">87.5</td>
                      <td className="py-3 px-4 text-right">%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Good
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Average Daily Cycles</td>
                      <td className="py-3 px-4 text-right">1.3</td>
                      <td className="py-3 px-4 text-right">cycles/day</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Good
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Battery Degradation (Year 1)</td>
                      <td className="py-3 px-4 text-right">2.1</td>
                      <td className="py-3 px-4 text-right">%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Good
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Detailed financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Financial metrics content will appear here in the full implementation.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Performance</CardTitle>
              <CardDescription>Detailed operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Operational metrics content will appear here in the full implementation.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>Compare different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Scenario comparison content will appear here in the full implementation.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Results;


import React, { useState } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Download, PieChart, LineChart as LineChartIcon, BarChart3, FileText } from 'lucide-react';

const sampleRevenueData = [
  { month: 'Jan', revenue: 15000, profit: 7500 },
  { month: 'Feb', revenue: 18000, profit: 9000 },
  { month: 'Mar', revenue: 22000, profit: 10000 },
  { month: 'Apr', revenue: 21000, profit: 9800 },
  { month: 'May', revenue: 24000, profit: 12000 },
  { month: 'Jun', revenue: 28000, profit: 14000 },
  { month: 'Jul', revenue: 30000, profit: 15000 },
  { month: 'Aug', revenue: 26000, profit: 13000 },
  { month: 'Sep', revenue: 29000, profit: 14500 },
  { month: 'Oct', revenue: 31000, profit: 15500 },
  { month: 'Nov', revenue: 34000, profit: 17000 },
  { month: 'Dec', revenue: 38000, profit: 19000 },
];

const sampleEnergyData = [
  { month: 'Jan', charge: 280, discharge: 230 },
  { month: 'Feb', charge: 300, discharge: 270 },
  { month: 'Mar', charge: 340, discharge: 310 },
  { month: 'Apr', charge: 360, discharge: 330 },
  { month: 'May', charge: 380, discharge: 350 },
  { month: 'Jun', charge: 410, discharge: 370 },
  { month: 'Jul', charge: 430, discharge: 390 },
  { month: 'Aug', charge: 420, discharge: 380 },
  { month: 'Sep', charge: 400, discharge: 360 },
  { month: 'Oct', charge: 380, discharge: 340 },
  { month: 'Nov', charge: 360, discharge: 320 },
  { month: 'Dec', charge: 340, discharge: 300 },
];

const ResultsPage = () => {
  const [activeTab, setActiveTab] = useState('charts');

  const chartConfig = {
    revenue: {
      label: "Revenue",
      theme: {
        light: "#2F855A",
        dark: "#4fd1c5",
      },
    },
    profit: {
      label: "Profit",
      theme: {
        light: "#1A365D",
        dark: "#90cdf4",
      },
    },
    charge: {
      label: "Charge",
      theme: {
        light: "#ECC94B",
        dark: "#fbd38d",
      },
    },
    discharge: {
      label: "Discharge",
      theme: {
        light: "#9B2C2C",
        dark: "#fc8181",
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            View and analyze your energy storage system performance results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download size={16} />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="charts">
            <LineChartIcon size={16} className="mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="data">
            <BarChart3 size={16} className="mr-2" />
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText size={16} className="mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit</CardTitle>
                <CardDescription>Monthly revenue and profit from your energy storage system</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={sampleRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={{ strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={{ strokeWidth: 2 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Data represents 12-month period
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charge & Discharge Cycles</CardTitle>
                <CardDescription>Monthly battery charge and discharge patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={sampleEnergyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="charge" fill="var(--color-charge)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="discharge" fill="var(--color-discharge)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Values shown in MWh
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Annual Performance Overview</CardTitle>
              <CardDescription>Composite view of system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig} className="h-full">
                  <LineChart 
                    data={sampleRevenueData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-profit)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="profit" 
                      stroke="var(--color-profit)" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Data Tables</CardTitle>
              <CardDescription>Tabular view of energy data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full data-grid">
                  <thead>
                    <tr>
                      <th className="data-header">Month</th>
                      <th className="data-header">Revenue ($)</th>
                      <th className="data-header">Profit ($)</th>
                      <th className="data-header">Charge (MWh)</th>
                      <th className="data-header">Discharge (MWh)</th>
                      <th className="data-header">Efficiency (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRevenueData.map((item, index) => (
                      <tr key={item.month}>
                        <td className="data-cell">{item.month}</td>
                        <td className="data-cell">${item.revenue.toLocaleString()}</td>
                        <td className="data-cell">${item.profit.toLocaleString()}</td>
                        <td className="data-cell">{sampleEnergyData[index].charge}</td>
                        <td className="data-cell">{sampleEnergyData[index].discharge}</td>
                        <td className="data-cell">
                          {Math.round((sampleEnergyData[index].discharge / sampleEnergyData[index].charge) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download size={16} />
                Export as CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>
                Download and view detailed performance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Monthly Performance Report</h4>
                      <p className="text-sm text-muted-foreground">April 2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Quarterly Financial Analysis</h4>
                      <p className="text-sm text-muted-foreground">Q1 2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Annual Revenue Projection</h4>
                      <p className="text-sm text-muted-foreground">2025 Fiscal Year</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Battery Degradation Analysis</h4>
                      <p className="text-sm text-muted-foreground">March 2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsPage;

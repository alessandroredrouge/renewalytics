import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Battery,
  Calendar,
  Check,
  Clock,
  Edit3,
  BarChart3,
  DollarSign,
  Info,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ProjectOverview = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-energy-blue">
              New York BESS Project
            </h1>
            <Badge variant="outline" className="ml-2">
              BESS
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            100MW / 400MWh Battery Energy Storage System
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit3 size={16} />
            <span>Edit Details</span>
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <BarChart3 size={16} />
            <span>Run Simulation</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Battery className="h-5 w-5 text-energy-green" />
                  System Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Power Rating</dt>
                    <dd className="font-medium">100 MW</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Energy Capacity</dt>
                    <dd className="font-medium">400 MWh</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">4 hours</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">
                      Round-Trip Efficiency
                    </dt>
                    <dd className="font-medium">87%</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Battery Chemistry</dt>
                    <dd className="font-medium">Lithium-Ion NMC</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">
                      Degradation per Year
                    </dt>
                    <dd className="font-medium">2.0%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-energy-blue" />
                  Financial Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Capital Cost</dt>
                    <dd className="font-medium">$320M</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Capex ($/kWh)</dt>
                    <dd className="font-medium">$800/kWh</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Annual O&M</dt>
                    <dd className="font-medium">$2.5M</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Project Lifetime</dt>
                    <dd className="font-medium">20 years</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Discount Rate</dt>
                    <dd className="font-medium">8.0%</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Tax Rate</dt>
                    <dd className="font-medium">21%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-energy-yellow" />
                  Market Participation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">ISO/RTO</dt>
                    <dd className="font-medium">NYISO</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Zone</dt>
                    <dd className="font-medium">Zone J (NYC)</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Revenue Streams</dt>
                    <dd className="font-medium">4</dd>
                  </div>
                  <div className="flex items-center py-1">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Check size={14} className="text-energy-green" />
                      Energy Arbitrage
                    </dt>
                  </div>
                  <div className="flex items-center py-1">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Check size={14} className="text-energy-green" />
                      Frequency Regulation
                    </dt>
                  </div>
                  <div className="flex items-center py-1">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Check size={14} className="text-energy-green" />
                      Capacity Market
                    </dt>
                  </div>
                  <div className="flex items-center py-1">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Check size={14} className="text-energy-green" />
                      Demand Response
                    </dt>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">
                      Overall Completion
                    </div>
                    <div className="text-sm text-muted-foreground">65%</div>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Project Setup</div>
                      <div className="text-sm text-muted-foreground">100%</div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Dispatch Logic</div>
                      <div className="text-sm text-muted-foreground">80%</div>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Revenue Streams</div>
                      <div className="text-sm text-muted-foreground">75%</div>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">
                        Financial Analysis
                      </div>
                      <div className="text-sm text-muted-foreground">40%</div>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This project involves the development of a 100MW/400MWh
                  Battery Energy Storage System (BESS) located in New York City
                  (NYISO Zone J). The system will primarily participate in
                  energy arbitrage, frequency regulation, capacity markets, and
                  demand response programs available in the NYISO market.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  The project aims to capture value from high price volatility
                  in the NYC area while providing grid stability services. The
                  battery system will employ smart dispatch algorithms to
                  optimize revenue across multiple value streams while managing
                  battery degradation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span>
                      Historical NYISO price data from 2022-2023 used for
                      forecasting
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span>
                      2% annual price escalation applied to energy prices
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span>Battery capacity degradation of 2% per year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span>ITC benefit of 30% applied to capital cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span>
                      20-year project lifetime with no major component
                      replacements
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-[15px] w-[1px] bg-border"></div>

                <div className="space-y-6">
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-energy-green flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Project Initiation
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>January 15, 2023</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Project scope defined and initial system parameters
                        established.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-energy-green flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Market Analysis Completed
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>March 10, 2023</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive analysis of NYISO market structure and
                        opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-energy-blue flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Dispatch Logic Development
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>In Progress - 80% Complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Development of optimization algorithms for dispatch
                        across multiple revenue streams.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-energy-blue flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Revenue Modeling
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>In Progress - 75% Complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Revenue forecasting for all identified value streams.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Financial Analysis
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>In Progress - 40% Complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive financial modeling and sensitivity
                        analysis.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        Final Decision Gate
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>Scheduled - September 30, 2023</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Final investment decision based on complete
                        techno-economic analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Project Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">
                      Project Manager
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      sarah.chen@example.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-energy-blue/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-energy-blue" />
                  </div>
                  <div>
                    <div className="font-semibold">Michael Rodriguez</div>
                    <div className="text-sm text-muted-foreground">
                      Energy Market Analyst
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      m.rodriguez@example.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-energy-green/10 flex items-center justify-center">
                    <Battery className="h-5 w-5 text-energy-green" />
                  </div>
                  <div>
                    <div className="font-semibold">Emma Wilson</div>
                    <div className="text-sm text-muted-foreground">
                      Battery Systems Engineer
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      e.wilson@example.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-energy-yellow/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-energy-yellow" />
                  </div>
                  <div>
                    <div className="font-semibold">James Kim</div>
                    <div className="text-sm text-muted-foreground">
                      Financial Analyst
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      j.kim@example.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Aisha Patel</div>
                    <div className="text-sm text-muted-foreground">
                      Data Scientist
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      a.patel@example.com
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectOverview;

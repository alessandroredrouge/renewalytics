import React, { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { getProjectDetails, ProjectData } from "@/lib/apiClient";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

const formatValue = (
  value: any,
  unit: string = "",
  precision: number = 2
): string => {
  if (value === null || typeof value === "undefined") return "-";
  if (typeof value === "number") {
    const effectivePrecision =
      Number.isInteger(value) && precision <= 0 ? 0 : precision;
    return `${value.toFixed(effectivePrecision)}${unit ? ` ${unit}` : ""}`;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
  return String(value);
};

const DetailItem: React.FC<{
  label: string;
  value: any;
  unit?: string;
  className?: string;
  precision?: number;
}> = ({ label, value, unit, className, precision }) => (
  <div className={className}>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm font-medium">{formatValue(value, unit, precision)}</p>
  </div>
);

const ProjectOverview = () => {
  const { activeProjectId } = useView();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!activeProjectId) {
        setError("No active project selected.");
        setIsLoading(false);
        setProjectData(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setProjectData(null);

      try {
        console.log(`Fetching data for project ID: ${activeProjectId}`);
        const data = await getProjectDetails(activeProjectId);
        setProjectData(data);
      } catch (err) {
        console.error("Error loading project details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load project details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [activeProjectId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <Skeleton className="h-9 w-3/4 md:w-1/2 mb-2" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Project Data</AlertTitle>
          <AlertDescription>
            {activeProjectId
              ? "Could not load data for the selected project."
              : "Please select a project to view its overview."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isBessProject = projectData.type_of_plant?.includes("BESS");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-energy-blue">
              {projectData.name}
            </h1>
            {projectData.type_of_plant &&
              projectData.type_of_plant.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {projectData.type_of_plant.join(" + ")}
                </Badge>
              )}
          </div>
          <p className="text-muted-foreground mt-1">
            {`${formatValue(projectData.nominal_power_capacity, "MW", 0)}`}
            {isBessProject
              ? ` / ${formatValue(
                  projectData.nominal_energy_capacity,
                  "MWh",
                  0
                )}`
              : ""}
            {` ${projectData.technology || "Project"} in ${
              projectData.location || projectData.country || "N/A"
            }`}
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl mt-2">
            {projectData.description || "No detailed description provided."}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled
          >
            <Edit3 size={16} />
            <span>Edit Details</span>
          </Button>
          <Button size="sm" className="flex items-center gap-2" disabled>
            <BarChart3 size={16} />
            <span>Run Simulation</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Battery className="h-5 w-5 text-energy-green" />
                  System Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem
                    label="Power Rating"
                    value={projectData.nominal_power_capacity}
                    unit="MW"
                    precision={0}
                  />
                  {isBessProject && (
                    <>
                      <DetailItem
                        label="Energy Capacity"
                        value={projectData.nominal_energy_capacity}
                        unit="MWh"
                        precision={0}
                      />
                      <DetailItem
                        label="Duration"
                        value={
                          (projectData.nominal_energy_capacity ?? 0) /
                          (projectData.nominal_power_capacity ?? 1)
                        }
                        unit="hours"
                        precision={1}
                      />
                      <DetailItem
                        label="Max Charging Power"
                        value={projectData.max_charging_power}
                        unit="MW"
                        precision={0}
                      />
                      <DetailItem
                        label="Charging Efficiency"
                        value={projectData.charging_efficiency}
                        unit="%"
                        precision={1}
                      />
                      <DetailItem
                        label="Max SoC"
                        value={projectData.max_soc}
                        unit="%"
                        precision={1}
                      />
                      <DetailItem
                        label="Min SoC"
                        value={projectData.min_soc}
                        unit="%"
                        precision={1}
                      />
                    </>
                  )}
                  <DetailItem
                    label="Max Discharging Power"
                    value={projectData.max_discharging_power}
                    unit="MW"
                    precision={0}
                  />
                  <DetailItem
                    label="Discharging Efficiency"
                    value={projectData.discharging_efficiency}
                    unit="%"
                    precision={1}
                  />
                  <DetailItem
                    label="Technology"
                    value={projectData.technology}
                  />
                  <DetailItem
                    label="Calendar Lifetime"
                    value={projectData.calendar_lifetime}
                    unit="Years"
                    precision={0}
                  />
                  {isBessProject && (
                    <DetailItem
                      label="Cycling Lifetime"
                      value={projectData.cycling_lifetime}
                      unit="Cycles"
                      precision={0}
                    />
                  )}
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem
                    label="Total CAPEX"
                    value={projectData.capex_tot}
                    unit="$"
                    precision={0}
                  />
                  <DetailItem
                    label="CAPEX (Power)"
                    value={projectData.capex_power}
                    unit="$/kW"
                    precision={0}
                  />
                  {isBessProject && (
                    <DetailItem
                      label="CAPEX (Energy)"
                      value={projectData.capex_energy}
                      unit="$/kWh"
                      precision={0}
                    />
                  )}
                  <DetailItem
                    label="Total OPEX (Yearly)"
                    value={projectData.opex_yr}
                    unit="$/yr"
                    precision={0}
                  />
                  <DetailItem
                    label="OPEX (Power / Year)"
                    value={projectData.opex_power_yr}
                    unit="$/kW/yr"
                    precision={0}
                  />
                  {isBessProject && (
                    <DetailItem
                      label="OPEX (Energy / Year)"
                      value={projectData.opex_energy_yr}
                      unit="$/kWh/yr"
                      precision={0}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-energy-yellow" />
                  Market Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                  <DetailItem label="Country" value={projectData.country} />
                  <DetailItem label="Location" value={projectData.location} />
                </div>
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Revenue Streams
                  </Label>
                  {projectData.revenue_streams &&
                  projectData.revenue_streams.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {projectData.revenue_streams.map((stream) => (
                        <li key={stream} className="flex items-center text-sm">
                          <Check
                            size={14}
                            className="mr-2 text-energy-green flex-shrink-0"
                          />
                          <span>{stream}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">-</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectOverview;

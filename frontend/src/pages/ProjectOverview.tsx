import React, { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { ProjectData } from "@/lib/apiClient";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Edit, CheckCircle } from "lucide-react";
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
import { useProjectData } from "@/contexts/ProjectDataContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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

const InputItem: React.FC<{
  label: string;
  id: string;
  value: any;
  onChange: (value: string) => void;
  unit?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  precision?: number;
}> = ({
  label,
  id,
  value,
  onChange,
  unit,
  type = "text",
  placeholder,
  className,
  precision,
}) => {
  const step =
    type === "number"
      ? precision && precision > 0
        ? `0.${"0".repeat(precision - 1)}1`
        : "1"
      : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center">
        <Input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          className={cn("text-sm", unit && "rounded-r-none")}
        />
        {unit && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm h-10">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

const ProjectOverview = () => {
  const { activeProjectId } = useView();
  const { projectData: projectDataFromContext, updateProjectField } =
    useProjectData();
  const [isEditing, setIsEditing] = useState(false);
  const [revenueStreamsInput, setRevenueStreamsInput] = useState<string>("");

  useEffect(() => {
    if (projectDataFromContext) {
      setRevenueStreamsInput(
        Array.isArray(projectDataFromContext.revenue_streams)
          ? projectDataFromContext.revenue_streams.join(", ")
          : ""
      );
    }
  }, [projectDataFromContext]);

  if (!activeProjectId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Project Selected</AlertTitle>
          <AlertDescription>
            Please open an existing project or start a new sandbox project.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (
    activeProjectId !== "sandbox" &&
    (!projectDataFromContext ||
      projectDataFromContext.project_id !== activeProjectId)
  ) {
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

  const projectData = projectDataFromContext;

  const defaultSandboxData: Partial<ProjectData> = {
    name: "New Sandbox Project",
    description: "Unsaved project. Fill in details and save.",
    country: null,
    location: null,
    type_of_plant: [],
    technology: null,
    nominal_power_capacity: null,
  };

  const displayData =
    activeProjectId === "sandbox" && !projectData
      ? (defaultSandboxData as ProjectData)
      : projectData;

  if (!displayData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Displaying Project</AlertTitle>
          <AlertDescription>
            Could not display project data. Project context might be empty.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFieldChange = (field: keyof ProjectData, value: string) => {
    if (field === "revenue_streams") return;

    let processedValue: any = value;
    const sourceDataForType = projectDataFromContext ?? defaultSandboxData;
    const originalValue = sourceDataForType[field];

    if (
      typeof originalValue === "number" ||
      (originalValue === null && typeof displayData[field] === "number")
    ) {
      if (value === "") {
        processedValue = null;
      } else {
        const num = parseFloat(value);
        processedValue = isNaN(num) ? null : num;
      }
    } else if (value === "") {
      processedValue = null;
    }
    if (projectDataFromContext || activeProjectId === "sandbox") {
      updateProjectField(field, processedValue);
    } else {
      console.warn(
        "Attempted to update field while context was unexpectedly null for a saved project."
      );
    }
  };

  const handleProjectTypeChange = (
    type: "BESS" | "PV",
    checked: boolean | string
  ) => {
    const currentTypes = displayData.type_of_plant ?? [];
    let newTypes: string[];

    if (checked) {
      newTypes = currentTypes.includes(type)
        ? currentTypes
        : [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter((t) => t !== type);
    }

    updateProjectField("type_of_plant", newTypes.length > 0 ? newTypes : null);
    updateProjectField("hybrid", newTypes.length > 1);
  };

  const updateRevenueStreamsContext = () => {
    const processedArray = revenueStreamsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const currentContextValue = projectDataFromContext?.revenue_streams ?? null;
    const newContextValue = processedArray.length > 0 ? processedArray : null;

    if (
      JSON.stringify(currentContextValue) !== JSON.stringify(newContextValue)
    ) {
      updateProjectField("revenue_streams", newContextValue);
      console.log("Updated revenue_streams in context:", newContextValue);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      updateRevenueStreamsContext();
    }
    setIsEditing(!isEditing);
  };

  const isBessProject = displayData.type_of_plant?.includes("BESS");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex-1 space-y-1 mr-4">
          {isEditing ? (
            <Input
              id="projectName"
              value={displayData.name ?? ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="text-3xl font-bold h-auto p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Project Name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-energy-blue flex items-center gap-2">
              {displayData.name} {activeProjectId === "sandbox" ? "*" : ""}
              {displayData.type_of_plant &&
                displayData.type_of_plant.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-sm">
                    {displayData.type_of_plant.join(" + ")}
                  </Badge>
                )}
            </h1>
          )}

          {isEditing && (
            <fieldset className="border p-3 rounded mt-3">
              <legend className="text-xs font-medium px-1 text-muted-foreground">
                Project Type
              </legend>
              <div className="flex items-center space-x-4 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-bess"
                    checked={displayData.type_of_plant?.includes("BESS")}
                    onCheckedChange={(checked) =>
                      handleProjectTypeChange("BESS", checked)
                    }
                  />
                  <Label htmlFor="type-bess" className="text-sm font-medium">
                    BESS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-pv"
                    checked={displayData.type_of_plant?.includes("PV")}
                    onCheckedChange={(checked) =>
                      handleProjectTypeChange("PV", checked)
                    }
                  />
                  <Label htmlFor="type-pv" className="text-sm font-medium">
                    PV
                  </Label>
                </div>
              </div>
            </fieldset>
          )}

          {!isEditing && (
            <p className="text-muted-foreground">
              {`${formatValue(displayData.nominal_power_capacity, "MW", 0)}`}
              {isBessProject
                ? ` / ${formatValue(
                    displayData.nominal_energy_capacity,
                    "MWh",
                    0
                  )}`
                : ""}
              {` ${displayData.technology || "Project"} in ${
                displayData.location || displayData.country || "N/A"
              }`}
            </p>
          )}
          {isEditing ? (
            <Textarea
              id="projectDescription"
              value={displayData.description ?? ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Project description..."
              className="text-sm min-h-[60px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground max-w-3xl mt-2">
              {displayData.description ||
                (activeProjectId === "sandbox"
                  ? "Unsaved project. Fill in details and save."
                  : "No detailed description provided.")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleToggleEdit}>
            {isEditing ? (
              <CheckCircle size={16} className="mr-2" />
            ) : (
              <Edit size={16} className="mr-2" />
            )}
            {isEditing ? "Done Editing" : "Edit Details"}
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
                  {isEditing ? (
                    <>
                      <InputItem
                        label="Power Rating (MW)"
                        id="nom-power"
                        type="number"
                        value={displayData.nominal_power_capacity}
                        onChange={(v) =>
                          handleFieldChange("nominal_power_capacity", v)
                        }
                        precision={0}
                        unit="MW"
                      />
                      {isBessProject && (
                        <InputItem
                          label="Energy Capacity (MWh)"
                          id="nom-energy"
                          type="number"
                          value={displayData.nominal_energy_capacity}
                          onChange={(v) =>
                            handleFieldChange("nominal_energy_capacity", v)
                          }
                          precision={0}
                          unit="MWh"
                        />
                      )}
                      {isBessProject && (
                        <InputItem
                          label="Max Charging Power (MW)"
                          id="max-charge"
                          type="number"
                          value={displayData.max_charging_power}
                          onChange={(v) =>
                            handleFieldChange("max_charging_power", v)
                          }
                          precision={0}
                          unit="MW"
                        />
                      )}
                      <InputItem
                        label="Max Discharging Power (MW)"
                        id="max-discharge"
                        type="number"
                        value={displayData.max_discharging_power}
                        onChange={(v) =>
                          handleFieldChange("max_discharging_power", v)
                        }
                        precision={0}
                        unit="MW"
                      />
                      {isBessProject && (
                        <InputItem
                          label="Charging Efficiency (%)"
                          id="charge-eff"
                          type="number"
                          value={displayData.charging_efficiency}
                          onChange={(v) =>
                            handleFieldChange("charging_efficiency", v)
                          }
                          precision={1}
                          unit="%"
                        />
                      )}
                      <InputItem
                        label="Discharging Efficiency (%)"
                        id="discharge-eff"
                        type="number"
                        value={displayData.discharging_efficiency}
                        onChange={(v) =>
                          handleFieldChange("discharging_efficiency", v)
                        }
                        precision={1}
                        unit="%"
                      />
                      {isBessProject && (
                        <InputItem
                          label="Max SoC (%)"
                          id="max-soc"
                          type="number"
                          value={displayData.max_soc}
                          onChange={(v) => handleFieldChange("max_soc", v)}
                          precision={1}
                          unit="%"
                        />
                      )}
                      {isBessProject && (
                        <InputItem
                          label="Min SoC (%)"
                          id="min-soc"
                          type="number"
                          value={displayData.min_soc}
                          onChange={(v) => handleFieldChange("min_soc", v)}
                          precision={1}
                          unit="%"
                        />
                      )}
                      <InputItem
                        label="Technology"
                        id="tech"
                        type="text"
                        value={displayData.technology}
                        onChange={(v) => handleFieldChange("technology", v)}
                      />
                      <InputItem
                        label="Calendar Lifetime (Years)"
                        id="cal-life"
                        type="number"
                        value={displayData.calendar_lifetime}
                        onChange={(v) =>
                          handleFieldChange("calendar_lifetime", v)
                        }
                        precision={0}
                        unit="Years"
                      />
                      {isBessProject && (
                        <InputItem
                          label="Cycling Lifetime (Cycles)"
                          id="cyc-life"
                          type="number"
                          value={displayData.cycling_lifetime}
                          onChange={(v) =>
                            handleFieldChange("cycling_lifetime", v)
                          }
                          precision={0}
                          unit="Cycles"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <DetailItem
                        label="Power Rating"
                        value={displayData.nominal_power_capacity}
                        unit="MW"
                        precision={0}
                      />
                      {isBessProject ? (
                        <>
                          <DetailItem
                            label="Energy Capacity"
                            value={displayData.nominal_energy_capacity}
                            unit="MWh"
                            precision={0}
                          />
                          <DetailItem
                            label="Duration"
                            value={
                              (displayData.nominal_energy_capacity ?? 0) /
                              (displayData.nominal_power_capacity ?? 1)
                            }
                            unit="hours"
                            precision={1}
                          />
                          <DetailItem
                            label="Max Charging Power"
                            value={displayData.max_charging_power}
                            unit="MW"
                            precision={0}
                          />
                          <DetailItem
                            label="Charging Efficiency"
                            value={displayData.charging_efficiency}
                            unit="%"
                            precision={1}
                          />
                          <DetailItem
                            label="Max SoC"
                            value={displayData.max_soc}
                            unit="%"
                            precision={1}
                          />
                          <DetailItem
                            label="Min SoC"
                            value={displayData.min_soc}
                            unit="%"
                            precision={1}
                          />
                          <DetailItem
                            label="Cycling Lifetime"
                            value={displayData.cycling_lifetime}
                            unit="Cycles"
                            precision={0}
                          />
                        </>
                      ) : (
                        <div className="sm:col-span-1"></div>
                      )}
                      <DetailItem
                        label="Max Discharging Power"
                        value={displayData.max_discharging_power}
                        unit="MW"
                        precision={0}
                      />
                      <DetailItem
                        label="Discharging Efficiency"
                        value={displayData.discharging_efficiency}
                        unit="%"
                        precision={1}
                      />
                      <DetailItem
                        label="Technology"
                        value={displayData.technology}
                      />
                      <DetailItem
                        label="Calendar Lifetime"
                        value={displayData.calendar_lifetime}
                        unit="Years"
                        precision={0}
                      />
                    </>
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
                  {isEditing ? (
                    <>
                      <InputItem
                        label="Total CAPEX ($)"
                        id="capex-tot"
                        type="number"
                        value={displayData.capex_tot}
                        onChange={(v) => handleFieldChange("capex_tot", v)}
                        precision={0}
                        unit="$"
                      />
                      <InputItem
                        label="CAPEX (Power, $/kW)"
                        id="capex-pwr"
                        type="number"
                        value={displayData.capex_power}
                        onChange={(v) => handleFieldChange("capex_power", v)}
                        precision={0}
                        unit="$/kW"
                      />
                      {isBessProject && (
                        <InputItem
                          label="CAPEX (Energy, $/kWh)"
                          id="capex-en"
                          type="number"
                          value={displayData.capex_energy}
                          onChange={(v) => handleFieldChange("capex_energy", v)}
                          precision={0}
                          unit="$/kWh"
                        />
                      )}
                      <InputItem
                        label="Total OPEX (Yearly, $/yr)"
                        id="opex-yr"
                        type="number"
                        value={displayData.opex_yr}
                        onChange={(v) => handleFieldChange("opex_yr", v)}
                        precision={0}
                        unit="$/yr"
                      />
                      <InputItem
                        label="OPEX (Power / Year, $/kW/yr)"
                        id="opex-pwr-yr"
                        type="number"
                        value={displayData.opex_power_yr}
                        onChange={(v) => handleFieldChange("opex_power_yr", v)}
                        precision={0}
                        unit="$/kW/yr"
                      />
                      {isBessProject && (
                        <InputItem
                          label="OPEX (Energy / Year, $/kWh/yr)"
                          id="opex-en-yr"
                          type="number"
                          value={displayData.opex_energy_yr}
                          onChange={(v) =>
                            handleFieldChange("opex_energy_yr", v)
                          }
                          precision={0}
                          unit="$/kWh/yr"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <DetailItem
                        label="Total CAPEX"
                        value={displayData.capex_tot}
                        unit="$"
                        precision={0}
                      />
                      <DetailItem
                        label="CAPEX (Power)"
                        value={displayData.capex_power}
                        unit="$/kW"
                        precision={0}
                      />
                      {isBessProject && (
                        <DetailItem
                          label="CAPEX (Energy)"
                          value={displayData.capex_energy}
                          unit="$/kWh"
                          precision={0}
                        />
                      )}
                      <DetailItem
                        label="Total OPEX (Yearly)"
                        value={displayData.opex_yr}
                        unit="$/yr"
                        precision={0}
                      />
                      <DetailItem
                        label="OPEX (Power / Year)"
                        value={displayData.opex_power_yr}
                        unit="$/kW/yr"
                        precision={0}
                      />
                      {isBessProject && (
                        <DetailItem
                          label="OPEX (Energy / Year)"
                          value={displayData.opex_energy_yr}
                          unit="$/kWh/yr"
                          precision={0}
                        />
                      )}
                    </>
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
                  {isEditing ? (
                    <>
                      <InputItem
                        label="Country"
                        id="country"
                        type="text"
                        value={displayData.country}
                        onChange={(v) => handleFieldChange("country", v)}
                      />
                      <InputItem
                        label="Location"
                        id="location"
                        type="text"
                        value={displayData.location}
                        onChange={(v) => handleFieldChange("location", v)}
                      />
                    </>
                  ) : (
                    <>
                      <DetailItem label="Country" value={displayData.country} />
                      <DetailItem
                        label="Location"
                        value={displayData.location}
                      />
                    </>
                  )}
                </div>
                <div className="pt-2">
                  <Label
                    htmlFor="revenue-streams"
                    className="text-xs text-muted-foreground"
                  >
                    Revenue Streams
                  </Label>
                  {isEditing ? (
                    <Input
                      id="revenue-streams"
                      type="text"
                      value={revenueStreamsInput}
                      onChange={(e) => setRevenueStreamsInput(e.target.value)}
                      onBlur={updateRevenueStreamsContext}
                      placeholder="Enter streams, comma-separated"
                      className="text-sm mt-1"
                    />
                  ) : displayData.revenue_streams &&
                    displayData.revenue_streams.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {displayData.revenue_streams.map((stream) => (
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

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // To handle potentially long content
import { ProjectData } from "@/lib/apiClient"; // Import the project data structure

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData | null;
}

// Helper to format values, handling null/undefined
const formatValue = (
  value: any,
  unit: string = "",
  precision: number = 2
): string => {
  if (value === null || typeof value === "undefined") return "-";
  if (typeof value === "number") {
    // Avoid unnecessary decimals for integers unless precision is explicitly set > 0
    const effectivePrecision =
      Number.isInteger(value) && precision <= 0 ? 0 : precision;
    return `${value.toFixed(effectivePrecision)}${unit ? ` ${unit}` : ""}`;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
  return String(value);
};

// Helper component for displaying label-value pairs
const DetailItem: React.FC<{
  label: string;
  value: any;
  unit?: string;
  className?: string;
}> = ({ label, value, unit, className }) => (
  <div className={className}>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm">{formatValue(value, unit)}</p>
  </div>
);

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!project) return null; // Don't render if no project data

  const isBessProject = project.type_of_plant?.includes("BESS");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Project Details: {project.name}</DialogTitle>
          <DialogDescription>
            {project.description || "Detailed information about the project."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="general"
          className="flex-grow overflow-hidden flex flex-col py-4"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow mt-4 pr-3">
            <div className="space-y-6 p-1">
              {/* --- General Tab --- */}
              <TabsContent value="general" className="mt-0 space-y-4">
                <DetailItem label="Project ID" value={project.project_id} />
                <DetailItem label="Pipeline ID" value={project.pipeline_id} />
                <DetailItem label="Country" value={project.country} />
                <DetailItem label="Location" value={project.location} />
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Project Type(s)
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.type_of_plant &&
                    project.type_of_plant.length > 0 ? (
                      project.type_of_plant.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm">-</p>
                    )}
                  </div>
                </div>
                <DetailItem label="Technology" value={project.technology} />
                <DetailItem label="Hybrid" value={project.hybrid} />
                <DetailItem
                  label="Created At"
                  value={new Date(project.created_at)}
                />
              </TabsContent>

              {/* --- Technical Tab --- */}
              <TabsContent
                value="technical"
                className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
              >
                <DetailItem
                  label="Nominal Power Capacity"
                  value={project.nominal_power_capacity}
                  unit="MW"
                />
                <DetailItem
                  label="Max Discharging Power"
                  value={project.max_discharging_power}
                  unit="MW"
                />
                <DetailItem
                  label="Discharging Efficiency"
                  value={project.discharging_efficiency}
                  unit="%"
                />
                <DetailItem
                  label="Calendar Lifetime"
                  value={project.calendar_lifetime}
                  unit="Years"
                />
                {isBessProject && (
                  <>
                    <DetailItem
                      label="Max Charging Power"
                      value={project.max_charging_power}
                      unit="MW"
                    />
                    <DetailItem
                      label="Nominal Energy Capacity"
                      value={project.nominal_energy_capacity}
                      unit="MWh"
                    />
                    <DetailItem
                      label="Charging Efficiency"
                      value={project.charging_efficiency}
                      unit="%"
                    />
                    <DetailItem
                      label="Max SoC"
                      value={project.max_soc}
                      unit="%"
                    />
                    <DetailItem
                      label="Min SoC"
                      value={project.min_soc}
                      unit="%"
                    />
                    <DetailItem
                      label="Cycling Lifetime"
                      value={project.cycling_lifetime}
                      unit="Cycles"
                    />
                  </>
                )}
              </TabsContent>

              {/* --- Economic Tab --- */}
              <TabsContent
                value="economic"
                className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
              >
                <DetailItem
                  label="CAPEX (Power)"
                  value={project.capex_power}
                  unit="$/kW"
                />
                <DetailItem
                  label="CAPEX (Total)"
                  value={project.capex_tot}
                  unit="$"
                />
                <DetailItem
                  label="OPEX (Power / Year)"
                  value={project.opex_power_yr}
                  unit="$/kW/yr"
                />
                <DetailItem
                  label="OPEX (Total / Year)"
                  value={project.opex_yr}
                  unit="$/yr"
                />
                {isBessProject && (
                  <>
                    <DetailItem
                      label="CAPEX (Energy)"
                      value={project.capex_energy}
                      unit="$/kWh"
                    />
                    <DetailItem
                      label="OPEX (Energy / Year)"
                      value={project.opex_energy_yr}
                      unit="$/kWh/yr"
                    />
                  </>
                )}
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Revenue Streams
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.revenue_streams &&
                    project.revenue_streams.length > 0 ? (
                      project.revenue_streams.map((stream) => (
                        <Badge key={stream} variant="outline">
                          {stream}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm">-</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* Add Edit/Delete buttons here later if needed */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

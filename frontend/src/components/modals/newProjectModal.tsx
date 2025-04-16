import React, { useState, useCallback, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the structure for the data to be submitted
// Matches the backend schema we will create later
export interface ProjectCreateData {
  pipeline_id: string; // Essential link
  name: string;
  description?: string | null;
  country?: string | null;
  location?: string | null;
  type_of_plant?: string[] | null;
  technology?: string | null;
  hybrid?: boolean | null;
  nominal_power_capacity?: number | null;
  max_discharging_power?: number | null;
  max_charging_power?: number | null;
  nominal_energy_capacity?: number | null;
  max_soc?: number | null;
  min_soc?: number | null;
  charging_efficiency?: number | null;
  discharging_efficiency?: number | null;
  calendar_lifetime?: number | null;
  cycling_lifetime?: number | null;
  capex_power?: number | null;
  capex_energy?: number | null;
  capex_tot?: number | null;
  opex_power_yr?: number | null;
  opex_energy_yr?: number | null;
  opex_yr?: number | null;
  revenue_streams?: string[] | null;
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateData) => Promise<void>;
  pipelineId: string | null; // ID of the pipeline to associate the project with
}

// Helper to parse float input, returning null if invalid or empty
const parseFloatOrNull = (value: string): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Helper to parse int input, returning null if invalid or empty
const parseIntOrNull = (value: string): number | null => {
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
};

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pipelineId,
}) => {
  // --- State for Form Fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [isBess, setIsBess] = useState(false);
  const [isPv, setIsPv] = useState(false);
  const [technology, setTechnology] = useState("");
  const [hybrid, setHybrid] = useState(false);

  const [nominalPowerCapacity, setNominalPowerCapacity] = useState("");
  const [maxDischargingPower, setMaxDischargingPower] = useState("");
  const [maxChargingPower, setMaxChargingPower] = useState("");
  const [nominalEnergyCapacity, setNominalEnergyCapacity] = useState("");
  const [maxSoc, setMaxSoc] = useState("100"); // Default 100
  const [minSoc, setMinSoc] = useState("0"); // Default 0
  const [chargingEfficiency, setChargingEfficiency] = useState("");
  const [dischargingEfficiency, setDischargingEfficiency] = useState("");
  const [calendarLifetime, setCalendarLifetime] = useState("");
  const [cyclingLifetime, setCyclingLifetime] = useState("");

  const [capexPower, setCapexPower] = useState("");
  const [capexEnergy, setCapexEnergy] = useState("");
  const [capexTot, setCapexTot] = useState("");
  const [opexPowerYr, setOpexPowerYr] = useState("");
  const [opexEnergyYr, setOpexEnergyYr] = useState("");
  const [opexYr, setOpexYr] = useState("");
  const [revenueStreamsInput, setRevenueStreamsInput] = useState("");

  // --- Control State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Determine plant types based on checkboxes
  const typeOfPlant = [...(isBess ? ["BESS"] : []), ...(isPv ? ["PV"] : [])];

  // Reset form fields
  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setCountry("");
    setLocation("");
    setIsBess(false);
    setIsPv(false);
    setTechnology("");
    setHybrid(false);
    setNominalPowerCapacity("");
    setMaxDischargingPower("");
    setMaxChargingPower("");
    setNominalEnergyCapacity("");
    setMaxSoc("100");
    setMinSoc("0");
    setChargingEfficiency("");
    setDischargingEfficiency("");
    setCalendarLifetime("");
    setCyclingLifetime("");
    setCapexPower("");
    setCapexEnergy("");
    setCapexTot("");
    setOpexPowerYr("");
    setOpexEnergyYr("");
    setOpexYr("");
    setRevenueStreamsInput("");
    setIsSubmitting(false);
    setError(null);
    setActiveTab("general");
  }, []);

  // Close handler
  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pipelineId) {
      setError("Cannot create project without a selected pipeline.");
      return;
    }
    if (!name.trim()) {
      setError("Project name is required.");
      setActiveTab("general"); // Switch to tab with error
      return;
    }
    if (!isBess && !isPv) {
      setError("Please select at least one Project Type (BESS or PV).");
      setActiveTab("general");
      return;
    }

    const projectData: ProjectCreateData = {
      pipeline_id: pipelineId,
      name: name.trim(),
      description: description.trim() || null,
      country: country.trim() || null,
      location: location.trim() || null,
      type_of_plant: typeOfPlant.length > 0 ? typeOfPlant : null,
      technology: technology.trim() || null,
      hybrid: typeOfPlant.length > 1 ? true : hybrid || null, // Auto-set hybrid if both selected
      // Technical
      nominal_power_capacity: parseFloatOrNull(nominalPowerCapacity),
      max_discharging_power: parseFloatOrNull(maxDischargingPower),
      discharging_efficiency: parseFloatOrNull(dischargingEfficiency),
      calendar_lifetime: parseIntOrNull(calendarLifetime),
      // BESS Specific Technical
      ...(isBess && {
        max_charging_power: parseFloatOrNull(maxChargingPower),
        nominal_energy_capacity: parseFloatOrNull(nominalEnergyCapacity),
        max_soc: parseFloatOrNull(maxSoc),
        min_soc: parseFloatOrNull(minSoc),
        charging_efficiency: parseFloatOrNull(chargingEfficiency),
        cycling_lifetime: parseIntOrNull(cyclingLifetime),
      }),
      // Economic
      capex_power: parseFloatOrNull(capexPower),
      capex_tot: parseFloatOrNull(capexTot),
      opex_power_yr: parseFloatOrNull(opexPowerYr),
      opex_yr: parseFloatOrNull(opexYr),
      // BESS Specific Economic
      ...(isBess && {
        capex_energy: parseFloatOrNull(capexEnergy),
        opex_energy_yr: parseFloatOrNull(opexEnergyYr),
      }),
      revenue_streams:
        revenueStreamsInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s) ?? null,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(projectData);
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog open/close handler
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Disable modal interaction when closed or submitting
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for the new project within the selected
              pipeline.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-grow overflow-hidden flex flex-col py-4"
          >
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
            </TabsList>

            <div className="flex-grow overflow-y-auto p-1 mt-4 space-y-4">
              {/* --- General Tab --- */}
              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <LabelledInput
                    label="Project Name *"
                    id="proj-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Site Alpha BESS"
                    required
                    disabled={isSubmitting}
                  />
                  <LabelledInput
                    label="Country"
                    id="proj-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., United Kingdom"
                    disabled={isSubmitting}
                  />
                </div>
                <LabelledInput
                  label="Location"
                  id="proj-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Near Manchester, UK or Lat/Lon coords"
                  disabled={isSubmitting}
                />
                <div>
                  <Label htmlFor="proj-desc">Description</Label>
                  <Textarea
                    id="proj-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief project description"
                    disabled={isSubmitting}
                  />
                </div>

                <fieldset className="border p-4 rounded">
                  <legend className="text-sm font-medium px-1">
                    Project Type *
                  </legend>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-bess"
                        checked={isBess}
                        onCheckedChange={(checked) => setIsBess(!!checked)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="type-bess">BESS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-pv"
                        checked={isPv}
                        onCheckedChange={(checked) => setIsPv(!!checked)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="type-pv">PV</Label>
                    </div>
                  </div>
                </fieldset>

                <LabelledInput
                  label="Technology"
                  id="proj-tech"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="e.g., Li-ion NMC, Monocrystalline PERC"
                  disabled={isSubmitting}
                />

                {typeOfPlant.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hybrid" checked={true} disabled />
                    <Label htmlFor="hybrid">
                      Hybrid Project (auto-detected)
                    </Label>
                  </div>
                )}
              </TabsContent>

              {/* --- Technical Tab --- */}
              <TabsContent
                value="technical"
                className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4"
              >
                <LabelledInput
                  type="number"
                  label="Nominal Power Capacity"
                  id="tech-nom-power"
                  value={nominalPowerCapacity}
                  onChange={(e) => setNominalPowerCapacity(e.target.value)}
                  placeholder="e.g., 100"
                  unit="MW"
                  disabled={isSubmitting}
                />
                <LabelledInput
                  type="number"
                  label="Max Discharging Power"
                  id="tech-max-dis"
                  value={maxDischargingPower}
                  onChange={(e) => setMaxDischargingPower(e.target.value)}
                  placeholder="e.g., 100"
                  unit="MW"
                  disabled={isSubmitting}
                />
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Max Charging Power (BESS)"
                    id="tech-max-chg"
                    value={maxChargingPower}
                    onChange={(e) => setMaxChargingPower(e.target.value)}
                    placeholder="e.g., 100"
                    unit="MW"
                    disabled={isSubmitting}
                  />
                )}
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Nominal Energy Capacity (BESS)"
                    id="tech-nom-energy"
                    value={nominalEnergyCapacity}
                    onChange={(e) => setNominalEnergyCapacity(e.target.value)}
                    placeholder="e.g., 200"
                    unit="MWh"
                    disabled={isSubmitting}
                  />
                )}
                <LabelledInput
                  type="number"
                  label="Discharging Efficiency"
                  id="tech-dis-eff"
                  value={dischargingEfficiency}
                  onChange={(e) => setDischargingEfficiency(e.target.value)}
                  placeholder="e.g., 90"
                  unit="%"
                  disabled={isSubmitting}
                  min={0}
                  max={100}
                  step="0.1"
                />
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Charging Efficiency (BESS)"
                    id="tech-chg-eff"
                    value={chargingEfficiency}
                    onChange={(e) => setChargingEfficiency(e.target.value)}
                    placeholder="e.g., 90"
                    unit="%"
                    disabled={isSubmitting}
                    min={0}
                    max={100}
                    step="0.1"
                  />
                )}
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Max SoC (BESS)"
                    id="tech-max-soc"
                    value={maxSoc}
                    onChange={(e) => setMaxSoc(e.target.value)}
                    placeholder="e.g., 100"
                    unit="%"
                    disabled={isSubmitting}
                    min={0}
                    max={100}
                    step="0.1"
                  />
                )}
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Min SoC (BESS)"
                    id="tech-min-soc"
                    value={minSoc}
                    onChange={(e) => setMinSoc(e.target.value)}
                    placeholder="e.g., 0"
                    unit="%"
                    disabled={isSubmitting}
                    min={0}
                    max={100}
                    step="0.1"
                  />
                )}
                <LabelledInput
                  type="number"
                  label="Calendar Lifetime"
                  id="tech-cal-life"
                  value={calendarLifetime}
                  onChange={(e) => setCalendarLifetime(e.target.value)}
                  placeholder="e.g., 20"
                  unit="Years"
                  disabled={isSubmitting}
                />
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="Cycling Lifetime (BESS)"
                    id="tech-cyc-life"
                    value={cyclingLifetime}
                    onChange={(e) => setCyclingLifetime(e.target.value)}
                    placeholder="e.g., 6000"
                    unit="Cycles"
                    disabled={isSubmitting}
                  />
                )}
              </TabsContent>

              {/* --- Economic Tab --- */}
              <TabsContent
                value="economic"
                className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4"
              >
                <LabelledInput
                  type="number"
                  label="CAPEX (Power)"
                  id="econ-capex-pwr"
                  value={capexPower}
                  onChange={(e) => setCapexPower(e.target.value)}
                  placeholder="e.g., 400"
                  unit="$/kW"
                  disabled={isSubmitting}
                />
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="CAPEX (Energy, BESS)"
                    id="econ-capex-en"
                    value={capexEnergy}
                    onChange={(e) => setCapexEnergy(e.target.value)}
                    placeholder="e.g., 300"
                    unit="$/kWh"
                    disabled={isSubmitting}
                  />
                )}
                <LabelledInput
                  type="number"
                  label="CAPEX (Total)"
                  id="econ-capex-tot"
                  value={capexTot}
                  onChange={(e) => setCapexTot(e.target.value)}
                  placeholder="Total project cost"
                  unit="$"
                  disabled={isSubmitting}
                />
                <LabelledInput
                  type="number"
                  label="OPEX (Power / Year)"
                  id="econ-opex-pwr"
                  value={opexPowerYr}
                  onChange={(e) => setOpexPowerYr(e.target.value)}
                  placeholder="e.g., 10"
                  unit="$/kW/yr"
                  disabled={isSubmitting}
                />
                {isBess && (
                  <LabelledInput
                    type="number"
                    label="OPEX (Energy / Year, BESS)"
                    id="econ-opex-en"
                    value={opexEnergyYr}
                    onChange={(e) => setOpexEnergyYr(e.target.value)}
                    placeholder="e.g., 5"
                    unit="$/kWh/yr"
                    disabled={isSubmitting}
                  />
                )}
                <LabelledInput
                  type="number"
                  label="OPEX (Total / Year)"
                  id="econ-opex-tot"
                  value={opexYr}
                  onChange={(e) => setOpexYr(e.target.value)}
                  placeholder="Total yearly OPEX"
                  unit="$/yr"
                  disabled={isSubmitting}
                />
                <div className="md:col-span-2">
                  <LabelledInput
                    label="Revenue Streams"
                    id="econ-rev-streams"
                    value={revenueStreamsInput}
                    onChange={(e) => setRevenueStreamsInput(e.target.value)}
                    placeholder="e.g., Arbitrage, FCR, Capacity Market (comma-separated)"
                    disabled={isSubmitting}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            {error && (
              <p className="text-sm text-destructive text-center mr-auto">
                Error: {error}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !name.trim() ||
                !pipelineId ||
                typeOfPlant.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for labelled inputs to reduce repetition
interface LabelledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  label,
  id,
  unit,
  ...props
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center">
        <Input id={id} {...props} className={cn(unit && "rounded-r-none")} />
        {unit && (
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm h-10">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

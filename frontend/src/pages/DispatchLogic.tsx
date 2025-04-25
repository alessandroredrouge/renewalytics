import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Battery } from "lucide-react";

const DispatchLogic = () => {
  // State for SoC values
  const [initialSoc, setInitialSoc] = useState(50);
  const [minSoc, setMinSoc] = useState(20);
  const [maxSoc, setMaxSoc] = useState(90);

  // Unified handler for Initial SoC changes
  const handleInitialSocChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue));
    let currentMin = minSoc;
    let currentMax = maxSoc;

    if (clampedValue < currentMin) {
      // If new initial is less than min, bring min down to new initial
      setMinSoc(clampedValue);
    }
    if (clampedValue > currentMax) {
      // If new initial is greater than max, bring max up to new initial
      setMaxSoc(clampedValue);
    }
    setInitialSoc(clampedValue);
  };

  // Unified handler for Minimum SoC changes
  const handleMinSocChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue));

    if (clampedValue > initialSoc) {
      // If new min is greater than initial, bring initial up to new min
      setInitialSoc(clampedValue);
    }
    if (clampedValue > maxSoc) {
      // If new min is greater than max, bring max up to new min (initial is already handled)
      setMaxSoc(clampedValue);
    }
    setMinSoc(clampedValue);
  };

  // Unified handler for Maximum SoC changes
  const handleMaxSocChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(100, newValue));

    if (clampedValue < initialSoc) {
      // If new max is less than initial, bring initial down to new max
      setInitialSoc(clampedValue);
    }
    if (clampedValue < minSoc) {
      // If new max is less than min, bring min down to new max (initial is already handled)
      setMinSoc(clampedValue);
    }
    setMaxSoc(clampedValue);
  };

  // Helper to parse input event value
  const parseInputEventValue = (
    event: React.ChangeEvent<HTMLInputElement>
  ): number => {
    const value = parseInt(event.target.value, 10);
    // Return current value if parsing fails or input is empty, preventing state updates with NaN
    if (isNaN(value) || event.target.value === "") {
      const id = event.target.id;
      if (id === "initialSocInput") return initialSoc;
      if (id === "minSocInput") return minSoc;
      if (id === "maxSocInput") return maxSoc;
      return 0; // Fallback, should not happen with IDs
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Logic</h1>
          <p className="text-muted-foreground mt-1">
            Configure the battery system's state of charge limits.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Battery className="mr-2 h-5 w-5 text-energy-green" />
            State of Charge (SoC) Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialSocInput">Initial SoC (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[initialSoc]}
                  onValueChange={(value) => handleInitialSocChange(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                  aria-label="Initial SoC"
                />
                <Input
                  id="initialSocInput"
                  type="number"
                  className="w-16"
                  value={initialSoc}
                  onChange={(e) =>
                    handleInitialSocChange(parseInputEventValue(e))
                  }
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minSocInput">Minimum SoC (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[minSoc]}
                  onValueChange={(value) => handleMinSocChange(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                  aria-label="Minimum SoC"
                />
                <Input
                  id="minSocInput"
                  type="number"
                  className="w-16"
                  value={minSoc}
                  onChange={(e) => handleMinSocChange(parseInputEventValue(e))}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSocInput">Maximum SoC (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[maxSoc]}
                  onValueChange={(value) => handleMaxSocChange(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                  aria-label="Maximum SoC"
                />
                <Input
                  id="maxSocInput"
                  type="number"
                  className="w-16"
                  value={maxSoc}
                  onChange={(e) => handleMaxSocChange(parseInputEventValue(e))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchLogic;

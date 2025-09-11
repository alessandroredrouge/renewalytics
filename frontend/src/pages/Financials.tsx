import React, { useState, useEffect } from "react";
import { useProjectData } from "@/contexts/ProjectDataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Financials = () => {
  const [usePlatformModel, setUsePlatformModel] = useState<boolean>(true);
  const { projectData, updateFinancialInput, markAsUnsaved } = useProjectData();

  const [discountRate, setDiscountRate] = useState<string>("");
  const [salvageValuePercentage, setSalvageValuePercentage] =
    useState<string>("");
  const [opexFixedEscalationRate, setOpexFixedEscalationRate] =
    useState<string>("");
  const [debtPercentage, setDebtPercentage] = useState<string>("");
  const [interestRateOnDebt, setInterestRateOnDebt] = useState<string>("");
  const [debtTermYears, setDebtTermYears] = useState<string>("");
  const [debtUpfrontFeePercentage, setDebtUpfrontFeePercentage] =
    useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("");
  const [depreciationYears, setDepreciationYears] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (projectData?.financialInputs) {
      const { financialInputs: fi } = projectData;
      setDiscountRate(fi.discountRate?.toString() ?? "");
      setSalvageValuePercentage(fi.salvageValuePercentage?.toString() ?? "");
      setOpexFixedEscalationRate(fi.opexFixedEscalationRate?.toString() ?? "");
      setDebtPercentage(fi.debtPercentage?.toString() ?? "");
      setInterestRateOnDebt(fi.interestRateOnDebt?.toString() ?? "");
      setDebtTermYears(fi.debtTermYears?.toString() ?? "");
      setDebtUpfrontFeePercentage(
        fi.debtUpfrontFeePercentage?.toString() ?? ""
      );
      setTaxRate(fi.taxRate?.toString() ?? "");
      setDepreciationYears(fi.depreciationYears?.toString() ?? undefined);
    }
  }, [projectData?.financialInputs]);

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: keyof NonNullable<typeof projectData.financialInputs>,
    value: string,
    isNumeric: boolean = true
  ) => {
    setter(value);
    if (value === "") {
      updateFinancialInput(field, null);
    } else if (isNumeric) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateFinancialInput(field, numValue);
      }
    } else {
      // For non-numeric fields if any in the future
      // updateFinancialInput(field, value as any); // Adjust type if needed
    }
    markAsUnsaved();
  };

  const handleSelectChange = (
    field: keyof NonNullable<typeof projectData.financialInputs>,
    value: string
  ) => {
    setDepreciationYears(value); // Update local state for select display
    if (value === "") {
      updateFinancialInput(field, null);
    } else {
      const numValue = parseInt(value.replace("sl-", "")); // Extract number from "sl-10"
      if (!isNaN(numValue)) {
        updateFinancialInput(field, numValue);
      }
    }
    markAsUnsaved();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Inputs
          </h1>
          <p className="text-muted-foreground">
            Configure core financial assumptions for the platform's economic
            evaluation.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="financial-model-toggle"
              checked={usePlatformModel}
              onCheckedChange={setUsePlatformModel}
            />
            <Label htmlFor="financial-model-toggle" className="text-base">
              {usePlatformModel
                ? "Using Renewalytics Financial Model"
                : "Using My Own Financial Model"}
            </Label>
          </div>
          {!usePlatformModel && (
            <Alert variant="default" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Using Your Own Financial Model</AlertTitle>
              <AlertDescription>
                Operational outputs for your external model will be available on
                the Results page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {usePlatformModel && (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Project & Valuation Assumptions</CardTitle>
              <CardDescription>
                Define discount rate, end-of-life value, and OPEX escalation.
                The financial analysis period will match the project's
                operational lifetime from Project Overview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discount-rate">
                    Discount Rate (WACC) (%)
                  </Label>
                  <Input
                    id="discount-rate"
                    placeholder="e.g., 8"
                    type="number"
                    step="0.1"
                    value={discountRate}
                    onChange={(e) =>
                      handleInputChange(
                        setDiscountRate,
                        "discountRate",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salvage-value">
                    Salvage Value (% of Initial CAPEX)
                  </Label>
                  <Input
                    id="salvage-value"
                    placeholder="e.g., 0 or 5"
                    type="number"
                    step="0.1"
                    value={salvageValuePercentage}
                    onChange={(e) =>
                      handleInputChange(
                        setSalvageValuePercentage,
                        "salvageValuePercentage",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opex-escalation">
                    Annual Fixed OPEX Escalation Rate (%)
                  </Label>
                  <Input
                    id="opex-escalation"
                    placeholder="e.g., 2.5"
                    type="number"
                    step="0.1"
                    value={opexFixedEscalationRate}
                    onChange={(e) =>
                      handleInputChange(
                        setOpexFixedEscalationRate,
                        "opexFixedEscalationRate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financing Parameters (Debt)</CardTitle>
              <CardDescription>
                Set up the project's debt structure. Equity is assumed to cover
                the remainder of CAPEX not financed by debt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="debt-percentage">
                    Debt Percentage (% of Initial CAPEX)
                  </Label>
                  <Input
                    id="debt-percentage"
                    placeholder="e.g., 70"
                    type="number"
                    step="1"
                    value={debtPercentage}
                    onChange={(e) =>
                      handleInputChange(
                        setDebtPercentage,
                        "debtPercentage",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate-debt">
                    Annual Interest Rate on Debt (%)
                  </Label>
                  <Input
                    id="interest-rate-debt"
                    placeholder="e.g., 6"
                    type="number"
                    step="0.1"
                    value={interestRateOnDebt}
                    onChange={(e) =>
                      handleInputChange(
                        setInterestRateOnDebt,
                        "interestRateOnDebt",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-term">Debt Term (Years)</Label>
                  <Input
                    id="debt-term"
                    placeholder="e.g., 15"
                    type="number"
                    step="1"
                    value={debtTermYears}
                    onChange={(e) =>
                      handleInputChange(
                        setDebtTermYears,
                        "debtTermYears",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-upfront-fee">
                    Debt Up-front Fee (% of Total Debt Amount)
                  </Label>
                  <Input
                    id="debt-upfront-fee"
                    placeholder="e.g., 1 or 2.75"
                    type="number"
                    step="0.01"
                    value={debtUpfrontFeePercentage}
                    onChange={(e) =>
                      handleInputChange(
                        setDebtUpfrontFeePercentage,
                        "debtUpfrontFeePercentage",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax & Depreciation</CardTitle>
              <CardDescription>
                Define corporate tax rate and the depreciation method for the
                project assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">
                    Effective Corporate Tax Rate (%)
                  </Label>
                  <Input
                    id="tax-rate"
                    placeholder="e.g., 21"
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) =>
                      handleInputChange(setTaxRate, "taxRate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depreciation-schedule">
                    Depreciation Schedule
                  </Label>
                  <Select
                    value={
                      depreciationYears ? `sl-${depreciationYears}` : undefined
                    }
                    onValueChange={(value) =>
                      handleSelectChange("depreciationYears", value)
                    }
                  >
                    <SelectTrigger id="depreciation-schedule">
                      <SelectValue placeholder="Select depreciation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* Add more options as backend supports them */}
                        <SelectItem value="sl-5">
                          Straight Line 5-Year
                        </SelectItem>
                        <SelectItem value="sl-7">
                          Straight Line 7-Year
                        </SelectItem>
                        <SelectItem value="sl-10">
                          Straight Line 10-Year
                        </SelectItem>
                        <SelectItem value="sl-15">
                          Straight Line 15-Year
                        </SelectItem>
                        <SelectItem value="sl-20">
                          Straight Line 20-Year
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Financials;

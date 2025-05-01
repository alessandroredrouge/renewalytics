import React, { useState, useEffect, useCallback } from "react";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { getMarketsByCountry } from "@/lib/apiClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  LineChart,
  PlusCircle,
  DownloadCloud,
  RefreshCcw,
  CircleDollarSign,
  Battery,
  ShieldCheck,
  Zap,
  AlertCircle,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getRevenueStreamIcon = (streamName: string) => {
  const lowerCaseName = streamName.toLowerCase();
  if (lowerCaseName.includes("wholesale"))
    return <CircleDollarSign className="mr-2 h-4 w-4" />;
  if (lowerCaseName.includes("capacity"))
    return <Battery className="mr-2 h-4 w-4" />;
  if (
    lowerCaseName.includes("ancillary") ||
    lowerCaseName.includes("frequency") ||
    lowerCaseName.includes("reserve")
  )
    return <ShieldCheck className="mr-2 h-4 w-4" />;
  return <Zap className="mr-2 h-4 w-4" />;
};

const RevenueStreams = () => {
  const { projectData, updateProjectField } = useProjectData();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [temporarySelectedStreams, setTemporarySelectedStreams] = useState<
    string[]
  >([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [errorLoadingMarkets, setErrorLoadingMarkets] = useState<string | null>(
    null
  );

  const selectedRevenueStreams = projectData?.revenue_streams ?? [];

  const defaultTabValue =
    selectedRevenueStreams.length > 0
      ? "summary"
      : selectedRevenueStreams[0] ?? null;

  useEffect(() => {
    if (isPopoverOpen && projectData?.country) {
      const fetchMarkets = async () => {
        setIsLoadingMarkets(true);
        setErrorLoadingMarkets(null);
        setAvailableMarkets([]);
        setTemporarySelectedStreams(projectData?.revenue_streams ?? []);
        try {
          const markets = await getMarketsByCountry(projectData.country);
          setAvailableMarkets(markets);
        } catch (error) {
          console.error("Failed to load markets:", error);
          setErrorLoadingMarkets(
            "Failed to load available markets. Please check connection or project setup."
          );
        } finally {
          setIsLoadingMarkets(false);
        }
      };
      fetchMarkets();
    } else if (isPopoverOpen && !projectData?.country) {
      setErrorLoadingMarkets("Project country is not set in Project Overview.");
      setIsLoadingMarkets(false);
      setAvailableMarkets([]);
      setTemporarySelectedStreams([]);
    }
  }, [isPopoverOpen, projectData?.country, projectData?.revenue_streams]);

  const handleMarketSelectionChange = useCallback(
    (market: string, checked: boolean) => {
      setTemporarySelectedStreams((prev) => {
        if (checked) {
          return [...prev, market];
        } else {
          return prev.filter((m) => m !== market);
        }
      });
    },
    []
  );

  const handleSaveChanges = useCallback(() => {
    const currentStreams = [...(projectData?.revenue_streams ?? [])].sort();
    const newStreams = [...temporarySelectedStreams].sort();

    if (JSON.stringify(currentStreams) !== JSON.stringify(newStreams)) {
      updateProjectField(
        "revenue_streams",
        temporarySelectedStreams.length > 0 ? temporarySelectedStreams : null
      );
      console.log("Revenue streams updated:", temporarySelectedStreams);
    } else {
      console.log("No changes detected in revenue streams.");
    }
    setIsPopoverOpen(false);
  }, [
    temporarySelectedStreams,
    projectData?.revenue_streams,
    updateProjectField,
  ]);

  if (!projectData) {
    return (
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading Project Data</AlertTitle>
        <AlertDescription>
          Project data is loading or not yet available. Please wait or select a
          project.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedRevenueStreams.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Revenue Streams
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure and analyze potential revenue sources for your renewable
              energy project
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" disabled>
              <PlusCircle size={16} />
              Modify Revenue Streams
            </Button>
          </div>
        </div>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Revenue Streams Selected</AlertTitle>
          <AlertDescription>
            Please select revenue streams in the Project Overview section to
            configure them here.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isModifyDisabled = !projectData?.country;
  const modifyButtonTooltip = isModifyDisabled
    ? "Please set a country in Project Overview first."
    : "Modify selected revenue streams";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Revenue Streams
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure and analyze potential revenue sources for your renewable
              energy project
            </p>
          </div>
          <div className="flex gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isModifyDisabled ? 0 : -1}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={isModifyDisabled}
                        aria-label={modifyButtonTooltip}
                      >
                        <Edit size={16} />
                        Modify Revenue Streams
                      </Button>
                    </PopoverTrigger>
                  </span>
                </TooltipTrigger>
                {isModifyDisabled && (
                  <TooltipContent>
                    <p>{modifyButtonTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Select Revenue Streams
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Choose streams for{" "}
                      {projectData?.country || "selected country"}.
                    </p>
                  </div>
                  {isLoadingMarkets ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">
                        Loading markets...
                      </span>
                    </div>
                  ) : errorLoadingMarkets ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{errorLoadingMarkets}</AlertDescription>
                    </Alert>
                  ) : availableMarkets.length > 0 ? (
                    <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                      {availableMarkets.map((market) => (
                        <div
                          key={market}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`market-${market}`}
                            checked={temporarySelectedStreams.includes(market)}
                            onCheckedChange={(checked) => {
                              handleMarketSelectionChange(
                                market,
                                Boolean(checked)
                              );
                            }}
                          />
                          <Label
                            htmlFor={`market-${market}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {market}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      No revenue streams found for{" "}
                      {projectData?.country || "this country"}.
                    </p>
                  )}
                  {!isLoadingMarkets &&
                    !errorLoadingMarkets &&
                    availableMarkets.length > 0 && (
                      <Button onClick={handleSaveChanges} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selectedRevenueStreams.length === 0 && (
          <Alert variant="default" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Revenue Streams Selected</AlertTitle>
            <AlertDescription>
              Click 'Modify Revenue Streams' above to select streams relevant to
              your project's country ({projectData?.country || "Not Set"}).
            </AlertDescription>
          </Alert>
        )}

        {selectedRevenueStreams.length > 0 && (
          <Tabs defaultValue={defaultTabValue ?? undefined} className="w-full">
            <TabsList
              className={`w-full mb-4 flex overflow-x-auto whitespace-nowrap pb-2`}
            >
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 flex-shrink-0"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Revenue Summary
              </TabsTrigger>

              {selectedRevenueStreams.map((stream) => (
                <TabsTrigger key={stream} value={stream}>
                  {getRevenueStreamIcon(stream)}
                  {stream}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-energy-blue" />
                    Revenue Summary
                  </CardTitle>
                  <CardDescription>
                    Projected annual revenue breakdown across all configured
                    revenue streams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center mb-6">
                    <div className="text-center px-4">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/70" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Revenue summary chart will appear here (Data is
                        currently static)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Annual Revenue Breakdown (Static Example)
                    </h3>
                    <div className="p-4 border rounded-md text-sm text-muted-foreground">
                      Revenue breakdown table will be generated here based on
                      configured streams.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {selectedRevenueStreams.map((stream) => (
              <TabsContent key={stream} value={stream} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getRevenueStreamIcon(stream)}
                      {stream}
                    </CardTitle>
                    <CardDescription>
                      Configure parameters and analyze data for the {stream}{" "}
                      revenue stream.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Price Data Source</h3>
                      <div className="p-4 border rounded-md bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                          Data source selection (from Supabase or CSV upload)
                          will be implemented here.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                          Price Data Visualization
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled
                        >
                          <RefreshCcw size={14} />
                          Update/Load Data
                        </Button>
                      </div>
                      <div className="h-72 w-full bg-muted/50 rounded-md flex items-center justify-center">
                        <div className="text-center px-4">
                          <LineChart className="h-12 w-12 mx-auto text-muted-foreground/70" />
                          <p className="text-sm text-muted-foreground mt-2">
                            Price data visualization will appear here once a
                            data source is selected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RevenueStreams;

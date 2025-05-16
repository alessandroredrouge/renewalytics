import React, { useState, useEffect, useCallback } from "react";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { getMarketsByCountry, getWeeklyPriceData } from "@/lib/apiClient";
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
  ChevronLeft,
  ChevronRight,
  Database,
  UploadCloud,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriceDataPoint {
  datetime: string;
  price: number;
}

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

const getCurrentWeekInfo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return { year, week: weekNumber };
};

const RevenueStreams = () => {
  const { projectData, updateProjectField, updateRevenueStreamSetting } =
    useProjectData();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [temporarySelectedStreams, setTemporarySelectedStreams] = useState<
    string[]
  >([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [errorLoadingMarkets, setErrorLoadingMarkets] = useState<string | null>(
    null
  );

  const [activeTabStream, setActiveTabStream] = useState<string | null>(null);
  const [activePriceData, setActivePriceData] = useState<PriceDataPoint[]>([]);
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  const [errorLoadingPriceData, setErrorLoadingPriceData] = useState<
    string | null
  >(null);

  const initialWeekInfo = getCurrentWeekInfo();
  const [visualizedYear, setVisualizedYear] = useState<number>(
    initialWeekInfo.year
  );
  const [visualizedWeek, setVisualizedWeek] = useState<number>(
    initialWeekInfo.week
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

  useEffect(() => {
    if (
      !activeTabStream ||
      activeTabStream === "summary" ||
      !projectData?.country
    ) {
      setActivePriceData([]);
      setErrorLoadingPriceData(null);
      setIsLoadingPriceData(false);
      return;
    }

    const settings = projectData?.revenueStreamSettings?.[activeTabStream];
    const dataSource = settings?.dataSourceType;

    if (dataSource === "supabase") {
      const fetchData = async () => {
        setIsLoadingPriceData(true);
        setErrorLoadingPriceData(null);
        setActivePriceData([]);
        console.log(
          `Fetching Supabase data for ${projectData.country}/${activeTabStream}, Year: ${visualizedYear}, Week: ${visualizedWeek}`
        );
        try {
          const data = await getWeeklyPriceData(
            projectData.country!,
            activeTabStream,
            visualizedYear,
            visualizedWeek
          );
          setActivePriceData(data);
        } catch (error: any) {
          console.error("Failed to load price data:", error);
          setErrorLoadingPriceData(
            error.message ||
              "Failed to load price data for the selected period."
          );
        } finally {
          setIsLoadingPriceData(false);
        }
      };
      fetchData();
    } else {
      setActivePriceData([]);
      setIsLoadingPriceData(false);
      setErrorLoadingPriceData(null);
    }
  }, [
    activeTabStream,
    projectData?.country,
    projectData?.revenueStreamSettings,
    visualizedYear,
    visualizedWeek,
  ]);

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

  const handleDataSourceChange = useCallback(
    (streamName: string, value: "supabase" | "csv") => {
      if (value) {
        updateRevenueStreamSetting(streamName, "dataSourceType", value);
      }
    },
    [updateRevenueStreamSetting]
  );

  const handleYearChange = (yearString: string) => {
    const year = parseInt(yearString, 10);
    if (!isNaN(year)) {
      setVisualizedYear(year);
      setVisualizedWeek(1);
    }
  };

  const handleWeekChange = (weekString: string) => {
    const week = parseInt(weekString, 10);
    if (!isNaN(week) && week >= 1 && week <= 53) {
      setVisualizedWeek(week);
    }
  };

  const goToPreviousWeek = () => {
    setVisualizedWeek((prev) => {
      if (prev > 1) return prev - 1;
      setVisualizedYear((y) => y - 1);
      return 52;
    });
  };

  const goToNextWeek = () => {
    setVisualizedWeek((prev) => {
      if (prev < 52) return prev + 1;
      setVisualizedYear((y) => y + 1);
      return 1;
    });
  };

  useEffect(() => {
    setActiveTabStream(defaultTabValue);
  }, [defaultTabValue]);

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => currentYear - i
  ).reverse();
  const weekOptions = Array.from({ length: 53 }, (_, i) => i + 1);

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
                    <p className="text-sm text-muted-foreground">
                    Choose the plant's revenue streams in{" "}
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
          <Tabs
            value={activeTabStream ?? undefined}
            onValueChange={setActiveTabStream}
            className="w-full"
          >
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
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Price Data Source
                      </Label>
                      <RadioGroup
                        value={
                          projectData?.revenueStreamSettings?.[stream]
                            ?.dataSourceType ?? undefined
                        }
                        onValueChange={(value: "supabase" | "csv") =>
                          handleDataSourceChange(stream, value)
                        }
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="supabase"
                            id={`${stream}-supabase`}
                          />
                          <Label
                            htmlFor={`${stream}-supabase`}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Database size={16} /> Platform Data (Supabase)
                          </Label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                                  <RadioGroupItem
                                    value="csv"
                                    id={`${stream}-csv`}
                                    disabled
                                  />
                                  <Label
                                    htmlFor={`${stream}-csv`}
                                    className="cursor-not-allowed flex items-center gap-2"
                                  >
                                    <UploadCloud size={16} /> Upload CSV
                                  </Label>
                                </div>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>CSV upload coming soon!</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </RadioGroup>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-base font-medium">
                        Price Data Visualization
                      </h3>
                      <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center border">
                        {isLoadingPriceData ? (
                          <div className="flex items-center text-muted-foreground">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <span>Loading Price Data...</span>
                          </div>
                        ) : errorLoadingPriceData ? (
                          <div className="text-destructive-foreground bg-destructive p-4 rounded-md text-center">
                            <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                            <p className="font-medium">Error Loading Data</p>
                            <p className="text-sm">{errorLoadingPriceData}</p>
                          </div>
                        ) : activePriceData.length > 0 ? (
                          <div className="text-center text-muted-foreground">
                            <LineChart className="h-12 w-12 mx-auto text-muted-foreground/70 mb-2" />
                            <p>
                              Chart Component for {activeTabStream} -{" "}
                              {activePriceData.length} points
                            </p>
                            <p className="text-xs">
                              (Year: {visualizedYear}, Week: {visualizedWeek})
                            </p>
                          </div>
                        ) : projectData?.revenueStreamSettings?.[stream]
                            ?.dataSourceType === "supabase" ? (
                          <div className="text-center text-muted-foreground px-4">
                            <LineChart className="h-12 w-12 mx-auto text-muted-foreground/70 mb-2" />
                            <p>
                              No price data found for Year {visualizedYear},
                              Week {visualizedWeek}.
                            </p>
                            <p className="text-xs">
                              Select a different period below.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground px-4">
                            <LineChart className="h-12 w-12 mx-auto text-muted-foreground/70 mb-2" />
                            <p>
                              Select 'Platform Data' above and choose a time
                              period below to view the visualization.
                            </p>
                          </div>
                        )}
                      </div>
                      {projectData?.revenueStreamSettings?.[stream]
                        ?.dataSourceType === "supabase" && (
                        <div className="flex items-center justify-center gap-3 p-3 border rounded-md bg-background">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPreviousWeek}
                            aria-label="Previous Week"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-2">
                            <Select
                              value={visualizedYear.toString()}
                              onValueChange={handleYearChange}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {yearOptions.map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={visualizedWeek.toString()}
                              onValueChange={handleWeekChange}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Week" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {weekOptions.map((week) => (
                                  <SelectItem
                                    key={week}
                                    value={week.toString()}
                                  >{`Week ${week}`}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextWeek}
                            aria-label="Next Week"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

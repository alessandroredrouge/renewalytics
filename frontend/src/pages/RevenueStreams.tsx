import React from "react";
import { useProjectData } from "@/contexts/ProjectDataContext";
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
  BarChart3,
  LineChart,
  PlusCircle,
  DownloadCloud,
  RefreshCcw,
  CircleDollarSign,
  Battery,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const { projectData } = useProjectData();

  const selectedRevenueStreams = projectData?.revenue_streams ?? [];

  const defaultTabValue =
    selectedRevenueStreams.length > 0
      ? "summary"
      : selectedRevenueStreams[0] ?? null;

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
              Configure and analyze potential revenue sources for your battery
              storage system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <DownloadCloud size={16} />
              Export
            </Button>
            <Button className="gap-2" disabled>
              <PlusCircle size={16} />
              Add Revenue Stream
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Streams</h1>
          <p className="text-muted-foreground mt-1">
            Configure and analyze potential revenue sources for your battery
            storage system
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <PlusCircle size={16} />
            Add Revenue Stream
          </Button>
        </div>
      </div>

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
                Projected annual revenue breakdown across all configured revenue
                streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center mb-6">
                <div className="text-center px-4">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/70" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Revenue summary chart will appear here (Data is currently
                    static)
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
                  Configure parameters and analyze data for the {stream} revenue
                  stream.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Price Data Source</h3>
                  <div className="p-4 border rounded-md bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Data source selection (from Supabase or CSV upload) will
                      be implemented here.
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
                        Price data visualization will appear here once a data
                        source is selected.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RevenueStreams;

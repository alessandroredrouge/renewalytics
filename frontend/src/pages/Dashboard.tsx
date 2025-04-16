import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Battery,
  Zap,
  BarChart3,
  DollarSign,
  ChevronRight,
  Package,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "@/lib/apiClient";

const Dashboard = () => {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [pipelineCount, setPipelineCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const summaryData = await getDashboardSummary();

        setProjectCount(summaryData.project_count);
        setPipelineCount(summaryData.pipeline_count);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.message ||
            "An unexpected error occurred while fetching dashboard summary."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-energy-blue">
            Renewalytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Revenue forecasting for renewable energy assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              <span>Total Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <p className="text-2xl font-bold">{projectCount ?? "N/A"}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of simulation projects created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-cyan-500" />
              <span>Total Pipelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <p className="text-2xl font-bold">{pipelineCount ?? "N/A"}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of analysis pipelines configured
            </p>
          </CardContent>
        </Card>
        <Card className="opacity-0 pointer-events-none hidden md:block">
          <CardHeader>
            <CardTitle>Placeholder</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hidden</p>
          </CardContent>
        </Card>
      </div>

      {/* Removed static Battery Storage, Solar PV, Hybrid Systems cards */}

      {/* Removed static Key Features and Target Users cards */}
    </div>
  );
};

export default Dashboard;

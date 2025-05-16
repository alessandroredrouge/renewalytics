import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { LegendType } from "recharts/types/util/types"; // Import LegendType
import {
  Loader2,
  AlertTriangle,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

// Base data point structure from API/source
interface InputPriceDataPoint {
  datetime: string; // Expect string from API
  price: number;
}

// Data structure after transformation for the chart
// It will have a timeLabel and a property for each stream's price
interface ChartableDataPoint {
  timeLabel: string;
  datetime: string; // Keep original datetime for reference or detailed tooltips
  [streamName: string]: number | string | undefined | null; // Prices for each stream, or the timeLabel/datetime
}

// Define how the input data prop can look
export type SingleStreamData = InputPriceDataPoint[];
export type MultiStreamData = { [streamName: string]: InputPriceDataPoint[] };
export type PriceChartDataInput = SingleStreamData | MultiStreamData;

interface PriceChartProps {
  data: PriceChartDataInput;
  isLoading?: boolean;
  error?: string | null;
  // streamName prop is removed, will be derived or defaulted
}

// Predefined colors for multiple lines
const LINE_COLORS = [
  "hsl(var(--primary))", // Color 1: Primary (e.g., blue)
  "#22c55e", // Color 2: Green (e.g., tailwind green-500)
  "#facc15", // Color 3: Yellow (e.g., tailwind yellow-400)
  "#f97316", // Color 4: Orange (e.g., tailwind orange-500)
  "#8b5cf6", // Color 5: Purple (e.g., tailwind violet-500)
  "#ec4899", // Color 6: Pink (e.g., tailwind pink-500)
  // Add more distinct colors if you anticipate more than 6 streams needing unique colors before cycling
];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let formattedLabel = label; // label here is the timeLabel
    // Find the original datetime from the payload if possible, for more precise tooltip time
    const originalDateTime = payload[0]?.payload?.datetime;
    if (originalDateTime) {
      const date = new Date(originalDateTime);
      if (!isNaN(date.getTime())) {
        formattedLabel = date.toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        });
      }
    }

    return (
      <div className="p-2 bg-background border rounded-md shadow-lg min-w-[150px]">
        <p className="text-sm text-muted-foreground mb-1">{formattedLabel}</p>
        {payload.map((entry: any, index: number) => (
          <div
            key={`tooltip-item-${index}`}
            className="flex justify-between items-center"
          >
            <span className="text-xs mr-2" style={{ color: entry.color }}>
              &#9679; {entry.name}:
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: entry.color }}
            >
              {typeof entry.value === "number"
                ? entry.value.toFixed(2)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, isLoading, error }) => {
  const [hiddenStreamNames, setHiddenStreamNames] = useState<Set<string>>(
    new Set()
  );
  const [yAxisDomain, setYAxisDomain] = useState<
    [number | "auto", number | "auto"] | undefined
  >(undefined);

  // --- Data Transformation and Stream Discovery ---
  const { chartData, activeStreams } = useMemo(() => {
    if (!data) return { chartData: [], activeStreams: [] };

    let processedData: ChartableDataPoint[] = [];
    let streams: { name: string; color: string }[] = [];

    if (Array.isArray(data)) {
      // Single stream data
      streams = [{ name: "Price", color: LINE_COLORS[0] }];
      processedData = data.map((item) => ({
        ...item, // price and datetime
        timeLabel: new Date(item.datetime).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        Price: item.price, // dataKey for the line will be 'Price'
      }));
    } else {
      // Multi-stream data (object)
      const streamNames = Object.keys(data);
      streams = streamNames.map((name, index) => ({
        name,
        color: LINE_COLORS[index % LINE_COLORS.length], // Restore cycling through colors
      }));

      // Consolidate data for Recharts: create a unified list of x-axis points (datetimes)
      const allDatetimes = new Set<string>();
      streamNames.forEach((streamName) => {
        (data[streamName] || []).forEach((point) =>
          allDatetimes.add(point.datetime)
        );
      });

      const sortedDatetimes = Array.from(allDatetimes).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      processedData = sortedDatetimes.map((dt) => {
        const point: ChartableDataPoint = {
          datetime: dt,
          timeLabel: new Date(dt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        streamNames.forEach((streamName) => {
          const streamData = data[streamName] || [];
          const streamPoint = streamData.find((p) => p.datetime === dt);
          point[streamName] = streamPoint ? streamPoint.price : null; // Use null for missing data
        });
        return point;
      });
    }
    return { chartData: processedData, activeStreams: streams };
  }, [data]);

  // Reset hidden streams and Y-axis zoom when activeStreams change
  useEffect(() => {
    setHiddenStreamNames(new Set());
    setYAxisDomain(undefined); // Also reset Y-axis zoom
  }, [activeStreams]);

  const handleLegendClick = (o: any) => {
    const streamId = o.id; // Use o.id, which we set to stream.name in legendPayload
    if (streamId) {
      setHiddenStreamNames((prevHidden) => {
        const newHidden = new Set(prevHidden);
        if (newHidden.has(streamId)) {
          newHidden.delete(streamId);
        } else {
          newHidden.add(streamId);
        }
        return newHidden;
      });
    }
  };

  // Filter streams to be rendered based on visibility
  const visibleStreams = useMemo(() => {
    return activeStreams.filter(
      (stream) => !hiddenStreamNames.has(stream.name)
    );
  }, [activeStreams, hiddenStreamNames]);

  // Prepare legend payload to mark hidden streams as inactive
  const legendPayload = useMemo(() => {
    return activeStreams.map((stream) => ({
      value: stream.name, // Name of the legend item
      type: "line" as LegendType, // Use a valid LegendType and assert
      id: stream.name, // Unique ID for the legend item
      color: stream.color, // Color for the legend icon
      inactive: hiddenStreamNames.has(stream.name), // Recharts uses this to style inactive items
    }));
  }, [activeStreams, hiddenStreamNames]);

  const calculateCurrentYRange = (): { min: number; max: number } | null => {
    if (
      yAxisDomain &&
      typeof yAxisDomain[0] === "number" &&
      typeof yAxisDomain[1] === "number"
    ) {
      return { min: yAxisDomain[0], max: yAxisDomain[1] };
    }

    if (!chartData || chartData.length === 0 || visibleStreams.length === 0) {
      return null; // Not enough info to determine range
    }

    let currentMin = Infinity;
    let currentMax = -Infinity;
    let dataFound = false;

    chartData.forEach((dataPoint) => {
      visibleStreams.forEach((stream) => {
        const value = dataPoint[stream.name];
        if (typeof value === "number" && !isNaN(value)) {
          currentMin = Math.min(currentMin, value);
          currentMax = Math.max(currentMax, value);
          dataFound = true;
        }
      });
    });

    if (!dataFound) {
      // Default if no numeric data points found for visible streams
      // This could happen if all visible streams have null data in the current chartData view
      return { min: 0, max: 100 };
    }

    // Add a small buffer if min and max are the same
    if (currentMin === currentMax) {
      currentMin -= 10; // Or some percentage/sensible default
      currentMax += 10;
    }
    // Ensure min is not greater than max (can happen if default range was hit weirdly)
    if (currentMin > currentMax) {
      return { min: currentMax - 10, max: currentMin + 10 };
    }

    return { min: currentMin, max: currentMax };
  };

  const resetYZoom = () => {
    setYAxisDomain(undefined);
  };

  // Placeholder for actual zoom functions - these will need more logic
  const zoomInY = () => {
    const currentRange = calculateCurrentYRange();
    if (!currentRange) return; // Cannot zoom if current range is indeterminable

    let { min: currentMin, max: currentMax } = currentRange;
    const span = currentMax - currentMin;

    if (span <= 0) {
      // If span is zero or negative, reset to a small default range around the value
      const mid = currentMin; // or currentMax, they are the same or inverted
      currentMin = mid - 10;
      currentMax = mid + 10;
    }

    const newMin = currentMin + span * 0.1;
    const newMax = currentMax - span * 0.1;

    // Ensure newMin is less than newMax, otherwise, they might cross or become equal.
    if (newMin >= newMax) {
      const midPoint = (currentMin + currentMax) / 2;
      setYAxisDomain([
        midPoint - Math.max(1, span * 0.05),
        midPoint + Math.max(1, span * 0.05),
      ]);
    } else {
      setYAxisDomain([newMin, newMax]);
    }
  };

  const zoomOutY = () => {
    const currentRange = calculateCurrentYRange();
    if (!currentRange) return;

    let { min: currentMin, max: currentMax } = currentRange;
    const span = currentMax - currentMin;

    // If span is effectively zero, expand by a fixed amount, otherwise by percentage
    const expansionFactor = span === 0 ? 10 : span * 0.1;

    const newMin = currentMin - expansionFactor;
    const newMax = currentMax + expansionFactor;
    setYAxisDomain([newMin, newMax]);
  };

  // --- Loading, Error, No Data States --- (remain largely the same)
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm text-center px-4">{error}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
        <TrendingUp className="h-8 w-8 mb-2 text-muted-foreground/50" />
        <p>No data available for the selected period.</p>
        {Array.isArray(data) || Object.keys(data || {}).length > 0 ? (
          <p className="text-xs">Try adjusting the time range.</p>
        ) : (
          <p className="text-xs">Select a data source and time range.</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 40,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
            tickFormatter={(value) =>
              typeof value === "number" ? `€${value.toFixed(0)}` : value
            }
            domain={yAxisDomain ? yAxisDomain : ["dataMin", "dataMax"]}
            allowDataOverflow={true}
          />
          <Tooltip content={<CustomTooltip />} filterNull={true} />
          {activeStreams.length > 1 && (
            <Legend
              verticalAlign="top"
              height={30}
              onClick={handleLegendClick}
              payload={legendPayload}
            />
          )}

          {visibleStreams.map((stream) => (
            <Line
              key={stream.name}
              type="monotone"
              dataKey={stream.name}
              name={stream.name}
              stroke={stream.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1, fill: stream.color }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {activeStreams.length > 0 && !isLoading && !error && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            gap: "4px",
            zIndex: 20,
            backgroundColor: "hsla(var(--background), 0.8)",
            padding: "4px",
            borderRadius: "var(--radius)",
          }}
        >
          <button
            onClick={zoomInY}
            title="Zoom In Y"
            className="p-1.5 border rounded bg-muted hover:bg-muted/80"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={resetYZoom}
            title="Reset Y Zoom"
            className="p-1.5 border rounded bg-muted hover:bg-muted/80"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={zoomOutY}
            title="Zoom Out Y"
            className="p-1.5 border rounded bg-muted hover:bg-muted/80"
          >
            <ZoomOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceChart;

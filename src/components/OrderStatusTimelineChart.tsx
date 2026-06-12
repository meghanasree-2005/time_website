import React, { useState } from "react";
import { Order } from "../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Activity, Clock, BarChart3, HelpCircle } from "lucide-react";

interface OrderStatusTimelineChartProps {
  orders: Order[];
}

const CHART_COLORS = [
  "#2E8B57", // Deep Green
  "#C9A86A", // Champagne Gold
  "#2563EB", // Royal Blue
  "#6366F1", // Indigo
  "#D946EF", // Fuchsia
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#EC4899"  // Pink
];

export default function OrderStatusTimelineChart({ orders }: OrderStatusTimelineChartProps) {
  const [metricMode, setMetricMode] = useState<"individual" | "cumulative">("cumulative");
  const [unitMode, setUnitMode] = useState<"seconds" | "hours">("hours");
  const [showExplanation, setShowExplanation] = useState(false);

  if (!orders || orders.length === 0) return null;

  // Calculate phase durations for an order based on its createdAt time
  const getOrderTimeline = (order: Order) => {
    const createdAt = order.createdAt || (Date.now() - 60000);
    const elapsedSeconds = Math.max(0, (Date.now() - createdAt) / 1000);

    // Dynamic phase bounds in our lab simulator
    // Phase 1 (Confirmed): up to 12s
    const confirmedSecs = Math.min(elapsedSeconds, 12);

    // Phase 2 (In Calibration): up to 12s (from 12s to 24s)
    const calibrationSecs = elapsedSeconds > 12 ? Math.min(elapsedSeconds - 12, 12) : 0;

    // Phase 3 (Quality Assurance): up to 12s (from 24s to 36s)
    const qaSecs = elapsedSeconds > 24 ? Math.min(elapsedSeconds - 24, 12) : 0;

    // Phase 4 (Dispatched): remainder
    const dispatchedSecs = elapsedSeconds > 36 ? Math.max(0, elapsedSeconds - 36) : 0;

    // Helper to scale seconds to Simulated Expert Labor Hours
    // Let's pretend 1 second of simulation time equals 4.5 hours of high-complexity Swiss craftsmanship!
    const multiplier = unitMode === "hours" ? 4.5 : 1;

    const indTimes = {
      Confirmed: Number((confirmedSecs * multiplier).toFixed(1)),
      "In Calibration": Number((calibrationSecs * multiplier).toFixed(1)),
      "Quality Assurance": Number((qaSecs * multiplier).toFixed(1)),
      "Dispatched": Number((dispatchedSecs * multiplier).toFixed(1))
    };

    const cumTimes = {
      Confirmed: Number((confirmedSecs * multiplier).toFixed(1)),
      "In Calibration": Number(((confirmedSecs + calibrationSecs) * multiplier).toFixed(1)),
      "Quality Assurance": Number(((confirmedSecs + calibrationSecs + qaSecs) * multiplier).toFixed(1)),
      "Dispatched": Number(((confirmedSecs + calibrationSecs + qaSecs + dispatchedSecs) * multiplier).toFixed(1))
    };

    return metricMode === "individual" ? indTimes : cumTimes;
  };

  // Prepare Recharts data format: 4 items (each representing a phase name)
  const phases = ["Confirmed", "In Calibration", "Quality Assurance", "Dispatched"];
  
  const chartData = phases.map(phaseName => {
    const row: any = { phase: phaseName };
    orders.forEach(order => {
      const times = getOrderTimeline(order);
      row[order.id] = times[phaseName as keyof typeof times] || 0;
    });
    return row;
  });

  const durationLabel = unitMode === "hours" ? "Expert Labor Hours (Simulated)" : "Sourcing Time (Live Seconds)";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 text-left animate-fade-in" id="atelier-performance-analytics">
      {/* Header section with metrics/toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-sm font-bold uppercase text-sapphire tracking-wider flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-quicksand" />
            <span>Atelier Assembly Metrics</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Real-time analytics showcasing cumulative or structural duration for precision watch builds.
          </p>
        </div>

        {/* Dynamic mini guides trigger */}
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-gray-500 hover:text-quicksand border border-gray-200 hover:border-quicksand/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all bg- Swanwing cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Timeline Guide</span>
        </button>
      </div>

      {showExplanation && (
        <div className="bg-swanwing border border-[#C9A86A]/20 rounded-xl p-4 text-xs text-sapphire space-y-2 animate-fade-in">
          <p className="font-bold text-quicksand uppercase tracking-wider text-[10px]">🔬 Ticking Laboratory Sourcing Simulation</p>
          <p className="leading-relaxed text-gray-600">
            Every custom-marked horology masterwork progresses live through 4 specialized stages. To illustrate expert craftsmanship, 
            the chart renders progress in <strong>Simulated Expert Labor Hours</strong> (1 live second maps to 4.5 hours of precision mechanics calibration) 
            or <strong>Live Sourcing Seconds</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-gray-500 mt-1">
            <li><strong>Confirmed (0-12s):</strong> Order ingestion, bespoke blueprints drawing, laser engraving mapping.</li>
            <li><strong>In Calibration (12-24s):</strong> Escapement regulation, hairspring balancing, gear ratio audit.</li>
            <li><strong>Quality Assurance (24-36s):</strong> Water resistance testing, pressure chambers, structural drop audits.</li>
            <li><strong>Dispatched (36s+):</strong> Luxury boxing, wax sealing, transfer to air priority courier routing.</li>
          </ul>
        </div>
      )}

      {/* Control Switchboard Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Toggle 1: Individual vs Cumulative */}
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => setMetricMode("cumulative")}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
              metricMode === "cumulative" 
                ? "bg-white text-sapphire shadow-xs" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Cumulative Path
          </button>
          <button
            onClick={() => setMetricMode("individual")}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
              metricMode === "individual" 
                ? "bg-white text-sapphire shadow-xs" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Phase Duration
          </button>
        </div>

        {/* Toggle 2: Hours vs Seconds */}
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => setUnitMode("hours")}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
              unitMode === "hours" 
                ? "bg-white text-sapphire shadow-xs" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Labor Hours
          </button>
          <button
            onClick={() => setUnitMode("seconds")}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
              unitMode === "seconds" 
                ? "bg-white text-sapphire shadow-xs" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sourcing Secs
          </button>
        </div>
      </div>

      {/* The Recharts Graphical Component */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis 
              dataKey="phase" 
              stroke="#94A3B8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
              label={{ 
                value: unitMode === "hours" ? "Hours Spent" : "Seconds", 
                angle: -90, 
                position: "insideLeft",
                fontSize: 9,
                fill: "#64748B",
                offset: 10
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                fontSize: "11px",
                boxShadow: "0 4px 12px rbg(0 0 0 / 0.05)"
              }}
              labelStyle={{ fontWeight: "bold", color: "#0F172A", marginBottom: "4px" }}
              formatter={(value: any, name: string) => [
                `${value} ${unitMode === "hours" ? "hrs" : "s"}`,
                `Order ID: ${name}`
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", marginTop: "15px" }}
            />
            
            {/* Render a Line for each Order */}
            {orders.map((order, index) => {
              const color = CHART_COLORS[index % CHART_COLORS.length];
              return (
                <Line
                  key={order.id}
                  type="monotone"
                  dataKey={order.id}
                  name={order.id}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: color, strokeWidth: 1, fill: "#FFFFFF" }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "#FFFFFF" }}
                  animationDuration={1200}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats summary card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4 text-center">
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Total Watches</span>
          <span className="text-base font-bold text-sapphire font-mono">{orders.length}</span>
        </div>
        <div className="space-y-1 border-l border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Fastest Build</span>
          <span className="text-base font-bold text-sapphire font-mono">1.2 hrs</span>
        </div>
        <div className="space-y-1 border-l border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Mode Activated</span>
          <span className="text-base font-bold text-quicksand font-semibold transition-all">
            {metricMode === "cumulative" ? "Cumulative" : "Independent"}
          </span>
        </div>
        <div className="space-y-1 border-l border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Simulated Multipliers</span>
          <span className="text-base font-bold text-sapphire font-mono">x4.5 Labor</span>
        </div>
      </div>
    </div>
  );
}

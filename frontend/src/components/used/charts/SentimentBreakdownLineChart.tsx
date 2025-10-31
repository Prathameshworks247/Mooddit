import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
  LegendProps,
} from "recharts";
import { SentimentPostsTimePoint } from "../sidebar";

interface PropsSentimentPostsTimePoint {
  data: SentimentPostsTimePoint[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const positive = payload.find((p) => p.dataKey === "positive")?.value ?? 0;
    const neutral = payload.find((p) => p.dataKey === "neutral")?.value ?? 0;

    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#1f2937" }}>{label}</p>

        <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
          Positive: <strong style={{ color: "#10b981" }}>{positive}</strong>
        </p>

        <p style={{ margin: "4px 0 0", color: "#4b5563" }}>
          Neutral: <strong style={{ color: "#94a3b8" }}>{neutral}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<LegendProps> = ({ payload }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "8px",
        fontSize: "12px",
        color: "#4b5563",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {payload.map((entry: any, i: number) => (
        <div
          key={`legend-${i}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              backgroundColor: entry.color,
              borderRadius: "50%",
              marginRight: 6,
            }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const SentimentBreakdownLineChart = ({
  data,
}: PropsSentimentPostsTimePoint) => {
  const chartData = data.map((d) => ({
    time: d.time,
    positive: d.positive,
    neutral: d.neutral,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

        {/* X Axis */}
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />

        {/* Y Axis */}
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={45}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: "5 5" }}
        />

        {/* Legend */}
        <Legend content={<CustomLegend />} />

        {/* Positive Line */}
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
          name="Positive"
        />

        {/* Neutral Line */}
        <Line
          type="monotone"
          dataKey="neutral"
          stroke="#94a3b8"
          strokeWidth={2.5}
          dot={{ fill: "#94a3b8", r: 5, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7, stroke: "#94a3b8", strokeWidth: 2, fill: "#fff" }}
          name="Neutral"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

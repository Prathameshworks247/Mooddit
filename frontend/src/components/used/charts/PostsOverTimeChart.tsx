import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
} from "recharts";
import { PostsTimePoint } from "../sidebar";

interface PropsPostsTimePoint {
  data: PostsTimePoint[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const { posts, date } = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#1f2937" }}>
          {date} {label}
        </p>
        <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
          Posts: <strong style={{ color: "#3b82f6" }}>{posts}</strong>
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
        gap: "16px",
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

export const PostsOverTimeChart = ({ data }: PropsPostsTimePoint) => {
  const formattedData = data.map((d) => ({
    ...d,
    label: d.time, // used in tooltip
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

        {/* X Axis – clean ticks */}
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />

        {/* Y Axis – smaller ticks, no extra left margin */}
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: "5 5" }}
        />

        {/* Legend */}
        <Legend content={<CustomLegend />} />

        {/* Line */}
        <Line
          type="monotone"
          dataKey="posts"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
          name="Posts" // shows in legend
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

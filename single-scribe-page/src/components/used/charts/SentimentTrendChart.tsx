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
import { SentimentTimePoint } from "../sidebar";

interface PropsSentimentTimePoint {
  data: SentimentTimePoint[];
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const { average_sentiment, date } = payload[0].payload;

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
        <p style={{ margin: 0, fontWeight: 600, color: "#1f2937" }}>
          {date ? `${date} ` : ""}
          {label}
        </p>
        <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
          Avg Sentiment:{" "}
          <strong style={{ color: "#8b5cf6" }}>
            {average_sentiment.toFixed(3)}
          </strong>
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

export const SentimentTrendChart = ({ data }: PropsSentimentTimePoint) => {
  const formattedData = data.map((d) => ({
    ...d,
    label: d.time,
    average_sentiment: Number(d.average_sentiment.toFixed(3)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
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

        {/* Y Axis – fixed [-1, 1] */}
        <YAxis
          domain={[-1, 1]}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          ticks={[-1, -0.5, 0, 0.5, 1]}
          width={50}
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
          dataKey="average_sentiment"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ fill: "#8b5cf6", r: 5, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
          name="Avg Sentiment"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

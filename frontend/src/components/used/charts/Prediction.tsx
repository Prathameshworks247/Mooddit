import React, { useMemo } from "react";
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
} from "recharts";

interface PredictionPoint {
  timestamp: string;
  hours_ahead: number;
  predicted_sentiment_score: number;
  predicted_sentiment_ratio: number;
  predicted_sentiment: string;
  confidence: number;
}

const CustomTooltip: React.FC<TooltipProps<number, number>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          fontSize: "14px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#333" }}>
          Hours Ahead: {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: "0 0 4px 0",
              color: entry.color || "#666",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "4px",
                marginRight: "8px",
                backgroundColor: entry.color || "#888",
                borderRadius: "2px",
              }}
            />
            {entry.name}: {entry.value?.toFixed(3)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PredictionChart = ({
  predictionsData,
}: {
  predictionsData: PredictionPoint[];
}) => {
  const memoizedChartData = useMemo(
    () =>
      predictionsData.map((item: PredictionPoint) => ({
        timestamp: item.timestamp,
        hours_ahead: item.hours_ahead,
        predicted_sentiment_score: item.predicted_sentiment_score,
        predicted_sentiment_ratio: item.predicted_sentiment_ratio,
        predicted_sentiment: item.predicted_sentiment,
        confidence: item.confidence,
      })),
    [predictionsData]
  );
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={memoizedChartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hours_ahead"
          label={{
            value: "Hours Ahead",
            position: "insideBottom",
            offset: -15,
            style: { fontSize: 12, fontWeight: "normal" },
          }}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          label={{
            value: "Predicted Sentiment Score",
            angle: -90,
            position: "insideLeft",
            offset: 0,
            dy: 0,
            style: { fontSize: 12, fontWeight: "normal", textAnchor: "middle" },
          }}
          domain={["dataMin", "dataMax"]}
          tick={{ fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            padding: "30px 0 0 0",
            fontSize: 12,
            fontFamily: "Arial, sans-serif",
          }}
        />
        <Line
          type="monotone"
          dataKey="predicted_sentiment_score"
          stroke="#8884d8"
          name="Sentiment Score"
        />
        <Line
          type="monotone"
          dataKey="predicted_sentiment_ratio"
          stroke="#82ca9d"
          name="Predicted Sentiment Ratio"
        />
        <Line
          type="monotone"
          dataKey="confidence"
          stroke="#ffc658"
          name="Confidence"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { PredictionChart };
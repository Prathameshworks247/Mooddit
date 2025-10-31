import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
} from "recharts";
import { SentimentDistribution } from "../sidebar";

interface PropsSentimentDistribution {
  data: SentimentDistribution[];
}

const COLORS = ["#10b981", "#ef4444", "#94a3b8"];

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const RADIAN = Math.PI / 180;
  // position a little outside the pie
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{
        fontSize: "13px",
        fontWeight: "600",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const CustomLegend: React.FC<LegendProps> = (props) => {
  const { payload } = props;

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: "10px 0 0",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      {payload?.map((entry: any, index: number) => (
        <li
          key={`legend-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "12px",
            color: "#555",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <svg width="12" height="12" style={{ marginRight: "6px" }}>
            <rect width="12" height="12" fill={entry.color} />
          </svg>
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export const SentimentDistributionPieChart = ({
  data,
}: PropsSentimentDistribution) => {
  // Create a custom tooltip component that has access to the full data
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percent = ((value! / total) * 100).toFixed(1);

      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>{name}</p>
          <p style={{ margin: "4px 0 0", color: "#555" }}>
            Value: <strong>{value}</strong>
          </p>
          <p style={{ margin: "4px 0 0", color: "#555" }}>
            Percent: <strong>{percent}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ right: 10 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};
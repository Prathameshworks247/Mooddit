import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// types.ts
export interface SentimentDistribution {
  name: string;
  value: number;
  percentage: number;
}

export interface SentimentTimePoint {
  timestamp: string;
  date: string;
  time: string;
  average_sentiment: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_posts: number;
}

export interface PostsTimePoint {
  timestamp: string;
  date: string;
  time: string;
  posts: number;
}

export interface SentimentPostsTimePoint {
  timestamp: string;
  date: string;
  time: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface Iphone17Data {
  query: string;
  total_posts: number;
  time_window_hours: number;
  actual_time_range_hours: number;
  first_post_time: string;
  last_post_time: string;
  sentiment_distribution: SentimentDistribution[];
  sentiment_over_time: SentimentTimePoint[];
  posts_over_time: PostsTimePoint[];
  sentiment_posts_over_time: SentimentPostsTimePoint[];
}

const data = {
  query: "iphone 17",
  total_posts: 246,
  time_window_hours: 48,
  actual_time_range_hours: 15.86,
  first_post_time: "2025-10-28T10:48:03",
  last_post_time: "2025-10-29T02:39:39",
  sentiment_distribution: [
    {
      name: "Positive",
      value: 39,
      percentage: 15.85,
    },
    {
      name: "Negative",
      value: 37,
      percentage: 15.04,
    },
    {
      name: "Neutral",
      value: 170,
      percentage: 69.11,
    },
  ],
  sentiment_over_time: [
    {
      timestamp: "2025-10-28T08:56:19.275036",
      date: "2025-10-28",
      time: "08:56",
      average_sentiment: -0.091,
      positive_count: 2,
      negative_count: 4,
      neutral_count: 16,
      total_posts: 22,
    },
    {
      timestamp: "2025-10-28T11:56:19.275036",
      date: "2025-10-28",
      time: "11:56",
      average_sentiment: 0.149,
      positive_count: 9,
      negative_count: 2,
      neutral_count: 36,
      total_posts: 47,
    },
    {
      timestamp: "2025-10-28T14:56:19.275036",
      date: "2025-10-28",
      time: "14:56",
      average_sentiment: -0.075,
      positive_count: 8,
      negative_count: 12,
      neutral_count: 33,
      total_posts: 53,
    },
    {
      timestamp: "2025-10-28T17:56:19.275036",
      date: "2025-10-28",
      time: "17:56",
      average_sentiment: 0.035,
      positive_count: 12,
      negative_count: 10,
      neutral_count: 35,
      total_posts: 57,
    },
    {
      timestamp: "2025-10-28T20:56:19.275036",
      date: "2025-10-28",
      time: "20:56",
      average_sentiment: -0.024,
      positive_count: 5,
      negative_count: 6,
      neutral_count: 30,
      total_posts: 41,
    },
    {
      timestamp: "2025-10-28T23:56:19.275036",
      date: "2025-10-28",
      time: "23:56",
      average_sentiment: 0,
      positive_count: 3,
      negative_count: 3,
      neutral_count: 20,
      total_posts: 26,
    },
  ],
  posts_over_time: [
    {
      timestamp: "2025-10-28T08:56:19.275036",
      date: "2025-10-28",
      time: "08:56",
      posts: 22,
    },
    {
      timestamp: "2025-10-28T11:56:19.275036",
      date: "2025-10-28",
      time: "11:56",
      posts: 47,
    },
    {
      timestamp: "2025-10-28T14:56:19.275036",
      date: "2025-10-28",
      time: "14:56",
      posts: 53,
    },
    {
      timestamp: "2025-10-28T17:56:19.275036",
      date: "2025-10-28",
      time: "17:56",
      posts: 57,
    },
    {
      timestamp: "2025-10-28T20:56:19.275036",
      date: "2025-10-28",
      time: "20:56",
      posts: 41,
    },
    {
      timestamp: "2025-10-28T23:56:19.275036",
      date: "2025-10-28",
      time: "23:56",
      posts: 26,
    },
  ],
  sentiment_posts_over_time: [
    {
      timestamp: "2025-10-28T08:56:19.275036",
      date: "2025-10-28",
      time: "08:56",
      positive: 2,
      negative: 4,
      neutral: 16,
    },
    {
      timestamp: "2025-10-28T11:56:19.275036",
      date: "2025-10-28",
      time: "11:56",
      positive: 9,
      negative: 2,
      neutral: 36,
    },
    {
      timestamp: "2025-10-28T14:56:19.275036",
      date: "2025-10-28",
      time: "14:56",
      positive: 8,
      negative: 12,
      neutral: 33,
    },
    {
      timestamp: "2025-10-28T17:56:19.275036",
      date: "2025-10-28",
      time: "17:56",
      positive: 12,
      negative: 10,
      neutral: 35,
    },
    {
      timestamp: "2025-10-28T20:56:19.275036",
      date: "2025-10-28",
      time: "20:56",
      positive: 5,
      negative: 6,
      neutral: 30,
    },
    {
      timestamp: "2025-10-28T23:56:19.275036",
      date: "2025-10-28",
      time: "23:56",
      positive: 3,
      negative: 3,
      neutral: 20,
    },
  ],
};

export function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu color="white" className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[400px] overflow-y-auto scrollbar-hide"
      >
        <SheetHeader>
          <SheetTitle>Your Charts</SheetTitle>
          <SheetDescription>Charts will appear here</SheetDescription>
        </SheetHeader>
        <div className="mt-6 w-full">
          <SentimentDistributionPieChart data={data.sentiment_distribution} />
        </div>
        <div className="mt-6 w-full">
          <PostsOverTimeChart data={data.posts_over_time} />
        </div>
        <div className="mt-6 w-full">
          <SentimentTrendChart data={data.sentiment_over_time} />
        </div>
        <div className="mt-6 w-full">
          <SentimentBreakdownLineChart data={data.sentiment_posts_over_time} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface PropsSentimentDistribution {
  data: SentimentDistribution[];
}

const COLORS = ["#10b981", "#ef4444", "#94a3b8"];

export const SentimentDistributionPieChart = ({
  data,
}: PropsSentimentDistribution) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface PropsPostsTimePoint {
  data: PostsTimePoint[];
}

export const PostsOverTimeChart = ({ data }: PropsPostsTimePoint) => {
  const formattedData = data.map((d) => ({
    ...d,
    label: `${d.date} ${d.time}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="posts"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface PropsSentimentTimePoint {
  data: SentimentTimePoint[];
}

export const SentimentTrendChart = ({ data }: PropsSentimentTimePoint) => {
  const formattedData = data.map((d) => ({
    ...d,
    label: `${d.time}`,
    average_sentiment: Number(d.average_sentiment.toFixed(3)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[-1, 1]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="average_sentiment"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: "#8b5cf6" }}
          name="Avg Sentiment"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface PropsSentimentPostsTimePoint {
  /** Expected shape: sentiment_posts_over_time array from the JSON */
  data: SentimentPostsTimePoint[];
}

export const SentimentBreakdownLineChart = ({
  data,
}: PropsSentimentPostsTimePoint) => {
  // Recharts likes a short label for the X-axis – we use the `time` field.
  const chartData = data.map((d) => ({
    time: d.time,
    positive: d.positive,
    neutral: d.neutral,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />

        {/* Positive line */}
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#10b981" // green-500
          strokeWidth={2}
          dot={{ fill: "#10b981" }}
          name="Positive"
        />

        {/* Neutral line */}
        <Line
          type="monotone"
          dataKey="neutral"
          stroke="#94a3b8" // slate-400
          strokeWidth={2}
          dot={{ fill: "#94a3b8" }}
          name="Neutral"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

import React from "react";
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
import { SentimentDistributionPieChart } from "./charts/SentimentDistributionPieChart";
import { PostsOverTimeChart } from "./charts/PostsOverTimeChart";
import { SentimentTrendChart } from "./charts/SentimentTrendChart";
import { SentimentBreakdownLineChart } from "./charts/SentimentBreakdownLineChart";
// Chart wrapper component with error boundary
function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return (
      <div className="mt-6 w-full">
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded">
          <p className="text-red-500 text-sm">Failed to render chart</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="mt-6 w-full">
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        {children}
      </div>
    );
  } catch (error) {
    setHasError(true);
    console.error(`Error rendering ${title}:`, error);
    return null;
  }
}

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

interface ChartData {
  query: string;
  total_posts: number;
  time_window_hours: number;
  actual_time_range_hours?: number;
  first_post_time?: string;
  last_post_time?: string;
  sentiment_distribution: SentimentDistribution[];
  sentiment_over_time: SentimentTimePoint[];
  posts_over_time: PostsTimePoint[];
  sentiment_posts_over_time: SentimentPostsTimePoint[];
}

interface SidebarProps {
  chartData: ChartData | null;
  loading: boolean;
  onLoadCharts: () => void;
}

export function Sidebar({ chartData, loading, onLoadCharts }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [chartError, setChartError] = React.useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Only load charts when opening and data doesn't exist yet
    if (open && !chartData && !loading) {
      try {
        onLoadCharts();
      } catch (error) {
        console.error("Error loading charts:", error);
        setChartError("Failed to load charts. Please try again.");
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
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
          <SheetTitle>Sentiment Charts</SheetTitle>
          <SheetDescription>
            {chartData ? `Analysis for "${chartData.query}"` : "Charts will load automatically"}
          </SheetDescription>
        </SheetHeader>
        
        {chartError ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-red-500 text-sm text-center">{chartError}</p>
            <Button onClick={() => { setChartError(null); onLoadCharts(); }} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-500 text-sm">Loading charts...</p>
          </div>
        ) : chartData ? (
          <div className="pb-6">
            <ChartWrapper title="Sentiment Distribution">
              <SentimentDistributionPieChart data={chartData.sentiment_distribution} />
            </ChartWrapper>
            <ChartWrapper title="Posts Over Time">
              <PostsOverTimeChart data={chartData.posts_over_time} />
            </ChartWrapper>
            <ChartWrapper title="Sentiment Trend">
              <SentimentTrendChart data={chartData.sentiment_over_time} />
            </ChartWrapper>
            <ChartWrapper title="Sentiment Breakdown">
              <SentimentBreakdownLineChart data={chartData.sentiment_posts_over_time} />
            </ChartWrapper>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-gray-500 text-sm text-center">
              No charts loaded yet.<br/>Charts will load when you open this sidebar.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
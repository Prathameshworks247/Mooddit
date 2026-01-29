import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Clock,
  Users,
  BarChart3,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Flame,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { getApiBaseUrl } from "@/lib/api";

// Chart Colors
const CHART_COLORS = {
  positive: "#10b981", // green-500
  negative: "#ef4444", // red-500
  neutral: "#6b7280", // gray-500
  primary: "#3b82f6", // blue-500
  secondary: "#8b5cf6", // purple-500
  accent: "#f59e0b", // amber-500
};

const PIE_COLORS = [CHART_COLORS.positive, CHART_COLORS.negative, CHART_COLORS.neutral];

// Types
interface SentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
}

interface ComponentSentiment {
  component: string;
  sentiment: string;
  confidence: string;
  summary: string;
  mention_count: number;
}

interface SourcePost {
  title: string;
  url: string;
  sentiment: string;
  selftext: string;
  score: number;
  created_utc: string;
}

interface TopicInfo {
  topic: string;
  rank: number;
  post_count: number;
  total_score: number;
  total_comments: number;
  avg_velocity: number;
  topic_score: number;
  trending_strength: number;
  subreddits: string[];
  subreddit_count: number;
  variants?: string[];
}

interface TrendingTopicAnalysis {
  topic_info: TopicInfo;
  sentiment_analysis: SentimentSummary;
  component_analysis?: ComponentSentiment[];
  key_insights?: string;
  trending_duration_hours?: number;
  sample_posts: SourcePost[];
}

interface TrendingResponse {
  trending_topics: TrendingTopicAnalysis[];
  total_topics_found: number;
  analysis_time: string;
  time_window_hours: number;
  category: string;
}

const categories = [
  { value: "all", label: "All", icon: "🌍" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "news", label: "News", icon: "📰" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "science", label: "Science", icon: "🔬" },
];

const TrendingAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeComponents, setAnalyzeComponents] = useState(false);
  const [topN, setTopN] = useState(1);
  
  // Cache to store fetched data per category
  const [dataCache, setDataCache] = useState<Record<string, TrendingResponse>>({});

  const fetchTrendingTopics = async (forceRefresh: boolean = false) => {
    console.log(`🎯 fetchTrendingTopics called for "${selectedCategory}", forceRefresh=${forceRefresh}`);
    
    // Check if we have cached data for this category
    if (!forceRefresh && dataCache[selectedCategory]) {
      console.log(`✅ 📦 Using cached data for category: ${selectedCategory}`);
      setTrendingData(dataCache[selectedCategory]);
      setError(null);
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      console.log(`⚠️ Already loading, skipping request for ${selectedCategory}`);
      return;
    }
    
    console.log(`❌ 🔄 Fetching fresh data for category: ${selectedCategory}`);
    console.log(`📊 Cache before fetch:`, Object.keys(dataCache));
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/trending/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time_window_hours: 24,
          top_n: topN,
          category: selectedCategory,
          analyze_sentiment: true,
          analyze_components: analyzeComponents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: TrendingResponse = await response.json();
      
      // Update current data
      setTrendingData(data);
      
      // Store in cache
      setDataCache(prev => {
        const newCache = {
          ...prev,
          [selectedCategory]: data
        };
        console.log(`💾 Stored "${selectedCategory}" in cache. Cache now has:`, Object.keys(newCache));
        return newCache;
      });
      
      toast({
        title: "✅ Analysis Complete",
        description: `Found ${data.total_topics_found} trending topics`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch trending topics";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Only fetch on initial load
  useEffect(() => {
    fetchTrendingTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount
  
  // Handle category changes
  useEffect(() => {
    // Debug: Show current cache state
    console.log(`🔍 Category changed to: ${selectedCategory}`);
    console.log(`📊 Current cache keys:`, Object.keys(dataCache));
    console.log(`❓ Is "${selectedCategory}" in cache?`, !!dataCache[selectedCategory]);
    
    // When category changes, check cache first
    if (dataCache[selectedCategory]) {
      console.log(`✅ 📦 Category changed to ${selectedCategory}, using cached data`);
      setTrendingData(dataCache[selectedCategory]);
      setError(null);
    } else {
      console.log(`❌ 🔄 Category changed to ${selectedCategory}, fetching new data`);
      fetchTrendingTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]); // Only run when category changes

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <ThumbsUp className="h-4 w-4" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500/15 text-green-300 border-green-500/30";
      case "negative":
        return "bg-red-500/15 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/15 text-gray-300 border-gray-500/30";
    }
  };

  const calculateSentimentPercentages = (sentiment: SentimentSummary) => {
    const total = sentiment.positive + sentiment.negative + sentiment.neutral;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0 };

    return {
      positive: (sentiment.positive / total) * 100,
      negative: (sentiment.negative / total) * 100,
      neutral: (sentiment.neutral / total) * 100,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-10 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gray-900/50 px-6 py-8 shadow-[0_25px_70px_rgba(8,8,35,0.45)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-orange-200">
                <Sparkles className="h-3 w-3" />
                Live Reddit Insights
              </div>
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
                  <span className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white shadow-lg shadow-orange-500/30">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                  <span className="bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
                    Trending Topics Radar
                  </span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
                  Explore the fastest-moving Reddit conversations, measure sentiment in real-time, and surface the components driving each trend forward.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3">
                <Switch
                  id="components"
                  checked={analyzeComponents}
                  onCheckedChange={setAnalyzeComponents}
                />
                <div className="space-y-1">
                  <Label htmlFor="components" className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                    Component Analysis
                  </Label>
                  <p className="text-xs text-gray-500">
                    Highlight aspect-level sentiment
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => fetchTrendingTopics(true)}
                  disabled={loading}
                  className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                {Object.keys(dataCache).length > 0 && (
                  <Button
                    onClick={() => {
                      setDataCache({});
                      setTrendingData(null);
                      toast({
                        title: "🗑️ Cache Cleared",
                        description: "All cached data has been removed",
                      });
                    }}
                    disabled={loading}
                    variant="outline"
                    className="gap-2 rounded-xl border-orange-500/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20"
                  >
                    Clear Cache ({Object.keys(dataCache).length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-2 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-gray-400 transition hover:text-gray-200 data-[state=active]:border-orange-500/40 data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-200"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="hidden lg:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6 space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-800 bg-gray-900/50">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success State */}
            {trendingData && !loading && (
              <div className="space-y-6">
                {/* Cache Status Badge */}
                {dataCache[selectedCategory] && (
                  <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
                    <Badge className="gap-1 border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
                      📦 Cached Data
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Click refresh to fetch latest
                    </span>
                  </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Card className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        Topics Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-white">
                        {trendingData.total_topics_found}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        Time Window
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-white">
                        {trendingData.time_window_hours}h
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold capitalize text-white">
                        {trendingData.category}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        Last Updated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium text-gray-200">
                        {new Date(trendingData.analysis_time).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trending Topics */}
                <div className="space-y-4">
                  {trendingData.trending_topics.map((topic) => (
                    <TrendingTopicCard
                      key={topic.topic_info.topic}
                      topic={topic}
                      getSentimentIcon={getSentimentIcon}
                      getSentimentColor={getSentimentColor}
                      calculateSentimentPercentages={calculateSentimentPercentages}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!trendingData && !loading && !error && (
              <Card className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur">
                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <TrendingUp className="mb-4 h-12 w-12 text-orange-400" />
                  <p className="text-sm text-gray-400">
                    Click refresh to discover trending topics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Trending Topic Card Component
const TrendingTopicCard = ({
  topic,
  getSentimentIcon,
  getSentimentColor,
  calculateSentimentPercentages,
}: {
  topic: TrendingTopicAnalysis;
  getSentimentIcon: (sentiment: string) => JSX.Element;
  getSentimentColor: (sentiment: string) => string;
  calculateSentimentPercentages: (sentiment: SentimentSummary) => {
    positive: number;
    negative: number;
    neutral: number;
  };
}) => {
  const { topic_info, sentiment_analysis, component_analysis, sample_posts } = topic;
  const percentages = calculateSentimentPercentages(sentiment_analysis);

  return (
    <Card className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-950/60 backdrop-blur transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_30px_80px_rgba(255,115,50,0.25)]">
      <CardHeader className="border-b border-gray-800/60 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-gray-900/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 opacity-60 blur-lg" />
                <Badge className="relative rounded-full border border-orange-500/40 bg-orange-500/20 px-4 py-2 text-base font-semibold text-orange-100 shadow-lg shadow-orange-500/30">
                  #{topic_info.rank}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-semibold leading-tight bg-gradient-to-r from-white via-orange-100 to-pink-100 bg-clip-text text-transparent">
                {topic_info.topic}
              </CardTitle>
            </div>
            {topic_info.variants && topic_info.variants.length > 1 && (
              <CardDescription className="ml-16 text-sm text-gray-400">
                <span className="text-gray-500">Also known as:</span> {topic_info.variants
                  .filter((v) => v !== topic_info.topic)
                  .join(", ")}
              </CardDescription>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 text-sm md:items-end">
            <Badge className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/15 px-3 py-1 text-sm font-medium text-orange-100 shadow-lg shadow-orange-500/20">
              <Flame className="h-3 w-3" />
              {topic_info.trending_strength.toFixed(0)}% Hot
            </Badge>
            {topic.trending_duration_hours && (
              <Badge variant="outline" className="flex items-center gap-1 rounded-full border border-gray-700 bg-gray-900/70 text-gray-300">
                <Clock className="h-3 w-3" />
                Active {topic.trending_duration_hours.toFixed(1)}h
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-6 sm:p-8">
        {/* Trending Strength Visualization */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-red-500/15 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-3">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">Trending Strength</p>
                <p className="text-sm text-orange-100/80">Popularity momentum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-semibold text-orange-100">
                {topic_info.trending_strength.toFixed(0)}%
              </p>
              {topic.trending_duration_hours && (
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-orange-100/70">
                  <Clock className="h-3 w-3" />
                  Active for {topic.trending_duration_hours.toFixed(1)}h
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-900/80">
            <div
              className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 pr-2 transition-all duration-500"
              style={{ width: `${Math.min(topic_info.trending_strength, 100)}%` }}
            >
              {topic_info.trending_strength > 20 && (
                <Zap className="h-3 w-3 text-orange-100 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-inner shadow-blue-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-blue-500/60 p-2">
                <MessageSquare className="h-4 w-4 text-blue-100" />
              </div>
              <p className="text-sm font-medium text-blue-100">Posts</p>
            </div>
            <p className="text-2xl font-semibold text-white">{topic_info.post_count}</p>
            <p className="mt-1 text-xs text-blue-100/70">Total discussions</p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 shadow-inner shadow-purple-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-purple-500/60 p-2">
                <BarChart3 className="h-4 w-4 text-purple-100" />
              </div>
              <p className="text-sm font-medium text-purple-100">Score</p>
            </div>
            <p className="text-2xl font-semibold text-white">{topic_info.total_score.toLocaleString()}</p>
            <p className="mt-1 text-xs text-purple-100/70">Total upvotes</p>
          </div>

          <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 shadow-inner shadow-pink-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-pink-500/60 p-2">
                <MessageSquare className="h-4 w-4 text-pink-100" />
              </div>
              <p className="text-sm font-medium text-pink-100">Comments</p>
            </div>
            <p className="text-2xl font-semibold text-white">{topic_info.total_comments.toLocaleString()}</p>
            <p className="mt-1 text-xs text-pink-100/70">Total engagements</p>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-inner shadow-amber-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-amber-500/60 p-2">
                <TrendingUp className="h-4 w-4 text-amber-100" />
              </div>
              <p className="text-sm font-medium text-amber-100">Velocity</p>
            </div>
            <p className="text-2xl font-semibold text-white">{topic_info.avg_velocity.toFixed(1)}</p>
            <p className="mt-1 text-xs text-amber-100/70">Engagement/hour</p>
          </div>
        </div>

        {/* Subreddits */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
            <Users className="h-4 w-4 text-gray-400" />
            Trending in {topic_info.subreddit_count} subreddit(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {topic_info.subreddits.map((sub) => (
              <Badge key={sub} className="border border-gray-700 bg-gray-900/70 text-gray-300">
                r/{sub}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="border-gray-800" />

        {/* Sentiment Analysis with Pie Chart */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
            <Activity className="h-4 w-4 text-orange-300" />
            Sentiment Distribution
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex h-64 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Positive", value: sentiment_analysis.positive },
                      { name: "Negative", value: sentiment_analysis.negative },
                      { name: "Neutral", value: sentiment_analysis.neutral },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(148,163,184,0.3)",
                      color: "#e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/60 p-2">
                      <ThumbsUp className="h-4 w-4 text-green-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-100">Positive</p>
                      <p className="text-xs text-green-100/70">Optimistic responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{sentiment_analysis.positive}</p>
                    <p className="text-xs text-green-100/70">{percentages.positive.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-500/60 p-2">
                      <ThumbsDown className="h-4 w-4 text-red-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-100">Negative</p>
                      <p className="text-xs text-red-100/70">Critical responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{sentiment_analysis.negative}</p>
                    <p className="text-xs text-red-100/70">{percentages.negative.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-500/30 bg-gray-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-500/60 p-2">
                      <Minus className="h-4 w-4 text-gray-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Neutral</p>
                      <p className="text-xs text-gray-300/70">Balanced responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{sentiment_analysis.neutral}</p>
                    <p className="text-xs text-gray-300/70">{percentages.neutral.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Analysis */}
        {component_analysis && component_analysis.length > 0 && (
          <>
            <Separator className="border-gray-800" />
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Component Analysis
              </p>
              <div className="grid gap-3">
                {component_analysis.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-3 ${getSentimentColor(comp.sentiment)}`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-200">
                        {getSentimentIcon(comp.sentiment)}
                        <span className="font-medium capitalize">{comp.component}</span>
                      </div>
                      <Badge variant="outline" className="rounded-full border border-gray-700 bg-gray-900/70 text-xs text-gray-300">
                        {comp.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">{comp.summary}</p>
                    <p className="mt-1 text-xs text-gray-500">~{comp.mention_count} mentions</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sample Posts */}
        {sample_posts && sample_posts.length > 0 && (
          <>
            <Separator className="border-gray-800" />
            <div>
              <p className="mb-3 text-sm font-medium text-gray-300">Top Posts</p>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-2">
                  {sample_posts.slice(0, 5).map((post, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-orange-500/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm font-medium text-gray-100 hover:text-orange-200 hover:underline"
                        >
                          {post.title}
                        </a>
                        <ExternalLink className="h-3 w-3 flex-shrink-0 text-orange-300" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <Badge
                          variant="outline"
                          className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${getSentimentColor(post.sentiment)}`}
                        >
                          {post.sentiment}
                        </Badge>
                        <span>{post.score.toLocaleString()} upvotes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingAnalysis;


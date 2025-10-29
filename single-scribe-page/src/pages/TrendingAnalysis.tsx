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

// API Base URL - change this to match your backend
const API_BASE_URL = "http://localhost:8000";

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
  const [topN, setTopN] = useState(5);
  
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
      const response = await fetch(`${API_BASE_URL}/api/trending/analyze`, {
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
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Trending Topics
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time sentiment analysis of what's trending on Reddit
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="components"
                checked={analyzeComponents}
                onCheckedChange={setAnalyzeComponents}
              />
              <Label htmlFor="components" className="text-sm">
                Component Analysis
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => fetchTrendingTopics(true)}
                disabled={loading}
                className="gap-2"
                variant="default"
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
                  className="gap-2"
                >
                  Clear Cache ({Object.keys(dataCache).length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
        >
          <TabsList className="grid grid-cols-7 w-full">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="gap-1">
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6 space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
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
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="gap-1">
                      📦 Cached Data
                    </Badge>
                    <span className="text-xs">
                      Click Refresh to fetch latest
                    </span>
                  </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Topics Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {trendingData.total_topics_found}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Time Window
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {trendingData.time_window_hours}h
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold capitalize">
                        {trendingData.category}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Last Updated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Enhanced Rank Badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-sm opacity-75"></div>
                <Badge className="relative bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 text-lg font-bold px-4 py-2 shadow-lg">
                  #{topic_info.rank}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {topic_info.topic}
              </CardTitle>
            </div>
            
            {topic_info.variants && topic_info.variants.length > 1 && (
              <CardDescription className="ml-16">
                <span className="text-sm">Also known as:</span> {topic_info.variants.filter(v => v !== topic_info.topic).join(", ")}
              </CardDescription>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-sm px-3 py-1 shadow-md">
              <Flame className="h-3 w-3 mr-1" />
              {topic_info.trending_strength.toFixed(0)}% Hot
            </Badge>
            {topic.trending_duration_hours && (
              <Badge variant="outline" className="gap-1 bg-white">
                <Clock className="h-3 w-3" />
                Active {topic.trending_duration_hours.toFixed(1)}h
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 mt-6">
        {/* Trending Strength Visualization */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Trending Strength</p>
                <p className="text-sm text-gray-600">Popularity momentum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {topic_info.trending_strength.toFixed(0)}%
              </p>
              {topic.trending_duration_hours && (
                <p className="text-xs text-gray-600 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" />
                  Active for {topic.trending_duration_hours.toFixed(1)}h
                </p>
              )}
            </div>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${Math.min(topic_info.trending_strength, 100)}%` }}
            >
              {topic_info.trending_strength > 20 && (
                <Zap className="h-3 w-3 text-white animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Posts */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium text-blue-900">Posts</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{topic_info.post_count}</p>
            <p className="text-xs text-blue-700 mt-1">Total discussions</p>
          </div>

          {/* Score */}
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium text-purple-900">Score</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{topic_info.total_score.toLocaleString()}</p>
            <p className="text-xs text-purple-700 mt-1">Total upvotes</p>
          </div>

          {/* Comments */}
          <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-pink-500 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium text-pink-900">Comments</p>
            </div>
            <p className="text-2xl font-bold text-pink-900">{topic_info.total_comments.toLocaleString()}</p>
            <p className="text-xs text-pink-700 mt-1">Total engagements</p>
          </div>

          {/* Velocity */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-medium text-amber-900">Velocity</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">{topic_info.avg_velocity.toFixed(1)}</p>
            <p className="text-xs text-amber-700 mt-1">Engagement/hour</p>
          </div>
        </div>

        {/* Subreddits */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Trending in {topic_info.subreddit_count} subreddit(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {topic_info.subreddits.map((sub) => (
              <Badge key={sub} variant="secondary">
                r/{sub}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sentiment Analysis with Pie Chart */}
        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sentiment Distribution
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64 flex items-center justify-center">
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
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div className="space-y-3">
              {/* Positive */}
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500 rounded-full">
                      <ThumbsUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Positive</p>
                      <p className="text-xs text-green-700">Optimistic responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">{sentiment_analysis.positive}</p>
                    <p className="text-xs text-green-700">{percentages.positive.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Negative */}
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-500 rounded-full">
                      <ThumbsDown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Negative</p>
                      <p className="text-xs text-red-700">Critical responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-900">{sentiment_analysis.negative}</p>
                    <p className="text-xs text-red-700">{percentages.negative.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Neutral */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-500 rounded-full">
                      <Minus className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Neutral</p>
                      <p className="text-xs text-gray-700">Balanced responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{sentiment_analysis.neutral}</p>
                    <p className="text-xs text-gray-700">{percentages.neutral.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Analysis */}
        {component_analysis && component_analysis.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Component Analysis
              </p>
              <div className="grid gap-3">
                {component_analysis.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${getSentimentColor(comp.sentiment)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(comp.sentiment)}
                        <span className="font-medium capitalize">{comp.component}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {comp.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{comp.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{comp.mention_count} mentions
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sample Posts */}
        {sample_posts && sample_posts.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3">Top Posts</p>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {sample_posts.slice(0, 5).map((post, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline flex-1 line-clamp-2"
                        >
                          {post.title}
                        </a>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getSentimentColor(post.sentiment)}`}
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


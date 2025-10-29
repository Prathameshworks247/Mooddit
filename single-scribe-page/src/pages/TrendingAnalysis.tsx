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
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// API Base URL - change this to match your backend
const API_BASE_URL = "http://localhost:8000";

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
  const [topN, setTopN] = useState(10);

  const fetchTrendingTopics = async () => {
    // Prevent multiple simultaneous requests
    if (loading) return;
    
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
      setTrendingData(data);
      
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
            
            <Button
              onClick={fetchTrendingTopics}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          value={selectedCategory} 
          onValueChange={(value) => {
            setSelectedCategory(value);
            // Trigger fetch when category changes
            setTimeout(() => fetchTrendingTopics(), 100);
          }}
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
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-lg font-bold">
                #{topic_info.rank}
              </Badge>
              <CardTitle className="text-2xl">{topic_info.topic}</CardTitle>
            </div>
            
            {topic_info.variants && topic_info.variants.length > 1 && (
              <CardDescription>
                Also: {topic_info.variants.filter(v => v !== topic_info.topic).join(", ")}
              </CardDescription>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-primary/10 text-primary">
              {topic_info.trending_strength.toFixed(0)}% Trending
            </Badge>
            {topic.trending_duration_hours && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {topic.trending_duration_hours.toFixed(1)}h
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Posts</p>
              <p className="font-semibold">{topic_info.post_count}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-semibold">{topic_info.total_score.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Comments</p>
              <p className="font-semibold">{topic_info.total_comments.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Velocity</p>
              <p className="font-semibold">{topic_info.avg_velocity.toFixed(1)}</p>
            </div>
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

        {/* Sentiment Analysis */}
        <div>
          <p className="text-sm font-medium mb-3">Sentiment Distribution</p>
          
          <div className="space-y-3">
            {/* Positive */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  Positive
                </span>
                <span className="font-medium">
                  {sentiment_analysis.positive} ({percentages.positive.toFixed(1)}%)
                </span>
              </div>
              <Progress value={percentages.positive} className="h-2 bg-green-100" />
            </div>

            {/* Negative */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  Negative
                </span>
                <span className="font-medium">
                  {sentiment_analysis.negative} ({percentages.negative.toFixed(1)}%)
                </span>
              </div>
              <Progress value={percentages.negative} className="h-2 bg-red-100" />
            </div>

            {/* Neutral */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Minus className="h-3 w-3 text-gray-600" />
                  Neutral
                </span>
                <span className="font-medium">
                  {sentiment_analysis.neutral} ({percentages.neutral.toFixed(1)}%)
                </span>
              </div>
              <Progress value={percentages.neutral} className="h-2 bg-gray-100" />
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


import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PredictionChart } from "@/components/used/charts/Prediction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LuSend } from "react-icons/lu";
import { Sidebar } from "@/components/used/sidebar";
import {
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  TrendingUp,
  Loader2,
  Sparkles,
  TrendingDown,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  first?: boolean;
  // posts?: Post[];
}

interface Post {
  title: string;
  url: string;
  sentiment: string;
  selftext: string;
  score: 286;
  created_utc: string;
}

interface PredictionPoint {
  timestamp: string;
  hours_ahead: number;
  predicted_sentiment_score: number;
  predicted_sentiment_ratio: number;
  predicted_sentiment: string;
  confidence: number;
}

interface HistoricalSummary {
  total_posts_analyzed: number;
  time_range_hours: number;
  current_sentiment: {
    score: number;
    ratio: number;
  };
  average_sentiment: {
    score: number;
    ratio: number;
  };
  trend: string;
}

interface PredictionData {
  query: string;
  predictions: PredictionPoint[];
  historical_summary: HistoricalSummary;
  prediction_method: string;
  interval_hours: number;
  generated_at: string;
}

interface SentimentDistribution {
  name: string;
  value: number;
  percentage: number;
}

interface SentimentOverTime {
  timestamp: string;
  date: string;
  time: string;
  average_sentiment: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_posts: number;
}

interface PostsOverTime {
  timestamp: string;
  date: string;
  time: string;
  posts: number;
}

interface SentimentPostsOverTime {
  timestamp: string;
  date: string;
  time: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface ChartData {
  query: string;
  total_posts: number;
  time_window_hours: number;
  actual_time_range_hours?: number;
  first_post_time?: string;
  last_post_time?: string;
  sentiment_distribution: SentimentDistribution[];
  sentiment_over_time: SentimentOverTime[];
  posts_over_time: PostsOverTime[];
  sentiment_posts_over_time: SentimentPostsOverTime[];
}

const Main = () => {
  const singleReqRef = useRef<boolean>(false);

  const { state } = useLocation();
  const prompt = state.prompt ?? "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    },
  ]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(
    null
  );
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(false);

  // const handleSend = () => {
  //   if (!input.trim()) return;

  //   setMessages([
  //     ...messages,
  //     {
  //       id: crypto.randomUUID(),
  //       role: "user",
  //       content: input,
  //     },
  //   ]);
  //   setInput("");

  //   // Simulate AI response
  //   setTimeout(() => {
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         id: crypto.randomUUID(),
  //         role: "assistant",
  //         content:
  //           "This is a simulated response. Connect to an AI service to enable real conversations.",
  //       },
  //     ]);
  //   }, 500);
  // };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSend();
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${getApiBaseUrl()}/api/rag`, {
          query: prompt,
          question: ".",
          limit: 100,
          time_window_hours: 48,
          include_context: true,
          conversation_history: [
            {
              question: "string",
              answer: "string",
              components: ["string"],
            },
          ],
        });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: (response.data as { answer: string }).answer,
            first: true,
          },
        ]);
        setPosts((response.data as { source_posts: Post[] }).source_posts);
      } catch (e: unknown) {
        const msg =
          axios.isAxiosError(e) && e.response?.data?.detail
            ? typeof e.response.data.detail === "string"
              ? e.response.data.detail
              : "Request failed"
            : "Failed to load. Try again in a few minutes.";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Sorry, ${msg}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (!singleReqRef.current) {
      fetchData();
      singleReqRef.current = true;
    }
  }, [prompt]);

  const handleSend = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
      },
    ]);
    setInput("");
    setLoading(true);
    try {
      const response = await axios.post(`${getApiBaseUrl()}/api/rag`, {
        query: prompt,
        question: input,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: (response.data as { answer: string }).answer,
          first: false,
        },
      ]);
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.detail
          ? typeof e.response.data.detail === "string"
            ? e.response.data.detail
            : "Request failed"
          : "Something went wrong. Try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoadingPrediction(true);
    setShowPredictionModal(true);
    try {
      const response = await axios.post(`${getApiBaseUrl()}/api/predict`, {
        query: prompt,
        time_window_hours: 48,
        hours_ahead: 12,
        interval_hours: 3,
        method: "hybrid",
      });
      setPredictionData(response.data as PredictionData);
    } catch (e) {
      console.error("Prediction error:", e);
      setPredictionData(null);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleShowCharts = async () => {
    if (chartData) return; // Don't reload if already loaded

    setLoadingCharts(true);
    try {
      const response = await axios.post(`${getApiBaseUrl()}/api/charts`, {
        query: prompt,
        limit: 300,
        time_window_hours: 48,
        interval_hours: 3,
        trim_empty_intervals: true,
      });
      setChartData(response.data as ChartData);
    } catch (e) {
      console.error("Charts error:", e);
      setChartData(null);
    } finally {
      setLoadingCharts(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <header className="flex flex-row justify-between items-center border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Sentiment Analysis
            </h1>
            <p className="text-xs text-gray-400">
              Ask me anything about {prompt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePredict}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Predict Trends
          </Button>
          <Sidebar
            chartData={chartData}
            loading={loadingCharts}
            onLoadCharts={handleShowCharts}
          />
        </div>
      </header>
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center pt-20">
              <Sparkles className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-white">
                How can I help you today?
              </h2>
              <p className="text-sm text-gray-400">
                Start a conversation by typing a message below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {messages.map((message, index) => (
                <Message
                  first={message.first}
                  key={index}
                  role={message.role}
                  content={message.content}
                  posts={posts}
                  loading={loading && index === messages.length - 1}
                />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span className="text-sm text-gray-300">
                      Analyzing sentiment...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sentiment, trends, or specific aspects..."
              className="min-h-[100px] resize-none pr-12 text-base bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
              disabled={!input.trim() || loading}
              onClick={handleSend}
            >
              <LuSend size={20} strokeWidth={3} color="white" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Ask follow-up questions about the sentiment analysis
          </p>
        </div>
      </div>

      {/* Prediction Modal */}
      <Dialog open={showPredictionModal} onOpenChange={setShowPredictionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sentiment Predictions for "{prompt}"
            </DialogTitle>
          </DialogHeader>

          {loadingPrediction ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
              <p className="text-gray-400">
                Analyzing trends and generating predictions...
              </p>
            </div>
          ) : predictionData ? (
            <div className="space-y-6">
              {/* Historical Summary */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-white">
                      Historical Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        Posts Analyzed
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {predictionData.historical_summary.total_posts_analyzed}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Time Range</p>
                      <p className="text-2xl font-bold text-white">
                        {predictionData.historical_summary.time_range_hours.toFixed(
                          1
                        )}
                        h
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        Current Score
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          predictionData.historical_summary.current_sentiment
                            .score > 0
                            ? "text-green-400"
                            : predictionData.historical_summary
                                .current_sentiment.score < 0
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {predictionData.historical_summary.current_sentiment.score.toFixed(
                          3
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Trend</p>
                      <div className="flex items-center gap-2">
                        {predictionData.historical_summary.trend ===
                        "increasing" ? (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        ) : predictionData.historical_summary.trend ===
                          "decreasing" ? (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        ) : (
                          <Activity className="h-5 w-5 text-gray-400" />
                        )}
                        <p className="text-sm font-semibold text-white capitalize">
                          {predictionData.historical_summary.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="max-w-4xl mx-auto">
                <PredictionChart predictionsData={predictionData.predictions} />
              </div>
              {/* Footer Info */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">
                      These predictions are based on analyzing{" "}
                      <span className="font-semibold text-white">
                        {predictionData.historical_summary.total_posts_analyzed}{" "}
                        posts
                      </span>{" "}
                      over the last{" "}
                      <span className="font-semibold text-white">
                        {predictionData.historical_summary.time_range_hours.toFixed(
                          1
                        )}{" "}
                        hours
                      </span>{" "}
                      using the{" "}
                      <span className="font-semibold text-purple-400">
                        {predictionData.prediction_method}
                      </span>{" "}
                      method.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Generated at{" "}
                      {new Date(predictionData.generated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <TrendingDown className="h-12 w-12 text-red-500" />
              <p className="text-gray-400">
                Failed to generate predictions. Please try again.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function Message({
  role,
  content,
  posts,
  first,
  loading,
}: {
  role: "user" | "assistant";
  content: string;
  posts: Post[];
  first?: boolean;
  loading?: boolean;
}) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "negative":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <>
      {role === "user" ? (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <p className="text-[15px] whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-start items-start gap-6 w-full">
          <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-100 shadow-xl">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-bold mb-4 text-white"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-semibold mb-3 text-white"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-medium mb-2 text-gray-200"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-[15px] mb-2 text-gray-300 leading-relaxed"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc list-inside mb-2 space-y-1"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-inside mb-2 space-y-1"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-[15px] text-gray-300" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-orange-400 hover:text-orange-300 hover:underline"
                    {...props}
                  />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-gray-900 px-1.5 py-0.5 rounded text-orange-400"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-white font-semibold" {...props} />
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
          {first && posts && posts.length > 0 && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">
                  Related Reddit Posts
                </h3>
                <Badge
                  variant="outline"
                  className="bg-gray-800 text-gray-300 border-gray-700"
                >
                  {posts.length} posts
                </Badge>
              </div>
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex flex-row gap-4 pb-2">
                  {posts.map((post, index) => (
                    <Card
                      key={index}
                      className="flex-shrink-0 w-[320px] bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10 group"
                    >
                      <CardContent className="p-5 flex flex-col h-full gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            className={`${getSentimentColor(
                              post.sentiment
                            )} border text-xs capitalize`}
                          >
                            {post.sentiment}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{post.score}</span>
                          </div>
                        </div>

                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col gap-2 flex-1"
                        >
                          <h4 className="text-base text-white font-semibold line-clamp-3 leading-snug group-hover:text-orange-400 transition-colors">
                            {post.title}
                          </h4>

                          {post.selftext && (
                            <p className="text-sm text-gray-400 line-clamp-3 flex-1">
                              {post.selftext}
                            </p>
                          )}

                          <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mt-auto">
                            <span>Read on Reddit</span>
                            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Main;

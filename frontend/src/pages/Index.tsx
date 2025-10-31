import { useState } from "react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaArrowUpLong } from "react-icons/fa6";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    navigate("/main", { state: { prompt: prompt } });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
        {/* Hero Content */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Reddit Sentiment Analysis
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover what's trending on Reddit with real-time AI-powered sentiment analysis across multiple categories
          </p>
        </div>

        {/* Textarea Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-xl opacity-30 transition-opacity duration-500" />
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a topic to analyze... (e.g., 'iPhone 17', 'Climate Change', 'AI Technology')"
              className="pl-5 pr-10 py-3 resize-none text-sm sm:text-base md:text-lg bg-card/50 backdrop-blur-xl border-border/50 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50"
              rows={4}
            />
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 absolute right-3 bottom-3 bg-slate-800 hover:bg-slate-700 rounded-full duration-200"
            >
              <FaArrowUpLong className="size-4" strokeWidth={4} color="white" />
            </button>
          </div>
        </div>

        {/* Optional: Action Hint */}
        <p className="text-center text-sm text-muted-foreground/70">
          Press Enter to analyze sentiment
        </p>

        {/* Quick Actions */}
        <div className="pt-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Or explore trending topics
          </p>
          <div className="flex justify-center">
            <Link to="/trending" className="w-full max-w-md">
              <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Trending Analysis</CardTitle>
                  <CardDescription>
                    Discover what's trending on Reddit with AI-powered sentiment analysis
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;

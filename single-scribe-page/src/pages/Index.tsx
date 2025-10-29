import { useState } from "react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaArrowUpLong } from "react-icons/fa6";
import { TrendingUp, BarChart3, MessageSquare } from "lucide-react";

const Index = () => {
  const [prompt, setPrompt] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
        {/* Hero Content */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Build with AI
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe what you want to create, and watch it come to life
            instantly
          </p>
        </div>

        {/* Textarea Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-xl opacity-30 transition-opacity duration-500" />
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your idea... (e.g., 'Create a modern dashboard with analytics charts')"
              className="pl-5 pr-10 py-3 resize-none text-sm sm:text-base md:text-lg bg-card/50 backdrop-blur-xl border-border/50 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50"
              rows={4}
            />
            <button className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 absolute right-3 bottom-3 bg-slate-800 hover:bg-slate-700 rounded-full duration-200">
              <FaArrowUpLong className="size-4" strokeWidth={4} color="white" />
            </button>
          </div>
        </div>

        {/* Optional: Action Hint */}
        <p className="text-center text-sm text-muted-foreground/70">
          Press Enter to start creating
        </p>

        {/* Quick Actions */}
        <div className="pt-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Or explore our features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/trending">
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

            <Card className="cursor-pointer opacity-50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Chart Analysis</CardTitle>
                <CardDescription>
                  Visualize sentiment trends over time (Coming soon)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer opacity-50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">RAG Q&A</CardTitle>
                <CardDescription>
                  Ask questions about sentiment data (Coming soon)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;

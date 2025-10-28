import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FaArrowUpLong } from "react-icons/fa6";

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
      </div>
    </main>
  );
};

export default Index;

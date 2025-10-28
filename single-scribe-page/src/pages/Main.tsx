import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuSend } from "react-icons/lu";
import { MdOutlineArrowOutward } from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Feb", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Mar", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Apr", uv: 2780, pv: 3908, amt: 2000 },
  { name: "May", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Jun", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Jul", uv: 3490, pv: 4300, amt: 2100 },
];

const posts = [
  {
    title: "very happy!",
    url: "https://i.redd.it/z3up10n5gxxf1.jpeg",
    selftext: "home tester is stepping up their game!",
    created_utc: "2025-10-28T22:16:07",
    score: 5,
    subreddit: "freebietalk",
    sentiment_label: "positive",
    sentiment_score: 1,
  },
  {
    title: "iPhone 17 Sage or White?",
    url: "https://www.reddit.com/r/iphone/comments/1oin82g/iphone_17_sage_or_white/",
    selftext: "Which one you would choose?",
    created_utc: "2025-10-28T22:14:44",
    score: 1,
    subreddit: "iphone",
    sentiment_label: "neutral",
    sentiment_score: 0,
  },
  {
    title: "very happy!",
    url: "https://i.redd.it/z3up10n5gxxf1.jpeg",
    selftext: "home tester is stepping up their game!",
    created_utc: "2025-10-28T22:16:07",
    score: 5,
    subreddit: "freebietalk",
    sentiment_label: "positive",
    sentiment_score: 1,
  },
  {
    title: "iPhone 17 Sage or White?",
    url: "https://www.reddit.com/r/iphone/comments/1oin82g/iphone_17_sage_or_white/",
    selftext: "Which one you would choose?",
    created_utc: "2025-10-28T22:14:44",
    score: 1,
    subreddit: "iphone",
    sentiment_label: "neutral",
    sentiment_score: 0,
  },
  {
    title: "very happy!",
    url: "https://i.redd.it/z3up10n5gxxf1.jpeg",
    selftext: "home tester is stepping up their game!",
    created_utc: "2025-10-28T22:16:07",
    score: 5,
    subreddit: "freebietalk",
    sentiment_label: "positive",
    sentiment_score: 1,
  },
  {
    title: "iPhone 17 Sage or White?",
    url: "https://www.reddit.com/r/iphone/comments/1oin82g/iphone_17_sage_or_white/",
    selftext: "Which one you would choose?",
    created_utc: "2025-10-28T22:14:44",
    score: 1,
    subreddit: "iphone",
    sentiment_label: "neutral",
    sentiment_score: 0,
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  // posts?: Post[];
}

const Main = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
      },
    ]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "This is a simulated response. Connect to an AI service to enable real conversations.",
        },
      ]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <h1 className="text-lg font-semibold text-foreground">Chat</h1>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground pt-20">
              <h2 className="text-2xl font-semibold mb-2">
                How can I help you today?
              </h2>
              <p className="text-sm">
                Start a conversation by typing a message below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="min-h-[90px] resize-none pr-12 text-base placeholder:text-muted-foreground/50 focus-visible:outline-1"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="absolute right-2 bottom-2 h-9 w-9 rounded-md"
              disabled={!input.trim()}
            >
              <LuSend size={30} strokeWidth={3} color="white" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

function Message({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <>
      {role === "user" ? (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-900 text-white">
            <p className="text-[15px] whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-start items-start gap-8">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground">
            <p className="text-[15px] whitespace-pre-wrap">{content}</p>
          </div>
          <button className="text-base text-blue-700 hover:text-blue-500 duration-150">
            Show Dashboard
          </button>
          <div className="w-full flex flex-col gap-4">
            <p className="">Related Reddit Posts:</p>
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex flex-row gap-6">
                {posts.map((post, index) => (
                  <a href={post.url} target="_blank" key={index}>
                    <div className="relative flex flex-col justify-between bg-[#383838] w-[250px] h-[150px] rounded-2xl py-4 border border-solid border-gray-400">
                      <p className="text-lg text-white font-semibold line-clamp-2 pl-4 pr-8">
                        {post.title}
                      </p>
                      <p className="text-sm text-white font-light line-clamp-2 px-4">
                        {post.selftext}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

{
  /* <a href={posts[0].url} target="_blank">
  <div className="relative flex flex-col justify-between bg-[#383838] w-[250px] h-[150px] rounded-2xl py-4 border border-solid border-gray-400">
    <p className="text-lg text-white font-semibold line-clamp-2 pl-4 pr-8">
      {posts[0].title}
    </p>
    <p className="text-sm text-white font-light line-clamp-2 px-4">
      {posts[0].selftext}
    </p>
  </div>
</a> */
}

const SimpleLineChart = () => {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Main;

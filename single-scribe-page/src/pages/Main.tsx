import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuSend } from "react-icons/lu";
import { Sidebar } from "@/components/used/sidebar";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import axios from "axios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

const Main = () => {
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
        const response = await axios.post("http://localhost:8001/chat", {
          message: prompt,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: (response.data as { answer: string }).answer,
          },
        ]);
        setPosts((response.data as { source_posts: Post[] }).source_posts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [prompt]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex flex-row justify-between items-center border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Chat</h1>
        <Sidebar />
      </header>
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
                  posts={posts}
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
              // onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="min-h-[100px] resize-none pr-12 text-base placeholder:text-muted-foreground/50 focus-visible:outline-1"
            />
            <Button
              // onClick={handleSend}
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
  posts,
}: {
  role: "user" | "assistant";
  content: string;
  posts: Post[];
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
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-semibold mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-medium mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-[15px] mb-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-[15px]" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-400 hover:underline" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-gray-700 px-1 rounded" {...props} />
                ),
              }}
            >
              {content}
            </Markdown>
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

export default Main;

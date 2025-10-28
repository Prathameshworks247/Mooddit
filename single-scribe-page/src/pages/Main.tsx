import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LuSend } from "react-icons/lu";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Main = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
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
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground">
            <p className="text-[15px] whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Main;

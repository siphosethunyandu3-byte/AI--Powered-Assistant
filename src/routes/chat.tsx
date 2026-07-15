import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Cortex" },
      { name: "description", content: "Chat with your workplace AI copilot." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Rewrite this Slack message to be more diplomatic…",
  "Help me structure a 1:1 agenda with my manager",
  "Brainstorm three angles for a product launch memo",
  "What questions should I ask in a vendor evaluation?",
];

function ChatPage() {
  const fn = useServerFn(chat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border/60 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Cortex Assistant</div>
            <div className="text-[11px] text-muted-foreground">Your workplace copilot</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="pt-12 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2
                className="text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                How can I help you today?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask about drafts, plans, meetings, or anything work-adjacent.
              </p>
              <div className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-lg shadow-primary/10">
                  {m.content}
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              Thinking…
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/60 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card flex items-end gap-2 p-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Message Cortex…"
              className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Cortex can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  Mail,
  FileText,
  CalendarClock,
  Search,
  Sparkles,
  TrendingUp,
  Command,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/lib/ai.functions";
import { trackGeneration } from "@/lib/generations";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Cortex Copilot — AI Workplace Assistant" },
      { name: "description", content: "Your AI teammate for work. Ask anything." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const CARDS = [
  {
    icon: Mail,
    label: "Draft Email",
    emoji: "📧",
    description: "Craft a polished follow-up",
    prompt:
      "Draft a professional follow-up email after a client meeting. The client is interested in CHULUMANCO LUXE luxury perfumes. Keep the tone premium and friendly. Include a call to action.",
  },
  {
    icon: FileText,
    label: "Meeting Notes",
    emoji: "📝",
    description: "Turn notes into action items",
    prompt:
      "Summarize these meeting notes into action items with owners and deadlines. Format it as a clean checklist.\n\nPaste your meeting transcript below:\n",
  },
  {
    icon: CalendarClock,
    label: "Plan Week",
    emoji: "📊",
    description: "Prioritize Mon–Fri",
    prompt:
      "Help me plan my week. I need to focus on marketing, product listings, and customer service. Create a prioritized task list for Mon-Fri.",
  },
  {
    icon: Search,
    label: "Research Topic",
    emoji: "🔍",
    description: "Get 5 sharp insights",
    prompt:
      "Research the latest trends in luxury perfumes and smartwatches for 2026. Give me 5 key insights I can use for marketing.",
  },
];

const INTEGRATIONS = [
  { name: "Gmail", color: "from-red-500 to-orange-500" },
  { name: "Slack", color: "from-purple-500 to-pink-500" },
  { name: "Google Calendar", color: "from-blue-500 to-cyan-500" },
  { name: "Notion", color: "from-neutral-400 to-neutral-600" },
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
      trackGeneration("chat");
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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-blue-400/40 to-purple-300/60 blur-[2px]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Cortex Copilot</div>
              <div className="text-[11px] text-muted-foreground">Your AI teammate for work</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300 sm:flex">
            <TrendingUp className="h-3.5 w-3.5" />
            You saved 2.5 hours this week with AI
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="pt-8 text-center">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/40 ring-1 ring-white/10">
                <div className="h-full w-full rounded-full bg-gradient-to-tr from-blue-400/40 to-purple-300/60 blur-sm" />
              </div>
              <h2 className="text-4xl font-semibold tracking-tight">Cortex Copilot</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your AI teammate for work. Ask me anything.
              </p>

              <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
                {CARDS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => send(c.prompt)}
                    disabled={loading}
                    className="group relative flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-card hover:shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-lg ring-1 ring-indigo-400/20">
                      {c.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold tracking-tight">{c.label}</span>
                        <Sparkles className="h-3 w-3 text-indigo-400 opacity-70" />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-lg shadow-primary/10">
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
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:300ms]" />
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
              placeholder="Ask anything — ⌘K for actions"
              className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={loading}
            />
            <div className="hidden items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
              <Command className="h-3 w-3" />K
            </div>
            <Button
              size="icon"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <span className="opacity-70">Connects with</span>
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full bg-gradient-to-br ${i.color}`}
                  aria-hidden
                />
                <span>{i.name}</span>
              </div>
            ))}
          </div>

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Cortex can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

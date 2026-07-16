import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Mail,
  Send,
  Reply,
  HeartHandshake,
  Sparkles,
  Calendar,
  Users,
  ThumbsUp,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { AiOutput } from "@/components/AiOutput";
import { generateEmail } from "@/lib/ai.functions";
import { trackGeneration } from "@/lib/generations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Cortex" },
      {
        name: "description",
        content: "Draft professional emails in seconds — choose formal, friendly, or persuasive.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "friendly" | "persuasive" | "concise" | "apologetic";

type Template = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  context: string;
};

const TEMPLATES: Template[] = [
  {
    id: "follow-up",
    label: "Follow-up",
    description: "Nudge after a meeting or unanswered thread.",
    icon: Reply,
    tone: "concise",
    context:
      "Follow up on our recent conversation about [topic]. Politely remind them of the next step, restate the value, and ask for a response or decision by [date].",
  },
  {
    id: "apology",
    label: "Apology",
    description: "Own a mistake and rebuild trust.",
    icon: HeartHandshake,
    tone: "apologetic",
    context:
      "Apologize sincerely for [what went wrong]. Acknowledge the impact on the recipient, explain briefly what happened without excuses, and outline the concrete steps being taken to fix it.",
  },
  {
    id: "outreach",
    label: "Cold outreach",
    description: "Introduce yourself and open a conversation.",
    icon: Sparkles,
    tone: "persuasive",
    context:
      "Introduce myself to [recipient] at [company]. Reference a specific reason I'm reaching out (recent news, mutual connection, or their work), share one concise sentence about the value I can offer, and propose a short intro call.",
  },
  {
    id: "meeting-request",
    label: "Meeting request",
    description: "Propose a time and set a clear agenda.",
    icon: Calendar,
    tone: "formal",
    context:
      "Request a 30-minute meeting to discuss [topic]. Suggest 2-3 time options, note the agenda in 2-3 bullet points, and mention who else should attend.",
  },
  {
    id: "intro",
    label: "Warm introduction",
    description: "Connect two people with context.",
    icon: Users,
    tone: "friendly",
    context:
      "Introduce [person A] to [person B]. Briefly explain who each person is, why the connection is valuable to both, and hand the thread off for them to take it from here.",
  },
  {
    id: "thank-you",
    label: "Thank you",
    description: "Show genuine appreciation.",
    icon: ThumbsUp,
    tone: "friendly",
    context:
      "Thank [recipient] for [what they did]. Be specific about the impact it had, keep it warm and personal, and close with an open door for the future.",
  },
  {
    id: "decline",
    label: "Polite decline",
    description: "Say no gracefully without burning bridges.",
    icon: XCircle,
    tone: "formal",
    context:
      "Decline [the request or invitation] respectfully. Thank them for considering me, give a brief honest reason, and leave the door open for future collaboration where appropriate.",
  },
  {
    id: "status-update",
    label: "Status update",
    description: "Share progress with stakeholders.",
    icon: Clock,
    tone: "concise",
    context:
      "Share a status update on [project]. Cover progress since last update, current blockers, next milestones with dates, and any decisions needed from the recipient.",
  },
];

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const applyTemplate = (t: Template) => {
    setActiveTemplate(t.id);
    setTone(t.tone);
    setContext(t.context);
    toast.success(`Loaded "${t.label}" template`);
  };

  const submit = async () => {
    if (!context.trim()) {
      toast.error("Describe what the email should say.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await fn({ data: { context, tone, recipient: recipient || undefined } });
      setOutput(res.text);
      trackGeneration("email");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <PageHeader
        icon={Mail}
        eyebrow="Communication"
        title="Smart Email Generator"
        description="Describe the situation. Cortex will craft a polished draft in your chosen tone."
      />

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Template gallery
          </h2>
          <span className="text-xs text-muted-foreground">
            Start from a saved style — edit before sending.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            const active = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className={cn(
                  "glass-card group flex flex-col items-start gap-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40",
                  active && "border-primary/60 ring-1 ring-primary/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground transition-colors group-hover:text-primary",
                    active && "text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium text-foreground">{t.label}</div>
                <div className="text-xs leading-snug text-muted-foreground">
                  {t.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. Sarah, Head of Product"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">What should this email say?</Label>
            <Textarea
              id="context"
              rows={10}
              placeholder="e.g. Follow up on the Q3 pricing proposal we discussed Tuesday. Ask for a decision by Friday and offer to jump on a call."
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                if (activeTemplate) setActiveTemplate(null);
              }}
            />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {loading ? "Drafting…" : "Draft email"}
          </Button>
        </div>
        <AiOutput content={output} loading={loading} placeholder="Your drafted email will appear here." />
      </div>
    </div>
  );
}

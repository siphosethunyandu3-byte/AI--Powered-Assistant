import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, Sparkles, MessageSquare, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const features = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    body: "Draft polished emails in formal, friendly, or persuasive tones — with a subject line ready to send.",
  },
  {
    to: "/notes" as const,
    icon: FileText,
    title: "Meeting Notes Summarizer",
    body: "Turn raw transcripts into decisions, action items, and deadlines you can act on today.",
  },
  {
    to: "/planner" as const,
    icon: CalendarClock,
    title: "AI Task Planner",
    body: "Prioritize your workload and generate a time-blocked day or week plan in seconds.",
  },
  {
    to: "/research" as const,
    icon: Sparkles,
    title: "Research Assistant",
    body: "Get a concise briefing on any topic with key insights, trends, and recommendations.",
  },
  {
    to: "/chat" as const,
    icon: MessageSquare,
    title: "AI Assistant",
    body: "A conversational copilot for the messy in-between — brainstorm, rewrite, or think out loud.",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <div className="mb-12 max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
          WORKPLACE INTELLIGENCE
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Your quiet advantage
          <br />
          <span className="italic text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>
            at work.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Cortex is an AI workspace for professionals — draft communication, distill meetings, and
          orchestrate your week without switching tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group glass-card relative overflow-hidden p-6 transition-all hover:border-primary/40 hover:bg-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border/60 bg-card/40 px-5 py-4 text-xs leading-relaxed text-muted-foreground backdrop-blur">
        <strong className="text-foreground/90">Responsible AI notice.</strong> Cortex uses large
        language models that can make mistakes or generate biased content. Review outputs before
        sending, sharing, or making decisions — especially anything involving people, finance, or
        legal matters. Do not paste confidential data you are not authorized to share with a
        third-party AI provider.
      </div>
    </div>
  );
}

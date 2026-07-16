import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Zap,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerations, TOOL_LABELS, type Tool } from "@/lib/generations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Cortex AI Workplace" },
      {
        name: "description",
        content: "Your Cortex activity, generation stats, and productivity insights at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const features: {
  to: "/email" | "/notes" | "/planner" | "/research" | "/chat";
  tool: Tool;
  icon: typeof Mail;
  title: string;
  body: string;
}[] = [
  { to: "/email", tool: "email", icon: Mail, title: "Smart Email Generator", body: "Draft polished emails in seconds." },
  { to: "/notes", tool: "notes", icon: FileText, title: "Meeting Notes", body: "Distill transcripts into decisions." },
  { to: "/planner", tool: "planner", icon: CalendarClock, title: "Task Planner", body: "Time-block your day or week." },
  { to: "/research", tool: "research", icon: Sparkles, title: "Research", body: "Briefings, insights, next steps." },
  { to: "/chat", tool: "chat", icon: MessageSquare, title: "Assistant", body: "Conversational copilot for work." },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function Dashboard() {
  const { entries, reset } = useGenerations();

  const total = entries.length;

  const perTool: Record<Tool, number> = {
    email: 0,
    notes: 0,
    planner: 0,
    research: 0,
    chat: 0,
  };
  for (const e of entries) perTool[e.tool] = (perTool[e.tool] || 0) + 1;
  const maxTool = Math.max(1, ...Object.values(perTool));

  // Last 7 days
  const today = startOfDay(new Date());
  const days: { label: string; count: number; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d,
      count: 0,
    });
  }
  for (const e of entries) {
    const d = startOfDay(new Date(e.ts));
    const idx = days.findIndex((x) => x.date.getTime() === d.getTime());
    if (idx >= 0) days[idx].count++;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const weekTotal = days.reduce((s, d) => s + d.count, 0);

  // simple estimate: 2 minutes saved per generation
  const minutesSaved = total * 2;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
            OVERVIEW
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your workspace,
            <br />
            <span className="italic text-primary" style={{ fontFamily: "var(--font-display)" }}>
              in motion.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Track how much Cortex is doing for you — across email, meetings, planning, and research.
          </p>
        </div>
        {total > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Reset stats
          </Button>
        )}
      </div>

      {/* Stat tiles */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Zap} label="Total generations" value={total} accent />
        <StatTile icon={TrendingUp} label="This week" value={weekTotal} />
        <StatTile icon={CalendarClock} label="Hours saved" value={`${hoursSaved}h`} sub="≈ 2 min / generation" />
        <StatTile
          icon={Sparkles}
          label="Most used"
          value={
            total === 0
              ? "—"
              : TOOL_LABELS[
                  (Object.entries(perTool).sort((a, b) => b[1] - a[1])[0]?.[0] as Tool) || "chat"
                ]
          }
          small
        />
      </div>

      {/* Charts */}
      <div className="mb-10 grid gap-4 lg:grid-cols-5">
        {/* 7-day bars */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Last 7 days</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Daily generations across every tool
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Peak: <span className="text-foreground font-medium">{maxDay}</span>
            </div>
          </div>
          <div className="flex h-44 items-end gap-2.5">
            {days.map((d, i) => {
              const pct = (d.count / maxDay) * 100;
              const isToday = i === days.length - 1;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-full w-full items-end">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-primary to-primary/60 shadow-[0_0_20px] shadow-primary/40"
                          : "bg-gradient-to-t from-primary/70 to-primary/30"
                      } ${d.count === 0 ? "opacity-25" : ""}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={`${d.count} generation${d.count === 1 ? "" : "s"}`}
                    />
                    {d.count > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground">
                        {d.count}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] ${
                      isToday ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-tool horizontal bars */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-5">
            <h3 className="text-sm font-semibold tracking-tight">By tool</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">All-time generations per tool</p>
          </div>
          <div className="space-y-3.5">
            {(Object.keys(TOOL_LABELS) as Tool[]).map((t) => {
              const count = perTool[t];
              const pct = (count / maxTool) * 100;
              return (
                <div key={t}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">{TOOL_LABELS[t]}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-500"
                      style={{ width: count === 0 ? "0%" : `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {total === 0 && (
              <p className="pt-2 text-xs text-muted-foreground">
                No generations yet — open a tool below to get started.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tools */}
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">TOOLS</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group glass-card relative overflow-hidden p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-primary/20">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {perTool[f.tool]}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </div>
            <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border/60 bg-card/40 px-5 py-4 text-xs leading-relaxed text-muted-foreground backdrop-blur">
        <strong className="text-foreground/90">Responsible AI notice.</strong> Cortex uses large
        language models that can make mistakes or generate biased content. Review outputs before
        sending, sharing, or making decisions.
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  small,
}: {
  icon: typeof Zap;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`glass-card relative overflow-hidden p-5 ${
        accent ? "ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div
        className={`font-semibold tracking-tight ${
          small ? "text-lg" : "text-3xl"
        } ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

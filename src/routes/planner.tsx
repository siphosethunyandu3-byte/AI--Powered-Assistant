import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarClock, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { AiOutput } from "@/components/AiOutput";
import { planTasks } from "@/lib/ai.functions";
import { trackGeneration } from "@/lib/generations";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Cortex" },
      { name: "description", content: "Generate a prioritized daily or weekly schedule." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!tasks.trim()) return toast.error("List your tasks first.");
    setLoading(true);
    setOutput("");
    try {
      const res = await fn({ data: { tasks, horizon } });
      setOutput(res.text);
      trackGeneration("planner");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <PageHeader
        icon={CalendarClock}
        eyebrow="Focus"
        title="AI Task Planner"
        description="List everything on your plate. Cortex prioritizes and time-blocks it."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-5 p-6">
          <div className="space-y-2">
            <Label>Plan for</Label>
            <div className="inline-flex rounded-lg border border-border bg-background/40 p-1">
              {(["day", "week"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    horizon === h
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {h === "day" ? "Today" : "This week"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tasks">Your tasks</Label>
            <Textarea
              id="tasks"
              rows={12}
              placeholder={"e.g.\n- Finish investor deck (urgent)\n- Review PR from Alex\n- Q3 planning doc\n- Gym\n- Call insurance"}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gap-2">
            <Zap className="h-4 w-4" />
            {loading ? "Planning…" : "Generate schedule"}
          </Button>
        </div>
        <AiOutput content={output} loading={loading} placeholder="Your prioritized plan will appear here." />
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { AiOutput } from "@/components/AiOutput";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Cortex" },
      { name: "description", content: "Concise briefings with insights and recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or paste an article.");
    setLoading(true);
    setOutput("");
    try {
      const res = await fn({ data: { topic } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <PageHeader
        icon={Sparkles}
        eyebrow="Research"
        title="AI Research Assistant"
        description="A topic, a question, or an article. Get a briefing with insights and next steps."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic, question, or pasted article</Label>
            <Textarea
              id="topic"
              rows={14}
              placeholder="e.g. The current state of vertical AI SaaS pricing models"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gap-2">
            <Search className="h-4 w-4" />
            {loading ? "Researching…" : "Generate briefing"}
          </Button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Briefings draw on the model's training data. Verify sources for anything time-sensitive.
          </p>
        </div>
        <AiOutput content={output} loading={loading} placeholder="Your briefing will appear here." />
      </div>
    </div>
  );
}

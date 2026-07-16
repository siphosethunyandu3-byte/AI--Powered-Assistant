import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { AiOutput } from "@/components/AiOutput";
import { summarizeNotes } from "@/lib/ai.functions";
import { trackGeneration } from "@/lib/generations";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Cortex" },
      {
        name: "description",
        content: "Turn raw meeting notes into decisions, action items, and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!notes.trim()) return toast.error("Paste your meeting notes first.");
    setLoading(true);
    setOutput("");
    try {
      const res = await fn({ data: { notes } });
      setOutput(res.text);
      trackGeneration("notes");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <PageHeader
        icon={FileText}
        eyebrow="Meetings"
        title="Meeting Notes Summarizer"
        description="Paste transcripts, bullets, or scribbles. Cortex extracts what matters."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Raw notes or transcript</Label>
            <Textarea
              id="notes"
              rows={16}
              placeholder="Paste the full meeting notes or transcript here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gap-2">
            <Wand2 className="h-4 w-4" />
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
        <AiOutput content={output} loading={loading} placeholder="Summary, decisions, and action items will appear here." />
      </div>
    </div>
  );
}

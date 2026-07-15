import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
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

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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
              onChange={(e) => setContext(e.target.value)}
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

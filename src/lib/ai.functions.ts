import { createServerFn } from "@tanstack/react-start";
import { generateText, type ModelMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: getModel(),
    system,
    prompt,
  });
  return { text };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        context: z.string().min(1).max(4000),
        tone: z.enum(["formal", "friendly", "persuasive", "concise", "apologetic"]),
        recipient: z.string().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    run(
      `You are an expert business communicator. Write a polished, professional email in a ${data.tone} tone. Include a clear subject line prefixed with "Subject:" then a blank line, then the body with a greeting, well-structured paragraphs, and a sign-off. Do not add commentary.`,
      `Recipient: ${data.recipient || "N/A"}\n\nContext / goal:\n${data.context}`,
    ),
  );

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ notes: z.string().min(1).max(20000) }).parse(d))
  .handler(async ({ data }) =>
    run(
      `You summarize meeting notes for busy professionals. Return well-formatted markdown with these sections in this order:\n\n## Summary\nA 3-5 sentence overview.\n\n## Key Decisions\nBulleted list.\n\n## Action Items\nBulleted list. Format each item as: **Owner** — task (due: date if mentioned, else "TBD").\n\n## Deadlines\nBulleted list of any dates mentioned.\n\n## Open Questions\nBulleted list. If none, say "None".`,
      data.notes,
    ),
  );

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        tasks: z.string().min(1).max(6000),
        horizon: z.enum(["day", "week"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    run(
      `You are a productivity coach. Build a prioritized ${data.horizon === "day" ? "daily" : "weekly"} schedule using the Eisenhower matrix (urgent/important). Return markdown with:\n\n## Priorities\nA numbered list ranking tasks with a one-line rationale.\n\n## Schedule\nA time-blocked plan. ${data.horizon === "day" ? "Use hourly blocks from 9:00 to 18:00." : "One section per weekday (Mon–Fri) with 2-4 focused blocks each."}\n\n## Recommendations\n2-3 short tips to protect focus.`,
      `Tasks:\n${data.tasks}`,
    ),
  );

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ topic: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data }) =>
    run(
      `You are a senior research analyst. Produce a concise briefing in markdown:\n\n## Overview\n2-3 sentence primer.\n\n## Key Insights\n4-6 bullets with substantive analysis.\n\n## Trends & Signals\nBulleted list.\n\n## Recommendations\nActionable, numbered list.\n\n## Further Reading\n3 suggested search queries or resource types (not fabricated URLs).`,
      data.topic,
    ),
  );

export const chat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().max(8000),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are the AI Workplace Productivity Assistant — a concise, professional colleague. Help with emails, meetings, planning, research, and general workplace productivity questions. Use markdown when it improves clarity. Be direct and useful.",
      messages: data.messages as ModelMessage[],
    });
    return { text };
  });

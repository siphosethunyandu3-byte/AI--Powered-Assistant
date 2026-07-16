import { useEffect, useState, useCallback } from "react";

export type Tool = "email" | "notes" | "planner" | "research" | "chat";

export type LogEntry = { tool: Tool; ts: number };

const KEY = "cortex.generations.v1";
const EVT = "cortex.generations.changed";

function read(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: LogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(EVT));
}

export function trackGeneration(tool: Tool) {
  const entries = read();
  entries.push({ tool, ts: Date.now() });
  // cap at 1000 to keep localStorage small
  write(entries.slice(-1000));
}

export function useGenerations() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    setEntries(read());
    const onChange = () => setEntries(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const reset = useCallback(() => write([]), []);

  return { entries, reset };
}

export const TOOL_LABELS: Record<Tool, string> = {
  email: "Email Generator",
  notes: "Meeting Notes",
  planner: "Task Planner",
  research: "Research",
  chat: "Assistant",
};

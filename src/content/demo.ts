import { emptyState, type State, type Attempt } from "../types";
import { record } from "../learning/engine";
import { questions, topics, contentVersion } from "./course";
export function demoState(now = new Date()): State {
  let s = emptyState();
  s.settings = {
    studied: topics.map((t) => t.id),
    examDate: "",
    size: 5,
    onboarded: true,
  };
  questions
    .filter((q) => q.type === "choice")
    .forEach((q, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - ((i % 3) + 3));
      const a: Attempt = {
        id: `demo-${i}`,
        sessionId: `demo-session-${i}`,
        questionId: q.id,
        conceptId: q.conceptId,
        contentVersion,
        at: d.toISOString(),
        confidence: "confident",
        outcome: i % 3 === 0 ? "incorrect" : "correct",
        method: "automatic",
        hint: i % 4 === 0,
        revealed: false,
      };
      s = record(s, a);
    });
  return s;
}

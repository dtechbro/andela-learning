import { describe, it, expect } from "vitest";
import { emptyState, type Attempt } from "../src/types";
import {
  schedule,
  record,
  select,
  day,
  addDays,
  attemptLabel,
} from "../src/learning/engine";
import { questions, concepts, validateContent } from "../src/content/course";
import { demoState } from "../src/content/demo";
const attempt = (overrides: Partial<Attempt> = {}): Attempt => ({
  id: "a",
  sessionId: "s1",
  questionId: "cell-types-choice",
  conceptId: "cell-types",
  contentVersion: "biology-demo-1",
  at: new Date(2026, 9, 14, 23, 59).toISOString(),
  confidence: "confident",
  outcome: "correct",
  method: "automatic",
  hint: false,
  revealed: false,
  ...overrides,
});
describe("calendar scheduling", () => {
  it("advances independent successes across sessions to 1, 3, 7, 14 days", () => {
    let r;
    for (let i = 1; i <= 5; i++) {
      const a = attempt({ sessionId: `s${i}` });
      r = schedule(r, a)!;
      expect(r.step).toBe(Math.min(i, 4));
      expect(r.due).toBe(
        addDays(new Date(a.at), [1, 3, 7, 14][Math.min(i, 4) - 1]),
      );
    }
  });
  it.each([
    { hint: true },
    { revealed: true },
    { confidence: "unsure" as const },
    { outcome: "partial" as const },
    { outcome: "incorrect" as const },
  ])(
    "does not treat assisted/uncertain/failing attempts as independent: %j",
    (overrides) => {
      const r = schedule(undefined, attempt(overrides))!;
      expect(r.step).toBe(0);
      expect(r.independent).toBe(false);
      expect(r.due).toBe("2026-10-15");
    },
  );
  it("preserves review state for skips", () => {
    const r = schedule(undefined, attempt())!;
    expect(schedule(r, attempt({ outcome: "skipped" }))).toBe(r);
  });
  it("does not advance two successes in one session", () => {
    const a = attempt();
    const r = schedule(undefined, a)!;
    expect(schedule(r, { ...a, id: "b" })).toMatchObject({
      step: 1,
      due: r.due,
    });
  });
  it("uses the actual review date after a missed week", () => {
    const a = attempt();
    const r = schedule(undefined, a)!;
    const later = attempt({
      sessionId: "later",
      at: new Date(2026, 9, 22).toISOString(),
    });
    expect(schedule(r, later)?.due).toBe("2026-10-25");
  });
  it("uses calendar days across midnight and year boundaries", () => {
    expect(day(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
    expect(addDays(new Date(2026, 11, 31, 23, 59), 1)).toBe("2027-01-01");
    expect(addDays(new Date(2026, 9, 14, 0, 1), 1)).toBe("2026-10-15");
  });
  it("records each attempt once", () => {
    const a = attempt();
    const s = record(emptyState(), a);
    expect(record(s, a)).toBe(s);
    expect(s.attempts).toHaveLength(1);
  });
});
describe("session selection", () => {
  const now = new Date(2026, 9, 14, 12);
  const setup = () => {
    const s = emptyState();
    s.settings.studied = ["cells"];
    return s;
  };
  it("excludes unstudied, flagged, and unvalidated questions", () => {
    const s = setup();
    s.flags = ["cell-types-choice"];
    const bank = questions.map((q) =>
      q.id === "ribosomes-choice" ? { ...q, validated: false } : q,
    );
    const result = select(s, bank, concepts, "review", now);
    expect(result.items.map((i) => i.questionId).sort()).toEqual([
      "cell-types-written",
      "ribosomes-written",
    ]);
  });
  it("returns fewer items rather than duplicating questions", () => {
    const s = select(setup(), questions.slice(0, 1), concepts, "review", now);
    expect(s.items).toHaveLength(1);
  });
  it("handles empty studied topics", () => {
    expect(
      select(emptyState(), questions, concepts, "review", now).items,
    ).toHaveLength(0);
  });
  it("prefers alternatives to the most recent question", () => {
    const s = record(setup(), attempt());
    expect(
      select(s, questions, concepts, "review", now).items.find((i) =>
        i.questionId.startsWith("cell-types"),
      )?.questionId,
    ).toBe("cell-types-written");
  });
  it("exam revision changes with history and includes reasons", () => {
    const baseline = emptyState();
    baseline.settings.studied = [
      "cells",
      "transport",
      "enzymes",
      "division",
      "genetics",
    ];
    const history = record(
      baseline,
      attempt({
        conceptId: "crossing",
        questionId: "crossing-choice",
        outcome: "incorrect",
      }),
    );
    const a = select(baseline, questions, concepts, "exam", now);
    const b = select(history, questions, concepts, "exam", now);
    expect(a.items).not.toEqual(b.items);
    expect(b.items[0].questionId).toContain("crossing");
    expect(b.items[0].reason).toContain("Needed help");
  });
  it("reserves successful material when available in five-question exam sessions", () => {
    const s = demoState(now);
    const exam = select(s, questions, concepts, "exam", now);
    expect(exam.items).toHaveLength(5);
    expect(
      exam.items.some(
        (i) =>
          s.reviews[questions.find((q) => q.id === i.questionId)!.conceptId]
            ?.independent,
      ),
    ).toBe(true);
    expect(new Set(exam.items.map((i) => i.questionId)).size).toBe(5);
  });
  it("checks content structure and alternative questions per concept", () => {
    expect(validateContent()).toBeUndefined();
    for (const c of concepts)
      expect(questions.filter((q) => q.conceptId === c.id)).toHaveLength(2);
  });
});

it("reports each attempt independently of later concept results", () => {
  expect(attemptLabel(attempt({ outcome: "incorrect" }))).toBe(
    "Needs another attempt",
  );
  expect(attemptLabel(attempt({ hint: true }))).toBe("Recalled with help");
  expect(attemptLabel(attempt({ outcome: "skipped" }))).toBe("Skipped");
  expect(attemptLabel(attempt())).toBe("Recalled independently");
});

it("adds calendar days across daylight-saving changes", () => {
  expect(addDays(new Date(2026, 2, 7, 23, 30), 1)).toBe("2026-03-08");
  expect(addDays(new Date(2026, 9, 31, 0, 30), 1)).toBe("2026-11-01");
});

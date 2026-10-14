import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { emptyState, type Attempt } from "../src/types";
import { save, load, saveAttempt, clear, migrate } from "../src/storage/store";
it("persists settings and atomically deduplicates concurrent attempts", async () => {
  const s = emptyState();
  s.settings.studied = ["cells"];
  await save("test", s);
  const a: Attempt = {
    id: "unique",
    sessionId: "session",
    questionId: "cell-types-choice",
    conceptId: "cell-types",
    contentVersion: "1",
    at: new Date().toISOString(),
    confidence: "confident",
    outcome: "correct",
    method: "automatic",
    hint: false,
    revealed: false,
  };
  await Promise.all([
    saveAttempt("test", a, null),
    saveAttempt("test", a, null),
  ]);
  const actual = await load("test");
  expect(actual.attempts).toHaveLength(1);
  expect(actual.settings.studied).toEqual(["cells"]);
  expect(actual.reviews["cell-types"].step).toBe(1);
  await clear("test");
  expect((await load("test")).attempts).toHaveLength(0);
});
it("keeps demo and learner data separate", async () => {
  const s = emptyState();
  s.settings.studied = ["cells"];
  await save("learner-test", s);
  await save("demo-test", emptyState());
  await clear("demo-test");
  expect((await load("learner-test")).settings.studied).toEqual(["cells"]);
});
it("initialises absent data, preserves current schema, and rejects unsupported versions without erasing them", () => {
  expect(migrate(undefined)).toEqual(emptyState());
  const s = emptyState();
  expect(migrate(s)).toBe(s);
  expect(() => migrate({ ...s, version: 2 })).toThrow(
    "Unsupported saved progress",
  );
});

import type {
  Attempt,
  Question,
  Review,
  Session,
  State,
  Concept,
} from "../types";
export function day(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return day(d);
}
export function schedule(
  previous: Review | undefined,
  a: Attempt,
): Review | undefined {
  if (a.outcome === "skipped") return previous;
  const independent =
    a.outcome === "correct" &&
    !a.hint &&
    !a.revealed &&
    a.confidence !== "unsure";
  const step = independent
    ? previous?.lastSession === a.sessionId
      ? previous.step
      : Math.min((previous?.step ?? 0) + 1, 4)
    : 0;
  const due =
    independent && previous?.lastSession === a.sessionId
      ? previous.due
      : addDays(
          new Date(a.at),
          independent ? [1, 3, 7, 14][Math.max(0, step - 1)] : 1,
        );
  return {
    conceptId: a.conceptId,
    lastAt: a.at,
    due,
    step,
    lastSession: a.sessionId,
    lastOutcome: a.outcome,
    independent,
  };
}
export function record(state: State, a: Attempt): State {
  if (state.attempts.some((x) => x.id === a.id)) return state;
  const review = schedule(state.reviews[a.conceptId], a);
  return {
    ...state,
    attempts: [...state.attempts, a],
    reviews: review
      ? { ...state.reviews, [a.conceptId]: review }
      : state.reviews,
  };
}
export function label(r?: Review) {
  return !r
    ? "Not checked yet"
    : r.lastOutcome !== "correct"
      ? "Needs another attempt"
      : r.independent
        ? "Recalled independently"
        : "Recalled with help";
}
export function select(
  state: State,
  questions: Question[],
  concepts: Concept[],
  mode: "review" | "exam",
  now = new Date(),
  rng = () => 0,
): Session {
  const today = day(now);
  const allowed = new Set(
    concepts
      .filter((c) => state.settings.studied.includes(c.topicId))
      .map((c) => c.id),
  );
  const eligible = questions.filter(
    (q) =>
      q.validated && allowed.has(q.conceptId) && !state.flags.includes(q.id),
  );
  const rank = (id: string) => {
    const r = state.reviews[id];
    if (!r) return 2;
    if (mode === "exam" && !r.independent) return 0;
    if (r.due <= today) return 0;
    if (!r.independent) return 1;
    return 3;
  };
  const reason = (id: string) => {
    const r = state.reviews[id];
    return !r
      ? "Not checked yet — establish a starting point"
      : !r.independent
        ? "Needed help or another attempt last time"
        : r.due <= today
          ? "Due for a revisit"
          : "Previously recalled — an early check-in";
  };
  const ids = [...new Set(eligible.map((q) => q.conceptId))].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (state.reviews[a]?.due ?? "").localeCompare(state.reviews[b]?.due ?? ""),
  );
  const chosen: string[] = [];
  const usedTopics = new Set<string>();
  // Spread within priority groups without discarding higher-priority concepts.
  for (const priority of [0, 1, 2, 3]) {
    const group = ids.filter((id) => rank(id) === priority);
    while (group.length) {
      let i = group.findIndex(
        (id) => !usedTopics.has(concepts.find((c) => c.id === id)!.topicId),
      );
      if (i < 0) i = 0;
      const id = group.splice(i, 1)[0];
      chosen.push(id);
      usedTopics.add(concepts.find((c) => c.id === id)!.topicId);
    }
  }
  if (mode === "exam" && state.settings.size === 5) {
    const successful = ids.find((id) => state.reviews[id]?.independent);
    if (successful) {
      const i = chosen.indexOf(successful);
      chosen.splice(i, 1);
      chosen.splice(Math.min(4, chosen.length), 0, successful);
    }
  }
  const ordered = chosen.flatMap((id) => {
    const last = [...state.attempts]
      .reverse()
      .find((a) => a.conceptId === id)?.questionId;
    const qs = eligible.filter((q) => q.conceptId === id);
    const alternatives = qs.filter((q) => q.id !== last);
    const first = (alternatives.length ? alternatives : qs)[
      Math.min(
        Math.floor(rng() * (alternatives.length || qs.length)),
        (alternatives.length || qs.length) - 1,
      )
    ];
    return [first, ...qs.filter((q) => q.id !== first.id)];
  });
  // First pass uses one question per concept, then backfills alternatives.
  const firsts = chosen.map((id) => ordered.find((q) => q.conceptId === id)!);
  const all = [...firsts, ...ordered.filter((q) => !firsts.includes(q))];
  return {
    id: crypto.randomUUID(),
    mode,
    items: all
      .slice(0, state.settings.size)
      .map((q) => ({ questionId: q.id, reason: reason(q.conceptId) })),
    position: 0,
    completed: false,
  };
}

export function attemptLabel(a: Attempt) {
  if (a.outcome === "skipped") return "Skipped";
  if (a.outcome !== "correct") return "Needs another attempt";
  return !a.hint && !a.revealed && a.confidence !== "unsure"
    ? "Recalled independently"
    : "Recalled with help";
}

import { openDB } from "idb";
import { emptyState, type State, type Attempt } from "../types";
import { record } from "../learning/engine";
const db = () =>
  openDB("recall-learning", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("states"))
        db.createObjectStore("states");
    },
  });
export function migrate(raw: unknown): State {
  if (!raw) return emptyState();
  const s = raw as State;
  if (
    s.version !== 1 ||
    !Array.isArray(s.attempts) ||
    !s.settings ||
    !Array.isArray(s.settings.studied) ||
    ![3, 5].includes(s.settings.size) ||
    typeof s.settings.examDate !== "string" ||
    typeof s.settings.onboarded !== "boolean" ||
    !s.reviews ||
    !Array.isArray(s.flags)
  )
    throw new Error(
      "Unsupported saved progress. Clear it in Settings to start again.",
    );
  return s;
}
export async function load(namespace: string) {
  const d = await db();
  return migrate(await d.get("states", namespace));
}
export async function save(namespace: string, state: State) {
  const d = await db();
  await d.put("states", state, namespace);
}
export async function saveAttempt(
  namespace: string,
  attempt: Attempt,
  session: State["session"],
) {
  const d = await db();
  const tx = d.transaction("states", "readwrite");
  const old = migrate(await tx.store.get(namespace));
  const next = { ...record(old, attempt), session };
  await tx.store.put(next, namespace);
  await tx.done;
  return next;
}
export async function clear(namespace: string) {
  const d = await db();
  await d.delete("states", namespace);
}

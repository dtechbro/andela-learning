# Architecture and learning rules

## Stack

React + TypeScript + Vite; npm lockfile; plain responsive CSS; IndexedDB through a small adapter; Vitest for domain logic; Playwright for browser journeys. Use a maintained service-worker integration such as vite-plugin-pwa if suitable, without unnecessary UI libraries.

No backend is needed for the core. An optional AI endpoint must keep credentials server-side and have a working non-AI fallback.

Suggested layout:

```text
src/
  components/
  pages/
  content/
  learning/       # scheduling, selection, progress
  storage/        # schema, transactions, migrations
  types/
  styles/
tests/
public/
```

## Data model

- Course: ID, title, description, language, content version, topic IDs.
- Topic: ID, course ID, title, concept IDs.
- Concept: ID, topic ID, title.
- Question: stable ID, concept ID, type, prompt, options if applicable, answer criteria, hint, explanation, sources, validation metadata.
- Settings: studied topic IDs, optional exam date, session size, schema version.
- Attempt: unique ID, session ID, question ID, content version, concept ID, completion timestamp, confidence, outcome, assessment method, hint used, answer revealed, skipped.
- ReviewState: concept ID, last attempted date, next review date, independent-success step, last outcome.
- Session: ID, mode, selected question IDs, selection reasons, current position, completion status.
- Flag: question ID and timestamp. Free-text comments are optional and local only.

Do not persist raw written answers by default. Scheduling needs outcomes rather than private answer text. Use transactions for attempt insertion and review-state updates. Make completion idempotent, including repeated clicks and reloads. Version persisted schemas and handle unavailable storage with a clear temporary-session warning.

## Outcome rules

Multiple choice uses deterministic answer checking. Short answers use explicit self-assessment until optional AI is implemented. Track assessment method so these are not presented as equivalent objective measurements.

Hint used or answer revealed prevents an independent-success result. A skipped question does not count as an incorrect answer and does not advance scheduling. It remains eligible for review. Confidence alone never marks a concept correct.

## Prototype scheduling

Schedule at concept level using local calendar dates; persist attempt instants in ISO UTC. Use a clock abstraction and test timezone and midnight boundaries. These rules are transparent heuristics, not a validated adaptive-learning model.

- Incorrect, partial, or revealed answer: reset independent-success step; due next calendar day. Permit an optional different-question retry after other questions in the current session.
- Correct with hint or unsure confidence: reset independent-success step; due next day.
- Correct independently with somewhat-confident or confident input: advance through intervals of 1, 3, 7, and 14 days; cap at 14 for the prototype.
- Never count multiple successes in the same session as separate spaced successes.
- Revisiting overdue material advances from the actual review date, not the original due date.

## Session selection

Filter to studied topics and validated, unflagged questions first. Avoid duplicate question IDs in a session and prefer a different question from the last attempt on that concept.

Normal review: overdue concepts, struggling concepts, newly studied or unchecked concepts, then not-yet-due concepts if needed. Explain early review if nothing is due.

Exam review: fill most slots from struggling and overdue concepts; reserve roughly one in five slots for previously independently recalled material when available. Backfill without duplicates. This proportion is a simple prototype rule, not an evidence-backed optimum. Include unchecked studied concepts when history is sparse.

Distribute questions across eligible topics where possible. Return fewer questions when inventory is insufficient; never manufacture extra questions or include unstudied topics. Selection should return human-readable reasons.

## Offline and privacy

Cache the app shell and packaged question content after first successful online load. Do not cache third-party source websites or optional AI responses by default. Show offline availability status accurately. External source links need connectivity; include sufficient local explanations for practice.

Handle updates so question IDs and content versions remain interpretable. Avoid replacing the active session mid-attempt. Provide a recoverable update prompt when appropriate.

Progress deletion clears learner settings, attempts, sessions, flags, and review state, but may retain downloaded public course content; say this explicitly. Demo data uses a separate namespace with a visible banner and an exit action.

## Optional AI contract

Use an authenticated/rate-limited server route appropriate to deployment. Never expose provider keys in browser bundles. Submit only the current question, approved criteria, explanation, and answer. Treat answer text as untrusted data. Validate structured output and fall back to self-assessment on timeout, invalid output, or network failure. Disclose transmission before enabling the feature. Do not describe uncertain grading as definitive.

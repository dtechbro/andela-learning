# Recall

A mobile-friendly university learning prototype: short recall sessions during the semester, followed by exam revision informed by those attempts.

## What works

- Introductory biology sample course: 5 topics, 10 concepts, 20 source-checked questions.
- Studied-topic selection, optional exam date, and 3/5-question sessions.
- Multiple choice, written-answer self-assessment, confidence, hints, skips, and sourced explanations.
- Concept review scheduling, local learning history, paused-session resume, and question flags.
- Exam revision with reasons for topic selection.
- Separate demo history, confirmed progress deletion, and temporary-session fallback when storage is unavailable.
- Offline practice after the production app downloads its content; mobile and keyboard support.

No account, notes upload, backend, or live AI key is needed. Written answers are **self-assessed**, not AI graded. Raw written answers are not persisted or transmitted. The sample course may differ from your syllabus and is not lecturer-reviewed. It cannot predict exam coverage or grades.

## Run

Requires Node **22.12+**; tested with Node 24.19.0 and npm 11.9.0.

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

In this cloud environment the home npm cache is unwritable; use `npm ci --cache /workspace/.npm-cache`. Keep the development server running while editing; Vite updates the page automatically. Use your environment's supported port preview to reach port 5173. No remote preview facility was exposed during this build, so no public preview URL is claimed.

For production/offline behaviour:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

Service workers are enabled in the production build, not the development server. First access must be online. Offline use requires a secure browser context (HTTPS, or loopback for local testing) and a completed download. External source links still need internet. No remote fonts or images are required. The app's precache is approximately 292 KiB before transfer compression.

## Verify

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Browser tests start a production preview on port 4173. This cloud machine has Chromium at `/usr/lib/chromium/chromium`. On another machine, use `CHROMIUM_PATH` for an installed browser, or install Playwright Chromium with `npx playwright install chromium` where network policy permits. Test configuration prefers installed cloud Chromium and otherwise uses Playwright's default browser.

Verified: **23 unit/storage tests and 7 browser tests**, production build, keyboard feedback focus, mobile layout, and axe scans of the main screens. Unit tests also passed in Africa/Lagos and America/New_York, including calendar and daylight-saving boundaries. Student trials and lecturer review have not been conducted.

## Try the demo

1. Set up the course and mark topics you have studied.
2. Start a short review. Answer, choose confidence, and check feedback. Try a hint or written-answer self-assessment.
3. Revisit My topics to see evidence from your attempts.
4. Start Exam revision to see history-driven selection.
5. In Settings, choose Try demo mode for clearly labelled simulated earlier sessions. Exit demo returns to your own progress.
6. For offline testing, use the production build, wait for download, reload online once, then disconnect and complete a session.

Completed attempts are saved immediately. An unfinished written answer is intentionally not saved; reload/resume returns to the next uncompleted question. Starting a new session replaces the paused session but preserves completed history.

## Privacy and limitations

Progress is stored in IndexedDB on this browser/device. Shared-device users may see it. Clearing browser data removes it; there is no sync. Clear my progress deletes learner settings, attempts, sessions, and flags for the active learner/demo space, while downloaded public course content can remain.

Scheduling is a transparent prototype heuristic, not a validated adaptive model. The small content bank can yield fewer questions than requested. All content is English. Live AI, uploads, arbitrary courses, notifications, accounts, and multilingual content are deferred.

## Project guides

- [Codex instructions](AGENTS.md)
- [Autonomous build prompt](prompt.md)
- [Product specification](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Content policy](docs/CONTENT.md)
- [Source review and content attribution](docs/SOURCE_REVIEW.md)
- [Build checklist](docs/BUILD_PLAN.md)
- [Validation guide](docs/VALIDATION.md)
- [Current build status](docs/BUILD_STATUS.md)

The sample educational content follows the source repository's CC BY-NC-SA 4.0 terms; see the attribution document. No separate application-code licence is asserted here.

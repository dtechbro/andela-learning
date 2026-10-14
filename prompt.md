# Autonomous build launch guide

Paste the launch prompt below into Codex while this repository is selected. It authorizes implementation of the specified prototype in the checkout. The remaining stages are instructions for Codex to execute in order within the same task, not prompts the user must send individually.

A Markdown file does not start an agent or keep it running after its execution session ends. This guide supports autonomous progress within an active Codex task and provides a checkpoint for resuming an interrupted task. Viewing the app remotely also depends on the environment's supported port-preview capability.

## Launch prompt

```text
Read AGENTS.md and prompt.md, then implement the Recall prototype described in the linked product, architecture, content, build, and validation documents.

Execute all build stages in prompt.md autonomously in order. Do not stop after a stage to request my confirmation or wait for another prompt. Make reasonable implementation decisions using the documented defaults. Use the labelled introductory biology demo course unless I provide a different course. Build the complete required core; live AI and real-student trials are optional and must not block delivery.

Inspect existing files and changes before editing. Preserve user work. Create and maintain docs/BUILD_STATUS.md with verified progress, actual commands, unresolved issues, and the next action. Update docs/BUILD_PLAN.md only when its checks are actually complete. Resume existing implementation rather than restarting it.

Start the development server as soon as the app shell runs, keep it running while you implement, and verify that it serves the application. Use the environment's supported preview or port-forwarding mechanism when available so I can view changes. Report only a real preview URL supplied by that mechanism; a localhost URL is not a remotely accessible preview. Keep implementing if preview access is unavailable, and explain the limitation. Leave the server running at handoff if the environment supports retained processes.

Continue through implementation, meaningful tests, production build, offline checks, accessibility review, and defect fixes. Send concise progress updates while working. Incorporate my feedback if I send it, but do not require it. Ask only when missing authorization or an external prerequisite prevents further useful work; never invent credentials or bypass security checks.

Do not commit, push, publish, or deploy. Finish with the implemented features, actual verification results, remaining limitations, and preview/server status. Do not claim completion if required features or required checks remain unresolved.
```

## Execution loop

For every stage: inspect current state → implement the next useful slice → run the relevant check → diagnose and fix failures → record evidence → continue to the next stage. Keep the app usable as each slice lands. Do not mark planned work as done.

If interrupted, read `docs/BUILD_STATUS.md`, inspect current code and Git status, check whether the recorded server is still alive, and continue from the first incomplete stage. Do not blindly rerun installs, overwrite files, or start duplicate servers.

## Stage 1 — Foundation and visible app

Read every guide listed in AGENTS.md. Inspect runtime versions, repository state, and available browser/preview tools. Scaffold into the existing directory without overwriting documentation. Establish npm scripts, the lockfile, TypeScript, responsive styling, and a functional app shell.

Start the development server once the shell renders. A typical Vite command is `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`; use it only after creating and checking the actual dev script. Binding all interfaces is for the development preview, not public deployment. If the port is occupied, identify the process; reuse the correct app server or select another available port rather than killing an unknown process.

Use the execution tool's managed background/session mechanism. Record the working directory, command, session or PID, port, and log location when available. Check a local HTTP response and inspect the app in a browser if supported. An open port alone is not proof the app works. Continue without waiting for the user to view it.

## Stage 2 — Complete learning session

Build the source-checked sample question bank, course setup, studied-topic selection, practice, confidence, hints, skips, feedback, transparent short-answer self-assessment, and session results. Use the content guide for provenance. Include empty and insufficient-content states. All visible controls must work.

Gate: complete a real session from setup to results. Verify exclusion of unstudied topics, honest assessment labels, and source links. Continue to persistence immediately after passing.

## Stage 3 — History and review scheduling

Implement IndexedDB, schema versioning, atomic/idempotent attempt writes, interrupted-session handling, concept scheduling, topic evidence, local flags, settings edits, and confirmed progress deletion. Add focused tests for scheduling, selection, and persistence behaviour.

Gate: reload preserves progress; an incorrect or helped response affects later selection; repeated submission cannot duplicate an attempt. Verify return-after-break behaviour and storage-failure messaging.

## Stage 4 — Exam revision and demo

Implement history-driven exam sessions, selection reasons, sparse-history fallback, and previously successful material. Add clearly labelled demo history in isolated storage. Keep real and simulated progress separate.

Gate: demonstrate two different histories producing appropriately different revision sessions. Entering and exiting demo mode must preserve the learner's real data.

## Stage 5 — Offline and accessible experience

Implement production service-worker caching, accurate offline status, update handling, and retained downloaded content. Test first online load followed by offline reload and a completed persistent session against a production preview on a separate port. Keep the development server available while doing this.

Check mobile layout, keyboard operation, focus after feedback/navigation, labels, contrast, and announced feedback. Include privacy and offline limitations in the interface. Fix issues rather than only documenting avoidable defects.

Gate: core practice works offline after download; a keyboard and mobile user can complete the main journeys.

## Stage 6 — End-to-end verification and handoff

Run the documented typecheck, unit tests, production build, and browser tests. Inspect the running interface and fix discovered defects. Verify representative content against its sources. Update README with tested setup and run commands, actual status, demo instructions, and known limitations.

Review every product acceptance criterion and build-plan item. Record the evidence, including passed, failed, skipped, or unavailable checks. Student trials require real participants and consent: never fabricate them. Optional live AI is not required; do not start it before completing the core.

Check that the development server still responds and provide the supported preview address if one exists. Do not promise a process will survive environment shutdown. Stop only temporary test/preview processes you started when no longer needed, preserving the requested development server.

## Progress record

Create `docs/BUILD_STATUS.md` when implementation starts, containing:

- Last updated time and current stage.
- Completed capabilities and their verification evidence.
- Remaining required work and diagnosed blockers.
- Actual installation/test/server commands and outcomes.
- Server session/PID, port, and supported preview URL if available; no secrets.
- The next concrete action for a resumed task.

Keep progress updates short and meaningful. After verified completion, end the task; do not create an endless polling loop or expand into deferred features.

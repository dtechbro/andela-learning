# Build plan

Unchecked items are planned, not completed. Update this file as implementation and checks actually finish.

## 1. Foundation

- [x] Scaffold React, TypeScript, and Vite with a reproducible npm lockfile.
- [x] Add domain types, content schema validation, and documented scripts.
- [x] Establish responsive layout and accessible shared controls.
- [x] Choose and document the actual pilot course, or retain labelled provisional biology content.

## 2. One complete learning session

- [x] Add source-checked sample content with alternative concept questions.
- [x] Implement setup and studied-topic selection.
- [x] Implement question, confidence, hint, skip, and feedback flows.
- [x] Implement transparent short-answer self-assessment.
- [x] Show results and a meaningful next action.

Gate: a learner can complete an actual session; no inert controls or fabricated feedback.

## 3. Persistent learning history

- [x] Add IndexedDB storage and graceful storage failure handling.
- [x] Implement concept scheduling and deterministic selection tests.
- [x] Persist settings and completed attempts without duplicates.
- [x] Add topic evidence, return-after-break behaviour, and deletion.
- [x] Handle reload and interrupted sessions explicitly.

Gate: history changes the next session and survives reload.

## 4. Exam revision

- [x] Implement revision selection and explanations.
- [x] Cover sparse history, insufficient content, flags, and unstudied topics.
- [x] Add isolated demo history with visible simulation labels.

Gate: revision demonstrably changes with history, without readiness claims.

## 5. Offline and accessibility

- [x] Cache shell and prepared content for repeat visits.
- [x] Verify production offline sessions and persistent results.
- [x] Test phone viewport, keyboard flow, focus, and accessible feedback.
- [x] Document first-load, external-link, shared-device, and storage limitations.

## 6. Validation and handoff

- [x] Run type checking, unit tests, production build, and browser checks.
- [x] Complete representative source review.
- [x] Update README with tested commands and actual status.
- [x] Prepare the demo and record known limitations.
- [ ] Conduct student trials when participants are available; report them separately from software checks. (Not conducted; requires real participants and consent.)

Optional after core completion: server-based AI feedback. Do not defer required offline or accessibility work to add AI.

# Codex development instructions

Build Recall: a mobile-friendly university study prototype that connects short recall sessions throughout a semester to focused exam revision. The user originated the idea; implement and refine that direction rather than replacing it.

## Read first

1. `docs/PRODUCT.md`: scope, journeys, and acceptance criteria.
2. `docs/ARCHITECTURE.md`: stack, data, scheduling, and offline behaviour.
3. `docs/CONTENT.md`: question quality and provenance requirements.
4. `docs/BUILD_PLAN.md`: implementation order and completion gates.
5. `docs/VALIDATION.md`: automated checks, usability trial, and demo.

These documents guide implementation; they do not describe features already built. Keep them accurate as decisions change. User instructions take precedence. Report material changes in scope.

For an autonomous build, follow `prompt.md` through all stages without waiting for a new user prompt between stages. Maintain `docs/BUILD_STATUS.md` once implementation starts. Start and verify the development server early, keep it available during development, and use only supported preview mechanisms for remote viewing. The launch guide does not itself execute anything or ensure processes survive task shutdown.

## Autonomy and scope

- Use the existing checkout. Cloud tasks are already isolated; do not create a worktree unless requested.
- When asked to build, implement the complete core journey, run it, and validate it. Do not stop after scaffolding or a visual mockup.
- Resolve routine implementation choices autonomously. Ask only about decisions that prevent useful progress; continue independent work.
- The first course is unconfirmed. Use introductory biology as an explicitly labelled provisional demonstration course if no course is supplied. Do not imply alignment with any institution's syllabus.
- Build the offline-capable core without external credentials. Live AI is optional and must not block completion.
- Do not commit, push, deploy, or send messages externally without authorization. Preserve existing user changes and never embed secrets.

## Implementation standards

- Use React, TypeScript, Vite, npm, IndexedDB, Vitest, and Playwright. Prefer a small dependency footprint. After creating a lockfile, use `npm ci` for reproducible installs.
- Separate domain logic from UI and persistence. Inject the clock and random selection where tests need deterministic behaviour.
- Make every visible action functional. No fabricated statistics, inert controls, placeholder readiness scores, or hidden dependency on a live AI service.
- Use semantic HTML, labelled inputs, accessible feedback, visible keyboard focus, readable contrast, and touch targets around 44 CSS pixels.
- Keep learning feedback supportive. Missing sessions must not create shame or an overwhelming backlog.
- Store progress locally, explain shared-device and browser-data risks, and provide deletion with confirmation.
- Never claim exam coverage, grade improvement, or mastery from a small number of attempts.
- Validate content against credible sources. Do not describe AI-generated content as human-reviewed. Never fabricate citations.
- Restrict production practice to validated content. Label demo content and seeded history visibly. Simulated history must not contaminate real learner progress.
- Preserve TLS, signatures, and checksums during setup. Never fix installation by disabling verification.

## Required verification and handoff

Establish scripts for `dev`, `build`, `preview`, `typecheck`, `test`, and `test:e2e`; document their actual commands in README. Run relevant tests, type checking, production build, and a representative browser flow. Test offline behaviour against the production build, not just the development server.

Before finishing, inspect Git changes, report what works and what remains, distinguish passed/skipped/unrun checks, and update the build checklist. Do not call the product complete while core acceptance criteria are unresolved. Optional AI and unperformed longitudinal student research are not core implementation blockers, but disclose them.

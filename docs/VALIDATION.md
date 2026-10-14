# Validation and demo

## Automated checks

Unit tests must exercise scheduling and selection outcomes, not mirror implementation details:

- Independent success advances intervals; hints, partial answers, and reveals do not.
- Skips do not become incorrect answers.
- Same-session retries do not count as separate spaced successes.
- Calendar-day scheduling works across midnight and timezone boundaries.
- Unstudied topics, flagged questions, and unvalidated questions are excluded.
- Sessions do not duplicate question IDs and handle insufficient inventory.
- Exam selection prioritises evidence of difficulty and returns selection reasons.
- Attempt persistence is idempotent and schema migrations preserve usable history.

Browser checks:

1. Set up course, mark topics studied, complete mixed-format practice.
2. Use a hint and self-assess a short answer; verify honest result labels.
3. Reload and verify history, then complete exam revision.
4. Flag a question and verify exclusion.
5. Enter and exit demo mode without modifying real history.
6. Delete progress with confirmation and verify deletion scope.
7. In a production preview, warm the cache, go offline, reload, complete a session, and verify persistence.
8. Complete the main flow at a phone viewport and using keyboard navigation.

Run type checking and a production build. Accessibility automation is useful but does not replace keyboard and focus inspection. Report test counts and skipped/unrun checks honestly.

## Small student trial

Recruit a few students familiar with the selected course. Explain that this is a prototype and participation is voluntary. Use anonymous participant labels; do not request grades or student IDs. Get consent before collecting responses or recording a session.

Ask participants to select a studied topic, complete a short review, interpret feedback, and start revision. Observe completion, confusing steps, misleading feedback, and device/data constraints. Ask whether they would return and why; stated intent is not evidence of actual retention.

If time permits, invite a later session with different questions testing the same concepts. Record the time interval, help used, and assessment method. Small uncontrolled trials cannot establish improved exam performance.

Useful measures: session completion, unaided recall on equivalent questions, voluntary return, and ability to explain feedback. Distinguish objective multiple-choice results from self-assessed written responses.

## Hackathon demo

Demonstrate one learner selecting a studied topic, answering confidently but incorrectly, receiving sourced feedback, revisiting the concept, and seeing it selected for exam revision. Use clearly labelled simulated history for elapsed weeks. Demonstrate offline practice after downloading content.

Explain the novelty as a connected semester-to-revision workflow. Do not claim invention of spaced repetition, guaranteed exam success, or research results that were not collected.

## Completion report

Report implemented journeys, content verification, passed/failed/skipped checks, offline limits, and remaining optional features. Separate current-instance functionality from deployment and real-student validation. Include a short reproducible demo procedure and known defects.

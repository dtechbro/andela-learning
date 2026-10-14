# Product specification

## Goal

Help university students discover what they have forgotten and practise recalling it over the semester. Exam revision is a continuation of that practice, using evidence from earlier sessions.

Primary users study on phones, may have limited data, and can identify topics covered in their course. The first release is a working hackathon proof of concept, not a production educational service.

## Scope

One prepared course, four to six topics, and several alternative questions per concept. Provisional demo: introductory biology covering cells, membranes and transport, enzymes, cell division, and basic genetics. Verify source coverage before finalising topics. Clearly state that this is sample content and may differ from the student's syllabus.

Required features:

- Course setup with optional exam date and topic selection.
- Record topics studied; unstudied topics are excluded from practice.
- Three- or five-question sessions, with a smaller session when content is insufficient.
- Multiple-choice and short-answer recall, optional hints, confidence input, and source-linked feedback.
- Local persistent history and scheduled concept review.
- Exam revision with explanations for selected concepts.
- Topic progress with evidence-based labels.
- Offline use after content is downloaded, accessible mobile UI, and progress deletion.
- Isolated, clearly labelled demo history for the hackathon.

Deferred: arbitrary course generation, PDF uploads, broad web retrieval, accounts, sync, notifications, leaderboards, grade predictions, and translated subject content. Live AI feedback is an optional later increment.

## Screens and behaviour

### Setup

Display the demo limitation. Select studied topics and optional exam date. Allow settings to be edited later. If no topics are studied, explain how to select one rather than generating unrelated questions.

### Home

Primary action: Start a short review. Also offer Record what I studied and Prepare for my exam. Show due concepts and recent activity without streak penalties. Returning students receive a manageable session rather than a backlog.

### Practice

One question at a time. Student supplies an answer and selects unsure, somewhat confident, or confident before feedback. Support skip and end-session actions. Hints are optional and their use is recorded. Do not expose answers in the question screen or silently auto-submit.

### Feedback

Show expected answer, explanation, source, and whether help was used. For short answers without AI, show answer criteria and ask the learner to self-assess as correct, partial, or incorrect. Label self-assessment clearly; do not pretend the tool graded the answer. Confidence and correctness are separate.

Allow feedback to be flagged locally with an explanation of what the flag does; do not imply it was sent to a moderator. A flagged question is excluded from future sessions on that device until reset.

### Results and topics

Show completed attempts, concepts to revisit, and one next action. Use Not checked yet, Needs another attempt, Recalled with help, and Recalled independently. Show last review and supporting attempt counts. These labels do not certify mastery.

### Exam revision

Choose session length. Prioritise struggling and overdue concepts, then include some previously successful material. Explain each selection. Never invent exam questions or indicate guaranteed syllabus coverage. If no history exists, offer a baseline session and explain why.

## Acceptance criteria

- Every core journey works without accounts or live AI.
- Selected studied topics govern all question selection.
- Hints, skips, reveals, confidence, and assessed outcomes are represented accurately.
- Reloading preserves completed attempts and settings without duplicate attempts.
- Different questions can revisit the same concept.
- Revision selection changes with learning history.
- Offline practice completes and persists results after a successful online download.
- No daily streak penalty, fabricated analytics, or precise readiness score exists.
- Mobile and keyboard users can complete setup, practice, and revision.
- Users can delete progress and understand the scope of deletion.

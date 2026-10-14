import { useEffect, useRef, useState } from "react";
import {
  emptyState,
  type State,
  type Confidence,
  type Outcome,
  type Attempt,
} from "./types";
import {
  course,
  topics,
  concepts,
  questions,
  contentVersion,
} from "./content/course";
import { demoState } from "./content/demo";
import { day, label, attemptLabel, record, select } from "./learning/engine";
import * as store from "./storage/store";
import { registerSW } from "virtual:pwa-register";
type Page =
  "home" | "topics" | "settings" | "setup" | "exam" | "practice" | "results";
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    home: "M3 10 12 3l9 7v10H3V10m6 10v-7h6v7",
    book: "M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2V4",
    calendar: "M4 5h16v16H4V5m3-3v6m10-6v6M4 10h16",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    leaf: "M19 4C6 3 2 8 5 15c7 6 15 1 14-11M5 20 15 9",
    clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
    wifi: "M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01",
    spark: "m12 3 2 6 7 3-7 2-2 7-2-7-7-2 7-3 2-6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.book} />
    </svg>
  );
}
const dateText = (d: string) =>
  d
    ? new Date(d.length === 10 ? `${d}T12:00:00` : d).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric" },
      )
    : "Not reviewed";
export default function App() {
  const [state, setState] = useState<State>(emptyState);
  const [namespace, setNamespace] = useState("learner");
  const [page, setPage] = useState<Page>("home");
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const swUpdate = useRef<((reload?: boolean) => Promise<void>) | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [result, setResult] = useState<Outcome | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formTopics, setFormTopics] = useState<string[]>([]);
  const [formDate, setFormDate] = useState("");
  const [formSize, setFormSize] = useState<3 | 5>(5);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackHeading = useRef<HTMLHeadingElement>(null);
  const working = useRef(false);
  useEffect(() => {
    let alive = true;
    store
      .load("learner")
      .then((s) => {
        if (alive) {
          setState(s);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (alive) {
          setStorageError(
            "Progress cannot be loaded. This is a temporary session; it may be lost on reload. Saved data has not been overwritten.",
          );
          setLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    if (import.meta.env.PROD) {
      swUpdate.current = registerSW({
        onOfflineReady() {
          setOfflineReady(true);
        },
        onNeedRefresh() {
          setUpdateReady(true);
        },
        onRegisterError() {
          setNotice(
            "Offline download failed. Keep this tab open and reconnect to retry.",
          );
        },
      });
      navigator.serviceWorker?.ready
        .then(async () => {
          const names = await caches.keys();
          if (names.some((n) => n.includes("precache"))) setOfflineReady(true);
        })
        .catch(() => {});
    }
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", up);
    };
  }, []);
  useEffect(() => {
    if (loaded) heading.current?.focus();
  }, [page, index]);
  useEffect(() => {
    if (feedback) feedbackHeading.current?.focus();
  }, [feedback]);
  const today = day(new Date());
  const studiedConcepts = concepts.filter((c) =>
    state.settings.studied.includes(c.topicId),
  );
  const due = studiedConcepts.filter(
    (c) => !state.reviews[c.id] || state.reviews[c.id].due <= today,
  );
  const independent = studiedConcepts.filter(
    (c) => state.reviews[c.id]?.independent,
  );
  const session = state.session;
  const q = session
    ? questions.find((q) => q.id === session.items[index]?.questionId)
    : undefined;
  const currentTopic = topics.find((t) =>
    t.conceptIds.includes(q?.conceptId ?? ""),
  );
  async function persist(next: State) {
    setState(next);
    if (!storageError)
      try {
        await store.save(namespace, next);
      } catch {
        setStorageError(
          "Storage is unavailable. Changes stay in this tab only and may be lost on reload.",
        );
      }
  }
  function navigate(p: Page) {
    setPage(p);
    setNotice("");
    setDeleteOpen(false);
  }
  function edit() {
    setFormTopics([...state.settings.studied]);
    setFormDate(state.settings.examDate);
    setFormSize(state.settings.size);
    navigate("setup");
  }
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await persist({
      ...state,
      settings: {
        studied: formTopics,
        examDate: formDate,
        size: formSize,
        onboarded: true,
      },
      session: null,
    });
    setBusy(false);
    navigate("home");
    setNotice("Your course is ready. Start with a small recall session.");
  }
  function resetQuestion() {
    setAnswer("");
    setConfidence(null);
    setHint(false);
    setFeedback(false);
    setResult(null);
    setRevealed(false);
  }
  async function start(mode: "review" | "exam") {
    const next = select(state, questions, concepts, mode);
    if (!next.items.length) {
      setNotice(
        "No eligible questions. Select a studied topic or reset question flags in Settings.",
      );
      return;
    }
    setBusy(true);
    await persist({ ...state, session: next });
    setBusy(false);
    setIndex(0);
    resetQuestion();
    navigate("practice");
  }
  function resume() {
    setIndex(session?.position ?? 0);
    resetQuestion();
    navigate("practice");
  }
  async function complete(outcome: Outcome, isReveal = revealed) {
    if (working.current || !q || !session) return;
    working.current = true;
    setBusy(true);
    const a: Attempt = {
      id: `${session.id}:${index}`,
      sessionId: session.id,
      questionId: q.id,
      conceptId: q.conceptId,
      contentVersion,
      at: new Date().toISOString(),
      confidence: confidence ?? "unsure",
      outcome,
      method: q.type === "choice" ? "automatic" : "self",
      hint,
      revealed: isReveal,
    };
    const nextSession = {
      ...session,
      position: index + 1,
      completed: index + 1 >= session.items.length,
    };
    let next: State = { ...record(state, a), session: nextSession };
    if (!storageError)
      try {
        next = await store.saveAttempt(namespace, a, nextSession);
      } catch {
        setStorageError(
          "Progress could not be saved. This session remains in this tab only.",
        );
      }
    setState(next);
    setResult(outcome);
    setBusy(false);
    working.current = false;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confidence || !answer) return;
    setFeedback(true);
    if (q?.type === "choice")
      await complete(
        Number(answer) === q.correctIndex ? "correct" : "incorrect",
      );
  }
  async function reveal() {
    setRevealed(true);
    setFeedback(true);
    await complete("incorrect", true);
  }
  async function skip() {
    await complete("skipped");
    advance();
  }
  function advance() {
    if (!session) return;
    if (index + 1 >= session.items.length) navigate("results");
    else {
      setIndex(index + 1);
      resetQuestion();
    }
  }
  async function switchDemo() {
    if (busy) return;
    setBusy(true);
    const nextNamespace = namespace === "learner" ? "demo" : "learner";
    try {
      let next = await store.load(nextNamespace);
      if (nextNamespace === "demo" && !next.settings.onboarded) {
        next = demoState();
        await store.save("demo", next);
      }
      setState(next);
      setNamespace(nextNamespace);
      setStorageError("");
      navigate("home");
    } catch {
      setNotice(
        "Could not switch progress safely. Your current progress has been kept.",
      );
    }
    setBusy(false);
  }
  async function deleteProgress() {
    setBusy(true);
    try {
      await store.clear(namespace);
      setState(emptyState());
      setStorageError("");
      setDeleteOpen(false);
      navigate("home");
      setNotice(
        "Progress cleared. Downloaded public course content is still available.",
      );
    } catch {
      setNotice(
        "Saved progress could not be deleted. Try again when browser storage is available.",
      );
    }
    setBusy(false);
  }
  const recent = [...state.attempts].reverse().slice(0, 4);
  const sessionAttempts = state.attempts.filter(
    (a) => a.sessionId === session?.id,
  );
  const daysToExam = state.settings.examDate
    ? Math.ceil(
        (new Date(`${state.settings.examDate}T12:00:00`).getTime() -
          new Date(`${today}T12:00:00`).getTime()) /
          86400000,
      )
    : null;
  function title(text: string, eyebrow?: string) {
    return (
      <>
        <p className="eyebrow">{eyebrow ?? "YOUR LEARNING SPACE"}</p>
        <h1 ref={heading} tabIndex={-1}>
          {text}
        </h1>
      </>
    );
  }
  function topicCard(t: (typeof topics)[number]) {
    const Heading = page === "topics" ? "h2" : "h3";
    const cs = concepts.filter((c) => c.topicId === t.id);
    const attempts = state.attempts.filter((a) =>
      cs.some((c) => c.id === a.conceptId),
    );
    const isStudied = state.settings.studied.includes(t.id);
    return (
      <article className="topic-card" key={t.id}>
        <div className={`topic-symbol ${t.id}`}>{t.symbol}</div>
        <div className="topic-copy">
          <Heading>{t.title}</Heading>
          <p>{t.description}</p>
          <span className="muted small">
            {attempts.length} attempts ·{" "}
            {attempts.length
              ? `Last checked ${dateText(attempts.at(-1)!.at)}`
              : "Not checked yet"}
          </span>
        </div>
        <span className={`tag ${isStudied ? "green" : ""}`}>
          {isStudied ? "Studied" : "Not studied"}
        </span>
      </article>
    );
  }
  if (!loaded)
    return (
      <main className="loading" aria-live="polite">
        <div className="wordmark">
          recall<span>✳</span>
        </div>
        <p>Opening your learning space…</p>
      </main>
    );
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar" aria-label="Workspace navigation">
        <button
          className="wordmark"
          onClick={() => navigate("home")}
          aria-label="Recall home"
        >
          recall<span>✳</span>
        </button>
        <div className="workspace-label">A LITTLE EVERY DAY</div>
        <nav aria-label="Main navigation">
          {[
            ["home", "home", "Overview"],
            ["topics", "book", "My topics"],
            ["exam", "calendar", "Exam revision"],
            ["settings", "settings", "Settings"],
          ].map(([p, icon, text]) => (
            <button
              key={p}
              className={page === p ? "nav-link active" : "nav-link"}
              aria-current={page === p ? "page" : undefined}
              onClick={() => navigate(p as Page)}
            >
              <Icon name={icon} />
              {text}
              {p === "exam" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="leaf" />
            <p>
              Small steps.
              <br />
              <strong>Lasting understanding.</strong>
            </p>
          </div>
          <button className="profile" onClick={edit}>
            <span className="avatar">B</span>
            <span>
              <strong>Biology learner</strong>
              <small>Personal learning space</small>
            </span>
            <span>↗</span>
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <span className="breadcrumb">
            My workspace <span>/</span>{" "}
            {page === "home"
              ? "Overview"
              : page === "practice"
                ? "Recall session"
                : page === "setup"
                  ? "Course setup"
                  : page === "results"
                    ? "Session results"
                    : page === "exam"
                      ? "Exam revision"
                      : page === "topics"
                        ? "My topics"
                        : "Settings"}
          </span>
          <span className="connection">
            <span className={`status-dot ${online ? "" : "offline"}`} />
            {online ? "Online" : "Offline"}
            <span className="desktop-only">
              {" "}
              ·{" "}
              {offlineReady
                ? "Ready offline"
                : import.meta.env.DEV
                  ? "Development preview"
                  : "Downloading for offline use"}
            </span>
          </span>
        </header>
        <main id="main" className="content" tabIndex={-1}>
          {namespace === "demo" && (
            <div className="banner demo">
              <strong>Demo mode · simulated learning history</strong>
              <button onClick={switchDemo} disabled={busy}>
                Exit demo
              </button>
            </div>
          )}
          {storageError && (
            <div className="banner warning" role="alert">
              {storageError}
            </div>
          )}
          {notice && (
            <div className="banner" role="status">
              {notice}
            </div>
          )}
          {updateReady && (
            <div className="banner">
              <span>
                An update is available. Finish your session before refreshing.
              </span>
              <button
                disabled={page === "practice"}
                onClick={() => swUpdate.current?.(true)}
              >
                Update now
              </button>
            </div>
          )}
          {page === "home" && (
            <>
              {title(
                state.settings.onboarded
                  ? "Keep your learning close."
                  : "A little today. Remembered tomorrow.",
                "MAKE ROOM FOR WHAT YOU REMEMBER",
              )}
              <p className="intro">
                A few questions. A fresh perspective. Pick up where you left
                off.
              </p>
              <section className="hero">
                <div className="hero-copy">
                  <span className="pill">
                    <Icon name="spark" size={15} /> YOUR DAILY RECALL
                  </span>
                  <h2>
                    {state.settings.onboarded
                      ? "A small session.\nA stronger memory."
                      : "Your semester,\none small step at a time."}
                  </h2>
                  <p>
                    {state.settings.onboarded
                      ? `Revisit what you’ve studied in a ${state.settings.size}-question session. No catching up. Just moving forward.`
                      : "Tell us what you’ve studied. We’ll help you revisit it, one thoughtful question at a time."}
                  </p>
                  <button
                    className="primary light"
                    disabled={busy}
                    onClick={() =>
                      state.settings.onboarded ? start("review") : edit()
                    }
                  >
                    {state.settings.onboarded
                      ? "Start a short review"
                      : "Set up my course"}
                    <Icon name="arrow" />
                  </button>
                  <span className="hero-foot">
                    <Icon name="clock" size={15} /> About 5 minutes · at your
                    own pace
                  </span>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-card back">
                    <span>THINK BACK</span>
                    <div className="art-line" />
                    <div className="art-line short" />
                  </div>
                  <div className="art-card front">
                    <span className="art-spark">✳</span>
                    <strong>
                      Learn.
                      <br />
                      Recall.
                      <br />
                      Grow.
                    </strong>
                    <div className="art-progress">
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <span className="floating star-one">✧</span>
                  <span className="floating star-two">✦</span>
                  <div className="art-caption">
                    A little practice goes a long way.
                  </div>
                </div>
              </section>
              {session && !session.completed && (
                <div className="resume-bar">
                  <span>
                    You have an unfinished session. Completed answers are saved;
                    an unfinished answer needs another attempt.
                  </span>
                  <button onClick={resume}>
                    Resume session <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
              <section className="stats" aria-label="Learning activity">
                <article>
                  <span className="stat-icon">
                    <Icon name="book" />
                  </span>
                  <div>
                    <span className="stat-value">
                      {state.settings.studied.length}
                      <small> / {topics.length}</small>
                    </span>
                    <p>Topics you’ve studied</p>
                  </div>
                </article>
                <article>
                  <span className="stat-icon amber">
                    <Icon name="clock" />
                  </span>
                  <div>
                    <span className="stat-value">{due.length}</span>
                    <p>Concepts to revisit</p>
                  </div>
                </article>
                <article>
                  <span className="stat-icon violet">
                    <Icon name="check" />
                  </span>
                  <div>
                    <span className="stat-value">{independent.length}</span>
                    <p>Recalled independently</p>
                  </div>
                </article>
              </section>
              <div className="dashboard-grid">
                <section>
                  <div className="section-heading">
                    <h2>Your topics</h2>
                    <button
                      className="text-button"
                      onClick={() => navigate("topics")}
                    >
                      View all <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <p className="section-sub">
                    A little attention keeps familiar ideas fresh.
                  </p>
                  <div className="topic-list">
                    {topics.slice(0, 3).map(topicCard)}
                  </div>
                  <button className="record-button" onClick={edit}>
                    ＋ Record what I studied
                  </button>
                </section>
                <aside className="revision-card" aria-label="Exam guidance">
                  <span className="mini-icon">
                    <Icon name="calendar" />
                  </span>
                  <p className="eyebrow">LOOKING AHEAD</p>
                  <h2>
                    Revision that knows{" "}
                    <br />
                    where to start.
                  </h2>
                  <p>
                    Your previous attempts help you choose what to revisit
                    before an exam.
                  </p>
                  {daysToExam !== null && (
                    <span className="tag">
                      {daysToExam < 0
                        ? "Exam date has passed"
                        : daysToExam === 0
                          ? "Exam today"
                          : `${daysToExam} days until your exam`}
                    </span>
                  )}
                  <button
                    className="secondary"
                    onClick={() => navigate("exam")}
                  >
                    Prepare for my exam <Icon name="arrow" size={16} />
                  </button>
                  <small>
                    Practice guidance, not a prediction of exam coverage.
                  </small>
                </aside>
              </div>
              <section className="recent">
                <div className="section-heading">
                  <h2>Recently revisited</h2>
                  <span className="muted small">
                    Your learning, at your pace
                  </span>
                </div>
                {recent.length ? (
                  <ul className="recent-list">
                    {recent.map((a) => (
                      <li key={a.id}>
                        <span className="recent-dot" />
                        <span>
                          {concepts.find((c) => c.id === a.conceptId)?.title}
                          <small>
                            {a.method === "self"
                              ? "Self-assessed"
                              : "Checked answer"}{" "}
                            · {dateText(a.at)}
                          </small>
                        </span>
                        <span className="tag">
                          {a.outcome === "skipped"
                            ? "Skipped"
                            : a.outcome === "correct" &&
                                !a.hint &&
                                !a.revealed &&
                                a.confidence !== "unsure"
                              ? "Recalled independently"
                              : a.outcome === "correct"
                                ? "Recalled with help"
                                : "Needs another attempt"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-inline">
                    <Icon name="leaf" />
                    <p>
                      Your first session starts your story. No history needed.
                    </p>
                  </div>
                )}
              </section>
              <div className="sample-note">
                <Icon name="book" size={16} />
                <span>
                  Introductory biology · sample course · source-checked by an
                  agent, not lecturer-reviewed. Your syllabus may differ.
                </span>
              </div>
            </>
          )}
          {page === "setup" && (
            <>
              {title("Make this space yours.", "COURSE SETUP")}
              <p className="intro">
                Choose what you’ve already studied. You can change this any
                time.
              </p>
              <form className="panel form-panel" onSubmit={saveSettings}>
                <span className="tag green">Sample course</span>
                <h2>{course.title}</h2>
                <p className="muted">
                  Prepared biology content, not an institution-specific
                  syllabus. No notes or account needed.
                </p>
                <fieldset>
                  <legend>Topics you’ve studied</legend>
                  <div className="topic-checks">
                    {topics.map((t) => (
                      <label key={t.id}>
                        <input
                          type="checkbox"
                          checked={formTopics.includes(t.id)}
                          onChange={(e) =>
                            setFormTopics(
                              e.target.checked
                                ? [...formTopics, t.id]
                                : formTopics.filter((id) => id !== t.id),
                            )
                          }
                        />
                        <span>
                          <strong>{t.title}</strong>
                          <small>{t.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="form-grid">
                  <label>
                    Exam date <span className="muted">(optional)</span>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Questions per session
                    <select
                      value={formSize}
                      onChange={(e) =>
                        setFormSize(Number(e.target.value) as 3 | 5)
                      }
                    >
                      <option value={3}>3 · a quick check-in</option>
                      <option value={5}>5 · a little more practice</option>
                    </select>
                  </label>
                </div>
                <p className="small muted">
                  Saving topic changes ends any unfinished session; completed
                  attempts remain. You can save with no topics and select one
                  later.
                </p>
                <button className="primary" disabled={busy}>
                  Save my course <Icon name="arrow" />
                </button>
              </form>
            </>
          )}
          {page === "topics" && (
            <>
              {title("Every topic has a next step.", "MY TOPICS")}
              <p className="intro">
                These labels reflect your attempts, not mastery or exam
                readiness.
              </p>
              <button className="secondary" onClick={edit}>
                Record what I studied
              </button>
              <div className="topic-detail-list">
                {topics.map((t) => (
                  <section className="panel" key={t.id}>
                    {topicCard(t)}
                    <ul className="concept-list">
                      {concepts
                        .filter((c) => c.topicId === t.id)
                        .map((c) => {
                          const r = state.reviews[c.id];
                          const n = state.attempts.filter(
                            (a) =>
                              a.conceptId === c.id && a.outcome !== "skipped",
                          ).length;
                          return (
                            <li key={c.id}>
                              <div>
                                <strong>{c.title}</strong>
                                <small>
                                  {n} completed attempts ·{" "}
                                  {r
                                    ? `Last reviewed ${dateText(r.lastAt)} · Revisit ${dateText(r.due)}`
                                    : "Start with a first check"}
                                </small>
                              </div>
                              <span className="tag">{label(r)}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
          {page === "exam" && (
            <>
              {title("Give your revision a direction.", "EXAM REVISION")}
              <p className="intro">
                Start with what needs attention, then check a little of what you
                remember.
              </p>
              <section className="panel exam-panel">
                <span className="mini-icon">
                  <Icon name="calendar" size={28} />
                </span>
                <h2>A focused session, built from your history.</h2>
                <p>
                  We prioritise concepts that needed help or are due for review.
                  With little history, we start with a baseline check of your
                  studied topics.
                </p>
                <div className="exam-facts">
                  <span>
                    <strong>{state.settings.studied.length}</strong> studied
                    topics
                  </span>
                  <span>
                    <strong>
                      {
                        state.attempts.filter((a) => a.outcome !== "skipped")
                          .length
                      }
                    </strong>{" "}
                    completed attempts
                  </span>
                  <span>
                    <strong>{state.settings.size}</strong> questions this
                    session
                  </span>
                </div>
                <label className="size-label">
                  Session length
                  <select
                    value={state.settings.size}
                    onChange={(e) =>
                      persist({
                        ...state,
                        settings: {
                          ...state.settings,
                          size: Number(e.target.value) as 3 | 5,
                        },
                      })
                    }
                  >
                    <option value={3}>3 questions</option>
                    <option value={5}>5 questions</option>
                  </select>
                </label>
                {!state.settings.studied.length && (
                  <p className="banner">
                    Select at least one studied topic to begin.
                  </p>
                )}
                <button
                  className="primary"
                  disabled={busy || !state.settings.studied.length}
                  onClick={() => start("exam")}
                >
                  Start exam revision <Icon name="arrow" />
                </button>
                <button className="text-button" onClick={edit}>
                  Edit topics or exam date
                </button>
                <p className="small muted">
                  This is recall practice, not a mock exam or a guarantee of
                  exam coverage. Scheduling uses simple prototype rules.
                </p>
              </section>
            </>
          )}
          {page === "practice" && q && session && (
            <>
              <div className="session-top">
                <span className="eyebrow">
                  {session.mode === "exam" ? "EXAM REVISION" : "DAILY RECALL"} ·{" "}
                  {currentTopic?.title}
                </span>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => navigate("home")}
                >
                  Pause & return home
                </button>
              </div>
              <div
                className="progress-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={session.items.length}
                aria-valuenow={index + 1}
                aria-label={`Question ${index + 1} of ${session.items.length}`}
              >
                <span
                  style={{
                    width: `${((index + 1) / session.items.length) * 100}%`,
                  }}
                />
              </div>
              <div className="question-meta">
                <span>
                  Question {index + 1} of {session.items.length}
                </span>
                <span>
                  {q.type === "choice"
                    ? "Multiple choice"
                    : "Explain in your own words"}
                </span>
              </div>
              <section className="panel question-panel">
                <div className="selection-reason">
                  <Icon name="spark" size={16} />
                  {session.items[index].reason}
                </div>
                <h1 className="question-title" ref={heading} tabIndex={-1}>
                  {q.prompt}
                </h1>
                {!feedback ? (
                  <form onSubmit={submit}>
                    {q.type === "choice" ? (
                      <fieldset className="options">
                        <legend className="sr-only">Choose an answer</legend>
                        {q.options!.map((option, i) => (
                          <label
                            className={answer === String(i) ? "selected" : ""}
                            key={option}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={i}
                              checked={answer === String(i)}
                              onChange={() => setAnswer(String(i))}
                            />
                            <span className="option-letter">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{option}</span>
                          </label>
                        ))}
                      </fieldset>
                    ) : (
                      <label className="written-label">
                        Your explanation
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Try recalling it before checking the answer…"
                          rows={5}
                        />
                        <small>
                          Your written answer stays in this tab and is not saved
                          or sent anywhere.
                        </small>
                      </label>
                    )}
                    <fieldset className="confidence">
                      <legend>How confident are you?</legend>
                      <div>
                        {(
                          [
                            ["unsure", "Unsure"],
                            ["somewhat", "Somewhat confident"],
                            ["confident", "Confident"],
                          ] as const
                        ).map(([value, text]) => (
                          <label
                            key={value}
                            className={confidence === value ? "selected" : ""}
                          >
                            <input
                              type="radio"
                              name="confidence"
                              value={value}
                              checked={confidence === value}
                              onChange={() => setConfidence(value)}
                            />
                            {text}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {hint && (
                      <div className="hint" role="status">
                        <strong>A small pointer</strong>
                        <p>{q.hint}</p>
                      </div>
                    )}
                    <div className="question-actions">
                      <button
                        className="primary"
                        disabled={!answer.trim() || !confidence || busy}
                      >
                        Check my answer <Icon name="arrow" size={17} />
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setHint(true)}
                        disabled={hint}
                      >
                        Give me a hint
                      </button>
                    </div>
                    <div className="question-bottom">
                      <button type="button" onClick={reveal} disabled={busy}>
                        I don’t know — show answer
                      </button>
                      <button type="button" onClick={skip} disabled={busy}>
                        Skip question
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="feedback" aria-live="polite">
                    <h2 tabIndex={-1} ref={feedbackHeading}>
                      {result === "correct"
                        ? hint
                          ? "A helpful step forward."
                          : "Nice work checking your recall."
                        : "Let’s make this clearer."}
                    </h2>
                    <span className="tag">
                      {q.type === "written"
                        ? "Self-assessment · not AI graded"
                        : "Answer checked automatically"}
                      {hint ? " · Hint used" : ""}
                      {revealed ? " · Answer revealed" : ""}
                    </span>
                    <h3>Expected answer</h3>
                    <ul>
                      {q.criteria.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <p>{q.explanation}</p>
                    <a
                      className="source-link"
                      href={q.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {q.source.title} · {q.source.section} ↗
                    </a>
                    <small className="muted block">
                      External source needs internet. Agent source-checked; not
                      lecturer-reviewed.
                    </small>
                    {q.type === "written" && !result && (
                      <fieldset className="self-assess">
                        <legend>Compare your answer. How did you do?</legend>
                        <p className="small muted">
                          Different wording is fine. Check whether you included
                          the essential points.
                        </p>
                        <div>
                          {(
                            ["correct", "partial", "incorrect"] as Outcome[]
                          ).map((o) => (
                            <button
                              type="button"
                              className="secondary"
                              disabled={busy}
                              key={o}
                              onClick={() => complete(o)}
                            >
                              {o === "correct"
                                ? "Included the key points"
                                : o === "partial"
                                  ? "Got some of it"
                                  : "Need another attempt"}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    )}
                    {result && (
                      <p className="feedback-status">
                        {result === "correct"
                          ? hint || revealed || confidence === "unsure"
                            ? "Recorded as recalled with help or uncertainty. We’ll revisit it soon."
                            : "Recorded as recalled independently."
                          : "Recorded for another attempt. A difficult question is useful information."}{" "}
                        {storageError
                          ? "Kept in this tab."
                          : "Progress saved on this device."}
                      </p>
                    )}
                    <div className="question-actions">
                      <button
                        className="primary"
                        disabled={!result || busy}
                        onClick={advance}
                      >
                        {index + 1 === session.items.length
                          ? "See session results"
                          : "Next question"}
                        <Icon name="arrow" size={17} />
                      </button>
                      <button
                        className="text-button"
                        disabled={state.flags.includes(q.id) || busy}
                        onClick={() =>
                          persist({ ...state, flags: [...state.flags, q.id] })
                        }
                      >
                        {state.flags.includes(q.id)
                          ? "Flagged on this device"
                          : "Flag this question"}
                      </button>
                    </div>
                    <small className="muted block">
                      Flags exclude the question from future sessions on this
                      device. Nothing is sent to a moderator; reset flags in
                      Settings.
                    </small>
                  </div>
                )}
              </section>
              <p className="session-note">
                <Icon name="leaf" size={16} /> You’re practising retrieval, not
                proving your worth.
              </p>
            </>
          )}
          {page === "results" && (
            <>
              {title("A small step worth taking.", "SESSION COMPLETE")}
              <p className="intro">
                You’ve made time for your learning. Here’s what this session
                showed.
              </p>
              <section className="panel">
                <div className="results-summary">
                  <div>
                    <strong>
                      {
                        sessionAttempts.filter((a) => a.outcome !== "skipped")
                          .length
                      }
                    </strong>
                    <span>Completed</span>
                  </div>
                  <div>
                    <strong>
                      {
                        sessionAttempts.filter(
                          (a) =>
                            a.outcome === "correct" &&
                            !a.hint &&
                            !a.revealed &&
                            a.confidence !== "unsure",
                        ).length
                      }
                    </strong>
                    <span>Recalled independently</span>
                  </div>
                  <div>
                    <strong>
                      {
                        sessionAttempts.filter((a) => a.outcome === "skipped")
                          .length
                      }
                    </strong>
                    <span>Skipped, not marked wrong</span>
                  </div>
                </div>
                <ul className="concept-list">
                  {sessionAttempts.map((a) => (
                    <li key={a.id}>
                      <div>
                        <strong>
                          {concepts.find((c) => c.id === a.conceptId)?.title}
                        </strong>
                        <small>
                          {a.method === "self"
                            ? "Self-assessed"
                            : "Automatically checked"}
                          {a.hint ? " · Hint used" : ""}
                          {a.revealed ? " · Answer revealed" : ""}
                        </small>
                      </div>
                      <span className="tag">{attemptLabel(a)}</span>
                    </li>
                  ))}
                </ul>
                <p className="muted">
                  There’s no backlog to clear. Come back for a short session
                  when you can.
                </p>
                <button className="primary" onClick={() => navigate("home")}>
                  Back to my learning <Icon name="arrow" />
                </button>
              </section>
            </>
          )}
          {page === "settings" && (
            <>
              {title("Your learning, your choices.", "SETTINGS")}
              <p className="intro">
                Keep your course relevant and your progress under your control.
              </p>
              <div className="settings-grid">
                <section className="panel">
                  <h2>Course & practice</h2>
                  <p>{course.title} · sample content</p>
                  <p>
                    {state.settings.studied.length} studied topics ·{" "}
                    {state.settings.size} questions per session
                  </p>
                  <p>
                    Exam date:{" "}
                    {state.settings.examDate
                      ? dateText(state.settings.examDate)
                      : "Not set"}
                  </p>
                  <button className="secondary" onClick={edit}>
                    Edit course settings
                  </button>
                </section>
                <section className="panel">
                  <h2>Explore a semester</h2>
                  <p>
                    Try simulated learning history to see how revision changes
                    over time. Demo progress is separate from your own.
                  </p>
                  <button
                    className="secondary"
                    disabled={busy || !!storageError}
                    onClick={switchDemo}
                  >
                    {namespace === "demo" ? "Exit demo mode" : "Try demo mode"}
                  </button>
                </section>
                <section className="panel">
                  <h2>Offline & sources</h2>
                  <p>
                    {import.meta.env.DEV
                      ? "Development preview: production offline caching is tested separately."
                      : offlineReady
                        ? "Public course content is downloaded for offline practice."
                        : "Keep the app open online to download public course content."}
                  </p>
                  <p>
                    First-time access and external source links need internet.
                    Questions and explanations are original sample material
                    supported by OpenStax Biology 2e.
                  </p>
                  <p className="small muted">
                    Source: OpenStax Biology 2e. Sample educational content
                    adapted for recall practice under CC BY-NC-SA 4.0.
                  </p>
                  <button
                    className="secondary"
                    disabled={busy || !state.flags.length}
                    onClick={() => persist({ ...state, flags: [] })}
                  >
                    Reset question flags ({state.flags.length})
                  </button>
                </section>
                <section className="panel">
                  <h2>Privacy & saved progress</h2>
                  <p>
                    No account, uploaded notes, or live AI. Progress stays in
                    this browser. Shared-device users may see it; clearing
                    browser data removes it. There is no cross-device sync.
                  </p>
                  <p>
                    Deleting progress clears settings, attempts, sessions, and
                    flags in{" "}
                    {namespace === "demo" ? "demo mode" : "your learning space"}
                    . Downloaded public content may remain.
                  </p>
                  {deleteOpen ? (
                    <div
                      className="delete-confirm"
                      role="group"
                      aria-label="Confirm progress deletion"
                    >
                      <p>
                        <strong>
                          Delete this progress? This cannot be undone.
                        </strong>
                      </p>
                      <button
                        className="danger"
                        disabled={busy}
                        onClick={deleteProgress}
                      >
                        Yes, delete progress
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setDeleteOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="danger-outline"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Clear my progress
                    </button>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
        <footer className="footer">
          <span>Made for a little progress, every day.</span>
          <span>
            <Icon name="leaf" size={14} /> Recall · learning prototype
          </span>
        </footer>
      </div>
    </div>
  );
}

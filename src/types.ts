export type Confidence = "unsure" | "somewhat" | "confident";
export type Outcome = "correct" | "partial" | "incorrect" | "skipped";
export interface Source {
  title: string;
  url: string;
  section: string;
}
export interface Question {
  id: string;
  conceptId: string;
  type: "choice" | "written";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  criteria: string[];
  hint: string;
  explanation: string;
  source: Source;
  validated: boolean;
  checkedAt: string;
  verification: string;
}
export interface Topic {
  id: string;
  title: string;
  description: string;
  symbol: string;
  conceptIds: string[];
}
export interface Concept {
  id: string;
  topicId: string;
  title: string;
}
export interface Settings {
  studied: string[];
  examDate: string;
  size: 3 | 5;
  onboarded: boolean;
}
export interface Attempt {
  id: string;
  sessionId: string;
  questionId: string;
  conceptId: string;
  contentVersion: string;
  at: string;
  confidence: Confidence;
  outcome: Outcome;
  method: "automatic" | "self";
  hint: boolean;
  revealed: boolean;
}
export interface Review {
  conceptId: string;
  lastAt: string;
  due: string;
  step: number;
  lastSession: string;
  lastOutcome: Outcome;
  independent: boolean;
}
export interface Session {
  id: string;
  mode: "review" | "exam";
  items: { questionId: string; reason: string }[];
  position: number;
  completed: boolean;
}
export interface State {
  version: 1;
  settings: Settings;
  attempts: Attempt[];
  reviews: Record<string, Review>;
  flags: string[];
  session: Session | null;
}
export const emptyState = (): State => ({
  version: 1,
  settings: { studied: [], examDate: "", size: 5, onboarded: false },
  attempts: [],
  reviews: {},
  flags: [],
  session: null,
});

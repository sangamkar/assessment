import { getActivity, getMission } from "../content/missions";
import type { AppState } from "./progress";

export const STAGES = [
  "Exposure",
  "Exploration",
  "Foundational competence",
  "Independent application",
  "Mastery / specialization",
] as const;
export type GrowthStage = (typeof STAGES)[number];
export type Support = "together" | "reminders" | "independent";
export type Strategy = "example" | "clue" | "another-way";
export interface ActivitySession {
  id: string;
  activityId: string;
  startedAt: number;
  triedAt?: number;
  reflection: string;
  drawing: string[];
  strategies: Strategy[];
}
export interface Observation {
  id: string;
  sessionId: string;
  ts: number;
  stage: GrowthStage;
  support: Support;
  note: string;
}
export interface GrowthState {
  activeMissionId?: string;
  sessions: ActivitySession[];
  observations: Observation[];
}
export const emptyGrowth = (): GrowthState => ({
  sessions: [],
  observations: [],
});
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const STRATEGIES: Strategy[] = ["example", "clue", "another-way"];
const SUPPORTS: Support[] = ["together", "reminders", "independent"];
const finite = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x > 0;

/** Sanitize imported growth data independently, preserving the academic backup. */
export function normalizeGrowth(value: unknown): GrowthState {
  if (!value || typeof value !== "object") return emptyGrowth();
  const data = value as Partial<GrowthState>;
  const ids = new Set<string>();
  const sessions: ActivitySession[] = [];
  for (const s of Array.isArray(data.sessions) ? data.sessions : []) {
    if (
      !s ||
      typeof s.id !== "string" ||
      ids.has(s.id) ||
      !getActivity(s.activityId) ||
      !finite(s.startedAt)
    )
      continue;
    ids.add(s.id);
    sessions.push({
      id: s.id,
      activityId: s.activityId,
      startedAt: s.startedAt,
      triedAt: finite(s.triedAt) ? s.triedAt : undefined,
      reflection:
        typeof s.reflection === "string" ? s.reflection.slice(0, 500) : "",
      drawing: Array.isArray(s.drawing)
        ? s.drawing
            .filter((p) => typeof p === "string" && /^[ML\d., -]+$/.test(p))
            .slice(0, 40)
            .map((p) => p.slice(0, 6000))
        : [],
      strategies: Array.isArray(s.strategies)
        ? [...new Set(s.strategies.filter((s) => STRATEGIES.includes(s)))]
        : [],
    });
  }
  const seen = new Set<string>();
  const observations: Observation[] = [];
  for (const o of Array.isArray(data.observations) ? data.observations : []) {
    if (
      !o ||
      typeof o.id !== "string" ||
      seen.has(o.id) ||
      !sessions.some((s) => s.id === o.sessionId && s.triedAt) ||
      !finite(o.ts) ||
      !STAGES.includes(o.stage) ||
      !SUPPORTS.includes(o.support) ||
      typeof o.note !== "string" ||
      !o.note.trim()
    )
      continue;
    seen.add(o.id);
    observations.push({
      id: o.id,
      sessionId: o.sessionId,
      ts: o.ts,
      stage: o.stage,
      support: o.support,
      note: o.note.trim().slice(0, 500),
    });
  }
  return {
    activeMissionId:
      typeof data.activeMissionId === "string" &&
      getMission(data.activeMissionId)
        ? data.activeMissionId
        : undefined,
    sessions,
    observations,
  };
}

export function chooseMission(state: AppState, missionId: string): AppState {
  return getMission(missionId)
    ? { ...state, growth: { ...state.growth, activeMissionId: missionId } }
    : state;
}
export function startActivity(
  state: AppState,
  activityId: string,
  now = Date.now(),
): AppState {
  if (
    !getActivity(activityId) ||
    state.growth.sessions.some((s) => s.activityId === activityId && !s.triedAt)
  )
    return state;
  const session: ActivitySession = {
    id: uid(),
    activityId,
    startedAt: now,
    reflection: "",
    drawing: [],
    strategies: [],
  };
  return {
    ...state,
    growth: { ...state.growth, sessions: [...state.growth.sessions, session] },
  };
}
export function editSession(
  state: AppState,
  id: string,
  patch: Partial<Pick<ActivitySession, "reflection" | "drawing">>,
): AppState {
  return {
    ...state,
    growth: {
      ...state.growth,
      sessions: state.growth.sessions.map((s) =>
        s.id !== id
          ? s
          : {
              ...s,
              reflection: (patch.reflection ?? s.reflection).slice(0, 500),
              drawing: patch.drawing
                ? patch.drawing.slice(0, 40).map((p) => p.slice(0, 6000))
                : s.drawing,
            },
      ),
    },
  };
}
export function useStrategy(
  state: AppState,
  id: string,
  strategy: Strategy,
): AppState {
  if (!STRATEGIES.includes(strategy)) return state;
  return {
    ...state,
    growth: {
      ...state.growth,
      sessions: state.growth.sessions.map((s) =>
        s.id === id
          ? { ...s, strategies: [...new Set([...s.strategies, strategy])] }
          : s,
      ),
    },
  };
}
export function markTried(
  state: AppState,
  id: string,
  now = Date.now(),
): AppState {
  return {
    ...state,
    growth: {
      ...state.growth,
      sessions: state.growth.sessions.map((s) =>
        s.id === id && !s.triedAt ? { ...s, triedAt: now } : s,
      ),
    },
  };
}
export function addObservation(
  state: AppState,
  sessionId: string,
  input: Pick<Observation, "stage" | "support" | "note">,
  now = Date.now(),
): AppState {
  if (
    !state.growth.sessions.some((s) => s.id === sessionId && s.triedAt) ||
    !STAGES.includes(input.stage) ||
    !SUPPORTS.includes(input.support) ||
    !input.note.trim()
  )
    return state;
  const observation: Observation = {
    ...input,
    note: input.note.trim().slice(0, 500),
    id: uid(),
    sessionId,
    ts: now,
  };
  return {
    ...state,
    growth: {
      ...state.growth,
      observations: [...state.growth.observations, observation],
    },
  };
}

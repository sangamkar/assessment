import { describe, expect, it } from "vitest";
import { getSkill } from "../src/content";
import { GROWTH_DOMAINS, MISSIONS } from "../src/content/missions";
import {
  addObservation,
  chooseMission,
  editSession,
  markTried,
  normalizeGrowth,
  startActivity,
  useStrategy,
} from "../src/engine/growth";
import {
  emptyState,
  recordAttempt,
  upgradeState,
} from "../src/engine/progress";

const NOW = Date.UTC(2026, 10, 4, 14);
const start = () => startActivity(emptyState(), "airport-runway", NOW);

describe("growth missions and real evidence", () => {
  it("preserves academic state when migrating a version 1 backup", () => {
    const academic = recordAttempt(emptyState(), {
      itemId: "saved-question",
      skill: "m.measure",
      correct: true,
      d: 2,
      ts: NOW,
      mode: "quest",
    });
    const { growth: _growth, ...old } = academic;
    const migrated = upgradeState(
      JSON.parse(JSON.stringify({ ...old, version: 1 })),
    );
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) return;
    expect(migrated.state.version).toBe(3);
    expect(migrated.state.attempts).toEqual(academic.attempts);
    expect(migrated.state.skills).toEqual(academic.skills);
    expect(migrated.state.stars).toBe(academic.stars);
    expect(migrated.state.growth).toEqual({ sessions: [], observations: [] });
  });

  it("resumes drafts, records coaching, and does not convert trying into mastery", () => {
    let state = chooseMission(start(), "airport");
    const id = state.growth.sessions[0].id;
    state = editSession(state, id, {
      reflection: "I made it wider.",
      drawing: ["M1,2 L10,20"],
    });
    state = useStrategy(useStrategy(state, id, "clue"), id, "clue");
    expect(startActivity(state, "airport-runway", NOW + 1)).toBe(state);
    state = markTried(state, id, NOW + 2);
    state = markTried(state, id, NOW + 3);
    expect(state.growth.sessions[0].triedAt).toBe(NOW + 2);
    expect(state.growth.sessions[0].strategies).toEqual(["clue"]);
    expect(state.growth.observations).toEqual([]);
    expect(state.skills).toEqual({});
    expect(state.attempts).toEqual([]);
    expect(state.stars).toBe(0);
    const restored = upgradeState(JSON.parse(JSON.stringify(state)));
    expect(restored.ok && restored.state.growth).toEqual(state.growth);
  });

  it("keeps revisits distinct and retains earlier evidence", () => {
    let state = start();
    const id = state.growth.sessions[0].id;
    state = markTried(state, id, NOW + 1);
    state = addObservation(
      state,
      id,
      {
        stage: "Exploration",
        support: "reminders",
        note: "Tested two planes after a reminder.",
      },
      NOW + 2,
    );
    state = startActivity(state, "airport-runway", NOW + 3);
    expect(state.growth.sessions).toHaveLength(2);
    expect(state.growth.sessions[1].id).not.toBe(id);
    expect(state.growth.sessions[1].triedAt).toBeUndefined();
    expect(state.growth.observations[0].sessionId).toBe(id);
    expect(chooseMission(state, "cafe").growth.sessions).toEqual(
      state.growth.sessions,
    );
  });

  it("requires a real completed session and written evidence for a parent observation", () => {
    const state = start();
    const input = {
      stage: "Independent application" as const,
      support: "independent" as const,
      note: "Used a checklist without prompts.",
    };
    expect(addObservation(state, state.growth.sessions[0].id, input)).toBe(
      state,
    );
    const tried = markTried(state, state.growth.sessions[0].id, NOW + 1);
    expect(addObservation(tried, "missing-session", input)).toBe(tried);
    expect(
      addObservation(tried, state.growth.sessions[0].id, {
        ...input,
        note: "  ",
      }),
    ).toBe(tried);
    const observed = addObservation(
      tried,
      state.growth.sessions[0].id,
      input,
      NOW + 2,
    );
    expect(observed.growth.observations).toHaveLength(1);
    expect(observed.skills).toEqual({});
  });

  it("ignores unknown missions, activities and malformed imported growth records", () => {
    const state = emptyState();
    expect(chooseMission(state, "unknown")).toBe(state);
    expect(startActivity(state, "unknown")).toBe(state);
    const valid = markTried(start(), start().growth.sessions[0].id); // wrong session id cannot complete a different run
    expect(valid.growth.sessions[0].triedAt).toBeUndefined();
    const clean = normalizeGrowth({
      activeMissionId: "unknown",
      sessions: [null, { id: "x", activityId: "unknown", startedAt: NOW }],
      observations: [
        {
          id: "o",
          sessionId: "x",
          ts: NOW,
          stage: "Mastery / specialization",
          support: "independent",
          note: "Claim",
        },
      ],
    });
    expect(clean.sessions).toEqual([]);
    expect(clean.observations).toEqual([]);
    expect(clean.activeMissionId).toBeUndefined();
  });

  it("bounds imported drawings and notes, rejecting markup in sketch paths", () => {
    const state = start();
    const s = state.growth.sessions[0];
    const normalized = normalizeGrowth({
      sessions: [
        {
          ...s,
          reflection: "a".repeat(800),
          drawing: [
            "<script>alert(1)</script>",
            ...Array(50).fill("M1,2 L3,4"),
          ],
          strategies: ["clue", "clue", "bad"],
        },
      ],
    });
    expect(normalized.sessions[0].reflection).toHaveLength(500);
    expect(normalized.sessions[0].drawing).toHaveLength(40);
    expect(normalized.sessions[0].strategies).toEqual(["clue"]);
  });

  it("ships a valid cross-domain activity catalog with working academic links", () => {
    const activities = MISSIONS.flatMap((m) => m.activities);
    expect(new Set(activities.map((a) => a.id)).size).toBe(activities.length);
    expect(new Set(activities.map((a) => a.domain))).toEqual(
      new Set(Object.keys(GROWTH_DOMAINS)),
    );
    for (const mission of MISSIONS) {
      expect(mission.activities).toHaveLength(4);
      for (const activity of mission.activities) {
        expect(activity.steps).toHaveLength(3);
        expect(activity.safety.length).toBeGreaterThan(15);
        expect(activity.observe.length).toBeGreaterThan(15);
        if (activity.practiceSkill)
          expect(
            getSkill(activity.practiceSkill),
            activity.practiceSkill,
          ).toBeTruthy();
      }
    }
  });
});

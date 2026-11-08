import type { Item, Skill } from "../content/types";
import { getSkill } from "../content";
import { MOCK_ONLY_ITEMS } from "../content/mockOnly";
/** Ignore IDs, answer order and distractor changes: those do not make a new task. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => [key, canonical(v)]),
    );
  return value;
}
export function itemFingerprint(item: Item): string {
  const correct = item.choices.find((c) => c.correct);
  const text = (v: string | undefined) =>
    (v ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  return JSON.stringify(
    canonical([
      text(item.say),
      item.visual ?? null,
      correct?.visual ?? text(correct?.text ?? correct?.say),
    ]),
  );
}
export function isMockFingerprint(fingerprint: string): boolean {
  let hash = 2166136261;
  for (let i = 0; i < fingerprint.length; i++) {
    hash ^= fingerprint.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 3 === 0;
}
const exclusiveFingerprints = new Set(MOCK_ONLY_ITEMS.map(itemFingerprint));
export function isMockItem(item: Item): boolean {
  const skill = getSkill(item.skill);
  const assessed =
    skill &&
    (skill.subject === "math" || skill.subject === "reading") &&
    skill.strand !== "writing" &&
    !skill.language &&
    (!skill.regions || skill.regions.includes("us-ga"));
  return (
    !!assessed &&
    (exclusiveFingerprints.has(itemFingerprint(item)) ||
      item.assessmentPool === "mock" ||
      (item.assessmentPool !== "practice" && isMockFingerprint(itemFingerprint(item))))
  );
}
export function poolItems(skill: Skill, pool: "practice" | "mock"): Item[] {
  const written = (skill.items ?? []).filter(
    (i) => isMockItem(i) === (pool === "mock"),
  );
  return pool === "mock"
    ? [...written, ...MOCK_ONLY_ITEMS.filter((i) => i.skill === skill.id)]
    : written;
}

/** Old reading generators encoded difficulty in IDs but did not save fingerprints. */
export function legacyItemFamily(id: string): string {
  if (/^r\.(sight|lettersound|firstsound)#/.test(id))
    return id.replace(/-[123]$/, "");
  if (id.startsWith("r.letters#")) return id.replace(/#[123]-/, "#");
  return id;
}

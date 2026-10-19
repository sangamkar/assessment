/**
 * Content linter for the skill map and question bank (docs/VISION.md §4).
 * Run: npm run validate
 */
import { ALL_SKILLS, SUBJECTS, getSkill } from '../src/content';
import type { Difficulty, Item, Skill } from '../src/content/types';
import { createRng } from '../src/engine/rng';

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

function checkItem(item: Item, where: string) {
  if (!item.say?.trim()) err(where, 'missing spoken prompt');
  if (!item.explain?.trim()) err(where, 'missing explanation (Q11)');
  const n = item.choices.length;
  if (n < 3 || n > 4) err(where, `has ${n} choices; need 3–4 (Q6)`);
  const correct = item.choices.filter((c) => c.correct);
  if (correct.length !== 1) err(where, `has ${correct.length} correct choices; need exactly 1`);
  const ids = new Set<string>();
  const keys = new Set<string>();
  for (const c of item.choices) {
    if (ids.has(c.id)) err(where, `duplicate choice id ${c.id}`);
    ids.add(c.id);
    if (!c.visual && !c.text) err(where, `choice ${c.id} has nothing to show`);
    if (!c.correct && !c.why) err(where, `wrong choice ${c.id} has no misconception tag (Q5)`);
    if (c.why && !/^[a-z][a-z_]+$/.test(c.why)) err(where, `bad tag "${c.why}"`);
    if (c.text && /[()=]/.test(c.text)) err(where, `choice text "${c.text}" looks like an answer giveaway (Q1)`);
    if (c.text && /^-\d/.test(c.text)) err(where, `negative number choice ${c.text}`);
    const key = JSON.stringify({ t: c.text, v: c.visual });
    if (keys.has(key)) err(where, `two identical choices (${c.text ?? c.visual?.kind})`);
    keys.add(key);
  }
  const texts = item.choices.map((c) => c.text?.toLowerCase()).filter(Boolean) as string[];
  if (item.speakChoices === false && texts.length === n && n > 1) {
    const said = item.say.toLowerCase();
    const spoken = (t: string) => new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(said);
    if (texts.every(spoken)) err(where, 'prompt reads every choice aloud on a no-read-aloud item (Q3)');
  }
}

function checkSkill(skill: Skill) {
  const where = skill.id;
  const subject = SUBJECTS.find((s) => s.id === skill.subject);
  if (!subject) err(where, `unknown subject ${skill.subject}`);
  else if (!subject.strands.some((s) => s.id === skill.strand)) err(where, `unknown strand ${skill.strand}`);
  for (const p of skill.prereqs) if (!getSkill(p)) err(where, `unknown prerequisite ${p}`);
  if (!skill.intro.length) err(where, 'no intro slides');
  if (!skill.items?.length && !skill.generate) err(where, 'no items and no generator');

  const seenIds = new Set<string>();
  for (const item of skill.items ?? []) {
    if (seenIds.has(item.id)) err(item.id, 'duplicate item id');
    seenIds.add(item.id);
    if (item.skill !== skill.id) err(item.id, `item skill ${item.skill} ≠ ${skill.id}`);
    checkItem(item, item.id);
  }
  if (skill.generate) {
    for (const d of [1, 2, 3] as Difficulty[]) {
      for (let seed = 1; seed <= 300; seed++) {
        let item: Item;
        try {
          item = skill.generate(createRng(seed * 7919 + d), d);
        } catch (e) {
          err(`${skill.id}@d${d}#${seed}`, `generator threw: ${(e as Error).message}`);
          break;
        }
        if (item.difficulty !== d) err(`${item.id}`, `generated difficulty ${item.difficulty}, asked for ${d}`);
        const before = errors.length;
        checkItem(item, `${item.id} (seed ${seed})`);
        if (errors.length > before) break; // one report per difficulty is enough
      }
    }
  }
}

function checkCycles() {
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      err(id, `prerequisite cycle: ${[...path, id].join(' → ')}`);
      return;
    }
    state.set(id, 'visiting');
    for (const p of getSkill(id)?.prereqs ?? []) visit(p, [...path, id]);
    state.set(id, 'done');
  };
  ALL_SKILLS.forEach((s) => visit(s.id, []));
}

const ids = new Set<string>();
for (const s of ALL_SKILLS) {
  if (ids.has(s.id)) err(s.id, 'duplicate skill id');
  ids.add(s.id);
  checkSkill(s);
}
checkCycles();

for (const subject of SUBJECTS) {
  const skills = ALL_SKILLS.filter((s) => s.subject === subject.id);
  const hand = skills.reduce((n, s) => n + (s.items?.length ?? 0), 0);
  const gens = skills.filter((s) => s.generate).length;
  console.log(`${subject.title.padEnd(28)} ${String(skills.length).padStart(3)} skills  ${String(hand).padStart(4)} written items  ${gens} generators`);
  for (const s of skills) {
    const count = s.items?.length ?? 0;
    if (!s.generate && count < 4) warnings.push(`${s.id}: only ${count} items (target 8+)`);
  }
}

warnings.forEach((w) => console.log(`warn  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`ERROR ${e}`));
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log(`\nAll content valid: ${ALL_SKILLS.length} skills.`);

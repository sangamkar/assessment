export type SubjectId = 'math' | 'reading' | 'science' | 'social' | 'reasoning' | 'hindi';
/** Curricula the skill map can be aligned to (see curricula.ts). */
export type CurriculumId = 'us-ga' | 'in-cbse';
export type Grade = 'K' | '1' | '2';
export type Difficulty = 1 | 2 | 3;

export type ShapeKind =
  // 2-D
  | 'circle'
  | 'oval'
  | 'triangle'
  | 'right-triangle'
  | 'square'
  | 'rectangle'
  | 'hexagon'
  | 'pentagon'
  | 'trapezoid'
  | 'rhombus'
  // non-examples used as distractors
  | 'open-triangle'
  | 'curvy-triangle'
  // partitioned
  | 'circle-halves'
  | 'circle-fourths'
  | 'circle-unequal'
  | 'rect-halves'
  | 'rect-fourths'
  | 'rect-unequal'
  // 3-D
  | 'cube'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'rect-prism';

export interface ShapeSpec {
  shape: ShapeKind;
  color?: string;
  /** degrees */
  rotate?: number;
  /** 0.5 – 1.2, relative size */
  scale?: number;
  /** width / height for rectangles (default 1.8) */
  stretch?: number;
  /** mirror image (used by spatial-reasoning items) */
  flip?: boolean;
  /** outline only, so closed/open shapes can be compared fairly */
  outline?: boolean;
}

export type CompositePreset =
  | 'house'
  | 'two-squares'
  | 'square-from-triangles'
  | 'hexagon-from-trapezoids'
  | 'ice-cream'
  | 'triangle-split';

export type Place = 'above' | 'below' | 'beside' | 'inside' | 'behind' | 'in-front';

/** Everything the app can draw. Each kind has exactly one renderer in ui/Visual.tsx. */
export type Visual =
  | { kind: 'emoji'; emoji: string; size?: 'md' | 'lg' | 'xl'; label?: string }
  | { kind: 'objects'; emoji: string; count: number; arrange?: 'line' | 'scatter' | 'dice' }
  | { kind: 'groups'; groups: { emoji: string; count: number }[]; sep?: string }
  | { kind: 'crossed'; emoji: string; total: number; crossed: number }
  | { kind: 'tenFrame'; filled: number; frames?: 1 | 2; color?: string }
  | { kind: 'number'; value: string | number }
  | { kind: 'sequence'; items: string[]; blank: number }
  | { kind: 'text'; text: string; size?: 'md' | 'lg' | 'xl' }
  | ({ kind: 'shape' } & ShapeSpec)
  | { kind: 'shapeRow'; shapes: ShapeSpec[]; blank?: number }
  | { kind: 'lengths'; mode: 'length' | 'height'; items: { emoji: string; size: number; color: string; offset?: number }[] }
  | { kind: 'composite'; preset: CompositePreset }
  | { kind: 'balance'; left: string; right: string; tilt: 'left' | 'right' | 'level'; leftCount?: number; rightCount?: number }
  | { kind: 'graph'; title?: string; rows: { emoji: string; count: number }[] }
  | { kind: 'tally'; count: number }
  | { kind: 'clock'; hour: number; minute: number }
  | { kind: 'matrix'; cols: 2 | 3; cells: (Visual | null)[] }
  | { kind: 'map'; rows: number; cols: number; cells: { r: number; c: number; emoji: string }[]; legend?: boolean }
  | { kind: 'story'; title: string; lines: { emoji: string; text: string }[] }
  | { kind: 'measure'; emoji: string; units: number; unit: string }
  | { kind: 'bond'; whole: number | '?'; a: number | '?'; b: number | '?' }
  | { kind: 'place'; thing: string; ref: string; where: Place }
  | { kind: 'coins'; values: number[]; symbol: string }
  | { kind: 'row'; items: Visual[]; sep?: string };

export interface Choice {
  id: string;
  visual?: Visual;
  text?: string;
  /** Spoken when the child taps the choice (unless the item disables it). */
  say?: string;
  correct?: true;
  /** Misconception tag for a wrong choice — see misconceptions.ts. */
  why?: string;
}

export interface Item {
  id: string;
  skill: string;
  difficulty: Difficulty;
  /** Spoken prompt (always read aloud). Must not reveal the answer. */
  say: string;
  /** Short on-screen prompt for grown-ups and early readers. */
  show?: string;
  visual?: Visual;
  choices: Choice[];
  /** Spoken + shown as teaching feedback after a wrong answer. */
  explain: string;
  /** Spoken after the first wrong try. */
  hint?: string;
  /** false when reading the choices aloud would give the answer away (decoding, sight words). */
  speakChoices?: boolean;
  /** Keep authored order instead of shuffling (e.g. ordered scales). */
  keepOrder?: boolean;
  /** Spoken right after `say` in another language — e.g. the Hindi letter or word being asked about. */
  voice?: { text: string; lang: string };
  /** Language for speaking choice names (default: the app's English locale). */
  choiceLang?: string;
}

export interface Slide {
  say: string;
  visual?: Visual;
  caption?: string;
}

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(list: readonly T[]): T;
  shuffle<T>(list: readonly T[]): T[];
}

export interface Skill {
  id: string;
  subject: SubjectId;
  strand: string;
  grade: Grade;
  /** Parent-facing name. */
  title: string;
  /** Child-facing name, read aloud. */
  kidTitle: string;
  icon: string;
  standards: string[];
  prereqs: string[];
  /** One concrete off-screen activity for the parent. */
  parentTip: string;
  /** 1–3 short spoken teaching slides shown the first time a skill is opened. */
  intro: Slide[];
  items?: Item[];
  generate?: (rng: Rng, difficulty: Difficulty) => Item;
  /** Only shown for these curricula (e.g. Hindi, Indian money). Omit for universal skills. */
  regions?: CurriculumId[];
}

export interface Strand {
  id: string;
  title: string;
}

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  kidTitle: string;
  icon: string;
  /** Tailwind-free raw colors so content stays UI-agnostic. */
  color: string;
  soft: string;
  strands: Strand[];
}

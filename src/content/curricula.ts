import type { CurriculumId, Grade, Skill } from './types';

/**
 * Curriculum overlays. Skills are universal; each curriculum adds its own
 * grade names, locale (spelling, voice, currency) and standard references.
 * Adding a country = adding an entry here plus any region-only skills.
 */
export interface Curriculum {
  id: CurriculumId;
  name: string;
  short: string;
  /** Speech + spelling locale for English. */
  locale: 'en-US' | 'en-IN';
  currency: string;
  /** Approximate grade equivalents for the app's K / 1 / 2 bands. */
  gradeLabel: Record<Grade, string>;
  gradeBadge: Record<Grade, string>;
  codes: (skill: Skill) => string[];
}

/**
 * NCERT "Joyful Mathematics" Class 1 (13 chapters, used by CBSE schools).
 * Mapping is by topic, so treat it as approximate.
 */
const NCERT_MATH_1: Record<string, string[]> = {
  'm.position': ['JM1 Ch1 Finding the Furry Cat!'],
  'm.measure': ['JM1 Ch2 What is Long?'],
  'm.shapes2d': ['JM1 Ch2 What is Long? (round/flat)'],
  'm.shapes3d': ['JM1 Ch2 What is Long? (round/flat)'],
  'm.count10': ['JM1 Ch3 Mango Treat'],
  'm.numerals': ['JM1 Ch3 Mango Treat'],
  'm.subitize': ['JM1 Ch3 Mango Treat'],
  'm.compare': ['JM1 Ch3 Mango Treat'],
  'm.make10': ['JM1 Ch4 Making 10'],
  'm.bonds': ['JM1 Ch4 Making 10'],
  'm.count20': ['JM1 Ch5 How Many?'],
  'm.teens': ['JM1 Ch5 How Many?'],
  'm.add': ['JM1 Ch6 Vegetable Farm'],
  'm1.add20': ['JM1 Ch6 Vegetable Farm'],
  'm.sub': ['JM1 Ch7 Lina’s Family'],
  'm1.sub20': ['JM1 Ch7 Lina’s Family'],
  'm.seqnext': ['JM1 Ch8 Fun with Numbers'],
  'm.countback': ['JM1 Ch8 Fun with Numbers'],
  'm.tens': ['JM1 Ch8 Fun with Numbers'],
  'm1.compare100': ['JM1 Ch8 Fun with Numbers'],
  'm1.tenmore': ['JM1 Ch8 Fun with Numbers'],
  'm.pattern': ['JM1 Ch9 Utsav'],
  'm1.growpattern': ['JM1 Ch9 Utsav'],
  'm1.time': ['JM1 Ch10 How do I Spend my Day?'],
  'q.balance': ['JM1 Ch11 How Many Times? (equal groups)'],
  'in.money': ['JM1 Ch12 How Much Can We Spend?'],
  'm.data': ['JM1 Ch13 So Many Toys'],
  'm1.units': ['JM1 Ch2 What is Long? (measuring)'],
};

export const CURRICULA: Record<CurriculumId, Curriculum> = {
  'us-ga': {
    id: 'us-ga',
    name: 'USA · Georgia (Forsyth) + i-Ready',
    short: 'US',
    locale: 'en-US',
    currency: '$',
    gradeLabel: { K: 'Kindergarten', '1': 'Grade 1', '2': 'Grade 2' },
    gradeBadge: { K: 'K', '1': 'G1', '2': 'G2' },
    codes: (s) => (s.regions && !s.regions.includes('us-ga') ? [] : s.standards),
  },
  'in-cbse': {
    id: 'in-cbse',
    name: 'India · CBSE / NCERT',
    short: 'India',
    locale: 'en-IN',
    currency: '₹',
    gradeLabel: { K: 'UKG – early Class 1', '1': 'Class 1 – 2', '2': 'Class 2 – 3' },
    gradeBadge: { K: 'UKG', '1': 'C1', '2': 'C2' },
    codes: (s) => NCERT_MATH_1[s.id] ?? (s.regions?.includes('in-cbse') ? s.standards : []),
  },
};

/** US → Indian/British English for on-screen and spoken text when the locale is en-IN. */
const EN_IN: [RegExp, string][] = [
  [/\bcolor(s|ful)?\b/gi, 'colour$1'],
  [/\bfavorite\b/gi, 'favourite'],
  [/\bgray\b/gi, 'grey'],
  [/\bcenter\b/gi, 'centre'],
  [/\bmeters?\b/gi, 'metre'],
  [/\bsoccer ball\b/gi, 'football'],
  [/\bflashlight\b/gi, 'torch'],
  [/\bcookies\b/gi, 'biscuits'],
  [/\bcookie\b/gi, 'biscuit'],
  [/\bcandy\b/gi, 'sweets'],
  [/\btrash in the bin\b/gi, 'rubbish in the dustbin'],
  [/\btrash\b/gi, 'rubbish'],
  [/\bMath\b/g, 'Maths'],
];

function matchCase(src: string, out: string) {
  return src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out;
}

export function localize(text: string, locale: 'en-US' | 'en-IN'): string {
  if (locale === 'en-US' || !text) return text;
  return EN_IN.reduce((t, [re, rep]) => t.replace(re, (m, ...g) => matchCase(m, rep.replace('$1', typeof g[0] === 'string' ? g[0] : ''))), text);
}

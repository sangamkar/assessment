import type { Skill, SubjectId, SubjectMeta } from './types';
import { MATH_SKILLS } from './math';
import { MATH2_SKILLS } from './math2';
import { READING_SKILLS } from './reading';
import { READING2_SKILLS } from './reading2';
import { SCIENCE_SKILLS } from './science';
import { SOCIAL_SKILLS } from './social';
import { REASONING_SKILLS } from './reasoning';
import { HINDI_SKILLS } from './hindi';
import { KANNADA_SKILLS } from './kannada';
import { INDIA_SKILLS } from './india';

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'math',
    title: 'Math',
    kidTitle: 'Number Mountain',
    icon: '⛰️',
    color: '#2563eb',
    soft: '#dbeafe',
    strands: [
      { id: 'number', title: 'Numbers & Counting' },
      { id: 'algebra', title: 'Add, Subtract & Patterns' },
      { id: 'measure', title: 'Measurement & Data' },
      { id: 'geometry', title: 'Geometry' },
    ],
  },
  {
    id: 'reading',
    title: 'Reading',
    kidTitle: 'Story Forest',
    icon: '🌳',
    color: '#16a34a',
    soft: '#dcfce7',
    strands: [
      { id: 'phonological', title: 'Phonological Awareness' },
      { id: 'phonics', title: 'Phonics' },
      { id: 'hfw', title: 'High-Frequency Words' },
      { id: 'vocab', title: 'Vocabulary' },
      { id: 'lit', title: 'Comprehension: Literature' },
      { id: 'info', title: 'Comprehension: Informational' },
      { id: 'writing', title: 'Writing & Grammar' },
    ],
  },
  {
    id: 'science',
    title: 'Science & STEM',
    kidTitle: 'Science Lab',
    icon: '🔬',
    color: '#9333ea',
    soft: '#f3e8ff',
    strands: [
      { id: 'life', title: 'Life Science' },
      { id: 'physical', title: 'Physical Science' },
      { id: 'earth', title: 'Earth & Space' },
      { id: 'engineering', title: 'Engineering Design' },
    ],
  },
  {
    id: 'social',
    title: 'Social Studies & Geography',
    kidTitle: 'World Explorer',
    icon: '🧭',
    color: '#ea580c',
    soft: '#ffedd5',
    strands: [
      { id: 'history', title: 'History' },
      { id: 'geography', title: 'Geography' },
      { id: 'civics', title: 'Civics' },
      { id: 'economics', title: 'Economics' },
    ],
  },
  {
    id: 'reasoning',
    title: 'Reasoning & Puzzles',
    kidTitle: 'Puzzle Cave',
    icon: '🧩',
    color: '#db2777',
    soft: '#fce7f3',
    strands: [
      { id: 'verbal', title: 'Verbal Reasoning' },
      { id: 'quantitative', title: 'Quantitative Reasoning' },
      { id: 'figural', title: 'Figural & Spatial Reasoning' },
    ],
  },
  {
    id: 'hindi',
    title: 'Hindi',
    kidTitle: 'Hindi Garden',
    icon: '🪷',
    color: '#0d9488',
    soft: '#ccfbf1',
    strands: [
      { id: 'varnamala', title: 'Letters (वर्णमाला)' },
      { id: 'shabd', title: 'Words (शब्द)' },
      { id: 'ginti', title: 'Numbers & colours (गिनती, रंग)' },
    ],
  },
  {
    id: 'kannada',
    title: 'Kannada',
    kidTitle: 'Kannada Garden',
    icon: '🐘',
    color: '#ca8a04',
    soft: '#fef9c3',
    strands: [
      { id: 'varnamala', title: 'Letters (ಅಕ್ಷರಮಾಲೆ)' },
      { id: 'shabd', title: 'Words (ಪದಗಳು)' },
      { id: 'ginti', title: 'Numbers & colours (ಸಂಖ್ಯೆ, ಬಣ್ಣ)' },
    ],
  },
];

/** Indian language tracks a parent can switch on. */
export const LANGUAGES = [
  { code: 'hi' as const, name: 'Hindi', native: 'हिंदी', lang: 'hi-IN', note: 'Taught in CBSE schools across India (three-language formula).' },
  { code: 'kn' as const, name: 'Kannada', native: 'ಕನ್ನಡ', lang: 'kn-IN', note: 'Compulsory in all Karnataka schools, Class 1–10, including CBSE/ICSE.' },
];

// India-only skills slot in next to their subject (they only show when India is switched on).
const [moneyIN, ...indiaSocial] = [INDIA_SKILLS.find((s) => s.subject === 'math')!, ...INDIA_SKILLS.filter((s) => s.subject !== 'math')];
export const ALL_SKILLS: Skill[] = [...MATH_SKILLS, ...MATH2_SKILLS, moneyIN, ...READING_SKILLS, ...READING2_SKILLS, ...SCIENCE_SKILLS, ...SOCIAL_SKILLS, ...indiaSocial, ...REASONING_SKILLS, ...HINDI_SKILLS, ...KANNADA_SKILLS];

const BY_ID = new Map(ALL_SKILLS.map((s) => [s.id, s]));

export function getSkill(id: string): Skill | undefined {
  return BY_ID.get(id);
}

export function getSubject(id: SubjectId): SubjectMeta {
  return SUBJECTS.find((s) => s.id === id)!;
}

export function skillsFor(subject: SubjectId): Skill[] {
  return ALL_SKILLS.filter((s) => s.subject === subject);
}

export { CURRICULA, localize } from './curricula';

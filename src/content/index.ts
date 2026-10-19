import type { Skill, SubjectId, SubjectMeta } from './types';
import { MATH_SKILLS } from './math';
import { READING_SKILLS } from './reading';
import { SCIENCE_SKILLS } from './science';
import { SOCIAL_SKILLS } from './social';
import { REASONING_SKILLS } from './reasoning';

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
];

export const ALL_SKILLS: Skill[] = [...MATH_SKILLS, ...READING_SKILLS, ...SCIENCE_SKILLS, ...SOCIAL_SKILLS, ...REASONING_SKILLS];

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

export const GRADE_LABEL: Record<string, string> = { K: 'Kindergarten', '1': 'Grade 1 stretch', '2': 'Grade 2 stretch' };

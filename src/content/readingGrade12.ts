import type { Skill } from './types';
import { BLENDS_DIGRAPHS, DIPHTHONGS, MAGIC_E, R_VOWELS, TRICKY_SPELLINGS, VOWEL_TEAMS_1, VOWEL_TEAMS_2 } from './grade12/phonicsWords';
import { wordSkill } from './grade12/wordEngine';
import { ENDINGS_1, ENDINGS_2, SYLLABLE_WORDS } from './grade12/phonicsParts';
import { HFW_1, HFW_2 } from './grade12/sightWords';
import { PHONEMES, SOUND_CHANGE, SYLLABLE_COUNT } from './grade12/phonological';
import { CONTEXT_CLUES, MULTIPLE_MEANING, SYNONYMS_ANTONYMS } from './grade12/vocab';
import { CATEGORIES, COMPOUND_WORDS, SHADES_OF_MEANING, WORD_PARTS } from './grade12/vocab2';

/*
 * Grade 1–2 foundational reading for i-Ready's Phonological Awareness, Phonics, High-Frequency Words and
 * Vocabulary domains (CCSS / Georgia ELAGSE RF.1–2, L.1–2). All are generators built from word lists in
 * ./grade12; a third of each catalogue is held back for the mock i-Ready (engine/itemPools.ts).
 */

export const GRADE1_FOUNDATION_SKILLS: Skill[] = [
  PHONEMES, SOUND_CHANGE, SYLLABLE_COUNT,
  wordSkill(MAGIC_E), wordSkill(VOWEL_TEAMS_1), wordSkill(R_VOWELS), wordSkill(BLENDS_DIGRAPHS), ENDINGS_1, SYLLABLE_WORDS,
  HFW_1,
  CONTEXT_CLUES, SYNONYMS_ANTONYMS, CATEGORIES,
];

export const GRADE2_FOUNDATION_SKILLS: Skill[] = [
  wordSkill(VOWEL_TEAMS_2), wordSkill(DIPHTHONGS), wordSkill(TRICKY_SPELLINGS), ENDINGS_2,
  HFW_2,
  MULTIPLE_MEANING, SHADES_OF_MEANING, COMPOUND_WORDS, WORD_PARTS,
];

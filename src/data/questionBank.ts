import { AssessmentQuestion, AssessmentDomain, AssessmentSubject } from '../types/assessment';
import { EXTENDED_QUESTIONS } from './extendedQuestions';
import { MATH_QUESTIONS } from './mathQuestions';
import { LITERACY_QUESTIONS } from './literacyQuestions';
import { SUPPLEMENTAL_QUESTIONS } from './supplementalQuestions';

const PALETTE = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

const GEOMETRY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'sr_circle_basic',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Circle Recognition (Standard)',
    difficulty: 1,
    format: 'multiple_choice',
    promptText: 'Find the circle.',
    audioPrompt: 'Find the circle.',
    targetStandard: 'CCSS.MATH.K.G.A.2',
    choices: [
      { id: 'c1', shape: { id: 's1', type: 'circle', color: PALETTE.blue, size: 'large' }, isCorrect: true },
      { id: 'c2', shape: { id: 's2', type: 'square', color: PALETTE.red, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
      { id: 'c3', shape: { id: 's3', type: 'triangle', color: PALETTE.green, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'sr_triangle_upright',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Triangle Recognition (Upright)',
    difficulty: 1,
    format: 'multiple_choice',
    promptText: 'Find the triangle.',
    audioPrompt: 'Find the triangle.',
    targetStandard: 'CCSS.MATH.K.G.A.2',
    choices: [
      { id: 't1', shape: { id: 'st1', type: 'square', color: PALETTE.yellow, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
      { id: 't2', shape: { id: 'st2', type: 'triangle', color: PALETTE.blue, size: 'large' }, isCorrect: true },
      { id: 't3', shape: { id: 'st3', type: 'circle', color: PALETTE.purple, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'sr_square_standard',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Square Recognition (Standard)',
    difficulty: 1,
    format: 'multiple_choice',
    promptText: 'Find the square.',
    audioPrompt: 'Find the square.',
    targetStandard: 'CCSS.MATH.K.G.A.2',
    choices: [
      { id: 'sq1', shape: { id: 'ss1', type: 'circle', color: PALETTE.green, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
      { id: 'sq2', shape: { id: 'ss2', type: 'rectangle', color: PALETTE.orange, size: 'large', customRatio: 2.2 }, isCorrect: false, errorTag: 'attribute_misunderstanding' },
      { id: 'sq3', shape: { id: 'ss3', type: 'square', color: PALETTE.purple, size: 'large' }, isCorrect: true },
    ],
  },
  {
    id: 'sr_rectangle_standard',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Rectangle Recognition (Standard)',
    difficulty: 2,
    format: 'multiple_choice',
    promptText: 'Find the rectangle.',
    audioPrompt: 'Find the rectangle.',
    targetStandard: 'CCSS.MATH.K.G.A.2',
    choices: [
      { id: 'r1', shape: { id: 'sr1', type: 'rectangle', color: PALETTE.teal, size: 'large', customRatio: 2.0 }, isCorrect: true },
      { id: 'r2', shape: { id: 'sr2', type: 'square', color: PALETTE.yellow, size: 'large' }, isCorrect: false, errorTag: 'attribute_misunderstanding' },
      { id: 'r3', shape: { id: 'sr3', type: 'triangle', color: PALETTE.red, size: 'large' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'sr_triangle_rotated_90',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Triangle Invariance (Rotated 90)',
    difficulty: 3,
    format: 'multiple_choice',
    promptText: 'Which one is still a triangle?',
    audioPrompt: 'Which one is still a triangle?',
    targetStandard: 'CCSS.MATH.K.G.A.2',
    choices: [
      { id: 'tr1', shape: { id: 'str1', type: 'square', color: PALETTE.blue, size: 'medium', rotation: 45 }, isCorrect: false, errorTag: 'orientation_confusion' },
      { id: 'tr2', shape: { id: 'str2', type: 'triangle', color: PALETTE.red, size: 'medium', rotation: 90 }, isCorrect: true },
      { id: 'tr3', shape: { id: 'str3', type: 'rectangle', color: PALETTE.green, size: 'medium' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'cs_triangle_count',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Count Sides on Triangle',
    difficulty: 1,
    format: 'count_picker',
    promptText: 'How many straight sides does this triangle have?',
    audioPrompt: 'How many straight sides does this triangle have?',
    targetStandard: 'CCSS.MATH.K.G.B.4',
    targetShape: { id: 'cst1', type: 'triangle', color: PALETTE.blue, size: 'large', highlightSides: true },
    choices: [
      { id: 's_3', label: '3', dotCount: 3, isCorrect: true },
      { id: 's_4', label: '4', dotCount: 4, isCorrect: false, errorTag: 'side_counting_error' },
      { id: 's_0', label: '0', dotCount: 0, isCorrect: false, errorTag: 'side_counting_error' },
    ],
  },
  {
    id: 'cc_triangle_corners',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Count Corners on Triangle',
    difficulty: 1,
    format: 'count_picker',
    promptText: 'How many corners does this triangle have?',
    audioPrompt: 'Look at the dots. How many pointy corners does this triangle have?',
    targetStandard: 'CCSS.MATH.K.G.B.4',
    targetShape: { id: 'cct1', type: 'triangle', color: PALETTE.blue, size: 'large', highlightCorners: true },
    choices: [
      { id: 'c_3', label: '3', dotCount: 3, isCorrect: true },
      { id: 'c_4', label: '4', dotCount: 4, isCorrect: false, errorTag: 'corner_counting_error' },
      { id: 'c_2', label: '2', dotCount: 2, isCorrect: false, errorTag: 'corner_counting_error' },
    ],
  },
  {
    id: 'env_window_rectangle',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Identify Window as Rectangle / Square',
    difficulty: 1,
    format: 'environment_spot',
    promptText: 'What shape is this window?',
    audioPrompt: 'Look at the window. What shape is this window?',
    targetStandard: 'CCSS.MATH.K.G.A.1',
    referenceImage: 'window',
    referenceDescription: 'A four-paned glass window',
    choices: [
      { id: 'ew_sq', label: 'Square', shape: { id: 'ew_s', type: 'square', color: PALETTE.blue, size: 'medium' }, isCorrect: true },
      { id: 'ew_circ', label: 'Circle', shape: { id: 'ew_c', type: 'circle', color: PALETTE.red, size: 'medium' }, isCorrect: false, errorTag: 'shape_name_confusion' },
      { id: 'ew_tri', label: 'Triangle', shape: { id: 'ew_t', type: 'triangle', color: PALETTE.yellow, size: 'medium' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'env_clock_circle',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Identify Wall Clock as Circle',
    difficulty: 1,
    format: 'environment_spot',
    promptText: 'What shape is this clock on the wall?',
    audioPrompt: 'Look at the wall clock. What shape is it?',
    targetStandard: 'CCSS.MATH.K.G.A.1',
    referenceImage: 'clock',
    referenceDescription: 'A round wall clock',
    choices: [
      { id: 'ec_tri', label: 'Triangle', shape: { id: 'ec_t', type: 'triangle', color: PALETTE.green, size: 'medium' }, isCorrect: false, errorTag: 'shape_name_confusion' },
      { id: 'ec_circ', label: 'Circle', shape: { id: 'ec_c', type: 'circle', color: PALETTE.yellow, size: 'medium' }, isCorrect: true },
      { id: 'ec_sq', label: 'Square', shape: { id: 'ec_s', type: 'square', color: PALETTE.blue, size: 'medium' }, isCorrect: false, errorTag: 'shape_name_confusion' },
    ],
  },
  {
    id: 'sort_circles_vs_squares',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Sort by Basic Shape Type',
    difficulty: 1,
    format: 'sorting',
    promptText: 'Put all the circles together, and all the squares together.',
    audioPrompt: 'Put all the circles in the circle basket, and all the squares in the square basket.',
    targetStandard: 'CCSS.MATH.K.G.B.4',
    sortItems: [
      { id: 'si1', shape: { id: 'si_c1', type: 'circle', color: PALETTE.blue, size: 'medium' }, targetBinId: 'bin_circle' },
      { id: 'si2', shape: { id: 'si_sq1', type: 'square', color: PALETTE.red, size: 'medium' }, targetBinId: 'bin_square' },
      { id: 'si3', shape: { id: 'si_c2', type: 'circle', color: PALETTE.yellow, size: 'small' }, targetBinId: 'bin_circle' },
      { id: 'si4', shape: { id: 'si_sq2', type: 'square', color: PALETTE.green, size: 'large' }, targetBinId: 'bin_square' },
    ],
    sortBins: [
      { id: 'bin_circle', label: 'Circles', audioPrompt: 'Circles go here', acceptedCriteria: (s) => s.type === 'circle' },
      { id: 'bin_square', label: 'Squares', audioPrompt: 'Squares go here', acceptedCriteria: (s) => s.type === 'square' },
    ],
  },
  {
    id: 'comp_house_picture',
    subject: 'math',
    domain: 'geometry',
    subskill: 'Decompose House Picture (Triangle + Square)',
    difficulty: 2,
    format: 'composition_builder',
    promptText: 'What shapes make this little house?',
    audioPrompt: 'Look at the house picture. What shapes make this little house?',
    targetStandard: 'CCSS.MATH.K.G.B.6',
    compositionTarget: {
      name: 'House',
      targetShape: 'house',
      requiredPieceIds: ['tri_plus_sq'],
      availablePieces: [],
    },
    choices: [
      {
        id: 'ch_tri_sq',
        label: 'Triangle and Square',
        isCorrect: true,
        shape: { id: 'ch_ans_tri', type: 'triangle', color: PALETTE.orange, size: 'medium' },
      },
      {
        id: 'ch_circ_sq',
        label: 'Circle and Square',
        isCorrect: false,
        errorTag: 'shape_name_confusion',
        shape: { id: 'ch_circ', type: 'circle', color: PALETTE.purple, size: 'medium' },
      },
    ],
  },
];

export const BASE_QUESTIONS: AssessmentQuestion[] = [
  ...GEOMETRY_QUESTIONS,
  ...EXTENDED_QUESTIONS,
  ...MATH_QUESTIONS,
  ...LITERACY_QUESTIONS,
  ...SUPPLEMENTAL_QUESTIONS,
];

export function getQuestionsBySubject(subject: AssessmentSubject): AssessmentQuestion[] {
  return BASE_QUESTIONS.filter((q) => (q.subject || 'math') === subject);
}

export function getQuestionsByDomain(domain: AssessmentDomain): AssessmentQuestion[] {
  return BASE_QUESTIONS.filter((q) => q.domain === domain);
}

export function getQuestionsBySubjectAndDomain(
  subject: AssessmentSubject,
  domain?: AssessmentDomain
): AssessmentQuestion[] {
  if (!domain) {
    return getQuestionsBySubject(subject);
  }
  return BASE_QUESTIONS.filter((q) => (q.subject || 'math') === subject && q.domain === domain);
}

/**
 * Grade K Diagnostic Assessment Standards & Benchmarks
 * Aligned with Kindergarten Diagnostic Scales:
 * - Reading: On-Grade Threshold 362 (Grade K Range: 362 - 479)
 * - Math: On-Grade Threshold 362 (Grade K Range: 362 - 448)
 */

export interface IReadyDomainResult {
  domainKey: string;
  domainName: string;
  placement: 'Above Grade Level' | 'At Grade Level' | 'Approaching Grade Level' | 'Needs Improvement';
  isFoundational?: boolean;
  priorityStatus: 'urgent_focus' | 'target_growth' | 'secure_maintain' | 'advanced_strength';
  teacherNotes: string;
  recommendedFocus: string[];
}

export interface IReadyStudentBenchmark {
  studentName?: string;
  studentGrade: string;
  math: {
    testDate: string;
    scaleScore: number;
    placement: 'Approaching Grade Level' | 'At Grade Level' | 'Above Grade Level';
    placementLabel: string;
    nationalPercentile: number;
    onGradeLevelRange: string;
    nextTestTargetScore: number;
    domains: IReadyDomainResult[];
    actionPlanSummary: string;
  };
  reading: {
    testDate: string;
    scaleScore: number;
    placement: 'Approaching Grade Level' | 'At Grade Level' | 'Above Grade Level';
    placementLabel: string;
    nationalPercentile: number;
    lexileMeasure: string;
    lexileRange: string;
    onGradeLevelRange: string;
    nextTestTargetScore: number;
    domains: IReadyDomainResult[];
    actionPlanSummary: string;
  };
}

export const GRADE_K_BENCHMARK: IReadyStudentBenchmark = {
  studentName: 'Kindergarten Learner',
  studentGrade: 'K',
  math: {
    testDate: 'Grade K Standard',
    scaleScore: 362,
    placement: 'At Grade Level',
    placementLabel: 'At Grade K (Standard Benchmark Threshold 362)',
    nationalPercentile: 50,
    onGradeLevelRange: '362 - 448',
    nextTestTargetScore: 385,
    actionPlanSummary:
      'Foundational counting and early equations establish the core for Kindergarten. Targeted practice in Measurement & Data and basic 2D/3D Geometry accelerates solid on-grade performance well into 380+ range.',
    domains: [
      {
        domainKey: 'measurement_and_data',
        domainName: 'Measurement and Data',
        placement: 'Approaching Grade Level',
        priorityStatus: 'urgent_focus',
        teacherNotes:
          'Students benefit from instruction developing understanding of measurable attributes: comparing and sorting objects by length, height, weight, and reading simple picture bar graphs.',
        recommendedFocus: [
          'Direct comparison of length (longer vs shorter) and height (taller vs shorter)',
          'Weight comparisons using visual balance scales (heavier vs lighter)',
          'Classifying and sorting objects into categories and counting how many in each group',
          'Reading simple tally marks and picture bar graphs',
        ],
      },
      {
        domainKey: 'geometry',
        domainName: 'Geometry',
        placement: 'Approaching Grade Level',
        priorityStatus: 'urgent_focus',
        teacherNotes:
          'Practice identifying basic shapes and their attributes (sides, corners/vertices, 2D flat vs 3D solid shapes).',
        recommendedFocus: [
          'Distinguishing 2D flat shapes (circle, triangle, square, rectangle, hexagon) regardless of orientation or size',
          'Recognizing 3D solid shapes (cube, sphere, cylinder, cone) and counting flat faces vs curved rolling surfaces',
          'Explicit counting of sides and corners/vertices',
          'Composing composite shapes (e.g. 2 triangles make a rectangle/rhombus)',
        ],
      },
      {
        domainKey: 'number_and_operations',
        domainName: 'Number and Operations',
        placement: 'At Grade Level',
        priorityStatus: 'secure_maintain',
        teacherNotes:
          'Appropriate understanding of numerals and basic counting. Continue developing counting skills, including counting by 1s and counting by 10s to 100.',
        recommendedFocus: [
          'Counting to 100 by 1s and 10s',
          'Counting forward from any given number (e.g., start at 47 and count forward)',
          'Teen numbers as ten ones and some more ones (e.g., 14 = 10 + 4)',
        ],
      },
      {
        domainKey: 'algebra_and_algebraic_thinking',
        domainName: 'Algebra and Algebraic Thinking',
        placement: 'At Grade Level',
        priorityStatus: 'secure_maintain',
        teacherNotes:
          'Develop concepts of part-part-whole relationships leading toward early addition and subtraction equations.',
        recommendedFocus: [
          'Part-part-whole number bonds up to 10',
          'Addition and subtraction within 10 using ten-frames and counters',
          'Finding the number that makes 10 when added to any number 1-9 (e.g., 7 + 3 = 10)',
        ],
      },
    ],
  },
  reading: {
    testDate: 'Grade K Standard',
    scaleScore: 362,
    placement: 'At Grade Level',
    placementLabel: 'At Grade K (Standard Benchmark Threshold 362)',
    nationalPercentile: 50,
    lexileMeasure: 'BR150L',
    lexileRange: 'BR250L - BR100L',
    onGradeLevelRange: '362 - 479',
    nextTestTargetScore: 400,
    actionPlanSummary:
      'Targeted instruction in High-Frequency Words (sight words) alongside foundational phonics and phonological awareness unlocks fluent Grade 1 reading readiness.',
    domains: [
      {
        domainKey: 'high_frequency_words',
        domainName: 'High-Frequency Words*',
        placement: 'At Grade Level',
        isFoundational: true,
        priorityStatus: 'urgent_focus',
        teacherNotes:
          'Automatic recognition of key Grade K high-frequency words is essential for reading fluency and comprehension.',
        recommendedFocus: [
          'Mastering top 50 Grade K sight words: the, to, and, a, I, you, it, in, said, for, up, look, is, see, we, they, was, with, have',
          'Flashcard multi-sensory sight word drills with audio read-aloud',
          'Cloze sentences: choosing the correct high-frequency word to finish a sentence',
        ],
      },
      {
        domainKey: 'phonics',
        domainName: 'Phonics*',
        placement: 'At Grade Level',
        isFoundational: true,
        priorityStatus: 'secure_maintain',
        teacherNotes:
          'Continue instruction decoding CVC words, short vowels, consonant digraphs, and inflectional endings.',
        recommendedFocus: [
          'Consonant digraphs: sh, ch, th, wh, ck',
          'Silent-e long vowel words (cake, bike, rope, tube)',
          'Two-syllable compound words (sun + flower = sunflower)',
        ],
      },
      {
        domainKey: 'phonological_awareness',
        domainName: 'Phonological Awareness*',
        placement: 'At Grade Level',
        isFoundational: true,
        priorityStatus: 'secure_maintain',
        teacherNotes:
          'Instruction in identifying rhyme, blending and segmenting onset and rime, and clapping/counting syllables.',
        recommendedFocus: [
          'Rhyme identification and odd-one-out rhyming games',
          'Syllable clapping and counting (e.g. el-e-phant = 3 syllables)',
          'Onset-rime blending (/c/ - /at/ -> "cat")',
          'Isolating beginning, middle short vowel, and ending sounds',
        ],
      },
      {
        domainKey: 'vocabulary',
        domainName: 'Vocabulary',
        placement: 'At Grade Level',
        priorityStatus: 'target_growth',
        teacherNotes:
          'Extend understanding of kindergarten vocabulary in stories and content areas. Explore word categories and opposite pairs.',
        recommendedFocus: [
          'Word sorting into categories (animals, food, clothing, vehicles)',
          'Multiple meaning words in context (e.g., bat = animal vs baseball bat)',
          'Antonyms and opposites (hot/cold, tall/short, fast/slow)',
        ],
      },
      {
        domainKey: 'comprehension_literature',
        domainName: 'Comprehension: Literature',
        placement: 'At Grade Level',
        priorityStatus: 'target_growth',
        teacherNotes:
          'Listening comprehension: retelling stories, identifying characters, settings, and main events.',
        recommendedFocus: [
          'Identifying the main character and setting of read-aloud stories',
          'Sequencing story events: beginning, middle, and end',
          'Retelling key details and understanding character feelings',
        ],
      },
      {
        domainKey: 'comprehension_informational',
        domainName: 'Comprehension: Informational Text',
        placement: 'At Grade Level',
        priorityStatus: 'target_growth',
        teacherNotes:
          'Listening comprehension for informational texts: identifying main topic and locating key details.',
        recommendedFocus: [
          'Identifying the main topic of informational read-aloud passages',
          'Locating specific facts and answers in diagrams and text',
          'Understanding informational text features (captions, labels, photos)',
        ],
      },
    ],
  },
};

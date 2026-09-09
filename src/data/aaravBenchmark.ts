/**
 * Real Diagnostic Test Baseline for Aarav Sangamkar (Grade K)
 * Extracted from official i-Ready Diagnostic Reports:
 * - Reading English: 08/27/26 (Scale Score: 407, 97th Percentile, At Grade K, Lexile: BR165L)
 * - Math: 08/31/26 (Scale Score: 360, 83rd Percentile, Approaching Grade K)
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
  studentName: string;
  studentId: string;
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

export const AARAV_BENCHMARK: IReadyStudentBenchmark = {
  studentName: 'Aarav Sangamkar',
  studentId: '210668',
  studentGrade: 'K',
  math: {
    testDate: '08/31/26',
    scaleScore: 360,
    placement: 'Approaching Grade Level',
    placementLabel: 'Approaching Grade K (Only 2 points from On-Grade 362)',
    nationalPercentile: 83,
    onGradeLevelRange: '362 - 448',
    nextTestTargetScore: 385,
    actionPlanSummary:
      'Aarav is only 2 points away from the on-grade threshold (362). His foundational counting and early equations are already At Grade K. Targeted instruction in Measurement & Data and basic 2D/3D Geometry will quickly propel him well above 380 into solid on-grade performance.',
    domains: [
      {
        domainKey: 'measurement_and_data',
        domainName: 'Measurement and Data',
        placement: 'Approaching Grade Level',
        priorityStatus: 'urgent_focus',
        teacherNotes:
          'Results indicate Aarav would likely benefit from instruction to develop a basic understanding of measurable attributes, and may benefit from practice comparing and sorting objects by attributes such as length, height, weight, and reading picture graphs.',
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
          'Test results indicate that Aarav would likely benefit from practice identifying basic shapes and their attributes (sides, corners/vertices, 2D vs 3D shapes).',
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
          'Aarav has an appropriate understanding of numerals and basic counting. Ready to further develop counting skills, including counting by 1s and counting by 10s to 100.',
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
          'Aarav may be ready to develop basic concepts of part-part-whole relationships leading toward early addition and subtraction concepts.',
        recommendedFocus: [
          'Part-part-whole number bonds up to 10',
          'Addition and subtraction within 10 using ten-frames and counters',
          'Finding the number that makes 10 when added to any number 1-9 (e.g., 7 + 3 = 10)',
        ],
      },
    ],
  },
  reading: {
    testDate: '08/27/26',
    scaleScore: 407,
    placement: 'At Grade Level',
    placementLabel: 'At Grade K (97th Percentile - High Achiever)',
    nationalPercentile: 97,
    lexileMeasure: 'BR165L',
    lexileRange: 'BR265L - BR115L',
    onGradeLevelRange: '362 - 479',
    nextTestTargetScore: 435,
    actionPlanSummary:
      'Aarav performed exceptionally well in Reading (97th percentile nationally), with Phonics already testing Above Grade K! The single most impactful growth target highlighted by the report is High-Frequency Words (sight words). Mastering Kindergarten high-frequency words will unlock fluent Grade 1 reading.',
    domains: [
      {
        domainKey: 'high_frequency_words',
        domainName: 'High-Frequency Words*',
        placement: 'At Grade Level',
        isFoundational: true,
        priorityStatus: 'urgent_focus',
        teacherNotes:
          'Results indicate that Aarav is not yet recognizing many Grade K high-frequency words. Rapid, automatic word recognition is essential for reading fluency.',
        recommendedFocus: [
          'Mastering top 50 Grade K sight words: the, to, and, a, I, you, it, in, said, for, up, look, is, see, we, they, was, with, have',
          'Flashcard multi-sensory sight word drills with audio read-aloud',
          'Cloze sentences: choosing the correct high-frequency word to finish a sentence',
        ],
      },
      {
        domainKey: 'phonics',
        domainName: 'Phonics*',
        placement: 'Above Grade Level',
        isFoundational: true,
        priorityStatus: 'advanced_strength',
        teacherNotes:
          'Strongest domain! Aarav is ready for instruction decoding words with long-vowel digraphs, vowel teams, 2-syllable VC/CV patterns, compound words, and inflectional endings.',
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
          'Aarav will benefit from instruction in identifying rhyme, blending and segmenting onset and rime, and blending and segmenting syllables.',
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
          'Mastering basic words; benefit from instruction in kindergarten vocabulary used in stories and content areas. Extend understanding of word categories and words with multiple meanings.',
        recommendedFocus: [
          'Word sorting into categories (animals, food, clothing, vehicles)',
          'Multiple meaning words in context (e.g., bat = animal vs baseball bat; watch = look vs clock)',
          'Antonyms and opposites (hot/cold, tall/short, fast/slow)',
        ],
      },
      {
        domainKey: 'comprehension_literature',
        domainName: 'Comprehension: Literature',
        placement: 'At Grade Level',
        priorityStatus: 'target_growth',
        teacherNotes:
          'Benefit from instruction in listening comprehension: retelling a story, identifying characters, settings, and comparing story elements.',
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
          'Ready for instruction targeting listening comprehension skills such as identifying the main idea or topic and retelling key details in informational texts.',
        recommendedFocus: [
          'Identifying the main topic of informational read-aloud passages',
          'Locating specific facts and answers in diagrams and text',
          'Understanding informational text features (captions, labels, photos)',
        ],
      },
    ],
  },
};

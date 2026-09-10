export type AssessmentSubject = 'math' | 'reading';
export type AssessmentScope = 'comprehensive' | 'single_module';

// Official i-Ready Math Domains
export type MathDomain =
  | 'measurement_and_data'
  | 'geometry'
  | 'number_and_operations'
  | 'algebra_and_algebraic_thinking';

// Official i-Ready Reading (Literacy) Domains
export type ReadingDomain =
  | 'high_frequency_words'
  | 'phonological_awareness'
  | 'phonics'
  | 'vocabulary'
  | 'comprehension_literature'
  | 'comprehension_informational';

// All assessment domains (including geometry subdomains for backward compatibility)
export type AssessmentDomain =
  | MathDomain
  | ReadingDomain
  | 'shape_recognition'
  | 'counting_sides'
  | 'counting_corners'
  | 'shape_attributes'
  | 'sorting_shapes'
  | 'shape_comparison'
  | 'shape_environment'
  | 'shape_composition'
  | 'number_reasoning';

export type ShapeType =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'hexagon'
  | 'trapezoid'
  | 'rhombus'
  | 'pentagon'
  | 'partitioned_circle'
  | 'partitioned_rectangle'
  | 'open_shape'
  | 'cube'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'rectangular_prism';

export type MasteryLevel =
  | 'KNOWS'
  | 'DEVELOPING'
  | 'NEEDS_SUPPORT'
  | 'NOT_YET_DEMONSTRATED';

export type OverallLevel =
  | 'Emerging Pre-K'
  | 'Developing Pre-K'
  | 'Approaching Grade K'
  | 'At Grade K'
  | 'Kindergarten Ready'
  | 'Kindergarten Secure'
  | 'Above Grade Level'
  | 'Needs Improvement'
  | 'Early Grade 1 Extension';

export type ConfidenceLevel = 'High confidence' | 'Moderate confidence' | 'Limited evidence';

export type ErrorClassification =
  | 'shape_name_confusion'
  | 'side_counting_error'
  | 'corner_counting_error'
  | 'orientation_confusion'
  | 'size_color_dependence'
  | 'attribute_misunderstanding'
  | 'visual_discrimination_difficulty'
  | 'random_responding'
  | 'possible_guessing'
  // Literacy specific errors
  | 'sight_word_confusion'
  | 'rhyme_phoneme_confusion'
  | 'syllable_count_error'
  | 'phonics_decoding_error'
  | 'vocabulary_category_error'
  | 'comprehension_detail_error'
  // Math specific errors
  | 'measurement_comparison_error'
  | 'graph_reading_error'
  | 'ten_frame_counting_error'
  | 'addition_subtraction_error'
  | (string & {});

export interface VisualShapeConfig {
  id: string;
  type: ShapeType;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  rotation?: number; // degrees: 0, 45, 90, 135, 180, 270
  highlightCorners?: boolean;
  highlightSides?: boolean;
  customRatio?: number;
  isUnusual?: boolean;
  triangleType?: 'equilateral' | 'right' | 'scalene' | 'obtuse';
  partitionType?: 'halves_equal' | 'halves_unequal' | 'fourths_equal' | 'fourths_unequal';
  openGapSide?: 'top' | 'right' | 'bottom' | 'left';
}

export type QuestionFormat =
  | 'multiple_choice'
  | 'count_picker'
  | 'sorting'
  | 'which_different'
  | 'environment_spot'
  | 'composition_builder';

export interface QuestionChoice {
  id: string;
  label?: string;
  shape?: VisualShapeConfig;
  svgIcon?: string;
  dotCount?: number;
  isCorrect: boolean;
  errorTag?: ErrorClassification;
}

export interface SortItem {
  id: string;
  shape: VisualShapeConfig;
  targetBinId: string;
}

export interface SortBin {
  id: string;
  label: string;
  audioPrompt: string;
  icon?: string;
  acceptedCriteria: (shape: VisualShapeConfig) => boolean;
}

export interface AssessmentQuestion {
  id: string;
  domain: AssessmentDomain;
  subject?: AssessmentSubject;
  subskill: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  format: QuestionFormat;
  promptText: string;
  audioPrompt: string;
  helperText?: string;
  targetStandard?: string;
  gradeLevel?: 'kindergarten' | 'above_kindergarten';
  targetShape?: VisualShapeConfig;
  referenceImage?: string;
  referenceDescription?: string;
  choices?: QuestionChoice[];
  // Reading / Literacy Specifics
  passage?: {
    title: string;
    category: 'literature' | 'informational';
    text: string;
    audioText?: string;
    iconEmoji?: string;
  };
  sightWord?: string;
  phonicsFocus?: string;
  literacyVisual?: {
    type?: string;
    details?: any;
    passage?: {
      title: string;
      category: 'literature' | 'informational';
      text: string;
      audioText?: string;
      iconEmoji?: string;
    };
  };
  // Math Specific Visuals
  mathVisual?: {
    type: 'ten_frame' | 'counter_dots' | 'measurement_compare' | 'clock' | 'bar_graph' | 'balance_scale' | 'tally_chart';
    details?: any;
  };
  sortItems?: SortItem[];
  sortBins?: SortBin[];
  compositionTarget?: {
    name: string;
    targetShape: ShapeType | 'house' | 'big_rectangle' | 'big_square';
    requiredPieceIds: string[];
    availablePieces: { id: string; shape: VisualShapeConfig }[];
  };
  prerequisiteDomain?: AssessmentDomain;
}

export interface QuestionResponse {
  questionId: string;
  domain: AssessmentDomain;
  difficulty: number;
  selectedChoiceId?: string;
  isCorrect: boolean;
  responseTimeMs: number;
  readAloudUsageCount: number;
  answerChangeCount: number;
  selectedOptionPosition: number;
  errorClass?: ErrorClassification;
  timestamp: number;
}

export interface StudentProfile {
  studentName: string;
  studentId?: string;
  grade: string;
  assessmentDate: string;
  assessorName?: string;
  subject?: AssessmentSubject;
  assessmentScope?: AssessmentScope;
  targetModuleDomain?: AssessmentDomain;
  levelMode?: 'kindergarten_core' | 'above_kindergarten' | 'comprehensive';
  adaptiveDifficultyPolicy?: AdaptiveDifficultyPolicy;
}

export type AdaptiveDifficultyPolicy =
  | 'dynamic'
  | 'foundational_scaffold'
  | 'advanced_extension';

export interface DifficultyStepRecord {
  questionNumber: number;
  questionId: string;
  domain: AssessmentDomain;
  difficulty: number;
  difficultyLabel: string;
  isCorrect: boolean;
  action: 'promoted' | 'maintained' | 'scaffolded';
  reason: string;
  responseTimeMs: number;
}

export interface AdaptiveProfile {
  currentDifficulty: number;
  startingDifficulty: number;
  highestDifficultyReached: number;
  averageDifficulty: number;
  totalPromotions: number;
  totalScaffolds: number;
  trajectory: DifficultyStepRecord[];
  zoneOfProximalDevelopment: string;
}

export interface DomainDiagnosticReport {
  domain: AssessmentDomain;
  domainTitle: string;
  level: MasteryLevel;
  totalQuestions: number;
  correctQuestions: number;
  accuracyRate: number;
  isFoundational?: boolean;
  observations: string[];
  strengths: string[];
  growthAreas: string[];
  missingPrerequisites: string[];
}

export interface CompleteDiagnosticResult {
  studentProfile: StudentProfile;
  subject: AssessmentSubject;
  assessmentScope?: AssessmentScope;
  targetModuleDomain?: AssessmentDomain;
  overallLevel: OverallLevel;
  scaleScore?: number;
  nationalPercentile?: number;
  lexileMeasure?: string;
  onGradeLevelRange?: string;
  confidence: ConfidenceLevel;
  summaryNarrative: string;
  lowestMissingPrerequisite: string | null;
  domainReports: Record<AssessmentDomain, DomainDiagnosticReport>;
  errorPatterns: {
    classification: ErrorClassification;
    count: number;
    title: string;
    description: string;
    recommendedRemediation: string;
  }[];
  positionBiasDetected: boolean;
  averageResponseTimeSeconds: number;
  recommendedPracticeSequence: {
    step: number;
    domain: AssessmentDomain;
    focusTitle: string;
    instructionalActivity: string;
  }[];
  suggestedReassessmentDate: string;
  responses: QuestionResponse[];
  adaptiveProfile?: AdaptiveProfile;
  benchmarkComparison?: {
    priorTestDate: string;
    priorScaleScore: number;
    priorPlacement: string;
    priorPercentile: number;
    targetScore: number;
  };
}

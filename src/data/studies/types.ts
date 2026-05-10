// Inductive Bible Study (Precept Method) content types.
// Each chapter study has 9 observation steps + interpretation movements +
// application questions, mirroring the Precept inductive method.

export interface StudyKeyword {
  word: string;
  greek?: string;
  count: number;
  verses: string;
}

export interface StudyContrast {
  verses: string;
  type: 'Contrast' | 'Simile' | 'Metaphor';
  pairing: string;
}

export interface StudyMovement {
  number: number;
  title: string;
  range: string;
  /** Short scripture excerpt that sets the movement (1 sentence). */
  excerpt?: string;
  /** Markdown body — Greek illumination + commentary, paraphrased / original. */
  body: string;
}

export interface StudyApplication {
  range: string;
  question: string;
}

/** One inductive observation step (1-9) for the chapter. */
export interface StudyStep {
  number: number;
  title: string;
  /** One-line description of the step (matches the methodology). */
  summary: string;
  /** Markdown body specific to this chapter. */
  body: string;
}

/** Full inductive study for a single chapter. */
export interface InductiveStudy {
  bookId: number;
  bookName: string;
  chapter: number;
  /** "James 1" */
  title: string;
  /** "The Precept Method, Verse by Verse" */
  subtitle: string;
  /** One-line theme using the text's own words. */
  themeOneLine: string;
  steps: StudyStep[];
  interpretation: {
    intro?: string;
    movements: StudyMovement[];
  };
  application: {
    intro?: string;
    questions: StudyApplication[];
  };
}

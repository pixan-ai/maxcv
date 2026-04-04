export type Improvement = {
  dimension: string;
  dimension_score: number;
  issue: string;
  suggestion: string;
  before?: string;
  after?: string;
};

export type Strength = {
  dimension: string;
  dimension_score: number;
  detail: string;
};

export type AnalysisResult = {
  detected_language: string;
  inferred_role?: string;
  score: { total: number; summary: string };
  analysis: {
    top_actions: string[];
    improvements: Improvement[];
    strengths: Strength[];
    ats_warnings?: string[];
    keyword_gaps?: string[];
  };
  improved_cv: { text: string; changes: string[] };
};

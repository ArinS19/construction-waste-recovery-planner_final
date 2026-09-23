export interface WasteInput {
  material: string;
  condition: string;
  contamination: string;
  quantity: number;
  unit: string;
  additional_characteristics?: Record<string, any>;
}

export interface DecisionStep {
  stage: string;
  title: string;
  description: string;
  status?: string;
  details?: Record<string, any>;
}

export interface HierarchyEvaluation {
  tier: string;
  name: string;
  selected: boolean;
  status: string;
  reason: string;
}

export interface SustainabilityAssessment {
  landfill_avoidance: string;
  material_recovery: string;
  resource_conservation: string;
  circularity_potential: string;
  assessment_type: string;
  note: string;
}

export interface AssessmentResult {
  id?: number;
  timestamp: string;
  input_summary: WasteInput;
  recommended_pathway: string;
  rule_match_strength: string;
  matched_rule: string;
  reason: string;
  conditions_satisfied: string[];
  potential_applications: string[];
  alternative_options: string[];
  decision_steps: DecisionStep[];
  hierarchy_evaluation: HierarchyEvaluation[];
  sustainability: SustainabilityAssessment;
  safety_disclaimer: string;
  professional_assessment_required: boolean;
  confidence_score?: number;
  prediction_probabilities?: Record<string, number>;
  model_name?: string;
  model_version?: string;
  inference_source?: string;
}

export interface AssessmentRecord {
  id: number;
  timestamp: string;
  material: string;
  condition: string;
  contamination: string;
  quantity: number;
  unit: string;
  recommended_pathway: string;
  matched_rule: string;
  reason: string;
  applications: string[];
  alternatives: string[];
  confidence_score?: number;
  model_version?: string;
}

export interface MLModelStatus {
  model_file_exists: boolean;
  model_file_path: string;
  is_user_trained_model_loaded: boolean;
  model_engine: string;
  model_version: string;
  target_classes: string[];
  required_feature_columns: string[];
  instructions: string;
}

export interface RuleResponse {
  id?: number;
  rule_id: string;
  material: string;
  pathway: string;
  priority: number;
  conditions_description: string;
  reason: string;
  applications: string[];
  alternatives: string[];
}

export interface MaterialResponse {
  id?: number;
  name: string;
  category: string;
  description: string;
  typical_waste_source: string;
  reuse_potential: string;
  recycling_potential: string;
  common_applications: string[];
  important_considerations: string;
}

export interface StatisticsResponse {
  total_assessments: number;
  pathway_counts: {
    REUSE: number;
    REPAIR: number;
    RECYCLE: number;
    RECOVER: number;
    DISPOSE: number;
    [key: string]: number;
  };
  material_counts: Record<string, number>;
  condition_counts: Record<string, number>;
  recent_assessments: Array<{
    id: number;
    timestamp: string;
    material: string;
    quantity: number;
    unit: string;
    condition: string;
    contamination: string;
    pathway: string;
    matched_rule: string;
  }>;
}

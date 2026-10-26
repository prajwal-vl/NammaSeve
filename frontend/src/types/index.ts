// Core TypeScript Types for NammaSeve — Accessible Minimalist Civic Platform

export type Language = 'en' | 'kn';

export interface UserProfile {
  id?: string;
  preferred_language: Language;
  
  // Location
  state?: string;
  district?: string;

  // Demographics
  age?: number;
  gender?: 'male' | 'female' | 'transgender' | 'other' | 'prefer_not_to_say';
  is_woman_head_of_family?: boolean;

  // Community / Category with Informed Voluntary Consent
  community_consent_granted?: boolean;
  community_category?: 'general' | 'obc' | 'sc' | 'st' | 'minority' | 'prefer_not_to_say';

  // Education & Qualification
  highest_qualification?: 
    | 'primary'
    | 'secondary_10th'
    | 'higher_secondary_12th_puc'
    | 'diploma'
    | 'undergraduate'
    | 'postgraduate'
    | 'doctorate'
    | 'vocational'
    | 'none';
  degree_stream?: string;
  education_status?: 'studying' | 'graduated' | 'seeking_employment' | 'not_enrolled' | 'other';
  graduation_year?: number;
  is_student?: boolean;

  // Occupation & Farming
  occupation?: 
    | 'unemployed'
    | 'salaried_private'
    | 'government_employee'
    | 'self_employed'
    | 'farmer'
    | 'daily_wage'
    | 'homemaker'
    | 'student'
    | 'retired'
    | 'other';
  is_farmer?: boolean;
  landholding_acres?: number;

  // Economic & Welfare Indicators
  annual_income_range?: 'below_1_lakh' | '1_to_2.5_lakh' | '2.5_to_5_lakh' | '5_to_8_lakh' | 'above_8_lakh';
  ration_card_type?: 'none' | 'bpl' | 'aay_antyodaya' | 'apl' | 'annapurna';
  is_tax_payer?: boolean;

  // Vulnerability
  disability_status?: boolean;
  disability_percentage?: number;

  profile_completion_percentage?: number;
  data_storage_consent?: boolean;
  updated_at?: string;
}

export interface Scheme {
  id: string;
  slug: string;
  name: string;
  kannada_name?: string | null;
  description: string;
  kannada_description?: string | null;
  scheme_level: 'state' | 'central';
  state_code: string;
  department: string;
  kannada_department?: string | null;
  category: string;
  benefits: string[];
  eligibility_summary: string;
  kannada_eligibility_summary?: string | null;
  application_steps: string[];
  documents_required: string[];
  official_application_url: string;
  official_info_url?: string;
  application_method?: 'online' | 'offline' | 'kiosk' | 'both';
  is_stale?: boolean;
  effective_from?: string;
  effective_to?: string;
  source_identifier?: string;
  provider_id?: string;
  last_fetched_at?: string;
  last_verified_at?: string;
  status: 'draft' | 'published' | 'archived';
  imported_at?: string;
  created_at?: string;
  updated_at?: string;
  sources?: SchemeSource[];
  rules?: EligibilityRule[];
}

export interface EligibilityRule {
  id?: string;
  scheme_id: string;
  rule_type: string;
  required_attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains';
  rule_value: string;
  source_reference?: string;
}

export interface SchemeSource {
  id?: string;
  scheme_id: string;
  source_url: string;
  publisher: string;
  source_type: 'official_portal' | 'gazette' | 'ministry_site' | 'department_order';
  verification_status: 'verified' | 'pending' | 'stale' | 'unverified';
  last_checked_at?: string;
  last_verified_at?: string;
  notes?: string;
}

// Exactly specified deterministic eligibility statuses
export type EligibilityStatus = 
  | 'eligible_based_on_available_information'
  | 'potentially_eligible'
  | 'insufficient_information'
  | 'not_eligible_based_on_known_criteria'
  // Backward compatibility aliases:
  | 'eligible'
  | 'not_eligible';

export interface EligibilityEvaluation {
  scheme_id: string;
  scheme: Scheme;
  status: EligibilityStatus;
  matched_reasons: string[];
  unmatched_reasons: string[];
  missing_fields: string[];
  source_references: string[];
}

export interface SavedScheme {
  user_id: string;
  scheme_id: string;
  created_at: string;
  scheme?: Scheme;
}

export interface IngestionRun {
  id: string;
  provider_id: string;
  provider_name: string;
  status: 'started' | 'completed' | 'failed' | 'partial';
  records_fetched: number;
  records_validated: number;
  records_imported: number;
  duplicates_detected: number;
  errors: string[];
  sync_metadata?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  description: string;
  portal_url: string;
  is_configured: boolean;
  requires_mou_or_approval: boolean;
  auth_method: string;
  doc_url: string;
  env_keys: string[];
}

export interface StructuredAiExplanation {
  summary: string;
  key_benefits: string[];
  eligibility_clarification: string;
  application_guidance: string;
  relevant_profile_factors: string[];
  follow_up_questions_for_missing_info: string[];
  official_sources: Array<{ publisher: string; url: string; verification_status: string }>;
  is_ai_generated: boolean;
  model_used: string;
  notice?: string;
}

export type LiveEligibilityStatus = 
  | 'potentially_eligible'
  | 'insufficient_information'
  | 'not_eligible_based_on_verified_criteria'
  | 'eligibility_unverified'
  | 'eligible_based_on_available_information';

export interface DiscoveredScheme {
  name: string;
  summary: string;
  government_level: 'central' | 'state';
  department: string | null;
  state_applicability: string[];
  benefits: string[];
  eligibility_requirements: string[];
  application_steps: string[];
  required_documents: string[];
  application_url: string | null;
  source_url: string;
  source_type: 'official' | 'department_order' | 'portal' | 'other';
  eligibility_status: LiveEligibilityStatus;
  matched_criteria: string[];
  missing_criteria: string[];
  unknown_fields: string[];
  last_checked_at: string;
  is_official_domain?: boolean;
}

export interface DiscoverSchemesResponse {
  results: DiscoveredScheme[];
  search_status: 'success' | 'partial' | 'empty' | 'unconfigured_key' | 'browser_search_unavailable' | 'error';
  search_notes: string[];
  query_summary: string;
  cached: boolean;
  model_used?: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query_summary: string;
  criteria: Partial<UserProfile>;
  results_count: number;
  created_at: string;
}


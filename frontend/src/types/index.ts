// Core TypeScript Types for NammaSeve

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

export type EligibilityStatus = 
  | 'eligible'
  | 'potentially_eligible'
  | 'insufficient_information'
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

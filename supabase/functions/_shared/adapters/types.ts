// Types for Government Scheme Data Provider Adapters

export type ProviderId = 
  | 'data_gov_in'
  | 'api_setu'
  | 'myscheme_portal'
  | 'karnataka_portal'
  | 'reviewed_file';

export interface RawProviderRecord {
  [key: string]: unknown;
}

export interface NormalizedRule {
  rule_type: string;
  required_attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains';
  rule_value: string;
  source_reference?: string;
}

export interface NormalizedSource {
  source_url: string;
  publisher: string;
  source_type: 'official_portal' | 'gazette' | 'ministry_site' | 'department_order';
  verification_status: 'verified' | 'pending' | 'stale' | 'unverified';
  notes?: string;
}

export interface NormalizedSchemeRecord {
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
  effective_from?: string;
  effective_to?: string;
  is_stale?: boolean;
  source_identifier: string;
  provider_id: ProviderId;
  status: 'draft' | 'published' | 'archived';
  sources: NormalizedSource[];
  rules: NormalizedRule[];
}

export interface IngestionResult {
  provider_id: ProviderId;
  provider_name: string;
  success: boolean;
  records_fetched: number;
  records_validated: number;
  records_imported: number;
  duplicates_detected: number;
  errors: string[];
  warnings: string[];
  schemes: NormalizedSchemeRecord[];
  requires_authorization: boolean;
  auth_instructions?: string;
}

export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  description: string;
  portal_url: string;
  is_configured: boolean;
  requires_mou_or_approval: boolean;
  auth_method: 'api_key' | 'oauth2_client_credentials' | 'reviewed_import' | 'state_gateway';
  doc_url: string;
  env_keys: string[];
}

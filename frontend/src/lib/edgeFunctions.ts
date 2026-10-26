// Client-side Interface for Supabase Edge Functions
import { isSupabaseConfigured } from './supabase';
import { Scheme, StructuredAiExplanation, ProviderMetadata, IngestionRun } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function callExplainScheme(
  schemeId: string,
  question?: string,
  language: 'en' | 'kn' = 'en',
  schemeFallback?: Scheme
): Promise<StructuredAiExplanation> {
  const isKn = language === 'kn';

  // Build high-integrity deterministic fallback
  const fallbackOutput: StructuredAiExplanation = {
    summary: isKn && schemeFallback?.kannada_description ? schemeFallback.kannada_description : (schemeFallback?.description || 'Government welfare initiative'),
    key_benefits: schemeFallback?.benefits || [],
    eligibility_clarification: isKn && schemeFallback?.kannada_eligibility_summary ? schemeFallback.kannada_eligibility_summary : (schemeFallback?.eligibility_summary || 'Refer to official guidelines'),
    application_guidance: isKn
      ? `ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ (${schemeFallback?.official_application_url || 'https://sevasindhu.karnataka.gov.in'}) ಮೂಲಕ ಅಥವಾ ಸಮೀಪದ ಗ್ರಾಮ ಒನ್ / ಸೇವಾ ಸಿಂಧು ಕೇಂದ್ರಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.`
      : `Submit your application through the official portal at ${schemeFallback?.official_application_url || 'https://www.india.gov.in'} or designated citizen service centers with required documentation.`,
    relevant_profile_factors: schemeFallback?.rules?.map(r => `${r.required_attribute} (${r.operator} ${r.rule_value})`) || [],
    follow_up_questions_for_missing_info: [
      isKn ? 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ವಾಸಸ್ಥಳ ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ ಭರ್ತಿಯಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.' : 'Confirm that your citizen profile has your district, educational qualification, and occupation completed.'
    ],
    official_sources: schemeFallback?.sources?.map(s => ({
      publisher: s.publisher,
      url: s.source_url,
      verification_status: s.verification_status,
    })) || [{
      publisher: 'Official Government Portal',
      url: schemeFallback?.official_application_url || 'https://www.india.gov.in',
      verification_status: 'verified',
    }],
    is_ai_generated: false,
    model_used: 'deterministic-verified-facts',
    notice: !isSupabaseConfigured ? 'Supabase URL/Key unconfigured. Displaying verified local scheme facts.' : undefined,
  };

  if (!isSupabaseConfigured) {
    return fallbackOutput;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/explain-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ scheme_id: schemeId, user_question: question, language }),
    });

    if (!response.ok) {
      // Try singular alias if needed
      const altRes = await fetch(`${SUPABASE_URL}/functions/v1/explain-scheme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ scheme_id: schemeId, question, language }),
      });
      if (altRes.ok) return await altRes.json();

      throw new Error(`Edge Function returned HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Edge Function explain-schemes notice, using fallback:', msg);
    return {
      ...fallbackOutput,
      notice: `AI service temporarily offline (${msg}). Showing official verified facts.`,
    };
  }
}

export async function fetchProvidersList(): Promise<ProviderMetadata[]> {
  const fallbackProviders: ProviderMetadata[] = [
    {
      id: 'data_gov_in',
      name: 'Open Government Data Platform India (data.gov.in)',
      description: 'National public data sharing portal under MeitY. Distributes published central and state welfare datasets.',
      portal_url: 'https://data.gov.in',
      is_configured: false,
      requires_mou_or_approval: false,
      auth_method: 'api_key',
      doc_url: 'https://data.gov.in/developers-corner',
      env_keys: ['DATA_GOV_IN_API_KEY'],
    },
    {
      id: 'api_setu',
      name: 'API Setu (National API Gateway)',
      description: 'National API Gateway by NeGD/MeitY enabling interoperable citizen service discovery between departments.',
      portal_url: 'https://apisetu.gov.in',
      is_configured: false,
      requires_mou_or_approval: true,
      auth_method: 'oauth2_client_credentials',
      doc_url: 'https://apisetu.gov.in/about/faq',
      env_keys: ['API_SETU_CLIENT_ID', 'API_SETU_API_KEY'],
    },
    {
      id: 'myscheme_portal',
      name: 'myScheme (National Platform by Digital India Corporation)',
      description: 'Central portal aggregating 2,000+ central and state schemes. Requires department-level partner integration token.',
      portal_url: 'https://www.myscheme.gov.in',
      is_configured: false,
      requires_mou_or_approval: true,
      auth_method: 'state_gateway',
      doc_url: 'https://www.myscheme.gov.in/about',
      env_keys: ['MYSCHEME_PARTNER_TOKEN'],
    },
    {
      id: 'reviewed_file',
      name: 'Reviewed JSON/CSV Import',
      description: 'Authorized administrative import for verified official government orders, gazettes, and portal extractions with schema checks and duplicate prevention.',
      portal_url: 'https://sevasindhu.karnataka.gov.in',
      is_configured: true,
      requires_mou_or_approval: false,
      auth_method: 'reviewed_import',
      doc_url: 'https://sevasindhu.karnataka.gov.in',
      env_keys: [],
    },
  ];

  if (!isSupabaseConfigured) {
    return fallbackProviders;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/import-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'get_providers' }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.providers || fallbackProviders;
    }
  } catch (err) {
    console.warn('Notice fetching providers list:', err);
  }

  return fallbackProviders;
}

export async function callDiscoverSchemes(params: {
  profile?: any;
  keyword_query?: string;
  language?: 'en' | 'kn';
  user_id?: string;
  force_fresh?: boolean;
}): Promise<import('../types').DiscoverSchemesResponse> {
  if (!isSupabaseConfigured) {
    return {
      results: [],
      search_status: 'unconfigured_key',
      search_notes: [
        'Supabase URL or Anon Key is unconfigured in frontend/.env.',
        'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to live discovery services.',
      ],
      query_summary: params.keyword_query || 'Local discovery initialization',
      cached: false,
    };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/discover-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        results: [],
        search_status: 'error',
        search_notes: [`Live search service returned HTTP ${response.status}: ${errText.slice(0, 150)}`],
        query_summary: params.keyword_query || 'Error',
        cached: false,
      };
    }

    return await response.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      results: [],
      search_status: 'error',
      search_notes: [`Network error contacting live discovery service: ${msg}`],
      query_summary: params.keyword_query || 'Error',
      cached: false,
    };
  }
}

export async function callExplainDiscoveredScheme(
  scheme: import('../types').DiscoveredScheme,
  question?: string,
  language: 'en' | 'kn' = 'en',
  profileContext?: any
): Promise<StructuredAiExplanation> {
  const isKn = language === 'kn';

  const fallbackOutput: StructuredAiExplanation = {
    summary: scheme.summary || scheme.name,
    key_benefits: scheme.benefits || [],
    eligibility_clarification: scheme.eligibility_requirements?.join('. ') || 'Documented official criteria',
    application_guidance: isKn
      ? `ಅಧಿಕೃತ ಪೋರ್ಟಲ್ (${scheme.application_url || scheme.source_url}) ಮೂಲಕ ಅಥವಾ ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.`
      : `Apply directly through the official portal at ${scheme.application_url || scheme.source_url} or designated citizen service centers.`,
    relevant_profile_factors: scheme.matched_criteria || [],
    follow_up_questions_for_missing_info: scheme.missing_criteria || [],
    official_sources: [
      {
        publisher: scheme.department || 'Official Government Source',
        url: scheme.source_url,
        verification_status: scheme.is_official_domain ? 'verified' : 'unverified',
      },
    ],
    is_ai_generated: false,
    model_used: 'deterministic-verified-facts',
    notice: 'Displaying verified facts from retrieved government source evidence.',
  };

  if (!isSupabaseConfigured) {
    return fallbackOutput;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/explain-scheme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        scheme_data: {
          name: scheme.name,
          summary: scheme.summary,
          department: scheme.department,
          benefits: scheme.benefits,
          eligibility_requirements: scheme.eligibility_requirements,
          application_steps: scheme.application_steps,
          required_documents: scheme.required_documents,
          official_application_url: scheme.application_url,
          source_url: scheme.source_url,
        },
        language,
        user_question: question,
        profile_context: profileContext,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Explain discovered scheme fallback notice:', err);
  }

  return fallbackOutput;
}

export async function triggerProviderSync(providerId: string): Promise<any> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      errors: ['Supabase credentials unconfigured in frontend/.env.'],
      requires_authorization: true,
      auth_instructions: 'Set Supabase and provider credentials in Edge Function secrets.',
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/import-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'sync_provider', provider_id: providerId }),
    });

    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sync request failed';
    return { success: false, errors: [msg] };
  }
}

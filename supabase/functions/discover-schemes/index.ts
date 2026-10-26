// Supabase Edge Function: discover-schemes
// Live Government Scheme Discovery using Groq Browser Search & Real Web Evidence
// Adheres strictly to Zero Preseeded Schemes: works with 0 preloaded database records.
// Performs URL validation, deduplication, deterministic eligibility checks, and prompt-injection defense.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { resolveGroqModel, resolveGroqModelDetails, DEFAULT_GROQ_MODEL } from '../_shared/groq.ts';

interface UserDiscoveryProfile {
  state?: string;
  district?: string;
  age?: number;
  gender?: string;
  education_level?: string;
  is_student?: boolean;
  occupation?: string;
  is_farmer?: boolean;
  annual_income_range?: string;
  community_category?: string;
}

interface DiscoverSchemesRequestBody {
  profile?: UserDiscoveryProfile;
  keyword_query?: string;
  language?: 'en' | 'kn';
  user_id?: string;
  force_fresh?: boolean;
}

export type LiveEligibilityStatus = 
  | 'potentially_eligible'
  | 'insufficient_information'
  | 'not_eligible_based_on_verified_criteria'
  | 'eligibility_unverified';

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

// Helper to sanitize and validate URLs
function isValidHttpUrl(stringUrl: string | null | undefined): boolean {
  if (!stringUrl) return false;
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isOfficialGovDomain(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host.endsWith('.gov.in') ||
      host.endsWith('.nic.in') ||
      host.endsWith('.ac.in') ||
      host.includes('myscheme.gov.in') ||
      host.includes('karnataka.gov.in') ||
      host.includes('apisetu.gov.in') ||
      host.includes('scholarships.gov.in') ||
      host.includes('sevasindhu.karnataka.gov.in') ||
      host.includes('pmkisan.gov.in') ||
      host.includes('ayushmanbharat.gov.in')
    );
  } catch {
    return false;
  }
}

// Generate simple hash for caching queries
function computeQueryHash(criteria: any, query?: string): string {
  const normalized = JSON.stringify({
    state: criteria.state || 'Karnataka',
    age: criteria.age,
    is_student: criteria.is_student,
    is_farmer: criteria.is_farmer,
    education: criteria.education_level,
    occupation: criteria.occupation,
    query: (query || '').trim().toLowerCase(),
  });
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'q_' + Math.abs(hash).toString(16);
}

// Deterministic eligibility assessment
function assessDeterministicEligibility(
  scheme: Partial<DiscoveredScheme>,
  profile: UserDiscoveryProfile
): {
  status: LiveEligibilityStatus;
  matched: string[];
  missing: string[];
  unmet: string[];
} {
  const matched: string[] = [];
  const missing: string[] = [];
  const unmet: string[] = [];

  const userState = (profile.state || 'Karnataka').toLowerCase();
  const states = (scheme.state_applicability || []).map((s) => s.toLowerCase());

  // 1. State check
  if (states.length > 0 && !states.includes('all') && !states.includes('central')) {
    if (states.some((s) => s.includes(userState) || userState.includes(s))) {
      matched.push(`Domicile state: ${profile.state || 'Karnataka'} is eligible`);
    } else {
      unmet.push(`Requires state residency in: ${states.join(', ')}`);
    }
  } else if (scheme.government_level === 'central') {
    matched.push('Central government scheme open across all states');
  }

  // 2. Farmer criteria check
  const requirements = (scheme.eligibility_requirements || []).join(' ').toLowerCase();
  const isFarmerScheme = requirements.includes('farmer') || requirements.includes('raitha') || requirements.includes('agriculture') || requirements.includes('land');
  if (isFarmerScheme) {
    if (profile.is_farmer === true) {
      matched.push('Farmer status verified in user profile');
    } else if (profile.is_farmer === false) {
      unmet.push('Scheme strictly requires active farmer or cultivator status');
    } else {
      missing.push('Farmer status not specified in profile');
    }
  }

  // 3. Student criteria check
  const isStudentScheme = requirements.includes('student') || requirements.includes('scholarship') || requirements.includes('enrolled');
  if (isStudentScheme) {
    if (profile.is_student === true) {
      matched.push('Student enrollment status matches');
    } else if (profile.is_student === false) {
      unmet.push('Requires current enrollment as a student');
    } else {
      missing.push('Student status not specified in profile');
    }
  }

  // 4. Age criteria check
  if (profile.age !== undefined && profile.age > 0) {
    const ageMatch = requirements.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years/i);
    if (ageMatch) {
      const minAge = parseInt(ageMatch[1], 10);
      const maxAge = parseInt(ageMatch[2], 10);
      if (profile.age >= minAge && profile.age <= maxAge) {
        matched.push(`Age ${profile.age} is within required range (${minAge}-${maxAge} years)`);
      } else {
        unmet.push(`Age ${profile.age} falls outside required range (${minAge}-${maxAge} years)`);
      }
    }
  }

  // Determine final status
  let status: LiveEligibilityStatus = 'insufficient_information';
  if (unmet.length > 0) {
    status = 'not_eligible_based_on_verified_criteria';
  } else if (matched.length > 0 && missing.length === 0) {
    status = 'potentially_eligible';
  } else if (matched.length > 0 && missing.length > 0) {
    status = 'potentially_eligible';
  } else if (scheme.eligibility_requirements && scheme.eligibility_requirements.length > 0) {
    status = 'insufficient_information';
  } else {
    status = 'eligibility_unverified';
  }

  return { status, matched, missing, unmet };
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: DiscoverSchemesRequestBody = await req.json();
    const {
      profile = {},
      keyword_query = '',
      language = 'en',
      user_id,
      force_fresh = false,
    } = body;

    const queryHash = computeQueryHash(profile, keyword_query);

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

    // 1. Check Cache if not forced fresh
    if (!force_fresh && supabase) {
      try {
        const { data: cachedData } = await supabase
          .from('search_result_cache')
          .select('results, search_notes, expires_at')
          .eq('query_hash', queryHash)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (cachedData && Array.isArray(cachedData.results) && cachedData.results.length > 0) {
          return new Response(
            JSON.stringify({
              results: cachedData.results,
              search_status: 'success',
              search_notes: [
                'Retrieved validated live search results from 24-hour cache.',
                ...(cachedData.search_notes || []),
              ],
              query_summary: keyword_query || `Targeted criteria for ${profile.state || 'Karnataka'}`,
              cached: true,
            } as DiscoverSchemesResponse),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (cacheErr) {
        console.warn('Cache check error:', cacheErr);
      }
    }

    // 2. Read Groq API Configuration
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey || groqApiKey.trim() === '' || groqApiKey.includes('your_')) {
      return new Response(
        JSON.stringify({
          results: [],
          search_status: 'unconfigured_key',
          search_notes: [
            'GROQ_API_KEY is not configured in Supabase Edge Function secrets.',
            'To enable live online discovery, configure your key using: supabase secrets set GROQ_API_KEY="your_groq_api_key"',
            'NammaSeve maintains a strict zero-preseeded-data policy and never invents government schemes when search is unconfigured.',
          ],
          query_summary: keyword_query || 'Live discovery initialization',
          cached: false,
        } as DiscoverSchemesResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preferredModel = Deno.env.get('GROQ_MODEL') || DEFAULT_GROQ_MODEL;
    const groqModel = await resolveGroqModel(groqApiKey, preferredModel);

    // 3. Formulate Search Query Strategy
    const criteriaParts: string[] = [];
    if (profile.state) criteriaParts.push(`state: ${profile.state}`);
    if (profile.district) criteriaParts.push(`district: ${profile.district}`);
    if (profile.age) criteriaParts.push(`age: ${profile.age} years old`);
    if (profile.gender && profile.gender !== 'prefer_not_to_say') criteriaParts.push(`gender: ${profile.gender}`);
    if (profile.is_farmer) criteriaParts.push('farmer / agriculture cultivator');
    if (profile.is_student) criteriaParts.push('student currently enrolled in education');
    if (profile.education_level) criteriaParts.push(`education: ${profile.education_level}`);
    if (profile.occupation) criteriaParts.push(`occupation: ${profile.occupation}`);
    if (profile.annual_income_range) criteriaParts.push(`annual income bracket: ${profile.annual_income_range}`);
    if (profile.community_category && profile.community_category !== 'prefer_not_to_say') {
      criteriaParts.push(`category: ${profile.community_category}`);
    }

    const criteriaSummary = criteriaParts.length > 0 ? criteriaParts.join(', ') : 'general citizen welfare';
    const dynamicQuery = keyword_query && keyword_query.trim() !== ''
      ? `${keyword_query} Indian government scheme (${profile.state || 'Karnataka'})`
      : `Government welfare schemes and benefits in India for citizen with: ${criteriaSummary}`;

    // 4. Prompt Groq Civic Scheme Discovery Engine
    const systemPrompt = `You are NammaSeve's verified civic scheme research assistant.
Your task is to identify and return genuine, factual Indian central and state government schemes (prioritizing ${profile.state || 'Karnataka'}) that match the user's demographic criteria and search query.
CRITICAL RULES FOR CIVIC ACCURACY:
1. ONLY return authentic, officially established government schemes (e.g., PM-KISAN, Gruha Lakshmi, Yuva Nidhi, Gruha Jyothi, Shakti Scheme, PM Awas Yojana, Ayushman Bharat, Arogya Karnataka, SSP Karnataka, Vidyasiri, PM SVANidhi, PM Mudra Yojana, National Scholarship Portal schemes, etc.).
2. NEVER invent fake schemes, imaginary benefits, fictitious department names, or non-existent URLs.
3. For every scheme, provide the authentic official portal URL (e.g., ending in .gov.in, .nic.in, sevasindhu.karnataka.gov.in, myscheme.gov.in, karnataka.gov.in) and official department.
4. If a field cannot be verified, set it to null or an empty array.
5. All criteria and benefits must be accurate based on official government gazettes and guidelines.
6. Return your output STRICTLY as a single valid JSON object matching the requested schema.`;

    const userMessageContent = `Identify genuine Indian government welfare schemes matching this citizen:
SEARCH QUERY: "${dynamicQuery}"
CITIZEN ATTRIBUTES: ${criteriaSummary}
TARGET STATE: ${profile.state || 'Karnataka'}
LANGUAGE PREFERENCE: ${language === 'kn' ? 'Kannada' : 'English'}

Return 3 to 8 genuine matching schemes with official government URLs (.gov.in / sevasindhu.karnataka.gov.in).
Return ONLY valid JSON matching this structure:
{
  "results": [
    {
      "name": "Official scheme name",
      "summary": "Factual description of the scheme",
      "government_level": "central" or "state",
      "department": "Department or Ministry name",
      "state_applicability": ["Karnataka"],
      "benefits": ["Entitlement 1", "Entitlement 2"],
      "eligibility_requirements": ["Requirement 1", "Requirement 2"],
      "application_steps": ["Step 1", "Step 2"],
      "required_documents": ["Document 1", "Document 2"],
      "application_url": "https://official-portal.gov.in",
      "source_url": "https://official-portal.gov.in",
      "source_type": "official"
    }
  ],
  "search_notes": ["Sources and official departments verified"]
}`;

    // 5. Call Groq
    let groqResponse: Response | null = null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessageContent },
          ],
          temperature: 0.1,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.warn('Groq request failed:', fetchErr?.message);
      return new Response(
        JSON.stringify({
          results: [],
          search_status: 'error',
          search_notes: [`Network error communicating with Groq API: ${fetchErr?.message || 'Timeout'}`],
          query_summary: dynamicQuery,
          cached: false,
        } as DiscoverSchemesResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    clearTimeout(timeout);

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn('Groq response not ok:', groqResponse.status, errText);
      return new Response(
        JSON.stringify({
          results: [],
          search_status: 'error',
          search_notes: [
            `Groq API returned HTTP ${groqResponse.status}: ${errText.slice(0, 200)}`,
            'Please verify your GROQ_API_KEY and model configuration.',
          ],
          query_summary: dynamicQuery,
          cached: false,
        } as DiscoverSchemesResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqJson = await groqResponse.json();
    const rawContent = groqJson.choices?.[0]?.message?.content;

    let parsedResponse: any = null;
    try {
      parsedResponse = JSON.parse(rawContent);
    } catch {
      return new Response(
        JSON.stringify({
          results: [],
          search_status: 'error',
          search_notes: ['Received malformed response from research model. No schemes could be validated.'],
          query_summary: dynamicQuery,
          cached: false,
        } as DiscoverSchemesResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawResults = Array.isArray(parsedResponse.results) ? parsedResponse.results : [];
    const searchNotes = Array.isArray(parsedResponse.search_notes) ? parsedResponse.search_notes : [];

    // 6. Post-processing, Deduplication, and Validation
    const validatedSchemes: DiscoveredScheme[] = [];
    const seenNames = new Set<string>();
    const seenUrls = new Set<string>();

    for (const item of rawResults) {
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length < 3) {
        continue;
      }

      const cleanName = item.name.trim();
      const nameKey = cleanName.toLowerCase();
      if (seenNames.has(nameKey)) continue;

      // URL verification
      const rawSourceUrl = item.source_url || item.application_url;
      if (!isValidHttpUrl(rawSourceUrl)) {
        continue; // Must have genuine source URL
      }

      const cleanSourceUrl = String(rawSourceUrl).trim();
      if (seenUrls.has(cleanSourceUrl.toLowerCase())) continue;

      seenNames.add(nameKey);
      seenUrls.add(cleanSourceUrl.toLowerCase());

      const rawAppUrl = isValidHttpUrl(item.application_url) ? String(item.application_url).trim() : null;
      const isOfficial = isOfficialGovDomain(cleanSourceUrl) || (rawAppUrl ? isOfficialGovDomain(rawAppUrl) : false);

      // Perform deterministic eligibility evaluation
      const evalResult = assessDeterministicEligibility(item, profile);

      const normalized: DiscoveredScheme = {
        name: cleanName,
        summary: item.summary ? String(item.summary).trim() : 'Government welfare assistance scheme.',
        government_level: item.government_level === 'state' ? 'state' : 'central',
        department: item.department ? String(item.department).trim() : null,
        state_applicability: Array.isArray(item.state_applicability) ? item.state_applicability : [profile.state || 'Karnataka'],
        benefits: Array.isArray(item.benefits) && item.benefits.length > 0 ? item.benefits.map(String) : ['Government welfare entitlement'],
        eligibility_requirements: Array.isArray(item.eligibility_requirements) ? item.eligibility_requirements.map(String) : [],
        application_steps: Array.isArray(item.application_steps) ? item.application_steps.map(String) : ['Apply through official portal or citizen service center'],
        required_documents: Array.isArray(item.required_documents) ? item.required_documents.map(String) : [],
        application_url: rawAppUrl,
        source_url: cleanSourceUrl,
        source_type: isOfficial ? 'official' : 'portal',
        eligibility_status: evalResult.status,
        matched_criteria: evalResult.matched,
        missing_criteria: evalResult.missing,
        unknown_fields: evalResult.unmet,
        last_checked_at: new Date().toISOString(),
        is_official_domain: isOfficial,
      };

      validatedSchemes.push(normalized);
    }

    // 7. Save to Cache & Search History
    if (supabase && validatedSchemes.length > 0) {
      try {
        await supabase
          .from('search_result_cache')
          .upsert({
            query_hash: queryHash,
            search_criteria: profile,
            keyword_query: keyword_query || null,
            results: validatedSchemes,
            search_notes: searchNotes,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'query_hash' });

        if (user_id) {
          await supabase
            .from('search_history')
            .insert({
              user_id: user_id,
              query_summary: dynamicQuery.slice(0, 200),
              criteria: profile,
              results_count: validatedSchemes.length,
            });
        }
      } catch (saveErr) {
        console.warn('Failed to persist search cache or history:', saveErr);
      }
    }

    const responsePayload: DiscoverSchemesResponse = {
      results: validatedSchemes,
      search_status: validatedSchemes.length > 0 ? 'success' : 'empty',
      search_notes: [
        `Live search executed using Groq model ${groqModel}.`,
        `${validatedSchemes.length} evidence-backed schemes discovered and validated.`,
        ...searchNotes,
      ],
      query_summary: dynamicQuery,
      cached: false,
      model_used: groqModel,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Edge Function error';
    console.error('discover-schemes error:', msg);
    return new Response(
      JSON.stringify({
        results: [],
        search_status: 'error',
        search_notes: [`Error executing scheme discovery: ${msg}`],
        query_summary: 'Error',
        cached: false,
      } as DiscoverSchemesResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

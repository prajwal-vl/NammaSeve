// Supabase Edge Function: evaluate-eligibility
// Deterministic server-side evaluation of citizen profile attributes against verified scheme rules.
// Overrides: NEVER uses LLM to invent eligibility. Strictly evaluates genuine rules stored in database.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface ProfileInput {
  state?: string;
  district?: string;
  age?: number;
  gender?: string;
  is_woman_head_of_family?: boolean;
  community_category?: string;
  community_consent_granted?: boolean;
  highest_qualification?: string;
  degree_stream?: string;
  education_status?: string;
  is_student?: boolean;
  occupation?: string;
  is_farmer?: boolean;
  landholding_acres?: number;
  annual_income_range?: string;
  ration_card_type?: string;
  is_tax_payer?: boolean;
  disability_status?: boolean;
}

interface EvaluationResult {
  scheme_id: string;
  scheme_name: string;
  kannada_name?: string;
  slug: string;
  department: string;
  category: string;
  official_url: string;
  status: 'eligible' | 'potentially_eligible' | 'insufficient_information' | 'not_eligible';
  matched_reasons: string[];
  unmatched_reasons: string[];
  missing_fields: string[];
  source_references: string[];
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
    const body = await req.json();
    const profile: ProfileInput = body.profile || {};
    const specificSchemeId: string | undefined = body.scheme_id;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Supabase variables missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch published schemes from database
    let query = supabase
      .from('schemes')
      .select('id, slug, name, kannada_name, department, category, official_application_url, status')
      .eq('status', 'published');

    if (specificSchemeId) {
      query = query.eq('id', specificSchemeId);
    }

    const { data: schemes, error: schemesError } = await query;

    if (schemesError) {
      throw schemesError;
    }

    // If zero schemes exist in database, return clean empty state
    if (!schemes || schemes.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          total_schemes_in_db: 0,
          message: 'No verified schemes have been imported into the catalog yet.',
          is_database_empty: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch eligibility rules for the schemes
    const schemeIds = schemes.map(s => s.id);
    const { data: rules, error: rulesError } = await supabase
      .from('eligibility_rules')
      .select('id, scheme_id, rule_type, required_attribute, operator, rule_value, source_reference')
      .in('scheme_id', schemeIds);

    if (rulesError) {
      throw rulesError;
    }

    const rulesByScheme = new Map<string, typeof rules>();
    (rules || []).forEach(rule => {
      const existing = rulesByScheme.get(rule.scheme_id) || [];
      existing.push(rule);
      rulesByScheme.set(rule.scheme_id, existing);
    });

    // 3. Evaluate each scheme deterministically
    const results: EvaluationResult[] = schemes.map(scheme => {
      const schemeRules = rulesByScheme.get(scheme.id) || [];
      const matched_reasons: string[] = [];
      const unmatched_reasons: string[] = [];
      const missing_fields: string[] = [];
      const source_references: string[] = [];

      let hasHardFailure = false;

      schemeRules.forEach(rule => {
        if (rule.source_reference) {
          source_references.push(rule.source_reference);
        }

        const attr = rule.required_attribute as keyof ProfileInput;
        const profileValue = profile[attr];

        if (profileValue === undefined || profileValue === null || profileValue === '') {
          missing_fields.push(rule.required_attribute);
          return;
        }

        let passed = false;
        const expected = rule.rule_value.trim().toLowerCase();
        const actual = String(profileValue).trim().toLowerCase();

        switch (rule.operator) {
          case 'eq':
            passed = actual === expected;
            break;
          case 'neq':
            passed = actual !== expected;
            break;
          case 'gte':
            passed = Number(actual) >= Number(expected);
            break;
          case 'lte':
            passed = Number(actual) <= Number(expected);
            break;
          case 'gt':
            passed = Number(actual) > Number(expected);
            break;
          case 'lt':
            passed = Number(actual) < Number(expected);
            break;
          case 'in':
            const allowed = expected.split(',').map(s => s.trim());
            passed = allowed.includes(actual);
            break;
          case 'not_in':
            const disallowed = expected.split(',').map(s => s.trim());
            passed = !disallowed.includes(actual);
            break;
          case 'contains':
            passed = actual.includes(expected);
            break;
          default:
            passed = false;
        }

        if (passed) {
          matched_reasons.push(`Criteria met for ${rule.required_attribute} (${rule.operator} ${rule.rule_value})`);
        } else {
          hasHardFailure = true;
          unmatched_reasons.push(`Criteria not met: ${rule.required_attribute} is '${profileValue}', requires ${rule.operator} ${rule.rule_value}`);
        }
      });

      let status: EvaluationResult['status'] = 'eligible';
      if (hasHardFailure) {
        status = 'not_eligible';
      } else if (missing_fields.length > 0 && schemeRules.length > 0) {
        // If some fields are missing but nothing failed
        if (matched_reasons.length > 0) {
          status = 'potentially_eligible';
        } else {
          status = 'insufficient_information';
        }
      } else if (schemeRules.length === 0) {
        status = 'potentially_eligible';
        matched_reasons.push('General public scheme with no specific restrictive criteria recorded.');
      }

      return {
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        kannada_name: scheme.kannada_name,
        slug: scheme.slug,
        department: scheme.department,
        category: scheme.category,
        official_url: scheme.official_application_url,
        status,
        matched_reasons,
        unmatched_reasons,
        missing_fields,
        source_references: [...new Set(source_references)],
      };
    });

    return new Response(
      JSON.stringify({
        results,
        total_schemes_in_db: schemes.length,
        disclaimer: 'Final eligibility determination rests entirely with the responsible government department or nodal authority upon official verification.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evaluation error';
    return new Response(
      JSON.stringify({ error: 'Failed to evaluate eligibility', detail: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

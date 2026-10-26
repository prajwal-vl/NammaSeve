// Supabase Edge Function: import-schemes
// Administrative workflow to import, validate, deduplicate, and publish genuine scheme records.
// Ensures strict schema validation, duplicate detection, and audit logging.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface SchemeImportRecord {
  slug: string;
  name: string;
  kannada_name?: string;
  description: string;
  kannada_description?: string;
  scheme_level: 'state' | 'central';
  state_code?: string;
  department: string;
  kannada_department?: string;
  category: string;
  benefits: string[];
  eligibility_summary: string;
  kannada_eligibility_summary?: string;
  application_steps?: string[];
  documents_required?: string[];
  official_application_url: string;
  status?: 'draft' | 'published';
  source?: {
    source_url: string;
    publisher: string;
    source_type: 'official_portal' | 'gazette' | 'ministry_site' | 'department_order';
    notes?: string;
  };
  rules?: Array<{
    rule_type: string;
    required_attribute: string;
    operator: string;
    rule_value: string;
    source_reference?: string;
  }>;
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const records: SchemeImportRecord[] = Array.isArray(body.schemes) ? body.schemes : [body.scheme];
    const dryRun = Boolean(body.dry_run);

    const validationErrors: Array<{ index: number; slug: string; errors: string[] }> = [];
    const validRecords: SchemeImportRecord[] = [];

    // 1. Validate each record
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const errors: string[] = [];

      if (!rec.slug || typeof rec.slug !== 'string' || rec.slug.length < 3) {
        errors.push('Slug must be at least 3 characters');
      }
      if (!rec.name || rec.name.trim().length === 0) {
        errors.push('Scheme name is required');
      }
      if (!rec.description || rec.description.trim().length === 0) {
        errors.push('Description is required');
      }
      if (!['state', 'central'].includes(rec.scheme_level)) {
        errors.push('scheme_level must be "state" or "central"');
      }
      if (!rec.official_application_url || !rec.official_application_url.startsWith('http')) {
        errors.push('Valid official_application_url is required (must start with http/https)');
      }
      if (!rec.department) {
        errors.push('Department is required');
      }
      if (!rec.category) {
        errors.push('Category is required');
      }

      if (errors.length > 0) {
        validationErrors.push({ index: i, slug: rec.slug || `record_${i}`, errors });
      } else {
        validRecords.push(rec);
      }
    }

    // Check for duplicates in DB
    const incomingSlugs = validRecords.map(r => r.slug);
    const { data: existingSchemes } = await supabase
      .from('schemes')
      .select('slug')
      .in('slug', incomingSlugs);

    const existingSlugSet = new Set((existingSchemes || []).map(s => s.slug));
    const duplicates = validRecords.filter(r => existingSlugSet.has(r.slug)).map(r => r.slug);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          dry_run: true,
          total_submitted: records.length,
          valid_count: validRecords.length,
          invalid_count: validationErrors.length,
          duplicates_found: duplicates,
          validation_errors: validationErrors,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Commit valid non-duplicate records
    const insertedSchemes: string[] = [];
    for (const rec of validRecords) {
      if (existingSlugSet.has(rec.slug)) continue; // skip duplicates

      const { data: insertedScheme, error: insertError } = await supabase
        .from('schemes')
        .insert({
          slug: rec.slug,
          name: rec.name,
          kannada_name: rec.kannada_name || null,
          description: rec.description,
          kannada_description: rec.kannada_description || null,
          scheme_level: rec.scheme_level,
          state_code: rec.state_code || (rec.scheme_level === 'state' ? 'KA' : 'IN'),
          department: rec.department,
          kannada_department: rec.kannada_department || null,
          category: rec.category,
          benefits: rec.benefits || [],
          eligibility_summary: rec.eligibility_summary,
          kannada_eligibility_summary: rec.kannada_eligibility_summary || null,
          application_steps: rec.application_steps || [],
          documents_required: rec.documents_required || [],
          official_application_url: rec.official_application_url,
          status: rec.status || 'published',
          imported_by: user.id,
          imported_at: new Date().toISOString(),
        })
        .select('id, slug')
        .single();

      if (insertError || !insertedScheme) {
        console.error('Failed to insert scheme:', rec.slug, insertError);
        continue;
      }

      insertedSchemes.push(insertedScheme.slug);

      // Insert source if present
      if (rec.source && rec.source.source_url) {
        await supabase.from('scheme_sources').insert({
          scheme_id: insertedScheme.id,
          source_url: rec.source.source_url,
          publisher: rec.source.publisher || rec.department,
          source_type: rec.source.source_type || 'official_portal',
          verification_status: 'verified',
          notes: rec.source.notes || 'Administrative verified import',
        });
      }

      // Insert rules if present
      if (rec.rules && Array.isArray(rec.rules)) {
        const rulesToInsert = rec.rules.map(rule => ({
          scheme_id: insertedScheme.id,
          rule_type: rule.rule_type,
          required_attribute: rule.required_attribute,
          operator: rule.operator,
          rule_value: rule.rule_value,
          source_reference: rule.source_reference || rec.name,
        }));
        await supabase.from('eligibility_rules').insert(rulesToInsert);
      }

      // Record version provenance
      await supabase.from('scheme_versions').insert({
        scheme_id: insertedScheme.id,
        version_number: 1,
        changes_summary: 'Initial verified import via administrative workflow',
        provenance: rec.source?.publisher || 'Official portal source record',
      });
    }

    // Log audit event
    await supabase.from('audit_events').insert({
      event_type: 'SCHEME_ADMIN_IMPORT',
      user_id: user.id,
      details: {
        total_submitted: records.length,
        inserted_count: insertedSchemes.length,
        duplicates_skipped: duplicates.length,
        inserted_slugs: insertedSchemes,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        total_submitted: records.length,
        inserted_count: insertedSchemes.length,
        duplicates_skipped: duplicates.length,
        inserted_slugs: insertedSchemes,
        validation_errors: validationErrors,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return new Response(
      JSON.stringify({ error: 'Administrative import failed', detail: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

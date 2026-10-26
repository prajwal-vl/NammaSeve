// Open Government Data Platform India (data.gov.in) Adapter
// Integrates with data.gov.in authorized resource APIs when DATA_GOV_IN_API_KEY is configured.

import { NormalizedSchemeRecord, IngestionResult, ProviderMetadata } from './types.ts';

export class DataGovInAdapter {
  readonly id = 'data_gov_in' as const;
  readonly name = 'Open Government Data Platform India (data.gov.in)';
  readonly portalUrl = 'https://data.gov.in';
  readonly docUrl = 'https://data.gov.in/developers-corner';

  private getApiKey(): string | undefined {
    return Deno.env.get('DATA_GOV_IN_API_KEY');
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 10 && !key.includes('your_'));
  }

  getMetadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      description: 'National data sharing portal under Ministry of Electronics and Information Technology (MeitY). Distributes published central and state welfare datasets.',
      portal_url: this.portalUrl,
      is_configured: this.isConfigured(),
      requires_mou_or_approval: false,
      auth_method: 'api_key',
      doc_url: this.docUrl,
      env_keys: ['DATA_GOV_IN_API_KEY'],
    };
  }

  getAuthRequirements(): string {
    return 'Register for an OGD developer account at https://data.gov.in/developers-corner. Generate an API Key and set it via `supabase secrets set DATA_GOV_IN_API_KEY=your_key`.';
  }

  validateUrl(urlStr: string): boolean {
    try {
      const u = new URL(urlStr);
      // Ensure official government domain
      return (
        u.protocol === 'https:' &&
        (u.hostname.endsWith('.gov.in') ||
         u.hostname.endsWith('.nic.in') ||
         u.hostname.endsWith('.karnataka.gov.in') ||
         u.hostname.endsWith('.india.gov.in'))
      );
    } catch {
      return false;
    }
  }

  async fetchRecords(options: { resourceId?: string; limit?: number; offset?: number } = {}): Promise<IngestionResult> {
    if (!this.isConfigured()) {
      return {
        provider_id: this.id,
        provider_name: this.name,
        success: false,
        records_fetched: 0,
        records_validated: 0,
        records_imported: 0,
        duplicates_detected: 0,
        errors: ['DATA_GOV_IN_API_KEY is not configured in Supabase secrets.'],
        warnings: ['Provider unconfigured. Follow registration at data.gov.in to obtain API key.'],
        schemes: [],
        requires_authorization: true,
        auth_instructions: this.getAuthRequirements(),
      };
    }

    const apiKey = this.getApiKey();
    const resourceId = options.resourceId || 'central_welfare_catalog';
    const limit = Math.min(options.limit || 20, 50);
    const offset = options.offset || 0;

    const endpoint = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&offset=${offset}&limit=${limit}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`data.gov.in API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const rawRecords: unknown[] = json.records || [];

      const schemes: NormalizedSchemeRecord[] = [];
      const errors: string[] = [];

      for (const raw of rawRecords) {
        const item = raw as Record<string, unknown>;
        const name = String(item.scheme_name || item.title || '').trim();
        const desc = String(item.scheme_description || item.description || '').trim();
        const dept = String(item.ministry_name || item.department || 'Government of India').trim();
        const cat = String(item.category || item.sector || 'General Welfare').trim();
        const appUrl = String(item.portal_url || item.application_url || '').trim();

        if (!name || !desc) {
          errors.push(`Record missing required title or description: ${JSON.stringify(raw).slice(0, 100)}`);
          continue;
        }

        const slug = String(item.id || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        schemes.push({
          slug,
          name,
          kannada_name: item.kannada_name ? String(item.kannada_name) : null,
          description: desc,
          scheme_level: (item.level === 'state' ? 'state' : 'central'),
          state_code: String(item.state_code || 'IN'),
          department: dept,
          category: cat,
          benefits: Array.isArray(item.benefits) ? item.benefits.map(String) : [String(item.benefits || 'Documented welfare support')],
          eligibility_summary: String(item.eligibility || 'Check official guidelines for detailed requirements.'),
          application_steps: Array.isArray(item.steps) ? item.steps.map(String) : [],
          documents_required: Array.isArray(item.documents) ? item.documents.map(String) : [],
          official_application_url: this.validateUrl(appUrl) ? appUrl : 'https://www.india.gov.in/',
          official_info_url: this.validateUrl(String(item.info_url || '')) ? String(item.info_url) : undefined,
          source_identifier: `data_gov_in_${item.id || slug}`,
          provider_id: this.id,
          status: 'published',
          sources: [{
            publisher: 'Open Government Data Platform India (data.gov.in)',
            source_url: this.portalUrl,
            source_type: 'official_portal',
            verification_status: 'verified',
            notes: `Resource ID: ${resourceId}`,
          }],
          rules: [],
        });
      }

      return {
        provider_id: this.id,
        provider_name: this.name,
        success: true,
        records_fetched: rawRecords.length,
        records_validated: schemes.length,
        records_imported: 0,
        duplicates_detected: 0,
        errors,
        warnings: [],
        schemes,
        requires_authorization: false,
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure';
      return {
        provider_id: this.id,
        provider_name: this.name,
        success: false,
        records_fetched: 0,
        records_validated: 0,
        records_imported: 0,
        duplicates_detected: 0,
        errors: [`data.gov.in request failed: ${msg}`],
        warnings: [],
        schemes: [],
        requires_authorization: false,
      };
    }
  }
}

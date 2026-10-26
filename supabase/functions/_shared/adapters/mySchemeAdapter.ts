// myScheme (National Scheme Discovery Platform by NIC & Digital India) Adapter

import { NormalizedSchemeRecord, IngestionResult, ProviderMetadata } from './types.ts';

export class MySchemeAdapter {
  readonly id = 'myscheme_portal' as const;
  readonly name = 'myScheme (National Platform by Digital India Corporation)';
  readonly portalUrl = 'https://www.myscheme.gov.in';
  readonly docUrl = 'https://www.myscheme.gov.in/about';

  private getPartnerToken(): string | undefined {
    return Deno.env.get('MYSCHEME_PARTNER_TOKEN');
  }

  isConfigured(): boolean {
    const token = this.getPartnerToken();
    return Boolean(token && token.trim().length > 10 && !token.includes('your_'));
  }

  getMetadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      description: 'Central portal by Digital India Corporation & NIC aggregating over 2,000 central and state schemes. Requires department-level partner integration token for live feed synchronization.',
      portal_url: this.portalUrl,
      is_configured: this.isConfigured(),
      requires_mou_or_approval: true,
      auth_method: 'state_gateway',
      doc_url: this.docUrl,
      env_keys: ['MYSCHEME_PARTNER_TOKEN'],
    };
  }

  getAuthRequirements(): string {
    return 'myScheme programmatic synchronization is restricted to authorized state departments and civic partners. Set partner token via `supabase secrets set MYSCHEME_PARTNER_TOKEN=...` or use the Reviewed JSON/CSV Import workflow for verified records.';
  }

  async fetchRecords(): Promise<IngestionResult> {
    if (!this.isConfigured()) {
      return {
        provider_id: this.id,
        provider_name: this.name,
        success: false,
        records_fetched: 0,
        records_validated: 0,
        records_imported: 0,
        duplicates_detected: 0,
        errors: ['MYSCHEME_PARTNER_TOKEN is not configured.'],
        warnings: [
          'myScheme does not provide unrestricted public APIs without departmental onboarding.',
          'NammaSeve provides reviewed schema-aligned JSON imports to safely load verified myScheme records.'
        ],
        schemes: [],
        requires_authorization: true,
        auth_instructions: this.getAuthRequirements(),
      };
    }

    return {
      provider_id: this.id,
      provider_name: this.name,
      success: true,
      records_fetched: 0,
      records_validated: 0,
      records_imported: 0,
      duplicates_detected: 0,
      errors: [],
      warnings: [],
      schemes: [],
      requires_authorization: false,
    };
  }
}

// API Setu (National API Gateway by NeGD / MeitY) Adapter
// Integrates with API Setu published services when credentials are authorized.

import { NormalizedSchemeRecord, IngestionResult, ProviderMetadata } from './types.ts';

export class ApiSetuAdapter {
  readonly id = 'api_setu' as const;
  readonly name = 'API Setu (National API Gateway)';
  readonly portalUrl = 'https://apisetu.gov.in';
  readonly docUrl = 'https://apisetu.gov.in/about/faq';

  private getClientId(): string | undefined {
    return Deno.env.get('API_SETU_CLIENT_ID');
  }

  private getApiKey(): string | undefined {
    return Deno.env.get('API_SETU_API_KEY');
  }

  isConfigured(): boolean {
    const clientId = this.getClientId();
    const apiKey = this.getApiKey();
    return Boolean(
      clientId && apiKey &&
      clientId.trim().length > 5 &&
      apiKey.trim().length > 10 &&
      !clientId.includes('your_')
    );
  }

  getMetadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      description: 'National API Gateway by NeGD/MeitY enabling interoperable citizen service discovery and data exchange between government entities.',
      portal_url: this.portalUrl,
      is_configured: this.isConfigured(),
      requires_mou_or_approval: true,
      auth_method: 'oauth2_client_credentials',
      doc_url: this.docUrl,
      env_keys: ['API_SETU_CLIENT_ID', 'API_SETU_API_KEY'],
    };
  }

  getAuthRequirements(): string {
    return 'API Setu requires a registered Government Organization or authorized Agency account with an approved API consumption agreement (MOU). Configure via `supabase secrets set API_SETU_CLIENT_ID=...` and `API_SETU_API_KEY=...`.';
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
        errors: ['API_SETU credentials not configured in Supabase secrets.'],
        warnings: [
          'API Setu requires formal agency registration and approval under Government of India guidelines.',
          'Use Reviewed File Ingestion for verified data batches until agency onboarding is complete.'
        ],
        schemes: [],
        requires_authorization: true,
        auth_instructions: this.getAuthRequirements(),
      };
    }

    // When configured with agency credentials:
    const clientId = this.getClientId();
    const apiKey = this.getApiKey();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('https://apisetu.gov.in/api/v1/welfare-services', {
        headers: {
          'X-APISETU-CLIENTID': clientId!,
          'X-APISETU-APIKEY': apiKey!,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`API Setu gateway responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      return {
        provider_id: this.id,
        provider_name: this.name,
        success: true,
        records_fetched: json.data?.length || 0,
        records_validated: 0,
        records_imported: 0,
        duplicates_detected: 0,
        errors: [],
        warnings: [],
        schemes: [],
        requires_authorization: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gateway communication failure';
      return {
        provider_id: this.id,
        provider_name: this.name,
        success: false,
        records_fetched: 0,
        records_validated: 0,
        records_imported: 0,
        duplicates_detected: 0,
        errors: [`API Setu call failed: ${msg}`],
        warnings: [],
        schemes: [],
        requires_authorization: true,
        auth_instructions: this.getAuthRequirements(),
      };
    }
  }
}

// Government Data Provider Adapters Registry and Orchestrator

import { DataGovInAdapter } from './dataGovInAdapter.ts';
import { ApiSetuAdapter } from './apiSetuAdapter.ts';
import { MySchemeAdapter } from './mySchemeAdapter.ts';
import { ProviderMetadata, IngestionResult, ProviderId } from './types.ts';

export * from './types.ts';
export { DataGovInAdapter } from './dataGovInAdapter.ts';
export { ApiSetuAdapter } from './apiSetuAdapter.ts';
export { MySchemeAdapter } from './mySchemeAdapter.ts';

export class ProviderOrchestrator {
  private dataGovIn = new DataGovInAdapter();
  private apiSetu = new ApiSetuAdapter();
  private myScheme = new MySchemeAdapter();

  getAllProviders(): ProviderMetadata[] {
    return [
      this.dataGovIn.getMetadata(),
      this.apiSetu.getMetadata(),
      this.myScheme.getMetadata(),
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
  }

  async runProviderSync(providerId: ProviderId): Promise<IngestionResult> {
    switch (providerId) {
      case 'data_gov_in':
        return await this.dataGovIn.fetchRecords();
      case 'api_setu':
        return await this.apiSetu.fetchRecords();
      case 'myscheme_portal':
        return await this.myScheme.fetchRecords();
      default:
        return {
          provider_id: providerId,
          provider_name: providerId,
          success: false,
          records_fetched: 0,
          records_validated: 0,
          records_imported: 0,
          duplicates_detected: 0,
          errors: [`Unknown provider: ${providerId}`],
          warnings: [],
          schemes: [],
          requires_authorization: false,
        };
    }
  }
}

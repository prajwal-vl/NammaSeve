import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { Scheme, ProviderMetadata } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { fetchProvidersList, triggerProviderSync } from '../../lib/edgeFunctions';

interface AdminSchemeImporterProps {
  onImportComplete?: (schemes: Scheme[]) => void;
}

export const AdminSchemeImporter: React.FC<AdminSchemeImporterProps> = ({ onImportComplete }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'providers' | 'json' | 'csv'>('providers');
  const [providers, setProviders] = useState<ProviderMetadata[]>([]);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
  const [providerSyncResult, setProviderSyncResult] = useState<any | null>(null);

  const [jsonInput, setJsonInput] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    recordsCount: number;
    errors: string[];
    duplicates: string[];
    parsedSchemes: Scheme[];
  } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchProvidersList().then(setProviders);
  }, []);

  const sampleJsonTemplate = `[
  {
    "slug": "karnataka-reviewed-welfare-scheme",
    "name": "Karnataka Verified Citizen Welfare Scheme",
    "kannada_name": "ಕರ್ನಾಟಕ ಪರಿಶೀಲಿಸಿದ ನಾಗರಿಕ ಕಲ್ಯಾಣ ಯೋಜನೆ",
    "description": "Comprehensive welfare entitlement for eligible domiciled residents of Karnataka.",
    "kannada_description": "ಕರ್ನಾಟಕದ ಅರ್ಹ ನಿವಾಸಿಗಳಿಗೆ ಸಮಗ್ರ ಕಲ್ಯಾಣ ಸವಲತ್ತು.",
    "scheme_level": "state",
    "state_code": "KA",
    "department": "Department of Social Welfare, Karnataka",
    "kannada_department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    "category": "Social Welfare & Empowerment",
    "benefits": [
      "Financial assistance credited directly to Aadhaar-linked bank account",
      "Subsidized skill development and educational support"
    ],
    "eligibility_summary": "Domiciled in Karnataka with family income within prescribed statutory limits.",
    "kannada_eligibility_summary": "ಕರ್ನಾಟಕದಲ್ಲಿ ವಾಸಿಸುವ ಹಾಗೂ ನಿಗದಿತ ವಾರ್ಷಿಕ ಆದಾಯ ಮಿತಿಯೊಳಗಿರುವ ನಾಗರಿಕರು.",
    "application_steps": [
      "Visit the official Karnataka Seva Sindhu or Nadakacheri portal",
      "Authenticate with Aadhaar and enter ration card details",
      "Submit required verification certificates"
    ],
    "documents_required": [
      "Aadhaar Card",
      "Karnataka Domicile Certificate",
      "Income Certificate issued by Nadakacheri",
      "Bank Account Passbook"
    ],
    "official_application_url": "https://sevasindhuservices.karnataka.gov.in/",
    "official_info_url": "https://sevasindhu.karnataka.gov.in/",
    "source_identifier": "KA_SWD_2024_01",
    "status": "published",
    "sources": [
      {
        "publisher": "Government of Karnataka - Seva Sindhu",
        "source_url": "https://sevasindhuservices.karnataka.gov.in/",
        "source_type": "official_portal",
        "verification_status": "verified"
      }
    ],
    "rules": [
      {
        "rule_type": "state",
        "required_attribute": "state",
        "operator": "eq",
        "rule_value": "Karnataka",
        "source_reference": "G.O. No. SWD 104 MMB 2024"
      }
    ]
  }
]`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleJsonTemplate], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nammaseve_scheme_import_schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncProvider = async (providerId: string) => {
    setSyncingProviderId(providerId);
    setProviderSyncResult(null);
    try {
      const res = await triggerProviderSync(providerId);
      setProviderSyncResult(res);
    } catch (err: unknown) {
      setProviderSyncResult({ success: false, errors: [err instanceof Error ? err.message : 'Sync failed'] });
    } finally {
      setSyncingProviderId(null);
    }
  };

  const handleValidate = () => {
    setIsValidating(true);
    setValidationResult(null);
    setImportStatus(null);

    try {
      if (!jsonInput.trim()) {
        throw new Error('Please paste JSON data to validate.');
      }

      const parsed = JSON.parse(jsonInput);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const errors: string[] = [];
      const parsedSchemes: Scheme[] = [];
      const seenSlugs = new Set<string>();
      const duplicates: string[] = [];

      items.forEach((item, index) => {
        const prefix = `Record #${index + 1}: `;
        if (!item.slug || typeof item.slug !== 'string' || item.slug.length < 3) {
          errors.push(`${prefix}Missing or invalid 'slug' (min 3 chars).`);
        }
        if (seenSlugs.has(item.slug)) {
          duplicates.push(item.slug);
          errors.push(`${prefix}Duplicate slug '${item.slug}' found in current batch.`);
        }
        seenSlugs.add(item.slug);

        if (!item.name || typeof item.name !== 'string') {
          errors.push(`${prefix}Field 'name' is required.`);
        }
        if (!item.description || typeof item.description !== 'string') {
          errors.push(`${prefix}Field 'description' is required.`);
        }
        if (!['state', 'central'].includes(item.scheme_level)) {
          errors.push(`${prefix}Field 'scheme_level' must be 'state' or 'central'.`);
        }
        if (!item.department) {
          errors.push(`${prefix}Field 'department' is required.`);
        }
        if (!item.category) {
          errors.push(`${prefix}Field 'category' is required.`);
        }
        if (!item.official_application_url || !item.official_application_url.startsWith('http')) {
          errors.push(`${prefix}Valid 'official_application_url' starting with http/https is required.`);
        }

        if (errors.length === 0) {
          parsedSchemes.push({
            id: item.id || crypto.randomUUID(),
            slug: item.slug,
            name: item.name,
            kannada_name: item.kannada_name || null,
            description: item.description,
            kannada_description: item.kannada_description || null,
            scheme_level: item.scheme_level,
            state_code: item.state_code || (item.scheme_level === 'state' ? 'KA' : 'IN'),
            department: item.department,
            kannada_department: item.kannada_department || null,
            category: item.category,
            benefits: item.benefits || [],
            eligibility_summary: item.eligibility_summary || '',
            kannada_eligibility_summary: item.kannada_eligibility_summary || null,
            application_steps: item.application_steps || [],
            documents_required: item.documents_required || [],
            official_application_url: item.official_application_url,
            official_info_url: item.official_info_url || undefined,
            source_identifier: item.source_identifier || `manual_${item.slug}`,
            provider_id: item.provider_id || 'reviewed_file',
            status: item.status || 'published',
            is_stale: Boolean(item.is_stale),
            sources: item.sources || [],
            rules: item.rules || [],
            created_at: new Date().toISOString(),
          });
        }
      });

      setValidationResult({
        valid: errors.length === 0,
        recordsCount: items.length,
        errors,
        duplicates,
        parsedSchemes,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON format';
      setValidationResult({
        valid: false,
        recordsCount: 0,
        errors: [msg],
        duplicates: [],
        parsedSchemes: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommitPublish = async () => {
    if (!validationResult || !validationResult.valid || validationResult.parsedSchemes.length === 0) {
      return;
    }

    setIsValidating(true);
    try {
      const schemesToSave = validationResult.parsedSchemes;

      if (isSupabaseConfigured) {
        for (const s of schemesToSave) {
          const { data: inserted, error } = await supabase
            .from('schemes')
            .upsert({
              slug: s.slug,
              name: s.name,
              kannada_name: s.kannada_name,
              description: s.description,
              kannada_description: s.kannada_description,
              scheme_level: s.scheme_level,
              state_code: s.state_code,
              department: s.department,
              kannada_department: s.kannada_department,
              category: s.category,
              benefits: s.benefits,
              eligibility_summary: s.eligibility_summary,
              kannada_eligibility_summary: s.kannada_eligibility_summary,
              application_steps: s.application_steps,
              documents_required: s.documents_required,
              official_application_url: s.official_application_url,
              official_info_url: s.official_info_url,
              source_identifier: s.source_identifier,
              status: s.status,
              is_stale: s.is_stale,
            })
            .select()
            .single();

          if (!error && inserted && s.rules) {
            for (const r of s.rules) {
              await supabase.from('eligibility_rules').insert({
                scheme_id: inserted.id,
                rule_type: r.rule_type,
                required_attribute: r.required_attribute,
                operator: r.operator,
                rule_value: r.rule_value,
                source_reference: r.source_reference,
              });
            }
          }
        }
      }

      const existingLocal = JSON.parse(localStorage.getItem('nammaseve_imported_schemes') || '[]');
      const combined = [...existingLocal, ...schemesToSave];
      localStorage.setItem('nammaseve_imported_schemes', JSON.stringify(combined));

      if (onImportComplete) {
        onImportComplete(schemesToSave);
      }

      setImportStatus(`Successfully published ${schemesToSave.length} verified government scheme record(s)!`);
      setValidationResult(null);
      setJsonInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setImportStatus(`Error: ${msg}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="dark" size="sm">
              Administrative Ingestion
            </MaximalistBadge>
            <span className="text-xs font-semibold text-indian-green flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Scheme Standards
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-text">
            {t('admin.title', 'Administrative Scheme Ingestion Portal')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text mt-1">
            {t('admin.subtitle', 'Import verified, genuine government scheme records. Fabricated or sample data is strictly prohibited.')}
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-saffron" />
          <span>{t('admin.sample_download', 'Download Schema Template')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'providers'
              ? 'bg-saffron text-white shadow-2xs'
              : 'bg-white text-muted-text hover:text-dark-text hover:bg-gray-50'
          }`}
        >
          Government Data Providers
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'json'
              ? 'bg-saffron text-white shadow-2xs'
              : 'bg-white text-muted-text hover:text-dark-text hover:bg-gray-50'
          }`}
        >
          {t('admin.tab_json', 'Reviewed JSON Ingestion')}
        </button>
      </div>

      {/* TAB 1: GOVERNMENT DATA PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl text-xs sm:text-sm text-muted-text leading-relaxed">
            NammaSeve connects to official data feeds using modular provider adapters. Providers require registered developer credentials or departmental onboarding agreements under Government of India guidelines.
          </div>

          <div className="space-y-3">
            {providers.map((p) => (
              <div key={p.id} className="p-5 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-dark-text text-base">
                      {p.name}
                    </h4>
                    {p.is_configured ? (
                      <span className="text-[11px] font-semibold text-indian-green bg-indian-green-50 border border-indian-green-200 px-2 py-0.5 rounded-full">
                        Configured
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-muted-text bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Credentials Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-text leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={p.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-saffron-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {p.env_keys.length > 0 && (
                      <span className="text-muted-text font-mono text-[11px]">
                        Secrets: {p.env_keys.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => handleSyncProvider(p.id)}
                    disabled={syncingProviderId === p.id}
                    className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProviderId === p.id ? 'animate-spin' : ''}`} />
                    <span>Sync Provider Feed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Provider Sync Output Box */}
          {providerSyncResult && (
            <div className={`mt-4 p-4 rounded-xl border text-xs sm:text-sm ${
              providerSyncResult.success ? 'bg-indian-green-50 border-indian-green-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {providerSyncResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-indian-green" />
                    <span className="text-indian-green-900">Provider Sync Completed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span className="text-amber-900">Provider Sync Notice</span>
                  </>
                )}
              </div>
              {providerSyncResult.errors?.map((err: string, i: number) => (
                <p key={i} className="text-amber-800 text-xs mt-1">{err}</p>
              ))}
              {providerSyncResult.auth_instructions && (
                <p className="text-dark-text text-xs mt-2 font-mono bg-white/70 p-2 rounded border border-amber-200">
                  {providerSyncResult.auth_instructions}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVIEWED JSON INGESTION */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              rows={12}
              placeholder="Paste verified scheme JSON records here..."
              className="minimal-input w-full p-4 font-mono text-xs sm:text-sm rounded-xl leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                className="w-4 h-4 rounded accent-saffron cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-dark-text">
                {t('admin.dry_run_label', 'Dry Run (Validate without saving)')}
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={handleValidate}
                disabled={isValidating || !jsonInput.trim()}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                <span>{t('admin.btn_validate', 'Validate Records')}</span>
              </button>

              {validationResult?.valid && (
                <button
                  onClick={handleCommitPublish}
                  disabled={isValidating}
                  className="btn-green px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('admin.btn_publish', 'Publish Verified Schemes')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Feedback & Preview */}
      {validationResult && (
        <div className={`mt-6 p-4 rounded-xl border text-sm ${
          validationResult.valid ? 'bg-indian-green-50/70 border-indian-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            {validationResult.valid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-indian-green" />
                <span className="text-indian-green-900">
                  Validation Passed: {validationResult.recordsCount} record(s) verified for publishing.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-900">
                  Validation Failed with {validationResult.errors.length} issue(s):
                </span>
              </>
            )}
          </div>

          {!validationResult.valid && (
            <ul className="text-xs text-red-700 list-disc list-inside space-y-1 mt-2">
              {validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {validationResult.valid && (
            <div className="mt-3 pt-3 border-t border-indian-green-200/80">
              <span className="text-xs font-bold text-dark-text block mb-1">
                Records Ready for Review:
              </span>
              <div className="space-y-1">
                {validationResult.parsedSchemes.map((s, idx) => (
                  <div key={idx} className="text-xs text-dark-text font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indian-green" />
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-muted-text text-[11px]">({s.department})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Notification */}
      {importStatus && (
        <div className="mt-6 p-4 bg-indian-green-50 border border-indian-green-200 text-indian-green-900 rounded-xl font-semibold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}
    </div>
  );
};

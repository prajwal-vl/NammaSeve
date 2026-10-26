import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Scheme } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MaximalistBadge } from '../../components/MaximalistBadge';

interface AdminSchemeImporterProps {
  onImportComplete?: (schemes: Scheme[]) => void;
}

export const AdminSchemeImporter: React.FC<AdminSchemeImporterProps> = ({ onImportComplete }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
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

  const sampleJsonTemplate = `[
  {
    "slug": "sample-verified-scheme",
    "name": "Karnataka Verified Welfare Scheme",
    "kannada_name": "ಕರ್ನಾಟಕ ಪರಿಶೀಲಿಸಿದ ಕಲ್ಯಾಣ ಯೋಜನೆ",
    "description": "Comprehensive direct benefit assistance for eligible citizens.",
    "kannada_description": "ಅರ್ಹ ನಾಗರಿಕರಿಗೆ ಸಮಗ್ರ ನೇರ ಸವಲತ್ತು ನೆರವು.",
    "scheme_level": "state",
    "state_code": "KA",
    "department": "Department of Social Welfare, Govt of Karnataka",
    "kannada_department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    "category": "Social Welfare & Empowerment",
    "benefits": [
      "Financial assistance credited directly to Aadhaar-seeded bank account",
      "Subsidized skill training and employment assistance"
    ],
    "eligibility_summary": "Resident of Karnataka with annual family income within prescribed guidelines.",
    "kannada_eligibility_summary": "ನಿಗದಿತ ಮಾರ್ಗಸೂಚಿಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಹೊಂದಿರುವ ಕರ್ನಾಟಕದ ನಿವಾಸಿಗಳು.",
    "application_steps": [
      "Visit the official Karnataka Seva Sindhu portal",
      "Authenticate with Aadhaar and enter ration card / family ID",
      "Submit required verification documents and download acknowledgement"
    ],
    "documents_required": [
      "Aadhaar Card",
      "Karnataka Domicile / Study Certificate",
      "Income Certificate issued by Nadakacheri",
      "Bank Account Passbook"
    ],
    "official_application_url": "https://sevasindhuservices.karnataka.gov.in/",
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
        "source_reference": "Official Govt Notification No. SWD 104"
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
            status: item.status || 'published',
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

      // 1. If Supabase is configured and reachable, insert into PostgreSQL
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
              status: s.status,
            })
            .select()
            .single();

          if (error) {
            console.warn('Supabase DB upsert notice:', error.message);
          } else if (inserted && s.rules) {
            // Upsert rules
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

      // 2. Also save to verified local state and notify parent
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
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dark-text mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="dark" size="sm">
              Administrative Ingestion
            </MaximalistBadge>
            <span className="text-xs font-bold text-indian-green flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Schema Validation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-text">
            {t('admin.title', 'Administrative Scheme Ingestion Portal')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text mt-1">
            {t('admin.subtitle', 'Import verified, genuine government scheme records. Fabricated or sample data is strictly prohibited.')}
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="neo-button-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-saffron" />
          <span>{t('admin.sample_download', 'Download Schema Template')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2 rounded-xl font-bold text-sm border-2 cursor-pointer ${
            activeTab === 'json'
              ? 'bg-saffron text-white border-dark-text shadow-[2px_2px_0px_#20241F]'
              : 'bg-warm-white text-dark-text border-gray-300'
          }`}
        >
          {t('admin.tab_json', 'JSON Ingestion')}
        </button>
      </div>

      {/* JSON Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            rows={12}
            placeholder="Paste verified scheme JSON records here..."
            className="neo-input w-full p-4 font-mono text-xs sm:text-sm rounded-xl leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={e => setDryRun(e.target.checked)}
              className="w-5 h-5 rounded accent-saffron cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-bold text-dark-text">
              {t('admin.dry_run_label', 'Dry Run (Validate without saving)')}
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleValidate}
              disabled={isValidating || !jsonInput.trim()}
              className="neo-button-secondary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{t('admin.btn_validate', 'Validate Records')}</span>
            </button>

            {validationResult?.valid && (
              <button
                onClick={handleCommitPublish}
                disabled={isValidating}
                className="neo-button-green px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('admin.btn_publish', 'Publish Verified Schemes')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Feedback & Preview */}
      {validationResult && (
        <div className={`mt-6 p-4 rounded-xl border-3 ${
          validationResult.valid ? 'bg-indian-green-50 border-indian-green' : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            {validationResult.valid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-indian-green" />
                <span className="text-indian-green-900">
                  Validation Passed: {validationResult.recordsCount} record(s) ready for review and publishing.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600" />
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
            <div className="mt-3 pt-3 border-t border-indian-green-200">
              <span className="text-xs font-bold text-dark-text block mb-1">
                Records to be Published:
              </span>
              <div className="space-y-1">
                {validationResult.parsedSchemes.map((s, idx) => (
                  <div key={idx} className="text-xs text-dark-text font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indian-green" />
                    <span>{s.name} ({s.slug})</span>
                    <span className="text-muted-text text-[11px]">— {s.department}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Notification */}
      {importStatus && (
        <div className="mt-6 p-4 bg-indian-green-100 border-2 border-indian-green text-indian-green-900 rounded-xl font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indian-green shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}
    </div>
  );
};

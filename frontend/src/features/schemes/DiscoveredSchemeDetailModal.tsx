import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  XCircle,
  ShieldCheck, 
  Bookmark, 
  Calendar,
  Languages,
  Check
} from 'lucide-react';
import { DiscoveredScheme, StructuredAiExplanation, UserProfile } from '../../types';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { callExplainDiscoveredScheme } from '../../lib/edgeFunctions';

interface DiscoveredSchemeDetailModalProps {
  scheme: DiscoveredScheme | null;
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (scheme: DiscoveredScheme) => void;
}

export const DiscoveredSchemeDetailModal: React.FC<DiscoveredSchemeDetailModalProps> = ({
  scheme,
  profile,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
}) => {
  const { t, i18n } = useTranslation();
  const activeSystemLang: 'en' | 'kn' = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('kn') ? 'kn' : 'en';

  const [explanation, setExplanation] = useState<StructuredAiExplanation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<'en' | 'kn'>(activeSystemLang);
  const [userQuestion, setUserQuestion] = useState('');

  // Sync aiLanguage whenever system language changes
  useEffect(() => {
    setAiLanguage(activeSystemLang);
  }, [activeSystemLang]);

  if (!isOpen || !scheme) return null;

  const handleFetchAiExplanation = async (targetLang: 'en' | 'kn') => {
    setIsLoadingAi(true);
    setAiLanguage(targetLang);
    try {
      const data = await callExplainDiscoveredScheme(
        scheme,
        userQuestion.trim() || undefined,
        targetLang,
        profile || undefined
      );
      setExplanation(data);
    } catch (err) {
      console.error('Failed to get AI explanation for discovered scheme:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-scheme-title"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <MaximalistBadge 
                variant={scheme.government_level === 'central' ? 'saffron' : 'green'} 
                size="sm"
              >
                {scheme.government_level === 'central'
                  ? t('modal.central_govt_scheme', 'Central Govt Scheme')
                  : t('modal.state_govt_scheme', 'State Govt Scheme')}
              </MaximalistBadge>

              {scheme.is_official_domain && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {t('modal.official_domain_verified', 'Official Domain Verified')}
                </span>
              )}
            </div>

            <h2 id="modal-scheme-title" className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
              {scheme.name}
            </h2>

            {scheme.department && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>{scheme.department}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scheme)}
                aria-label={isSaved ? 'Remove from saved' : 'Save scheme'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-saffron text-white border-saffron'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Overview */}
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">
              {t('modal.summary_overview', 'Summary & Overview')}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {scheme.summary}
            </p>
          </div>

          {/* Benefits */}
          {scheme.benefits && scheme.benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {t('modal.documented_benefits_subsidies', 'Documented Benefits & Subsidies')}
              </h3>
              <ul className="space-y-1.5">
                {scheme.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documented Eligibility Criteria */}
          {scheme.eligibility_requirements && scheme.eligibility_requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {t('modal.documented_eligibility_guidelines', 'Documented Eligibility Guidelines')}
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <ul className="space-y-1.5">
                  {scheme.eligibility_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Criteria Evaluation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {scheme.matched_criteria && scheme.matched_criteria.length > 0 && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t('modal.matched_criteria', 'Matched Criteria')} ({scheme.matched_criteria.length})
                </span>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {scheme.matched_criteria.map((m, i) => (
                    <li key={i} className="truncate">• {m}</li>
                  ))}
                </ul>
              </div>
            )}

            {scheme.missing_criteria && scheme.missing_criteria.length > 0 && (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  {t('modal.additional_info_needed', 'Additional Information Needed')}
                </span>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {scheme.missing_criteria.map((m, i) => (
                    <li key={i} className="truncate">• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Application Steps & Required Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scheme.application_steps && scheme.application_steps.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('modal.how_to_apply', 'How to Apply')}
                </h4>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  {scheme.application_steps.map((st, i) => (
                    <li key={i} className="leading-relaxed">{st}</li>
                  ))}
                </ol>
              </div>
            )}

            {scheme.required_documents && scheme.required_documents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('modal.required_documents', 'Required Documents')}
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {scheme.required_documents.map((d, i) => (
                    <li key={i} className="leading-relaxed">{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* GROQ AI EXPLANATION SECTION */}
          <div className="p-5 bg-gradient-to-r from-saffron-50/50 to-warm-white border border-saffron-200/90 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-saffron text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t('modal.ai_explanation_title', 'AI Scheme Explanation (Groq)')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t('modal.ai_explanation_subtitle', 'Get simple, factual answers in English or Kannada')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFetchAiExplanation('en')}
                  disabled={isLoadingAi}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    aiLanguage === 'en' && explanation
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleFetchAiExplanation('kn')}
                  disabled={isLoadingAi}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    aiLanguage === 'kn' && explanation
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

            {/* Custom Question Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={t('modal.ask_custom_question', "Ask specific question (e.g. 'Can I apply if I am in college?')")}
                className="minimal-input flex-1 px-3 py-2 text-xs bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchAiExplanation(aiLanguage);
                }}
              />
              <button
                onClick={() => handleFetchAiExplanation(aiLanguage)}
                disabled={isLoadingAi}
                className="px-3 py-2 bg-saffron text-white hover:bg-saffron-600 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingAi ? t('modal.explaining', 'Explaining...') : t('modal.ask_ai_btn', 'Ask AI')}</span>
              </button>
            </div>

            {/* AI Explanation Result Output */}
            {explanation && (
              <div className="mt-3 p-4 bg-white border border-saffron-200 rounded-xl space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">{t('modal.overview', 'Overview:')}</span>
                  <p className="text-slate-700">{explanation.summary}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">{t('modal.who_qualifies', 'Who Qualifies:')}</span>
                  <p className="text-slate-700">{explanation.eligibility_clarification}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">{t('modal.how_to_apply', 'How to Apply:')}</span>
                  <p className="text-slate-700">{explanation.application_guidance}</p>
                </div>

                {explanation.notice && (
                  <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
                    ℹ️ {explanation.notice}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Civic Integrity Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            <strong>{t('modal.civic_notice_title', 'Civic Notice:')}</strong>{' '}
            {t('modal.civic_notice_desc', 'NammaSeve is an independent discovery platform. We do not approve, process, or certify government benefits. All applications must be submitted directly to official government departments or authorized service centers.')}
          </div>
        </div>

        {/* Modal Footer with Direct Source Links */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {t('modal.discovered_from_evidence', 'Discovered from verified web evidence')} • {new Date(scheme.last_checked_at).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {scheme.application_url && (
              <a
                href={scheme.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indian-green text-white hover:bg-indian-green-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>{t('modal.apply_on_portal', 'Apply on Official Portal')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>{t('modal.view_official_source', 'View Official Source')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

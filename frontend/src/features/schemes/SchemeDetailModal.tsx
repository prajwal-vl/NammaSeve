import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ListChecks, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark,
  Send,
  Loader2,
  Calendar
} from 'lucide-react';
import { Scheme, EligibilityEvaluation } from '../../types';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { EligibilityBadge } from '../eligibility/EligibilityBadge';
import { callExplainScheme, ExplainResponse } from '../../lib/edgeFunctions';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  evaluation?: EligibilityEvaluation;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
  onClose: () => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  evaluation,
  isSaved = false,
  onToggleSave,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [userQuestion, setUserQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<ExplainResponse | null>(null);

  if (!scheme) return null;

  const displayName = isKn && scheme.kannada_name ? scheme.kannada_name : scheme.name;
  const secondaryName = isKn ? scheme.name : scheme.kannada_name;
  const displayDepartment = isKn && scheme.kannada_department ? scheme.kannada_department : scheme.department;
  const displaySummary = isKn && scheme.kannada_description ? scheme.kannada_description : scheme.description;
  const displayEligibility = isKn && scheme.kannada_eligibility_summary ? scheme.kannada_eligibility_summary : scheme.eligibility_summary;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme) return;
    setAiLoading(true);
    try {
      const res = await callExplainScheme(
        scheme.id,
        userQuestion || 'Explain the key benefits, eligibility, and application procedure in simple terms.',
        isKn ? 'kn' : 'en',
        scheme
      );
      setAiResponse(res);
    } catch (err) {
      console.error('AI call failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto relative my-8 p-6 sm:p-8">
        
        {/* Top Floating Controls */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-dark-text mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <MaximalistBadge variant={scheme.scheme_level === 'state' ? 'saffron' : 'dark'}>
              {scheme.scheme_level === 'state' ? 'Karnataka State' : 'Central Scheme'}
            </MaximalistBadge>
            <span className="text-xs font-bold bg-warm-white border border-dark-text px-2.5 py-1 rounded-md">
              {scheme.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scheme.id)}
                className={`neo-box px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isSaved ? 'bg-saffron text-white' : 'bg-white text-dark-text'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>{isSaved ? t('schemes.btn_saved', 'Saved') : t('schemes.btn_save', 'Save')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border-2 border-dark-text hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-dark-text" />
            </button>
          </div>
        </div>

        {/* Title & Department */}
        <h2 className="text-2xl sm:text-4xl font-heading font-black text-dark-text mb-1 leading-tight">
          {displayName}
        </h2>
        {secondaryName && (
          <p className="text-sm sm:text-base font-semibold text-muted-text mb-3 font-kannada">
            {secondaryName}
          </p>
        )}
        <p className="text-xs sm:text-sm font-bold text-indian-green uppercase tracking-wide mb-6">
          {displayDepartment}
        </p>

        {/* Dynamic Eligibility Results if Evaluated */}
        {evaluation && (
          <div className="mb-6 p-4 bg-warm-white border-3 border-dark-text shadow-neo-sm rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-text">
                Your Profile Match Status:
              </span>
              <EligibilityBadge status={evaluation.status} />
            </div>

            {evaluation.matched_reasons.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-indian-green block">Criteria Met:</span>
                <ul className="text-xs text-dark-text space-y-0.5">
                  {evaluation.matched_reasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indian-green shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.missing_fields.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-bold text-amber-700 block">
                  Additional attributes needed to confirm full eligibility:
                </span>
                <span className="text-xs text-muted-text">
                  {evaluation.missing_fields.map(f => f.replace(/_/g, ' ')).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Scheme Overview */}
        <div className="mb-8">
          <h4 className="text-sm font-black uppercase tracking-wider text-dark-text mb-2">
            Scheme Overview
          </h4>
          <p className="text-base text-dark-text leading-relaxed bg-warm-white p-4 rounded-xl border-2 border-dark-text">
            {displaySummary}
          </p>
        </div>

        {/* Benefits Grid */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-black uppercase tracking-wider text-dark-text mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron" />
              {t('schemes.benefits_title', 'Key Benefits')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.benefits.map((benefit, i) => (
                <div key={i} className="p-3.5 bg-indian-green-50 border-2 border-indian-green rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-dark-text">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        <div className="mb-8">
          <h4 className="text-sm font-black uppercase tracking-wider text-dark-text mb-2 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-saffron" />
            {t('schemes.eligibility_title', 'Official Eligibility Criteria')}
          </h4>
          <div className="p-4 bg-white border-2 border-dark-text rounded-xl text-sm leading-relaxed text-dark-text">
            {displayEligibility}
          </div>
        </div>

        {/* Documents Required */}
        {scheme.documents_required && scheme.documents_required.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-black uppercase tracking-wider text-dark-text mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-saffron" />
              {t('schemes.documents_title', 'Required Documents')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {scheme.documents_required.map((doc, i) => (
                <span key={i} className="px-3 py-1.5 bg-warm-white border-2 border-dark-text rounded-lg text-xs font-bold text-dark-text shadow-[2px_2px_0px_#20241F]">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Application Steps */}
        {scheme.application_steps && scheme.application_steps.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-black uppercase tracking-wider text-dark-text mb-3">
              {t('schemes.steps_title', 'How to Apply')}
            </h4>
            <ol className="space-y-2.5">
              {scheme.application_steps.map((step, i) => (
                <li key={i} className="p-3 bg-warm-white border-2 border-dark-text rounded-xl flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-saffron text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-dark-text font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Official Application Portal CTA */}
        <div className="p-5 bg-saffron-50 border-3 border-dark-text shadow-neo-sm rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Verified Government Gateway
            </div>
            <p className="text-sm font-bold text-dark-text mt-1">
              Apply directly on the official department portal without intermediaries.
            </p>
          </div>
          <a
            href={scheme.official_application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-button-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('schemes.official_portal', 'Official Application Portal')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Verified Official Sources & Provenance */}
        {scheme.sources && scheme.sources.length > 0 && (
          <div className="mb-8 p-4 bg-warm-white border-2 border-dark-text rounded-xl">
            <h5 className="text-xs font-black uppercase tracking-wider text-dark-text mb-2">
              {t('schemes.sources_title', 'Verified Official Sources')}
            </h5>
            <ul className="space-y-1.5 text-xs">
              {scheme.sources.map((src, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 text-muted-text">
                  <span className="font-bold text-dark-text">{src.publisher}</span>
                  <a
                    href={src.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indian-green underline hover:text-indian-green-800 truncate max-w-[280px]"
                  >
                    {src.source_url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GROQ AI SCHEME ASSISTANT SECTION */}
        <div className="border-3 border-dark-text shadow-neo-sm rounded-2xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-saffron-100 border border-saffron rounded-lg">
                <Sparkles className="w-4 h-4 text-saffron" />
              </div>
              <h4 className="font-heading font-black text-dark-text text-base sm:text-lg">
                {t('schemes.ai_assistant_title', 'Ask NammaSeve AI About This Scheme')}
              </h4>
            </div>
            <MaximalistBadge variant="green" size="sm">
              Groq Powered
            </MaximalistBadge>
          </div>

          <p className="text-xs text-muted-text">
            {t('schemes.ai_disclaimer', 'AI answers are generated exclusively using verified official records. Official government departments make final eligibility decisions.')}
          </p>

          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              placeholder={t('schemes.ai_assistant_placeholder', 'Ask a question (e.g. Do I need a caste certificate to apply?)...')}
              className="neo-input flex-1 px-4 py-2.5 rounded-xl text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="neo-button-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{t('schemes.ai_assistant_btn', 'Ask AI')}</span>
            </button>
          </form>

          {/* AI Response Box */}
          {aiResponse && (
            <div className="p-4 bg-warm-white border-2 border-dark-text rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-muted-text font-bold">
                <span className="text-saffron">
                  {aiResponse.is_ai_generated ? 'AI-Generated Explanation (Constrained to Verified Facts)' : 'Verified Official Summary'}
                </span>
                {aiResponse.model && <span>Engine: {aiResponse.model}</span>}
              </div>
              <div className="text-sm text-dark-text whitespace-pre-line leading-relaxed font-medium">
                {aiResponse.explanation}
              </div>
              {aiResponse.notice && (
                <p className="text-xs text-muted-text italic pt-1">
                  Notice: {aiResponse.notice}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

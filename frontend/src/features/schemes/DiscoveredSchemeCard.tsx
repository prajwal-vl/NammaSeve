import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  ExternalLink, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { DiscoveredScheme, LiveEligibilityStatus } from '../../types';
import { MaximalistBadge } from '../../components/MaximalistBadge';

interface DiscoveredSchemeCardProps {
  scheme: DiscoveredScheme;
  isSaved?: boolean;
  onToggleSave?: (scheme: DiscoveredScheme) => void;
  onSelect: (scheme: DiscoveredScheme) => void;
  onExplain?: (scheme: DiscoveredScheme) => void;
}

export const DiscoveredSchemeCard: React.FC<DiscoveredSchemeCardProps> = ({
  scheme,
  isSaved = false,
  onToggleSave,
  onSelect,
  onExplain,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: LiveEligibilityStatus) => {
    switch (status) {
      case 'eligible_based_on_available_information':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Eligible Based on Criteria</span>
          </span>
        );
      case 'potentially_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Potentially Eligible</span>
          </span>
        );
      case 'insufficient_information':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Needs More Information</span>
          </span>
        );
      case 'not_eligible_based_on_verified_criteria':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Eligible (Criteria Unmet)</span>
          </span>
        );
      case 'eligibility_unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Eligibility Unverified</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left">
      <div className="space-y-3">
        {/* Top Badges & Bookmark */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <MaximalistBadge 
              variant={scheme.government_level === 'central' ? 'saffron' : 'green'} 
              size="sm"
            >
              {scheme.government_level === 'central' ? 'Central Govt' : 'State Govt'}
            </MaximalistBadge>

            {scheme.is_official_domain && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Official Source
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(scheme);
              }}
              aria-label={isSaved ? 'Remove from saved' : 'Save scheme'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-saffron text-white border-saffron'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {/* Scheme Title */}
        <h3 
          onClick={() => onSelect(scheme)}
          className="text-base sm:text-lg font-heading font-bold text-slate-900 leading-snug hover:text-saffron transition-colors cursor-pointer"
        >
          {scheme.name}
        </h3>

        {/* Department */}
        {scheme.department && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{scheme.department}</span>
          </div>
        )}

        {/* Factual Summary */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {scheme.summary}
        </p>

        {/* Benefits Preview */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
              Documented Benefits:
            </span>
            <p className="line-clamp-2 text-slate-600 font-medium">
              {scheme.benefits.join(' • ')}
            </p>
          </div>
        )}

        {/* Eligibility Status Badge */}
        <div>{getStatusBadge(scheme.eligibility_status)}</div>

        {/* Matched / Missing Criteria Highlights */}
        {scheme.matched_criteria && scheme.matched_criteria.length > 0 && (
          <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{scheme.matched_criteria[0]}</span>
          </div>
        )}
      </div>

      {/* Card Actions & Official Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(scheme)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          View Details
        </button>

        <div className="flex items-center gap-2">
          {onExplain && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExplain(scheme);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-saffron-50 hover:bg-saffron-100 text-saffron-700 border border-saffron-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Explain this scheme with Groq AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Explain</span>
            </button>
          )}

          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            title="Open official source page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

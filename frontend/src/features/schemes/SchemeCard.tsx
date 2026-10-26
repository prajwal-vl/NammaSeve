import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Bookmark, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Scheme, EligibilityEvaluation } from '../../types';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { EligibilityBadge } from '../eligibility/EligibilityBadge';

interface SchemeCardProps {
  scheme: Scheme;
  evaluation?: EligibilityEvaluation;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
  onSelect: (scheme: Scheme) => void;
  onCheckEligibility?: (scheme: Scheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  evaluation,
  isSaved = false,
  onToggleSave,
  onSelect,
  onCheckEligibility,
}) => {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const displayName = isKn && scheme.kannada_name ? scheme.kannada_name : scheme.name;
  const secondaryName = isKn ? scheme.name : scheme.kannada_name;
  const displayDepartment = isKn && scheme.kannada_department ? scheme.kannada_department : scheme.department;
  const displaySummary = isKn && scheme.kannada_description ? scheme.kannada_description : scheme.description;

  return (
    <div className="neo-box bg-white p-6 rounded-2xl flex flex-col justify-between transition-all group">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <MaximalistBadge
              variant={scheme.scheme_level === 'state' ? 'saffron' : 'dark'}
              size="sm"
            >
              {scheme.scheme_level === 'state' ? 'Karnataka' : 'Central'}
            </MaximalistBadge>
            <span className="text-xs font-bold text-muted-text bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-md">
              {scheme.category}
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(scheme.id);
              }}
              className={`p-2 rounded-xl border-2 border-dark-text transition-colors cursor-pointer ${
                isSaved ? 'bg-saffron text-white' : 'bg-white text-dark-text hover:bg-gray-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save scheme'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {/* Scheme Titles */}
        <h3 
          onClick={() => onSelect(scheme)}
          className="text-xl sm:text-2xl font-heading font-black text-dark-text group-hover:text-saffron transition-colors cursor-pointer mb-1 leading-snug"
        >
          {displayName}
        </h3>

        {secondaryName && (
          <p className="text-xs font-semibold text-muted-text mb-2 font-kannada">
            {secondaryName}
          </p>
        )}

        <p className="text-xs font-bold text-indian-green uppercase tracking-wide mb-3">
          {displayDepartment}
        </p>

        {/* Dynamic Eligibility Badge if evaluated */}
        {evaluation && (
          <div className="mb-4">
            <EligibilityBadge status={evaluation.status} />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-text line-clamp-3 mb-4 leading-relaxed">
          {displaySummary}
        </p>

        {/* Benefits Preview */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="mb-4 p-3 bg-warm-white border-2 border-dark-text rounded-xl space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-dark-text block">
              {t('schemes.benefits_title', 'Key Benefits')}
            </span>
            <ul className="text-xs text-dark-text space-y-1">
              {scheme.benefits.slice(0, 2).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indian-green shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t-2 border-gray-200 mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indian-green">
          <ShieldCheck className="w-4 h-4 text-indian-green" />
          <span>Official Portal</span>
        </div>

        <div className="flex items-center gap-2">
          {onCheckEligibility && !evaluation && (
            <button
              onClick={() => onCheckEligibility(scheme)}
              className="neo-button-secondary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              Check
            </button>
          )}

          <button
            onClick={() => onSelect(scheme)}
            className="neo-button-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{t('schemes.btn_view_details', 'Details')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

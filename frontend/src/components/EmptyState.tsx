import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, HelpCircle, FilePlus, Sparkles } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';
import { TreeLogo } from './TreeLogo';

interface EmptyStateProps {
  onOpenProfile: () => void;
  onOpenPrivacy: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateAdminImport?: () => void;
  hasProfile?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenProfile,
  onOpenPrivacy,
  onNavigateHowItWorks,
  onNavigateAdminImport,
  hasProfile = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-8 sm:p-12 bg-white border border-gray-200/90 shadow-sm rounded-2xl relative overflow-hidden text-center flex flex-col items-center">
      {/* Subtle Tree Emblem Badge */}
      <div className="mb-4">
        <TreeLogo size="lg" withText={false} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <MaximalistBadge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          {t('empty_state.verified_standard', 'Verified Scheme Standard')}
        </MaximalistBadge>
        <MaximalistBadge variant="saffron" icon={<Sparkles className="w-3.5 h-3.5" />}>
          {t('empty_state.zero_preseeded', 'Zero Preseeded Records')}
        </MaximalistBadge>
      </div>

      {/* Required Exact Headline */}
      <h2 className="text-2xl sm:text-4xl font-heading font-black text-dark-text mb-3 leading-tight max-w-2xl">
        {t('empty_state.headline', "Your profile is ready. Let's find your opportunities.")}
      </h2>

      {/* Required Exact Supporting Text */}
      <p className="text-base sm:text-lg text-muted-text font-normal max-w-2xl mb-8 leading-relaxed">
        {t(
          'empty_state.description',
          'NammaSeve matches your profile with verified government schemes. Scheme information has not been added yet, so personalized recommendations will appear once verified records become available.'
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl mb-6">
        <button
          onClick={onOpenProfile}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{hasProfile ? t('empty_state.update_profile', 'Update My Citizen Profile') : t('empty_state.btn_complete_profile', 'Complete or Update My Profile')}</span>
        </button>

        <button
          onClick={onOpenPrivacy}
          className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-indian-green" />
          <span>{t('empty_state.btn_review_privacy', 'Review Privacy Settings')}</span>
        </button>

        <button
          onClick={onNavigateHowItWorks}
          className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-saffron" />
          <span>{t('empty_state.btn_explore_how', 'Explore How NammaSeve Works')}</span>
        </button>
      </div>

      {/* Administrative Ingestion Callout */}
      {onNavigateAdminImport && (
        <div className="w-full pt-6 mt-2 border-t border-gray-100">
          <div className="inline-flex items-center gap-2 bg-saffron-50/60 border border-saffron-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-dark-text">
            <FilePlus className="w-4 h-4 text-saffron" />
            <span>{t('empty_state.admin_notice', 'Are you an authorized administrator? Use the Administrative Data Import workflow to publish verified scheme records.')}</span>
            <button
              onClick={onNavigateAdminImport}
              className="underline text-saffron-700 hover:text-saffron-900 font-bold ml-1 cursor-pointer"
            >
              {t('empty_state.import_schemes', 'Import Schemes')} &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

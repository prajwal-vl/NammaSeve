import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, HelpCircle, FilePlus, Sparkles } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';

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
    <div className="w-full max-w-4xl mx-auto my-8 p-8 md:p-12 bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl relative overflow-hidden">
      {/* Decorative Indian Civic Starburst / Pattern Accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-saffron-100 rounded-full border-4 border-dark-text opacity-50 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indian-green-100 rounded-full border-4 border-dark-text opacity-50 pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <MaximalistBadge variant="green" icon={<ShieldCheck className="w-4 h-4" />}>
            Verified Scheme Standard
          </MaximalistBadge>
          <MaximalistBadge variant="saffron" icon={<Sparkles className="w-4 h-4" />}>
            Zero Preseeded Records
          </MaximalistBadge>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-heading font-black text-dark-text mb-4 leading-tight">
          {t('empty_state.headline', "Your profile is ready. Let's find your opportunities.")}
        </h2>

        {/* Supporting Text */}
        <p className="text-lg md:text-xl text-muted-text font-medium max-w-2xl mb-8 leading-relaxed">
          {t(
            'empty_state.description',
            'NammaSeve matches your profile with verified government schemes. Scheme information has not been added yet, so personalized recommendations will appear once verified records become available.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl mb-8">
          <button
            onClick={onOpenProfile}
            className="neo-button-primary px-6 py-3.5 rounded-xl text-base md:text-lg flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-5 h-5" />
            {hasProfile ? 'Update My Citizen Profile' : t('empty_state.btn_complete_profile', 'Complete or Update My Profile')}
          </button>

          <button
            onClick={onOpenPrivacy}
            className="neo-button-secondary px-6 py-3.5 rounded-xl text-base md:text-lg flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-indian-green" />
            {t('empty_state.btn_review_privacy', 'Review Privacy Settings')}
          </button>

          <button
            onClick={onNavigateHowItWorks}
            className="neo-button-secondary px-6 py-3.5 rounded-xl text-base md:text-lg flex items-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-saffron" />
            {t('empty_state.btn_explore_how', 'Explore How NammaSeve Works')}
          </button>
        </div>

        {/* Administrative Ingestion Callout */}
        {onNavigateAdminImport && (
          <div className="w-full pt-6 mt-4 border-t-2 border-dashed border-gray-300">
            <div className="inline-flex items-center gap-2 bg-saffron-50 border-2 border-saffron px-4 py-2 rounded-xl text-sm font-semibold text-dark-text">
              <FilePlus className="w-4 h-4 text-saffron" />
              <span>{t('empty_state.admin_notice', 'Are you an authorized administrator? Use the Administrative Data Import workflow to publish verified scheme records.')}</span>
              <button
                onClick={onNavigateAdminImport}
                className="underline text-saffron-700 hover:text-saffron-900 font-bold ml-1 cursor-pointer"
              >
                Import Schemes &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

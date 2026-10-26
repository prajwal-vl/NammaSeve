import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, Cpu, ExternalLink, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { MaximalistBadge } from '../components/MaximalistBadge';

interface HowItWorksPageProps {
  onOpenProfile: () => void;
  onNavigateExplore: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onOpenProfile,
  onNavigateExplore,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <MaximalistBadge variant="saffron">
          {t('how_it_works.badge', 'Civic Architecture')}
        </MaximalistBadge>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
          {t('how_it_works.title', 'How NammaSeve Matches Welfare Without Guesswork')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          {t('how_it_works.subtitle', 'A personal-profile-first matching engine designed around citizen transparency, deterministic logic, and genuine government data.')}
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-saffron text-white flex items-center justify-center font-bold shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-900">
            {t('how_it_works.pillar1_title', '1. Profile-First Matching')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('how_it_works.pillar1_desc', 'Instead of forcing citizens to browse hundreds of irrelevant schemes, NammaSeve evaluates your age, district, education, and occupation to identify applicable opportunities.')}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indian-green text-white flex items-center justify-center font-bold shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-900">
            {t('how_it_works.pillar2_title', '2. Deterministic Engine')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('how_it_works.pillar2_desc', 'Eligibility is never left to AI hallucination. We encode verifiable mathematical and logical rules from official gazettes into deterministic checks.')}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-900">
            {t('how_it_works.pillar3_title', '3. Zero Preseeded Data')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('how_it_works.pillar3_desc', 'We never invent fake government records or demo schemes. Only genuine schemes verified from Seva Sindhu, myScheme, or official department portals are loaded.')}
          </p>
        </div>
      </div>

      {/* Outcome Classification Explanation */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
          {t('how_it_works.outcomes_title', 'Understanding The Four Eligibility Outcomes')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
            <span className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('how_it_works.outcome1_title', 'Eligible based on available information')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how_it_works.outcome1_desc', 'Every documented official criterion in the scheme rules was matched by your citizen profile.')}
            </p>
          </div>

          <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <span className="font-semibold text-amber-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              {t('how_it_works.outcome2_title', 'Potentially eligible — verification required')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how_it_works.outcome2_desc', 'Key general criteria match, but external conditions require department verification.')}
            </p>
          </div>

          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
            <span className="font-semibold text-blue-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              {t('how_it_works.outcome3_title', 'Insufficient information')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how_it_works.outcome3_desc', "The scheme requires specific criteria that you haven't answered yet in your profile.")}
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              {t('how_it_works.outcome4_title', 'Not eligible based on documented criteria')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how_it_works.outcome4_desc', 'One or more official exclusionary conditions apply.')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-4 space-y-4">
        <button
          onClick={onOpenProfile}
          className="px-8 py-3.5 bg-saffron text-white hover:bg-saffron-600 rounded-xl font-semibold text-base inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <span>{t('how_it_works.start_cta', 'Complete My Profile & Start Matching')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

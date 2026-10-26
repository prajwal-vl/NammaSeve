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
          Civic Architecture
        </MaximalistBadge>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-dark-text tracking-tight">
          How NammaSeve Matches Welfare Without Guesswork
        </h1>
        <p className="text-base sm:text-lg text-muted-text">
          A personal-profile-first matching engine designed around transparency, deterministic logic, and genuine government data.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-box p-6 rounded-2xl bg-white space-y-3">
          <div className="w-10 h-10 rounded-xl bg-saffron text-white flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-dark-text">
            1. Profile-First Matching
          </h3>
          <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
            Instead of forcing citizens to browse hundreds of irrelevant schemes, NammaSeve evaluates your age, district, education, and occupation to identify applicable opportunities.
          </p>
        </div>

        <div className="neo-box p-6 rounded-2xl bg-white space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indian-green text-white flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-dark-text">
            2. Deterministic Engine
          </h3>
          <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
            Eligibility is never left to AI hallucination. We encode verifiable mathematical and logical rules from official gazettes into deterministic checks.
          </p>
        </div>

        <div className="neo-box p-6 rounded-2xl bg-white space-y-3">
          <div className="w-10 h-10 rounded-xl bg-dark-text text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-dark-text">
            3. Zero Preseeded Data
          </h3>
          <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
            We never invent fake government records or demo schemes. Only genuine schemes verified from Seva Sindhu, myScheme, or official department portals are loaded.
          </p>
        </div>
      </div>

      {/* Outcome Classification Explanation */}
      <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-text">
          Understanding The Four Eligibility Outcomes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-indian-green-50 border-2 border-indian-green rounded-xl space-y-1.5">
            <span className="font-bold text-indian-green-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indian-green" />
              Eligible based on available information
            </span>
            <p className="text-xs text-muted-text leading-relaxed">
              Every documented official criterion in the scheme rules was matched by your citizen profile.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-xl space-y-1.5">
            <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Potentially eligible — verification required
            </span>
            <p className="text-xs text-muted-text leading-relaxed">
              Key general criteria match, but external conditions (like physical survey, land records, or medical certificates) require department verification.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-xl space-y-1.5">
            <span className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Insufficient information
            </span>
            <p className="text-xs text-muted-text leading-relaxed">
              The scheme requires specific criteria (e.g., student status or income ceiling) that you haven't answered yet in your profile.
            </p>
          </div>

          <div className="p-4 bg-gray-100 border-2 border-gray-500 rounded-xl space-y-1.5">
            <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-gray-600" />
              Not eligible based on documented criteria
            </span>
            <p className="text-xs text-muted-text leading-relaxed">
              One or more official exclusionary conditions apply (e.g., residency outside the qualifying state or income above statutory limit).
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-4 space-y-4">
        <button
          onClick={onOpenProfile}
          className="neo-button-primary px-8 py-3.5 rounded-xl font-bold text-base inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Complete My Profile & Start Matching</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart, Users, ExternalLink } from 'lucide-react';
import { MaximalistBadge } from '../components/MaximalistBadge';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-4">
        <MaximalistBadge variant="green">
          {t('about.badge', 'Civic Mission')}
        </MaximalistBadge>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
          {t('about.title', 'About NammaSeve (ನಮ್ಮ ಸೇವೆ)')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('about.subtitle', 'Bridging the gap between Indian government welfare policies and the everyday citizens who qualify for them.')}
        </p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10 space-y-6">
        <h3 className="text-2xl font-heading font-bold text-slate-900">
          {t('about.principles_title', 'Our Guiding Principles')}
        </h3>
        
        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            {t('about.p1', 'Millions of rupees in government welfare subsidies, youth stipends, farmer incentives, and healthcare schemes remain unclaimed each year because citizens either do not know about them or find eligibility guidelines overwhelming.')}
          </p>
          <p>
            {t('about.p2', 'NammaSeve solves this through an open, transparent, and profile-driven civic technology platform. Rather than showing static pdf directories or relying on unverified claims, we encode verified official eligibility criteria into deterministic rules.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-semibold text-slate-900 block text-sm">
              {t('about.free_title', '100% Free & Open')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.free_desc', 'Zero monetization, no paid consultations, and no paywalls for discovering welfare benefits.')}
            </p>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-semibold text-slate-900 block text-sm">
              {t('about.no_aadhaar_title', 'Zero Aadhaar Storage')}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.no_aadhaar_desc', 'We never collect biometric data or sensitive identifiers. We calculate general eligibility and connect you to official government websites to apply directly.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

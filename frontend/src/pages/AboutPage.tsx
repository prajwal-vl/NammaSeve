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
          Civic Mission
        </MaximalistBadge>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-dark-text tracking-tight">
          About NammaSeve (ನಮ್ಮ ಸೇವೆ)
        </h1>
        <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto leading-relaxed">
          Bridging the gap between Indian government welfare policies and the everyday citizens who qualify for them.
        </p>
      </div>

      <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl p-6 sm:p-10 space-y-6">
        <h3 className="text-2xl font-heading font-black text-dark-text">
          Our Guiding Principles
        </h3>
        
        <div className="space-y-4 text-sm sm:text-base text-dark-text leading-relaxed">
          <p>
            Millions of rupees in government welfare subsidies, youth stipends, farmer incentives, and healthcare schemes remain unclaimed each year because citizens either do not know about them or find eligibility guidelines overwhelming.
          </p>
          <p>
            NammaSeve solves this through an open, transparent, and profile-driven civic technology platform. Rather than showing static pdf directories or relying on unverified claims, we encode verified official eligibility criteria into deterministic rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
          <div className="p-4 bg-warm-white border-2 border-dark-text rounded-xl space-y-1">
            <span className="font-bold text-dark-text block">100% Free & Open</span>
            <p className="text-xs text-muted-text">
              Zero monetization, no paid consultations, and no paywalls for discovering welfare benefits.
            </p>
          </div>
          <div className="p-4 bg-warm-white border-2 border-dark-text rounded-xl space-y-1">
            <span className="font-bold text-dark-text block">Zero Aadhaar Storage</span>
            <p className="text-xs text-muted-text">
              We never collect biometric data or sensitive identifiers. We calculate general eligibility and connect you to official government websites to apply directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

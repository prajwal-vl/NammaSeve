import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ExternalLink, Heart, Globe, Award } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t-4 border-dark-text pt-12 pb-8 mt-20 text-dark-text relative overflow-hidden">
      {/* Decorative top border bar with saffron & green */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-saffron via-white to-indian-green" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Civic Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-saffron border-2 border-dark-text shadow-[2px_2px_0px_#20241F] flex items-center justify-center text-white font-black text-base">
                NS
              </div>
              <span className="text-xl font-black font-heading tracking-tight">
                Namma<span className="text-saffron">Seve</span>
              </span>
            </div>
            <p className="text-sm text-muted-text leading-relaxed">
              Karnataka & National civic technology discovery engine. Matching citizens with legitimate welfare entitlements using deterministic rules and verified sources.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <MaximalistBadge variant="green" size="sm">
                Zero Preseeded
              </MaximalistBadge>
              <MaximalistBadge variant="saffron" size="sm">
                Privacy-First
              </MaximalistBadge>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-heading font-black text-base uppercase tracking-wider mb-4 border-b-2 border-dark-text pb-1 inline-block">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-saffron cursor-pointer">
                  {t('nav.home', 'Home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-saffron cursor-pointer">
                  {t('nav.explore', 'Explore Schemes')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-saffron cursor-pointer">
                  {t('nav.dashboard', 'My Profile & Matches')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-saffron cursor-pointer">
                  {t('nav.how_it_works', 'How It Works')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-import')} className="hover:text-saffron cursor-pointer text-xs text-muted-text">
                  {t('nav.admin_import', 'Admin Ingestion')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Portals */}
          <div>
            <h4 className="font-heading font-black text-base uppercase tracking-wider mb-4 border-b-2 border-dark-text pb-1 inline-block">
              Official Portals
            </h4>
            <ul className="space-y-2 text-sm text-muted-text font-medium">
              <li>
                <a
                  href="https://sevasindhu.karnataka.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  Karnataka Seva Sindhu
                </a>
              </li>
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  myScheme (Govt of India)
                </a>
              </li>
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  National Portal of India
                </a>
              </li>
              <li>
                <a
                  href="https://ssp.postmatric.karnataka.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  Karnataka State Scholarship (SSP)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Civic Disclaimer & Privacy */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-base uppercase tracking-wider mb-4 border-b-2 border-dark-text pb-1 inline-block">
              Civic Disclaimer
            </h4>
            <p className="text-xs text-muted-text leading-relaxed">
              NammaSeve is an open discovery assistant and does not collect application fees or disburse funds. Official government departments make all binding eligibility and benefit determinations.
            </p>
            <div>
              <button
                onClick={onOpenPrivacy}
                className="text-xs font-bold text-indian-green underline cursor-pointer hover:text-indian-green-700 flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                Read Citizen Privacy Pledge
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-2 border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-text gap-4">
          <p>© {new Date().getFullYear()} NammaSeve (ನಮ್ಮ ಸೇವೆ). Built for Indian Citizens.</p>
          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacy} className="hover:underline cursor-pointer">
              Privacy & Consent
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('about')} className="hover:underline cursor-pointer">
              About Platform
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

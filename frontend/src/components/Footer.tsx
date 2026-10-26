import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';
import { TreeLogo } from './TreeLogo';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-20 text-dark-text relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Civic Mission */}
          <div className="md:col-span-1 space-y-4">
            <TreeLogo size="md" withText={true} kannadaText={true} />
            <p className="text-sm text-muted-text leading-relaxed">
              {t('footer.about_mission', 'Open civic platform matching Indian citizens with verified welfare benefits using deterministic criteria and official government records.')}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <MaximalistBadge variant="green" size="sm">
                {t('footer.zero_preseeded', 'Zero Preseeded')}
              </MaximalistBadge>
              <MaximalistBadge variant="saffron" size="sm">
                {t('footer.privacy_first', 'Privacy-First')}
              </MaximalistBadge>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-dark-text mb-4">
              {t('footer.navigation', 'Navigation')}
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onNavigate('home')} className="text-muted-text hover:text-saffron transition-colors cursor-pointer">
                  {t('nav.home', 'Home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('live-discovery')} className="text-muted-text hover:text-saffron transition-colors cursor-pointer">
                  {t('nav.discover', 'Discover Schemes')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="text-muted-text hover:text-saffron transition-colors cursor-pointer">
                  {t('nav.dashboard', 'My Profile')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="text-muted-text hover:text-saffron transition-colors cursor-pointer">
                  {t('nav.how_it_works', 'How It Works')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-import')} className="text-muted-text hover:text-saffron transition-colors cursor-pointer">
                  {t('nav.admin_import', 'Admin Ingestion')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Portals */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-dark-text mb-4">
              {t('footer.official_portals', 'Official Portals')}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-text font-medium">
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
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  data.gov.in (OGD India)
                </a>
              </li>
              <li>
                <a
                  href="https://apisetu.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dark-text flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  API Setu (National Gateway)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Civic Disclaimer & Privacy */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-dark-text mb-4">
              {t('footer.civic_disclaimer_title', 'Civic Disclaimer')}
            </h4>
            <p className="text-xs text-muted-text leading-relaxed">
              {t('footer.civic_disclaimer_desc', 'NammaSeve does not collect application fees or disburse welfare funds. Responsible government departments make all binding eligibility and benefit determinations.')}
            </p>
            <div className="pt-1">
              <button
                onClick={onOpenPrivacy}
                className="text-xs font-semibold text-indian-green hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('footer.read_privacy_pledge', 'Read Citizen Privacy Pledge')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-text gap-4">
          <p>© {new Date().getFullYear()} NammaSeve (ನಮ್ಮ ಸೇವೆ). {t('footer.copyright', 'Built for Indian Citizens.')}</p>
          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacy} className="hover:underline cursor-pointer">
              {t('footer.privacy_and_consent', 'Privacy & Consent')}
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('about')} className="hover:underline cursor-pointer">
              {t('footer.about_platform', 'About Platform')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Menu, X, User, LogOut } from 'lucide-react';
import { switchLanguage } from '../i18n';
import { TreeLogo } from './TreeLogo';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLang = i18n.language === 'kn' ? 'kn' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'kn' : 'en';
    switchLanguage(nextLang);
  };

  const navLinks = [
    { id: 'home', label: t('nav.home', 'Home') },
    { id: 'live-discovery', label: t('nav.discover', 'Discover Schemes') },
    { id: 'how-it-works', label: t('nav.how_it_works', 'How It Works') },
    { id: 'dashboard', label: t('nav.dashboard', 'My Profile') },
    { id: 'saved', label: t('nav.saved', 'Saved Schemes') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Tree Emblem & Tagline */}
          <div 
            onClick={() => onNavigate('home')}
            className="cursor-pointer group select-none flex flex-col justify-center"
          >
            <TreeLogo size="md" withText={true} kannadaText={true} />
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 pl-11 -mt-1 hidden sm:block">
              {currentLang === 'kn' ? 'ನಿಮಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' : 'Discover Government Schemes for You'}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-saffron-50 text-saffron-900 border border-saffron-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
              title="Switch language between English and Kannada"
            >
              <Languages className="w-4 h-4 text-saffron" />
              <span className={currentLang === 'kn' ? 'font-bold text-saffron' : 'text-dark-text'}>
                {currentLang === 'kn' ? 'ಕನ್ನಡ' : 'English'}
              </span>
            </button>

            {/* Auth CTA or Profile Badge */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3 py-1.5 rounded-lg border border-indian-green-200 bg-indian-green-50 text-sm font-semibold text-indian-green-900 flex items-center gap-2 cursor-pointer hover:bg-indian-green-100 transition-colors"
                >
                  <User className="w-4 h-4 text-indian-green" />
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0] || 'Citizen'}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  title={t('nav.sign_out', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4 text-muted-text" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {t('nav.sign_in', 'Sign In')}
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold"
            >
              {currentLang === 'kn' ? 'ಕನ್ನಡ' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-gray-200 bg-white text-dark-text"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-dark-text" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white p-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold text-sm border ${
                currentPage === link.id
                  ? 'bg-saffron text-white border-saffron'
                  : 'bg-white border-gray-100 text-dark-text'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-2">
            {user ? (
              <button
                onClick={() => {
                  onSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-secondary py-2.5 rounded-lg font-semibold text-center text-sm"
              >
                {t('nav.sign_out', 'Sign Out')} ({user.email?.split('@')[0]})
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-primary py-2.5 rounded-lg font-semibold text-center text-sm"
              >
                {t('nav.sign_in', 'Sign In')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

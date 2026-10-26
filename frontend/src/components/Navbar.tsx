import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Menu, X, Shield, Sparkles, User, LogOut, FileText } from 'lucide-react';
import { switchLanguage } from '../i18n';
import { MaximalistBadge } from './MaximalistBadge';

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
    { id: 'explore', label: t('nav.explore', 'Explore Schemes') },
    { id: 'dashboard', label: t('nav.dashboard', 'My Profile & Matches') },
    { id: 'how-it-works', label: t('nav.how_it_works', 'How It Works') },
    { id: 'admin-import', label: t('nav.admin_import', 'Admin Ingestion') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-dark-text shadow-neo-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Wordmark */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-saffron border-2.5 border-dark-text shadow-[3px_3px_0px_#20241F] flex items-center justify-center text-white font-black text-xl group-hover:bg-saffron-600 transition-all">
              NS
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-heading tracking-tight text-dark-text">
                  Namma<span className="text-saffron">Seve</span>
                </span>
                <span className="text-sm font-bold text-indian-green font-kannada bg-indian-green-100 px-2 py-0.5 rounded-md border border-indian-green">
                  ನಮ್ಮ ಸೇವೆ
                </span>
              </div>
              <span className="text-xs text-muted-text font-medium hidden sm:block">
                AI-Powered Citizen Scheme Discovery
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-2 rounded-lg font-bold text-sm tracking-wide transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-saffron-100 text-saffron-900 border-2 border-dark-text shadow-[2px_2px_0px_#20241F]'
                    : 'text-dark-text hover:bg-gray-100'
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
              className="neo-box px-3.5 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer bg-white"
              title="Switch language between English and Kannada"
            >
              <Languages className="w-4 h-4 text-saffron" />
              <span className={currentLang === 'kn' ? 'font-bold text-saffron' : 'text-muted-text'}>
                {currentLang === 'kn' ? 'ಕನ್ನಡ' : 'English'}
              </span>
            </button>

            {/* Auth CTA or Profile Badge */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="neo-box-green px-3.5 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-indian-green" />
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0] || 'Citizen'}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-2 border-2 border-dark-text rounded-xl hover:bg-gray-100 cursor-pointer"
                  title={t('nav.sign_out', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4 text-dark-text" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="neo-button-primary px-5 py-2 rounded-xl text-sm font-bold cursor-pointer"
              >
                {t('nav.sign_in', 'Sign In')}
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg border-2 border-dark-text bg-white text-xs font-bold"
            >
              {currentLang === 'kn' ? 'ಕನ್ನಡ' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border-2 border-dark-text bg-white text-dark-text"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t-2 border-dark-text bg-warm-white p-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-base border-2 ${
                currentPage === link.id
                  ? 'bg-saffron text-white border-dark-text shadow-[3px_3px_0px_#20241F]'
                  : 'bg-white border-dark-text text-dark-text'
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
                className="w-full neo-button-secondary py-3 rounded-xl font-bold text-center"
              >
                {t('nav.sign_out', 'Sign Out')} ({user.email?.split('@')[0]})
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full neo-button-primary py-3 rounded-xl font-bold text-center"
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

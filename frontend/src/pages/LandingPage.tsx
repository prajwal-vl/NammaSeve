import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  GraduationCap,
  Users,
  Tractor,
  Home,
  HeartPulse,
  SunMedium,
  Bus
} from 'lucide-react';
import { MaximalistBadge } from '../components/MaximalistBadge';
import { EmptyState } from '../components/EmptyState';
import { Scheme, UserProfile } from '../types';

interface LandingPageProps {
  schemes: Scheme[];
  profile: UserProfile | null;
  onNavigate: (page: string) => void;
  onOpenProfile: () => void;
  onOpenPrivacy: () => void;
  onSearch: (query: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  schemes,
  profile,
  onNavigate,
  onOpenProfile,
  onOpenPrivacy,
  onSearch,
}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('explore');
    }
  };

  const categories = [
    { name: 'Agriculture & Farming', icon: <Tractor className="w-5 h-5 text-indian-green" />, desc: 'Kisan assistance, seed subsidies, crop insurance' },
    { name: 'Youth & Education', icon: <GraduationCap className="w-5 h-5 text-saffron" />, desc: 'Post-matric scholarships, unemployment stipends, skill programs' },
    { name: 'Women & Family Welfare', icon: <Users className="w-5 h-5 text-dark-text" />, desc: 'Gruha Lakshmi, maternity aid, nutrition assistance' },
    { name: 'Healthcare & Health Insurance', icon: <HeartPulse className="w-5 h-5 text-red-600" />, desc: 'Ayushman Bharat PM-JAY, cashless hospitalization' },
    { name: 'Housing & Urban Welfare', icon: <Home className="w-5 h-5 text-amber-600" />, desc: 'PMAY pucca house subsidies, housing loans' },
    { name: 'Energy & Utilities', icon: <SunMedium className="w-5 h-5 text-yellow-600" />, desc: 'Gruha Jyothi free power, solar rooftop subsidies' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        {/* Background decorative neo-elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl h-full -z-10 bg-warm-white rounded-3xl border-4 border-dark-text shadow-neo-xl opacity-90" />
        <div className="absolute top-4 right-10 w-24 h-24 bg-saffron rounded-full border-4 border-dark-text -z-10 hidden md:block" />
        <div className="absolute bottom-6 left-10 w-28 h-28 bg-indian-green rounded-full border-4 border-dark-text -z-10 hidden md:block" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          {/* Top verified trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <MaximalistBadge variant="saffron" icon={<Sparkles className="w-4 h-4" />}>
              Personal-Profile-First Discovery
            </MaximalistBadge>
            <MaximalistBadge variant="green" icon={<ShieldCheck className="w-4 h-4" />}>
              100% Verified Official Portals
            </MaximalistBadge>
            <MaximalistBadge variant="dark" icon={<UserCheck className="w-4 h-4" />}>
              Zero Aadhaar Required
            </MaximalistBadge>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black text-dark-text tracking-tight leading-[1.08] max-w-4xl mx-auto">
            {t('brand.hero_headline', 'The Benefits You Deserve. The Schemes You Should Know.')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-text font-medium max-w-2xl mx-auto leading-relaxed">
            {t(
              'brand.hero_subheadline',
              'A privacy-first civic platform that matches your personal profile with genuine Karnataka and Central government welfare schemes without intermediaries or paperwork confusion.'
            )}
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 border-3 border-dark-text shadow-neo rounded-2xl">
              <div className="flex-1 flex items-center px-3">
                <Search className="w-5 h-5 text-muted-text shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t('hero.search_placeholder', 'Search by scheme name, department, or keyword...')}
                  className="w-full py-2.5 text-sm sm:text-base font-semibold text-dark-text placeholder:text-muted-text focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="neo-button-primary px-6 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('hero.btn_find_schemes', 'Find My Schemes')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenProfile}
              className="neo-button-green px-6 py-3.5 rounded-xl text-base font-bold flex items-center gap-2 cursor-pointer shadow-neo-green"
            >
              <UserCheck className="w-5 h-5" />
              <span>{profile ? 'View My Citizen Matches' : 'Build My Profile & Match'}</span>
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className="neo-button-secondary px-6 py-3.5 rounded-xl text-base font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>{t('hero.btn_explore_all', 'Explore All Schemes')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SCHEME STATUS OR EMPTY STATE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        {schemes.length === 0 ? (
          <EmptyState
            hasProfile={Boolean(profile)}
            onOpenProfile={onOpenProfile}
            onOpenPrivacy={onOpenPrivacy}
            onNavigateHowItWorks={() => onNavigate('how-it-works')}
            onNavigateAdminImport={() => onNavigate('admin-import')}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <MaximalistBadge variant="green" size="sm">
                  Verified Catalog
                </MaximalistBadge>
                <h2 className="text-2xl sm:text-4xl font-heading font-black text-dark-text mt-1">
                  Featured Government Schemes
                </h2>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="neo-button-secondary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>View all {schemes.length} schemes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.slice(0, 3).map(s => (
                <div key={s.id} className="neo-box p-6 rounded-2xl bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <MaximalistBadge variant={s.scheme_level === 'state' ? 'saffron' : 'dark'} size="sm">
                      {s.scheme_level === 'state' ? 'Karnataka' : 'Central'}
                    </MaximalistBadge>
                    <span className="text-xs font-bold text-muted-text">{s.category}</span>
                  </div>
                  <h3 className="text-xl font-heading font-black text-dark-text line-clamp-2">
                    {s.name}
                  </h3>
                  <p className="text-xs font-bold text-indian-green uppercase">{s.department}</p>
                  <p className="text-sm text-muted-text line-clamp-3">{s.description}</p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('explore')}
                      className="neo-button-primary w-full py-2 rounded-xl text-xs font-bold text-center"
                    >
                      View Details & Check Eligibility
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* THREE-STEP PROCESS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <MaximalistBadge variant="saffron">
            How It Works
          </MaximalistBadge>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-dark-text">
            {t('steps.title', 'Three Steps to Unlock Your Entitlements')}
          </h2>
          <p className="text-base sm:text-lg text-muted-text max-w-2xl mx-auto">
            {t('steps.subtitle', 'No agents, no guesswork. Simple, deterministic matching based on verified government orders.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="neo-box p-6 sm:p-8 rounded-2xl bg-white space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-saffron text-white font-black text-xl flex items-center justify-center border-2 border-dark-text shadow-[3px_3px_0px_#20241F]">
              1
            </div>
            <h3 className="text-xl font-heading font-black text-dark-text">
              {t('steps.step1_title', '1. Build Your Profile')}
            </h3>
            <p className="text-sm text-muted-text leading-relaxed">
              {t('steps.step1_desc', 'Share your basic demographic, education, and occupation details voluntarily. We never ask for Aadhaar, bank credentials, or OTPs.')}
            </p>
          </div>

          <div className="neo-box p-6 sm:p-8 rounded-2xl bg-white space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-indian-green text-white font-black text-xl flex items-center justify-center border-2 border-dark-text shadow-[3px_3px_0px_#20241F]">
              2
            </div>
            <h3 className="text-xl font-heading font-black text-dark-text">
              {t('steps.step2_title', '2. Deterministic Matching')}
            </h3>
            <p className="text-sm text-muted-text leading-relaxed">
              {t('steps.step2_desc', 'Our dynamic engine evaluates official gazettes and eligibility rules against your profile to find schemes you qualify for.')}
            </p>
          </div>

          <div className="neo-box p-6 sm:p-8 rounded-2xl bg-white space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-dark-text text-white font-black text-xl flex items-center justify-center border-2 border-dark-text shadow-[3px_3px_0px_#20241F]">
              3
            </div>
            <h3 className="text-xl font-heading font-black text-dark-text">
              {t('steps.step3_title', '3. Clear Guidance & Official Links')}
            </h3>
            <p className="text-sm text-muted-text leading-relaxed">
              {t('steps.step3_desc', 'Understand benefits, required documents, and step-by-step application instructions with official direct portal links.')}
            </p>
          </div>
        </div>
      </section>

      {/* SCHEME CATEGORIES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <MaximalistBadge variant="green">
            Sectors Covered
          </MaximalistBadge>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-dark-text">
            Key Government Welfare Sectors
          </h2>
          <p className="text-sm sm:text-base text-muted-text max-w-xl mx-auto">
            From direct benefit transfers (DBT) to educational scholarships and renewable subsidies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => onNavigate('explore')}
              className="neo-box p-5 rounded-2xl bg-white hover:border-saffron cursor-pointer space-y-2 group transition-all"
            >
              <div className="p-2.5 rounded-xl bg-warm-white border-2 border-dark-text inline-block group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <h4 className="font-heading font-black text-lg text-dark-text group-hover:text-saffron transition-colors">
                {cat.name}
              </h4>
              <p className="text-xs text-muted-text leading-relaxed">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY & CITIZEN PLEDGE SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <MaximalistBadge variant="green" icon={<ShieldCheck className="w-4 h-4" />}>
              Constitutional Privacy
            </MaximalistBadge>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-dark-text leading-tight">
              We Never Ask for Aadhaar, Bank Details, or Passwords.
            </h2>
            <p className="text-base sm:text-lg text-muted-text leading-relaxed">
              Discovering public welfare shouldn't mean compromising your digital safety. NammaSeve uses general eligibility parameters to calculate matching schemes, and directs you to apply safely on official government portals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indian-green shrink-0" />
                <span className="text-sm font-bold text-dark-text">Zero Fabricated Recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indian-green shrink-0" />
                <span className="text-sm font-bold text-dark-text">Deterministic Rule Checks</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indian-green shrink-0" />
                <span className="text-sm font-bold text-dark-text">Instant Data Erasure Anytime</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indian-green shrink-0" />
                <span className="text-sm font-bold text-dark-text">Bilingual in Kannada & English</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onOpenPrivacy}
                className="neo-button-secondary px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              >
                Read Citizen Privacy Pledge
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 pb-6">
        <h2 className="text-3xl sm:text-5xl font-heading font-black text-dark-text">
          Ready to Find the Welfare Schemes You Deserve?
        </h2>
        <p className="text-base sm:text-lg text-muted-text max-w-xl mx-auto">
          Take 2 minutes to create your citizen profile and start matching opportunities.
        </p>
        <button
          onClick={onOpenProfile}
          className="neo-button-primary px-8 py-4 rounded-2xl text-lg font-black inline-flex items-center gap-2 cursor-pointer shadow-neo-lg"
        >
          <UserCheck className="w-6 h-6" />
          <span>Get Started with My Profile</span>
        </button>
      </section>
    </div>
  );
};

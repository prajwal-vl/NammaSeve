import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap,
  Users,
  Tractor,
  Home,
  HeartPulse,
  SunMedium
} from 'lucide-react';
import { MaximalistBadge } from '../components/MaximalistBadge';
import { EmptyState } from '../components/EmptyState';
import { TreeLogo } from '../components/TreeLogo';
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
    { name: t('landing.cat_agri', 'Agriculture & Farming'), icon: <Tractor className="w-5 h-5 text-indian-green" />, desc: t('landing.cat_agri_desc', 'Kisan assistance, seed subsidies, crop insurance') },
    { name: t('landing.cat_youth', 'Youth & Education'), icon: <GraduationCap className="w-5 h-5 text-saffron" />, desc: t('landing.cat_youth_desc', 'Post-matric scholarships, unemployment stipends, skill programs') },
    { name: t('landing.cat_women', 'Women & Family Welfare'), icon: <Users className="w-5 h-5 text-dark-text" />, desc: t('landing.cat_women_desc', 'Gruha Lakshmi, maternity aid, nutrition assistance') },
    { name: t('landing.cat_health', 'Healthcare & Health Insurance'), icon: <HeartPulse className="w-5 h-5 text-red-600" />, desc: t('landing.cat_health_desc', 'Ayushman Bharat PM-JAY, cashless hospitalization') },
    { name: t('landing.cat_housing', 'Housing & Urban Welfare'), icon: <Home className="w-5 h-5 text-amber-600" />, desc: t('landing.cat_housing_desc', 'PMAY pucca house subsidies, housing loans') },
    { name: t('landing.cat_energy', 'Energy & Utilities'), icon: <SunMedium className="w-5 h-5 text-yellow-600" />, desc: t('landing.cat_energy_desc', 'Gruha Jyothi free power, solar rooftop subsidies') },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Tree Emblem with subtle badge */}
          <div className="flex flex-col items-center justify-center gap-3">
            <TreeLogo size="xl" withText={false} />
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <MaximalistBadge variant="saffron" icon={<Sparkles className="w-3.5 h-3.5" />}>
                {t('hero.badge_live_search', 'Live Online Search')}
              </MaximalistBadge>
              <MaximalistBadge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                {t('hero.badge_official_sources', 'Official Government Portals')}
              </MaximalistBadge>
              <MaximalistBadge variant="dark" icon={<UserCheck className="w-3.5 h-3.5" />}>
                {t('hero.badge_zero_aadhaar', 'Zero Aadhaar Required')}
              </MaximalistBadge>
            </div>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            {t('hero.heading', 'Find Government Schemes You May Qualify For')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {t('hero.subheading', 'A privacy-first civic platform that searches the live internet for relevant Karnataka and Central government welfare schemes based on your personal criteria, with clear bilingual explanations and direct official links.')}
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
            <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 shadow-xs rounded-xl focus-within:border-saffron focus-within:ring-2 focus-within:ring-saffron/20 transition-all">
              <div className="flex-1 flex items-center px-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t('hero.search_placeholder', 'Search by scheme name, department, or keyword...')}
                  className="w-full py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{t('hero.btn_find_schemes', 'Find My Schemes')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Primary and Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('live-discovery')}
              className="px-6 py-2.5 bg-saffron text-white hover:bg-saffron-600 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.btn_find_schemes', 'Find My Schemes')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenProfile}
              className="px-5 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>{profile ? t('hero.btn_edit_profile', 'Edit My Citizen Profile') : t('hero.btn_setup_profile', 'Set Up Profile')}</span>
            </button>

            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{t('hero.btn_how_it_works', 'How It Works')}</span>
            </button>
          </div>

          {/* Disclaimer & Explanation */}
          <div className="pt-2 text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            {t('hero.disclaimer', 'NammaSeve is an independent public-service discovery platform. Results are informational only; final eligibility is determined solely by the relevant government department or authority.')}
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
                  {t('landing.verified_catalog', 'Verified Catalog')}
                </MaximalistBadge>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-text mt-1">
                  {t('landing.featured_schemes', 'Featured Government Schemes')}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>{t('landing.view_all_schemes', 'View all schemes')} ({schemes.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.slice(0, 3).map(s => (
                <div key={s.id} className="minimal-card p-6 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <MaximalistBadge variant={s.scheme_level === 'state' ? 'saffron' : 'dark'} size="sm">
                      {s.scheme_level === 'state' ? 'Karnataka' : 'Central'}
                    </MaximalistBadge>
                    <span className="text-xs text-muted-text">{s.category}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-dark-text line-clamp-2">
                    {s.name}
                  </h3>
                  <p className="text-xs font-semibold text-indian-green uppercase">{s.department}</p>
                  <p className="text-xs text-muted-text line-clamp-3 leading-relaxed">{s.description}</p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('explore')}
                      className="btn-primary w-full py-2 rounded-lg text-xs font-semibold text-center"
                    >
                      {t('landing.view_details_check', 'View Details & Check Eligibility')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* THREE-STEP PROCESS SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <MaximalistBadge variant="saffron">
            {t('nav.how_it_works', 'How It Works')}
          </MaximalistBadge>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-dark-text">
            {t('steps.title', 'Three Steps to Unlock Your Entitlements')}
          </h2>
          <p className="text-sm sm:text-base text-muted-text max-w-xl mx-auto">
            {t('steps.subtitle', 'No agents, no guesswork. Simple, deterministic matching based on verified government orders.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="minimal-card p-6 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-saffron-50 text-saffron font-bold text-base flex items-center justify-center border border-saffron-200">
              1
            </div>
            <h3 className="text-base font-heading font-bold text-dark-text">
              {t('steps.step1_title', '1. Build Your Profile')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              {t('steps.step1_desc', 'Share your basic demographic, education, and occupation details voluntarily. We never ask for Aadhaar, bank credentials, or OTPs.')}
            </p>
          </div>

          <div className="minimal-card p-6 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indian-green-50 text-indian-green font-bold text-base flex items-center justify-center border border-indian-green-200">
              2
            </div>
            <h3 className="text-base font-heading font-bold text-dark-text">
              {t('steps.step2_title', '2. Deterministic Matching')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              {t('steps.step2_desc', 'Our dynamic engine evaluates official gazettes and eligibility rules against your profile to find schemes you qualify for.')}
            </p>
          </div>

          <div className="minimal-card p-6 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 text-dark-text font-bold text-base flex items-center justify-center border border-gray-200">
              3
            </div>
            <h3 className="text-base font-heading font-bold text-dark-text">
              {t('steps.step3_title', '3. Clear Guidance & Official Links')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              {t('steps.step3_desc', 'Understand benefits, required documents, and step-by-step application instructions with official direct portal links.')}
            </p>
          </div>
        </div>
      </section>

      {/* SCHEME CATEGORIES SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <MaximalistBadge variant="green">
            {t('landing.sectors_badge', 'Sectors Covered')}
          </MaximalistBadge>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-text">
            {t('landing.sectors_title', 'Key Government Welfare Sectors')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text max-w-md mx-auto">
            {t('landing.sectors_desc', 'From direct benefit transfers (DBT) to educational scholarships and renewable subsidies.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => onNavigate('explore')}
              className="minimal-card p-4 bg-white hover:border-saffron/40 cursor-pointer space-y-2 group transition-all"
            >
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 inline-block">
                {cat.icon}
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-dark-text group-hover:text-saffron transition-colors">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs relative">
          <div className="max-w-2xl space-y-5">
            <MaximalistBadge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              {t('landing.pledge_badge', 'Constitutional Privacy')}
            </MaximalistBadge>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold text-dark-text leading-tight">
              {t('landing.pledge_title', 'We Never Ask for Aadhaar, Bank Details, or Passwords.')}
            </h2>
            <p className="text-sm sm:text-base text-muted-text leading-relaxed">
              {t('landing.pledge_desc', "Discovering public welfare shouldn't mean compromising your digital safety. NammaSeve uses general eligibility parameters to calculate matching schemes, and directs you to apply safely on official government portals.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-dark-text">
                  {t('landing.pledge_point_1', 'Zero Fabricated Recommendations')}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-dark-text">
                  {t('landing.pledge_point_2', 'Deterministic Rule Checks')}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-dark-text">
                  {t('landing.pledge_point_3', 'Instant Data Erasure Anytime')}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indian-green shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-dark-text">
                  {t('landing.pledge_point_4', 'Bilingual in Kannada & English')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenPrivacy}
                className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('landing.pledge_btn', 'Read Citizen Privacy Pledge')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4 pb-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-text">
          {t('landing.cta_ready_title', 'Ready to Find the Welfare Schemes You Deserve?')}
        </h2>
        <p className="text-sm text-muted-text max-w-lg mx-auto">
          {t('landing.cta_ready_desc', 'Take 2 minutes to create your citizen profile and start matching opportunities.')}
        </p>
        <button
          onClick={onOpenProfile}
          className="btn-primary px-7 py-3 rounded-xl text-base font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <UserCheck className="w-5 h-5" />
          <span>{t('landing.cta_get_started', 'Get Started with My Profile')}</span>
        </button>
      </section>
    </div>
  );
};

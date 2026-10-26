import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Bookmark, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { Scheme, UserProfile, EligibilityEvaluation } from '../types';
import { ProfileSummaryCard } from '../features/profile/ProfileSummaryCard';
import { SchemeCard } from '../features/schemes/SchemeCard';
import { EmptyState } from '../components/EmptyState';
import { MaximalistBadge } from '../components/MaximalistBadge';
import { evaluateSchemeEligibility } from '../lib/eligibilityEngine';

interface DashboardPageProps {
  user: any;
  profile: UserProfile | null;
  schemes: Scheme[];
  savedSchemeIds: Set<string>;
  onToggleSave: (schemeId: string) => void;
  onSelectScheme: (scheme: Scheme) => void;
  onOpenProfile: () => void;
  onOpenPrivacy: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateAdminImport: () => void;
  onDeleteProfile: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  profile,
  schemes,
  savedSchemeIds,
  onToggleSave,
  onSelectScheme,
  onOpenProfile,
  onOpenPrivacy,
  onNavigateHowItWorks,
  onNavigateAdminImport,
  onDeleteProfile,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'privacy'>('recommended');

  // Evaluate schemes against current profile
  const evaluations: EligibilityEvaluation[] = useMemo(() => {
    if (!profile) return [];
    return schemes.map(s => evaluateSchemeEligibility(profile, s));
  }, [schemes, profile]);

  // Group by the 4 deterministic outcomes
  const eligibleSchemes = evaluations.filter(
    e => e.status === 'eligible_based_on_available_information' || e.status === 'eligible'
  );
  const potentiallyEligibleSchemes = evaluations.filter(
    e => e.status === 'potentially_eligible'
  );
  const insufficientInfoSchemes = evaluations.filter(
    e => e.status === 'insufficient_information'
  );
  const notEligibleSchemes = evaluations.filter(
    e => e.status === 'not_eligible_based_on_known_criteria' || e.status === 'not_eligible'
  );

  const savedSchemesList = useMemo(() => {
    return schemes.filter(s => savedSchemeIds.has(s.id));
  }, [schemes, savedSchemeIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MaximalistBadge variant="green" size="sm">
              {t('dashboard.portal_badge', 'Citizen Portal')}
            </MaximalistBadge>
            <span className="text-xs font-medium text-slate-500">
              {user?.email ? user.email : t('dashboard.guest_session', 'Guest Discovery Session')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            {t('dashboard.title', 'My Citizen Profile & Opportunities')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            {t('dashboard.subtitle', 'Personalized welfare discoveries based strictly on your voluntarily provided citizen criteria.')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onOpenProfile}
            className="px-4 py-2.5 bg-saffron text-white hover:bg-saffron-600 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{profile ? t('dashboard.edit_profile', 'Edit Profile') : t('dashboard.complete_profile', 'Complete Profile')}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      {profile ? (
        <ProfileSummaryCard profile={profile} onEdit={onOpenProfile} />
      ) : (
        <div className="p-6 bg-gradient-to-r from-saffron-50/80 to-white border border-saffron-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-lg font-heading font-bold text-slate-900">
              {t('dashboard.incomplete_title', 'Your Profile is Incomplete')}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {t('dashboard.incomplete_desc', 'Add your age, district, and education details to unlock personalized deterministic scheme matching.')}
            </p>
          </div>
          <button
            onClick={onOpenProfile}
            className="px-5 py-2.5 bg-saffron text-white hover:bg-saffron-600 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer self-start"
          >
            <span>{t('dashboard.complete_btn', 'Complete My Profile Now')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recommended'
              ? 'bg-saffron text-white font-semibold shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('dashboard.tab_recommended', 'Recommended Matches')}</span>
          {evaluations.length > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'recommended' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {eligibleSchemes.length + potentiallyEligibleSchemes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-saffron text-white font-semibold shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t('dashboard.tab_saved', 'Saved Schemes')} ({savedSchemeIds.size})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-saffron text-white font-semibold shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('dashboard.tab_privacy', 'Privacy & Data Controls')}</span>
        </button>
      </div>

      {/* TAB 1: RECOMMENDED MATCHES */}
      {activeTab === 'recommended' && (
        <div className="space-y-8">
          {schemes.length === 0 ? (
            <EmptyState
              hasProfile={Boolean(profile)}
              onOpenProfile={onOpenProfile}
              onOpenPrivacy={onOpenPrivacy}
              onNavigateHowItWorks={onNavigateHowItWorks}
              onNavigateAdminImport={onNavigateAdminImport}
            />
          ) : (
            <>
              {/* Classification 1: Eligible Based on Available Information */}
              {eligibleSchemes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indian-green" />
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      {t('dashboard.eligible_title', 'Eligible Based on Available Information')} ({eligibleSchemes.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eligibleSchemes.map(ev => (
                      <SchemeCard
                        key={ev.scheme_id}
                        scheme={ev.scheme}
                        evaluation={ev}
                        isSaved={savedSchemeIds.has(ev.scheme_id)}
                        onToggleSave={onToggleSave}
                        onSelect={onSelectScheme}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Classification 2: Potentially Eligible */}
              {potentiallyEligibleSchemes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      {t('dashboard.potentially_eligible_title', 'Potentially Eligible — Verification Required')} ({potentiallyEligibleSchemes.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {potentiallyEligibleSchemes.map(ev => (
                      <SchemeCard
                        key={ev.scheme_id}
                        scheme={ev.scheme}
                        evaluation={ev}
                        isSaved={savedSchemeIds.has(ev.scheme_id)}
                        onToggleSave={onToggleSave}
                        onSelect={onSelectScheme}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Classification 3: Insufficient Information */}
              {insufficientInfoSchemes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      {t('dashboard.insufficient_info_title', 'Insufficient Profile Information')} ({insufficientInfoSchemes.length})
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {t('dashboard.insufficient_info_desc', 'Update your profile with additional information (such as landholding or education stream) to evaluate these schemes.')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insufficientInfoSchemes.map(ev => (
                      <SchemeCard
                        key={ev.scheme_id}
                        scheme={ev.scheme}
                        evaluation={ev}
                        isSaved={savedSchemeIds.has(ev.scheme_id)}
                        onToggleSave={onToggleSave}
                        onSelect={onSelectScheme}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Classification 4: Not Eligible Based on Known Criteria */}
              {notEligibleSchemes.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-heading font-bold text-slate-700">
                      {t('dashboard.not_eligible_title', 'Not Eligible Based on Known Criteria')} ({notEligibleSchemes.length})
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {t('dashboard.not_eligible_desc', 'These schemes require attributes that do not match your current profile.')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notEligibleSchemes.map(ev => (
                      <SchemeCard
                        key={ev.scheme_id}
                        scheme={ev.scheme}
                        evaluation={ev}
                        isSaved={savedSchemeIds.has(ev.scheme_id)}
                        onToggleSave={onToggleSave}
                        onSelect={onSelectScheme}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SCHEMES */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedSchemesList.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-3">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-heading font-bold text-slate-900">
                {t('dashboard.no_saved_title', 'No Saved Schemes Yet')}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {t('dashboard.no_saved_desc', 'Explore the scheme catalogue and click the bookmark icon on any scheme to save it for quick reference.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSchemesList.map(s => (
                <SchemeCard
                  key={s.id}
                  scheme={s}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onSelect={onSelectScheme}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRIVACY & DATA CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="max-w-2xl bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-bold text-slate-900">
              {t('dashboard.privacy_title', 'Your Data & Privacy Controls')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('dashboard.privacy_desc', 'We uphold the principle of data minimization and citizen data sovereignty. You have complete ownership over your citizen profile.')}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
              {t('dashboard.data_stored_title', 'Data Stored on This Device:')}
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>{t('dashboard.data_stored_1', 'Citizen eligibility indicators (District, Age, Education, Occupation)')}</li>
              <li>{t('dashboard.data_stored_2', 'Saved schemes bookmarks')} ({savedSchemeIds.size})</li>
              <li>{t('dashboard.data_stored_3', 'Language preference')} ({profile?.preferred_language || 'en'})</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-red-600 text-sm mb-1">
              {t('dashboard.permanent_erasure', 'Permanent Data Erasure')}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {t('dashboard.erasure_desc', 'Delete your citizen profile, match history, and saved schemes permanently.')}
            </p>
            <button
              onClick={() => {
                if (window.confirm(t('dashboard.confirm_delete', 'Are you sure you want to delete your profile data permanently?'))) {
                  onDeleteProfile();
                }
              }}
              className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('dashboard.btn_delete_profile', 'Permanently Delete My Citizen Profile')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  ArrowRight
} from 'lucide-react';
import { Scheme, UserProfile, EligibilityEvaluation, EligibilityStatus } from '../types';
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

  // Group by status
  const eligibleSchemes = evaluations.filter(e => e.status === 'eligible');
  const potentiallyEligibleSchemes = evaluations.filter(e => e.status === 'potentially_eligible');
  const insufficientInfoSchemes = evaluations.filter(e => e.status === 'insufficient_information');

  const savedSchemesList = useMemo(() => {
    return schemes.filter(s => savedSchemeIds.has(s.id));
  }, [schemes, savedSchemeIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dark-text">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="green" size="sm">
              Citizen Portal
            </MaximalistBadge>
            <span className="text-xs font-bold text-muted-text">
              {user?.email ? user.email : 'Guest Discovery Session'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-dark-text tracking-tight">
            My Profile & Opportunities
          </h1>
          <p className="text-sm sm:text-base text-muted-text mt-1">
            Personalized welfare discoveries based strictly on your voluntarily provided citizen criteria.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onOpenProfile}
            className="neo-button-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{profile ? 'Edit Profile' : 'Complete Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      {profile ? (
        <ProfileSummaryCard profile={profile} onEdit={onOpenProfile} />
      ) : (
        <div className="p-6 bg-saffron-50 border-3 border-dark-text shadow-neo rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-heading font-black text-dark-text">
              Your Profile is Incomplete
            </h3>
            <p className="text-sm text-muted-text mt-1">
              Add your age, district, and education details to unlock personalized scheme matching.
            </p>
          </div>
          <button
            onClick={onOpenProfile}
            className="neo-button-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer self-start"
          >
            <span>Complete My Profile Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-dark-text pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recommended'
              ? 'bg-saffron text-white border-dark-text shadow-[2px_2px_0px_#20241F]'
              : 'bg-warm-white text-dark-text border-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommended Matches</span>
          {evaluations.length > 0 && (
            <span className="bg-white text-dark-text text-xs font-black px-2 py-0.5 rounded-full border border-dark-text">
              {eligibleSchemes.length + potentiallyEligibleSchemes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-saffron text-white border-dark-text shadow-[2px_2px_0px_#20241F]'
              : 'bg-warm-white text-dark-text border-gray-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Schemes ({savedSchemeIds.size})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-saffron text-white border-dark-text shadow-[2px_2px_0px_#20241F]'
              : 'bg-warm-white text-dark-text border-gray-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Data Controls</span>
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
              {/* Classification 1: Eligible */}
              {eligibleSchemes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indian-green" />
                    <h3 className="text-xl font-heading font-black text-dark-text">
                      Eligible Based on Available Information ({eligibleSchemes.length})
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
                    <h3 className="text-xl font-heading font-black text-dark-text">
                      Potentially Eligible — Verification Required ({potentiallyEligibleSchemes.length})
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
                    <h3 className="text-xl font-heading font-black text-dark-text">
                      Insufficient Profile Information ({insufficientInfoSchemes.length})
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-text">
                    Update your profile with additional information (such as landholding or education stream) to evaluate these schemes.
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
            </>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SCHEMES */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedSchemesList.length === 0 ? (
            <div className="text-center py-16 bg-white border-3 border-dark-text shadow-neo rounded-2xl p-8 space-y-3">
              <Bookmark className="w-12 h-12 text-muted-text mx-auto" />
              <h3 className="text-xl font-heading font-black text-dark-text">
                No Saved Schemes Yet
              </h3>
              <p className="text-sm text-muted-text max-w-md mx-auto">
                Explore the scheme catalogue and click the bookmark icon on any scheme to save it for quick reference.
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
        <div className="max-w-2xl bg-white border-3 border-dark-text shadow-neo rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-black text-dark-text">
              Your Data & Privacy Controls
            </h3>
            <p className="text-sm text-muted-text leading-relaxed">
              We uphold the principle of data minimization and citizen data sovereignty. You have complete ownership over your citizen profile.
            </p>
          </div>

          <div className="p-4 bg-warm-white border-2 border-dark-text rounded-xl space-y-2">
            <h4 className="font-bold text-dark-text text-sm">Data Stored on This Device:</h4>
            <ul className="text-xs text-muted-text space-y-1 list-disc list-inside">
              <li>Citizen eligibility indicators (District, Age, Education, Occupation)</li>
              <li>Saved schemes bookmarks ({savedSchemeIds.size})</li>
              <li>Language preference ({profile?.preferred_language || 'en'})</li>
            </ul>
          </div>

          <div className="pt-4 border-t-2 border-gray-200">
            <h4 className="font-bold text-red-600 text-sm mb-1">Permanent Data Erasure</h4>
            <p className="text-xs text-muted-text mb-4">
              Delete your citizen profile, match history, and saved schemes permanently.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your profile data permanently?')) {
                  onDeleteProfile();
                }
              }}
              className="px-4 py-2.5 bg-red-50 text-red-700 border-2 border-red-500 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete My Citizen Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

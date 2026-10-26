import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { DashboardPage } from './pages/DashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { AdminImportPage } from './pages/AdminImportPage';
import { ProfileWizard } from './features/profile/ProfileWizard';
import { SchemeDetailModal } from './features/schemes/SchemeDetailModal';
import { AuthModal } from './features/auth/AuthModal';
import { Scheme, UserProfile } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

import { LiveDiscoveryPage } from './pages/LiveDiscoveryPage';
import { DiscoveredScheme } from './types';

export function App() {
  const { i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication State
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('nammaseve_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Citizen Profile State (Default starts empty or loaded from localStorage)
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nammaseve_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // ZERO PRESEEDED SCHEMES: Starts strictly empty!
  const [schemes, setSchemes] = useState<Scheme[]>(() => {
    const saved = localStorage.getItem('nammaseve_imported_schemes');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Schemes Bookmarks (Both catalog scheme IDs and discovered scheme names)
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('nammaseve_saved_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [savedDiscoveredSchemes, setSavedDiscoveredSchemes] = useState<DiscoveredScheme[]>(() => {
    const saved = localStorage.getItem('nammaseve_saved_discovered_schemes');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Fetch schemes from Supabase database if configured
  const loadSchemesFromDatabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('schemes')
        .select(`
          id, slug, name, kannada_name, description, kannada_description,
          scheme_level, state_code, department, kannada_department, category,
          benefits, eligibility_summary, kannada_eligibility_summary,
          application_steps, documents_required, official_application_url,
          status, created_at,
          sources:scheme_sources(publisher, source_url, source_type, verification_status),
          rules:eligibility_rules(rule_type, required_attribute, operator, rule_value, source_reference)
        `)
        .eq('status', 'published');

      if (!error && data) {
        const localImported = JSON.parse(localStorage.getItem('nammaseve_imported_schemes') || '[]');
        const dbSlugs = new Set(data.map(d => d.slug));
        const nonDuplicateLocal = localImported.filter((l: Scheme) => !dbSlugs.has(l.slug));
        const combined = [...data, ...nonDuplicateLocal];
        setSchemes(combined);
      }
    } catch (err) {
      console.warn('Notice loading schemes from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    loadSchemesFromDatabase();
  }, [loadSchemesFromDatabase]);

  // Load user session on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('nammaseve_user', JSON.stringify(session.user));
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setProfile(data);
                localStorage.setItem('nammaseve_profile', JSON.stringify(data));
              }
            });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('nammaseve_user', JSON.stringify(session.user));
        } else {
          setUser(null);
          localStorage.removeItem('nammaseve_user');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Save profile handler
  const handleSaveProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('nammaseve_profile', JSON.stringify(newProfile));
    setIsProfileModalOpen(false);

    if (user && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            preferred_language: newProfile.preferred_language,
            state: newProfile.state,
            district: newProfile.district,
            age: newProfile.age,
            gender: newProfile.gender,
            is_woman_head_of_family: newProfile.is_woman_head_of_family,
            community_consent_granted: newProfile.community_consent_granted,
            community_category: newProfile.community_category,
            highest_qualification: newProfile.highest_qualification,
            degree_stream: newProfile.degree_stream,
            education_status: newProfile.education_status,
            is_student: newProfile.is_student,
            occupation: newProfile.occupation,
            is_farmer: newProfile.is_farmer,
            landholding_acres: newProfile.landholding_acres,
            annual_income_range: newProfile.annual_income_range,
            ration_card_type: newProfile.ration_card_type,
            is_tax_payer: newProfile.is_tax_payer,
            disability_status: newProfile.disability_status,
            profile_completion_percentage: newProfile.profile_completion_percentage,
          });
      } catch (err) {
        console.warn('Notice saving profile to Supabase:', err);
      }
    }

    setCurrentPage('live-discovery');
  };

  // Permanently delete citizen profile
  const handleDeleteProfile = async () => {
    setProfile(null);
    localStorage.removeItem('nammaseve_profile');
    localStorage.removeItem('nammaseve_saved_ids');
    localStorage.removeItem('nammaseve_saved_discovered_schemes');
    setSavedSchemeIds(new Set());
    setSavedDiscoveredSchemes([]);

    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', user.id);
      } catch (err) {
        console.warn('Notice deleting profile from Supabase:', err);
      }
    }
    setCurrentPage('home');
  };

  // Toggle Save Catalog Scheme
  const handleToggleSave = async (schemeId: string) => {
    setSavedSchemeIds(prev => {
      const next = new Set(prev);
      if (next.has(schemeId)) {
        next.delete(schemeId);
      } else {
        next.add(schemeId);
      }
      localStorage.setItem('nammaseve_saved_ids', JSON.stringify(Array.from(next)));
      return next;
    });

    if (user && isSupabaseConfigured) {
      if (savedSchemeIds.has(schemeId)) {
        await supabase.from('saved_schemes').delete().eq('user_id', user.id).eq('scheme_id', schemeId);
      } else {
        await supabase.from('saved_schemes').insert({ user_id: user.id, scheme_id: schemeId });
      }
    }
  };

  // Toggle Save Discovered Scheme
  const handleToggleSaveDiscovered = async (discScheme: DiscoveredScheme) => {
    const key = discScheme.name;
    const isCurrentlySaved = savedSchemeIds.has(key);

    setSavedSchemeIds(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(key);
      else next.add(key);
      localStorage.setItem('nammaseve_saved_ids', JSON.stringify(Array.from(next)));
      return next;
    });

    setSavedDiscoveredSchemes(prev => {
      let nextList: DiscoveredScheme[];
      if (isCurrentlySaved) {
        nextList = prev.filter(s => s.name !== key);
      } else {
        nextList = [...prev, discScheme];
      }
      localStorage.setItem('nammaseve_saved_discovered_schemes', JSON.stringify(nextList));
      return nextList;
    });

    if (user && isSupabaseConfigured) {
      try {
        if (isCurrentlySaved) {
          await supabase.from('saved_schemes').delete().eq('user_id', user.id).eq('scheme_key', key);
        } else {
          await supabase.from('saved_schemes').insert({
            user_id: user.id,
            scheme_key: key,
            scheme_data: discScheme,
          });
        }
      } catch (err) {
        console.warn('Failed saving discovered scheme to Supabase:', err);
      }
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('nammaseve_user');
  };

  // Admin Import Complete
  const handleAdminImportComplete = (imported: Scheme[]) => {
    setSchemes(prev => {
      const existingSlugs = new Set(prev.map(p => p.slug));
      const newlyAdded = imported.filter(i => !existingSlugs.has(i.slug));
      return [...prev, ...newlyAdded];
    });
    setCurrentPage('explore');
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-white text-dark-text">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'saved') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage(page);
          }
        }}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage
            schemes={schemes}
            profile={profile}
            onNavigate={(page) => {
              if (page === 'explore') setCurrentPage('live-discovery');
              else setCurrentPage(page);
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onSearch={(q) => {
              setSearchQuery(q);
              setCurrentPage('live-discovery');
            }}
          />
        )}

        {(currentPage === 'live-discovery' || currentPage === 'discover') && (
          <LiveDiscoveryPage
            profile={profile}
            user={user}
            savedSchemeKeys={savedSchemeIds}
            onToggleSaveScheme={handleToggleSaveDiscovered}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateHowItWorks={() => setCurrentPage('how-it-works')}
            initialQuery={searchQuery}
          />
        )}

        {currentPage === 'explore' && (
          <ExplorePage
            schemes={schemes}
            profile={profile}
            savedSchemeIds={savedSchemeIds}
            onToggleSave={handleToggleSave}
            onSelectScheme={setSelectedScheme}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onNavigateHowItWorks={() => setCurrentPage('how-it-works')}
            onNavigateAdminImport={() => setCurrentPage('admin-import')}
            onRefreshSchemes={loadSchemesFromDatabase}
            initialSearch={searchQuery}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            user={user}
            profile={profile}
            schemes={schemes}
            savedSchemeIds={savedSchemeIds}
            onToggleSave={handleToggleSave}
            onSelectScheme={setSelectedScheme}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onNavigateHowItWorks={() => setCurrentPage('how-it-works')}
            onNavigateAdminImport={() => setCurrentPage('admin-import')}
            onDeleteProfile={handleDeleteProfile}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateExplore={() => setCurrentPage('live-discovery')}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage />
        )}

        {currentPage === 'admin-import' && (
          <AdminImportPage
            onImportComplete={handleAdminImportComplete}
            onNavigateHome={() => setCurrentPage('home')}
          />
        )}
      </main>

      {/* Modals */}
      {isProfileModalOpen && (
        <ProfileWizard
          initialProfile={profile || undefined}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileModalOpen(false)}
          isModal={true}
        />
      )}

      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          isSaved={savedSchemeIds.has(selectedScheme.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedScheme(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={setUser}
        />
      )}

      {isPrivacyModalOpen && (
        <PrivacyNoticeModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onClearProfile={profile ? handleDeleteProfile : undefined}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={setCurrentPage}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />
    </div>
  );
}

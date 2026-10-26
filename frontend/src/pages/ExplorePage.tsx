import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Scheme, UserProfile, EligibilityEvaluation } from '../types';
import { SchemeCard } from '../features/schemes/SchemeCard';
import { EmptyState } from '../components/EmptyState';
import { MaximalistBadge } from '../components/MaximalistBadge';
import { evaluateSchemeEligibility } from '../lib/eligibilityEngine';

interface ExplorePageProps {
  schemes: Scheme[];
  profile: UserProfile | null;
  savedSchemeIds: Set<string>;
  onToggleSave: (schemeId: string) => void;
  onSelectScheme: (scheme: Scheme) => void;
  onOpenProfile: () => void;
  onOpenPrivacy: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateAdminImport: () => void;
  onRefreshSchemes?: () => void;
  initialSearch?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  schemes,
  profile,
  savedSchemeIds,
  onToggleSave,
  onSelectScheme,
  onOpenProfile,
  onOpenPrivacy,
  onNavigateHowItWorks,
  onNavigateAdminImport,
  onRefreshSchemes,
  initialSearch = '',
}) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'state' | 'central'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest'>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract available categories dynamically from genuine loaded schemes
  const categories = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [schemes]);

  // Pre-calculate profile evaluations if profile exists
  const evaluationsMap = useMemo(() => {
    const map = new Map<string, EligibilityEvaluation>();
    if (!profile) return map;
    schemes.forEach(s => {
      const evaluation = evaluateSchemeEligibility(profile, s);
      map.set(s.id, evaluation);
    });
    return map;
  }, [schemes, profile]);

  // Filter & Search logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      // Level filter
      if (selectedLevel !== 'all' && s.scheme_level !== selectedLevel) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q) || (s.kannada_name && s.kannada_name.toLowerCase().includes(q));
        const matchDesc = s.description.toLowerCase().includes(q) || (s.kannada_description && s.kannada_description.toLowerCase().includes(q));
        const matchDept = s.department.toLowerCase().includes(q) || (s.kannada_department && s.kannada_department.toLowerCase().includes(q));
        const matchCat = s.category.toLowerCase().includes(q);
        return matchName || matchDesc || matchDept || matchCat;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [schemes, selectedLevel, selectedCategory, searchQuery, sortBy]);

  const handleRefresh = async () => {
    if (onRefreshSchemes) {
      setIsRefreshing(true);
      await onRefreshSchemes();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dark-text">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="saffron" size="sm">
              Civic Discovery
            </MaximalistBadge>
            <span className="text-xs font-bold text-muted-text">
              {schemes.length} verified record(s) loaded
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-dark-text tracking-tight">
            {t('schemes.catalog_title', 'Government Schemes Catalogue')}
          </h1>
          <p className="text-sm sm:text-base text-muted-text mt-1 max-w-2xl">
            {t('schemes.catalog_subtitle', 'Genuine Karnataka and Central Government welfare schemes verified from official portals.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="neo-button-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            title="Refresh catalogue from Supabase database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* If ZERO schemes in database, display required EmptyState */}
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
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-6 border-3 border-dark-text shadow-neo-sm rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-muted-text absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('schemes.search_input', 'Search schemes by name, department, or keyword...')}
                  className="neo-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-semibold text-dark-text"
                />
              </div>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value as any)}
                className="neo-input px-3.5 py-2.5 rounded-xl text-sm font-bold bg-white"
              >
                <option value="all">{t('schemes.filter_level_all', 'All Levels')}</option>
                <option value="state">{t('schemes.filter_level_state', 'Karnataka State')}</option>
                <option value="central">{t('schemes.filter_level_central', 'Central Government')}</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="neo-input px-3.5 py-2.5 rounded-xl text-sm font-bold bg-white"
              >
                <option value="all">{t('schemes.filter_all', 'All Categories')}</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="neo-input px-3.5 py-2.5 rounded-xl text-sm font-bold bg-white"
              >
                <option value="newest">Recently Added</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-16 bg-white border-3 border-dark-text shadow-neo rounded-2xl p-8 space-y-3">
              <AlertCircle className="w-12 h-12 text-muted-text mx-auto" />
              <h3 className="text-xl font-heading font-black text-dark-text">
                No matching schemes found
              </h3>
              <p className="text-sm text-muted-text max-w-md mx-auto">
                No verified records match your current search terms or filter selection.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedLevel('all'); setSelectedCategory('all'); }}
                className="neo-button-primary px-4 py-2 rounded-xl text-xs font-bold mt-2"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map(s => (
                <SchemeCard
                  key={s.id}
                  scheme={s}
                  evaluation={evaluationsMap.get(s.id)}
                  isSaved={savedSchemeIds.has(s.id)}
                  onToggleSave={onToggleSave}
                  onSelect={onSelectScheme}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

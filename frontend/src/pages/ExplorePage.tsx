import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'state' | 'central'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest'>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [schemes]);

  const evaluationsMap = useMemo(() => {
    const map = new Map<string, EligibilityEvaluation>();
    if (!profile) return map;
    schemes.forEach(s => {
      const evaluation = evaluateSchemeEligibility(profile, s);
      map.set(s.id, evaluation);
    });
    return map;
  }, [schemes, profile]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      if (selectedLevel !== 'all' && s.scheme_level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
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
      if (sortBy === 'name') return a.name.localeCompare(b.name);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="saffron" size="sm">
              Civic Discovery
            </MaximalistBadge>
            <span className="text-xs text-muted-text font-medium">
              {schemes.length} verified record(s) loaded
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-dark-text tracking-tight">
            {t('schemes.catalog_title', 'Government Schemes Catalogue')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-1 max-w-2xl">
            {t('schemes.catalog_subtitle', 'Genuine Karnataka and Central Government welfare schemes verified from official portals.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Refresh catalogue from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
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
          <div className="bg-white p-4 border border-gray-200 shadow-xs rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-muted-text absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('schemes.search_input', 'Search schemes by name, department, or keyword...')}
                  className="minimal-input w-full pl-9 pr-3.5 py-2 text-sm font-medium text-dark-text"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value as any)}
                className="minimal-input px-3 py-2 text-xs sm:text-sm font-semibold bg-white"
              >
                <option value="all">{t('schemes.filter_level_all', 'All Levels')}</option>
                <option value="state">{t('schemes.filter_level_state', 'Karnataka State')}</option>
                <option value="central">{t('schemes.filter_level_central', 'Central Government')}</option>
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="minimal-input px-3 py-2 text-xs sm:text-sm font-semibold bg-white"
              >
                <option value="all">{t('schemes.filter_all', 'All Categories')}</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="minimal-input px-3 py-2 text-xs sm:text-sm font-semibold bg-white"
              >
                <option value="newest">Recently Added</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-8 space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-text mx-auto" />
              <h3 className="text-base font-heading font-bold text-dark-text">
                No matching schemes found
              </h3>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                No verified records match your current search terms or filter selection.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedLevel('all'); setSelectedCategory('all'); }}
                className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold mt-2"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

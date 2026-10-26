import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { 
  UserProfile, 
  DiscoveredScheme, 
  DiscoverSchemesResponse, 
  LiveEligibilityStatus 
} from '../types';
import { MaximalistBadge } from '../components/MaximalistBadge';
import { DiscoveredSchemeCard } from '../features/schemes/DiscoveredSchemeCard';
import { DiscoveredSchemeDetailModal } from '../features/schemes/DiscoveredSchemeDetailModal';
import { callDiscoverSchemes } from '../lib/edgeFunctions';
import { TreeLogo } from '../components/TreeLogo';

interface LiveDiscoveryPageProps {
  profile: UserProfile | null;
  user: any;
  savedSchemeKeys: Set<string>;
  onToggleSaveScheme: (scheme: DiscoveredScheme) => void;
  onOpenProfile: () => void;
  onNavigateHowItWorks: () => void;
  initialQuery?: string;
}

export const LiveDiscoveryPage: React.FC<LiveDiscoveryPageProps> = ({
  profile,
  user,
  savedSchemeKeys,
  onToggleSaveScheme,
  onOpenProfile,
  onNavigateHowItWorks,
  initialQuery = '',
}) => {
  const { t, i18n } = useTranslation();
  const [keywordQuery, setKeywordQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DiscoveredScheme[]>([]);
  const [searchResponse, setSearchResponse] = useState<DiscoverSchemesResponse | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<DiscoveredScheme | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | LiveEligibilityStatus>('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Trigger discovery
  const handlePerformDiscovery = async (forceFresh = false) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await callDiscoverSchemes({
        profile: profile || {},
        keyword_query: keywordQuery.trim(),
        language: i18n.language === 'kn' ? 'kn' : 'en',
        user_id: user?.id,
        force_fresh: forceFresh,
      });

      setSearchResponse(response);
      setSearchResults(response.results || []);
    } catch (err) {
      console.error('Error during live scheme discovery:', err);
      setSearchResponse({
        results: [],
        search_status: 'error',
        search_notes: ['An unexpected error occurred during discovery.'],
        query_summary: keywordQuery || 'Error',
        cached: false,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Run on initial load if an initialQuery is passed
  useEffect(() => {
    if (initialQuery && !hasSearched) {
      handlePerformDiscovery();
    }
  }, [initialQuery]);

  // Filter results by status
  const filteredResults = useMemo(() => {
    if (statusFilter === 'all') return searchResults;
    return searchResults.filter(s => s.eligibility_status === statusFilter);
  }, [searchResults, statusFilter]);

  // Status counts
  const eligibleCount = searchResults.filter(
    s => s.eligibility_status === 'eligible_based_on_available_information' || s.eligibility_status === 'potentially_eligible'
  ).length;
  const infoNeededCount = searchResults.filter(s => s.eligibility_status === 'insufficient_information').length;
  const notEligibleCount = searchResults.filter(s => s.eligibility_status === 'not_eligible_based_on_verified_criteria').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MaximalistBadge variant="saffron" size="sm">
              Live Web Discovery
            </MaximalistBadge>
            <span className="text-xs font-semibold text-slate-500">
              Powered by Groq AI & Genuine Web Sources
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Discover Government Schemes for You
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Real-time search across central and state government portals using your verified citizen criteria. No static preseeded records.
          </p>
        </div>

        <button
          onClick={onOpenProfile}
          className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4 text-slate-500" />
          <span>{profile ? 'Edit Profile Criteria' : 'Set Up Profile'}</span>
        </button>
      </div>

      {/* Profile Criteria Pill Summary */}
      <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">Search Context:</span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
            State: {profile?.state || 'Karnataka (Default)'}
          </span>
          {profile?.age && (
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
              Age: {profile.age}
            </span>
          )}
          {profile?.is_farmer && (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              Farmer
            </span>
          )}
          {profile?.is_student && (
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-medium">
              Student
            </span>
          )}
          {profile?.highest_qualification && (
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
              {profile.highest_qualification.replace(/_/g, ' ')}
            </span>
          )}
          {profile?.occupation && (
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
              {profile.occupation.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500">
          *Voluntarily supplied profile data minimizes false recommendations
        </span>
      </div>

      {/* Live Search Box Toolbar */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-xs rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              placeholder="Search by scheme name or keywords (e.g. 'Scholarship', 'Kisan subsidy', 'Housing aid')..."
              className="minimal-input w-full pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePerformDiscovery(true);
              }}
            />
          </div>

          <button
            onClick={() => handlePerformDiscovery(true)}
            disabled={isSearching}
            className="px-6 py-2.5 bg-saffron text-white hover:bg-saffron-600 rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching Government Sources...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find My Schemes</span>
              </>
            )}
          </button>
        </div>

        {/* Informational Guidance Notice */}
        <p className="text-xs text-slate-500">
          Searches official portals including myscheme.gov.in, karnataka.gov.in, sevasindhu, and central ministries. Groq AI extracts documented criteria without fabricating data.
        </p>
      </div>

      {/* SEARCH IN PROGRESS INDICATOR */}
      {isSearching && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-xs animate-pulse">
          <div className="w-12 h-12 mx-auto text-saffron flex items-center justify-center">
            <TreeLogo size="lg" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-bold text-slate-900">
              Searching Official Government Portals...
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Querying live web evidence and assessing eligibility against your citizen profile. This takes a few seconds.
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-saffron animate-[progress_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {!isSearching && hasSearched && (
        <div className="space-y-6">
          {/* Diagnostic Note / Status Box */}
          {searchResponse?.search_status === 'unconfigured_key' && (
            <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Groq API Key Required for Live Browser Search</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                NammaSeve discovers schemes via live web search using Groq AI. Because the server secret <code>GROQ_API_KEY</code> has not been set yet, live discovery is currently paused.
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs font-mono text-slate-700">
                supabase secrets set GROQ_API_KEY="your_actual_groq_api_key"<br />
                supabase secrets set GROQ_MODEL="openai/gpt-oss-120b"
              </div>
              <p className="text-xs text-amber-700">
                In adherence to our strict zero-fabrication requirement, NammaSeve will never show fake sample schemes.
              </p>
            </div>
          )}

          {searchResponse?.search_status === 'browser_search_unavailable' && (
            <div className="p-6 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Groq Browser Search Tool Configuration</span>
              </div>
              <ul className="text-xs text-blue-800 space-y-1">
                {searchResponse.search_notes.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Result Filter Tabs & Counts */}
          {searchResults.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Schemes ({searchResults.length})
                </button>

                <button
                  onClick={() => setStatusFilter('potentially_eligible')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'potentially_eligible'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Potentially Eligible ({eligibleCount})
                </button>

                <button
                  onClick={() => setStatusFilter('insufficient_information')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'insufficient_information'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Needs More Info ({infoNeededCount})
                </button>

                {notEligibleCount > 0 && (
                  <button
                    onClick={() => setStatusFilter('not_eligible_based_on_verified_criteria')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === 'not_eligible_based_on_verified_criteria'
                        ? 'bg-slate-600 text-white border-slate-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Unmet Criteria ({notEligibleCount})
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {searchResponse?.cached ? '⚡ 24h Cached Evidence' : '🌐 Fresh Web Evidence'}
              </div>
            </div>
          )}

          {/* Zero Results Empty State */}
          {searchResults.length === 0 && searchResponse?.search_status !== 'unconfigured_key' && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                No Schemes Discovered For This Query
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                No active government schemes could be verified matching your current search terms. Try broadening your keywords (e.g. "scholarships", "housing", "farmer") or updating your citizen profile.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => { setKeywordQuery(''); handlePerformDiscovery(true); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Reset Query
                </button>
                <button
                  onClick={onOpenProfile}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Schemes Grid */}
          {filteredResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((scheme, i) => (
                <DiscoveredSchemeCard
                  key={i}
                  scheme={scheme}
                  isSaved={savedSchemeKeys.has(scheme.name)}
                  onToggleSave={onToggleSaveScheme}
                  onSelect={setSelectedScheme}
                  onExplain={setSelectedScheme}
                />
              ))}
            </div>
          )}

          {/* Civic Disclaimer Footer */}
          {searchResults.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed text-center max-w-3xl mx-auto">
              These are potential matches identified through live online research. Always review the official department website or notification to confirm statutory eligibility, application deadlines, and quota guidelines.
            </div>
          )}
        </div>
      )}

      {/* Initial Landing prompt if not yet searched */}
      {!hasSearched && !isSearching && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-saffron-50 text-saffron mx-auto flex items-center justify-center shadow-xs">
            <TreeLogo size="lg" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
              Start Your Personalized Welfare Discovery
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Click below to initiate live online discovery across Karnataka State and Central Government welfare schemes tailored to your profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handlePerformDiscovery(false)}
              className="px-6 py-3 bg-saffron text-white hover:bg-saffron-600 rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Search Government Sources Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateHowItWorks}
              className="px-5 py-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              How It Works
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DiscoveredSchemeDetailModal
        scheme={selectedScheme}
        profile={profile}
        isOpen={Boolean(selectedScheme)}
        onClose={() => setSelectedScheme(null)}
        isSaved={selectedScheme ? savedSchemeKeys.has(selectedScheme.name) : false}
        onToggleSave={onToggleSaveScheme}
      />
    </div>
  );
};

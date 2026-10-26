-- Migration 20261026000003: Add Live Search Cache, Search History, and Flexible Saved Schemes
-- Enables live web search scheme discovery without preloaded databases.
-- Preserves zero-preseeded schemes requirement.

-- 1. Search Result Cache (Transient caching of live Groq search evidence)
CREATE TABLE IF NOT EXISTS public.search_result_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) UNIQUE NOT NULL,
    search_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    keyword_query TEXT,
    results JSONB NOT NULL DEFAULT '[]'::jsonb,
    search_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON public.search_result_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expiry ON public.search_result_cache(expires_at);

-- 2. Search History (User-owned search records with minimal attributes)
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_summary TEXT NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    results_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON public.search_history(created_at DESC);

-- 3. Extend Saved Schemes to support both catalog schemes and live-discovered web schemes
ALTER TABLE public.saved_schemes ALTER COLUMN scheme_id DROP NOT NULL;
ALTER TABLE public.saved_schemes ADD COLUMN IF NOT EXISTS scheme_key TEXT;
ALTER TABLE public.saved_schemes ADD COLUMN IF NOT EXISTS scheme_data JSONB;

-- Ensure uniqueness per user for either scheme_id or scheme_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_schemes_user_key 
    ON public.saved_schemes (user_id, COALESCE(scheme_id::text, scheme_key));

-- 4. Enable RLS
ALTER TABLE public.search_result_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Search Result Cache Policies: Public can read valid cached searches
CREATE POLICY "Public can read search cache"
    ON public.search_result_cache FOR SELECT
    USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Service role can manage search cache"
    ON public.search_result_cache FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Search History Policies: Strict user ownership
CREATE POLICY "Users can view their own search history"
    ON public.search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
    ON public.search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
    ON public.search_history FOR DELETE
    USING (auth.uid() = user_id);

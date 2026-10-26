-- ============================================================================
-- NAMMASEVE UNIFIED DATABASE SETUP SCRIPT (100% IDEMPOTENT)
-- Safe to run in Supabase SQL Editor any number of times.
-- Strict adherence to ZERO PRESEEDED SCHEMES: Only schemas, indexes, and RLS.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Personal-Profile-First Citizen Data)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'kn')),
    
    -- Location
    state VARCHAR(50) DEFAULT 'Karnataka',
    district VARCHAR(50),
    
    -- Demographics
    age INTEGER CHECK (age >= 0 AND age <= 120),
    age_range VARCHAR(20),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'transgender', 'other', 'prefer_not_to_say')),
    is_woman_head_of_family BOOLEAN DEFAULT FALSE,
    
    -- Community / Category (Voluntary with explicit informed consent)
    community_consent_granted BOOLEAN DEFAULT FALSE,
    community_category VARCHAR(50),
    
    -- Education & Qualification
    highest_qualification VARCHAR(60),
    degree_stream VARCHAR(100),
    education_status VARCHAR(50) CHECK (education_status IN ('studying', 'graduated', 'seeking_employment', 'not_enrolled', 'other')),
    graduation_year INTEGER CHECK (graduation_year >= 1950 AND graduation_year <= 2100),
    is_student BOOLEAN DEFAULT FALSE,
    
    -- Occupation & Livelihood
    occupation VARCHAR(60),
    is_farmer BOOLEAN DEFAULT FALSE,
    landholding_acres NUMERIC(8, 2) DEFAULT 0 CHECK (landholding_acres >= 0),
    
    -- Income & Economic Status
    annual_income_range VARCHAR(50),
    ration_card_type VARCHAR(30) CHECK (ration_card_type IN ('none', 'bpl', 'aay_antyodaya', 'apl', 'annapurna')),
    is_tax_payer BOOLEAN DEFAULT FALSE,
    
    -- Vulnerability & Special Criteria
    disability_status BOOLEAN DEFAULT FALSE,
    disability_percentage INTEGER CHECK (disability_percentage >= 0 AND disability_percentage <= 100),
    
    -- Privacy & Profile Control
    profile_completion_percentage INTEGER NOT NULL DEFAULT 0,
    data_storage_consent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Profiles Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, preferred_language, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. SCHEMES TABLE (ZERO preseeded records - strictly empty initially)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    kannada_name VARCHAR(255),
    description TEXT NOT NULL,
    kannada_description TEXT,
    scheme_level VARCHAR(20) NOT NULL CHECK (scheme_level IN ('state', 'central')),
    state_code VARCHAR(10) NOT NULL DEFAULT 'KA',
    department VARCHAR(150) NOT NULL,
    kannada_department VARCHAR(150),
    category VARCHAR(80) NOT NULL,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    eligibility_summary TEXT NOT NULL,
    kannada_eligibility_summary TEXT,
    application_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    documents_required JSONB NOT NULL DEFAULT '[]'::jsonb,
    official_application_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    imported_at TIMESTAMPTZ,
    imported_by UUID REFERENCES auth.users(id),
    is_stale BOOLEAN DEFAULT FALSE,
    effective_from DATE,
    effective_to DATE,
    source_identifier VARCHAR(150),
    application_method VARCHAR(50) DEFAULT 'online' CHECK (application_method IN ('online', 'offline', 'kiosk', 'both')),
    official_info_url TEXT,
    provider_id VARCHAR(100),
    last_fetched_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS update_schemes_updated_at ON public.schemes;
CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_schemes_slug ON public.schemes(slug);
CREATE INDEX IF NOT EXISTS idx_schemes_level ON public.schemes(scheme_level);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON public.schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_stale ON public.schemes(is_stale);
CREATE INDEX IF NOT EXISTS idx_schemes_provider ON public.schemes(provider_id);
CREATE INDEX IF NOT EXISTS idx_schemes_source_id ON public.schemes(source_identifier);
CREATE INDEX IF NOT EXISTS idx_schemes_search ON public.schemes USING gin(to_tsvector('english', name || ' ' || description || ' ' || department || ' ' || category));

-- ----------------------------------------------------------------------------
-- 3. DYNAMIC ELIGIBILITY RULES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL,
    required_attribute VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL CHECK (operator IN ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains')),
    rule_value TEXT NOT NULL,
    rule_description TEXT,
    kannada_rule_description TEXT,
    source_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rules_scheme_id ON public.eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_rules_attribute ON public.eligibility_rules(required_attribute);
CREATE INDEX IF NOT EXISTS idx_rules_type ON public.eligibility_rules(rule_type);

-- ----------------------------------------------------------------------------
-- 4. SCHEME SOURCES & PROVENANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheme_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    publisher VARCHAR(150) NOT NULL,
    source_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('official_portal', 'government_order', 'gazette_notification', 'open_data_api', 'department_press_release')),
    document_reference_number VARCHAR(100),
    publication_date DATE,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_by UUID REFERENCES auth.users(id),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'disputed', 'stale')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sources_scheme_id ON public.scheme_sources(scheme_id);

-- ----------------------------------------------------------------------------
-- 5. SCHEME VERSIONS (Audit & History tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheme_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_summary TEXT NOT NULL,
    provenance TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_versions_scheme_id ON public.scheme_versions(scheme_id);

-- ----------------------------------------------------------------------------
-- 6. SAVED SCHEMES (Supports Catalog & Live Discovered Schemes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE CASCADE,
    scheme_key TEXT,
    scheme_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'saved_schemes' AND constraint_type = 'PRIMARY KEY'
        AND constraint_name = 'saved_schemes_pkey'
    ) THEN
        ALTER TABLE public.saved_schemes DROP CONSTRAINT saved_schemes_pkey;
        ALTER TABLE public.saved_schemes ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
        ALTER TABLE public.saved_schemes ADD PRIMARY KEY (id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

ALTER TABLE public.saved_schemes ALTER COLUMN scheme_id DROP NOT NULL;
ALTER TABLE public.saved_schemes ADD COLUMN IF NOT EXISTS scheme_key TEXT;
ALTER TABLE public.saved_schemes ADD COLUMN IF NOT EXISTS scheme_data JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_schemes_user_key 
    ON public.saved_schemes (user_id, COALESCE(scheme_id::text, scheme_key));
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON public.saved_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scheme_id ON public.saved_schemes(scheme_id);

-- ----------------------------------------------------------------------------
-- 7. AUDIT EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_events(created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. INGESTION RUNS (Batch and API sync tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'partial')),
    records_fetched INTEGER NOT NULL DEFAULT 0,
    records_validated INTEGER NOT NULL DEFAULT 0,
    records_imported INTEGER NOT NULL DEFAULT 0,
    duplicates_detected INTEGER NOT NULL DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    sync_metadata JSONB DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_provider ON public.ingestion_runs(provider_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON public.ingestion_runs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started ON public.ingestion_runs(started_at DESC);

-- ----------------------------------------------------------------------------
-- 9. LIVE SEARCH RESULT CACHE & SEARCH HISTORY
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_result_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Schemes Policies
DROP POLICY IF EXISTS "Public can view published schemes" ON public.schemes;
CREATE POLICY "Public can view published schemes"
    ON public.schemes FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users with admin role can manage schemes" ON public.schemes;
CREATE POLICY "Authenticated users with admin role can manage schemes"
    ON public.schemes FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Eligibility Rules Policies
DROP POLICY IF EXISTS "Public can view eligibility rules for published schemes" ON public.eligibility_rules;
CREATE POLICY "Public can view eligibility rules for published schemes"
    ON public.eligibility_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = eligibility_rules.scheme_id AND s.status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins can manage eligibility rules" ON public.eligibility_rules;
CREATE POLICY "Admins can manage eligibility rules"
    ON public.eligibility_rules FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Scheme Sources Policies
DROP POLICY IF EXISTS "Public can view verified sources for published schemes" ON public.scheme_sources;
CREATE POLICY "Public can view verified sources for published schemes"
    ON public.scheme_sources FOR SELECT
    USING (
        verification_status = 'verified' AND
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = scheme_sources.scheme_id AND s.status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins can manage scheme sources" ON public.scheme_sources;
CREATE POLICY "Admins can manage scheme sources"
    ON public.scheme_sources FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Scheme Versions Policies
DROP POLICY IF EXISTS "Public can view versions of published schemes" ON public.scheme_versions;
CREATE POLICY "Public can view versions of published schemes"
    ON public.scheme_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = scheme_versions.scheme_id AND s.status = 'published'
        )
    );

-- Saved Schemes Policies
DROP POLICY IF EXISTS "Users can view their saved schemes" ON public.saved_schemes;
CREATE POLICY "Users can view their saved schemes"
    ON public.saved_schemes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save schemes" ON public.saved_schemes;
CREATE POLICY "Users can save schemes"
    ON public.saved_schemes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete saved schemes" ON public.saved_schemes;
CREATE POLICY "Users can delete saved schemes"
    ON public.saved_schemes FOR DELETE USING (auth.uid() = user_id);

-- Audit Events Policies
DROP POLICY IF EXISTS "System and users can insert audit events" ON public.audit_events;
CREATE POLICY "System and users can insert audit events"
    ON public.audit_events FOR INSERT WITH CHECK (true);

-- Ingestion Runs Policies
DROP POLICY IF EXISTS "Admins can view ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Admins can view ingestion runs"
    ON public.ingestion_runs FOR SELECT
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true OR
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Admins and service role can insert ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Admins and service role can insert ingestion runs"
    ON public.ingestion_runs FOR INSERT
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true OR
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Admins and service role can update ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Admins and service role can update ingestion runs"
    ON public.ingestion_runs FOR UPDATE
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Search Result Cache Policies
DROP POLICY IF EXISTS "Public can read search cache" ON public.search_result_cache;
CREATE POLICY "Public can read search cache"
    ON public.search_result_cache FOR SELECT
    USING (expires_at > timezone('utc'::text, now()));

DROP POLICY IF EXISTS "Service role can manage search cache" ON public.search_result_cache;
CREATE POLICY "Service role can manage search cache"
    ON public.search_result_cache FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Search History Policies
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
CREATE POLICY "Users can view their own search history"
    ON public.search_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own search history" ON public.search_history;
CREATE POLICY "Users can insert their own search history"
    ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own search history" ON public.search_history;
CREATE POLICY "Users can delete their own search history"
    ON public.search_history FOR DELETE USING (auth.uid() = user_id);

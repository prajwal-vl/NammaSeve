-- Migration 20261026000001: Initial Schema for NammaSeve
-- ZERO PRESEEDED SCHEMES: Starts with a completely empty database.
-- Personal-profile-first architecture with strict privacy controls, dynamic rules, and RLS.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table: Personal-Profile-First citizen data
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
    community_category VARCHAR(50), -- 'general', 'obc', 'sc', 'st', 'minority', 'prefer_not_to_say'
    
    -- Education & Qualification
    highest_qualification VARCHAR(60), -- 'primary', 'secondary_10th', 'higher_secondary_12th_puc', 'diploma', 'undergraduate', 'postgraduate', 'doctorate', 'none'
    degree_stream VARCHAR(100), -- 'Arts', 'Science', 'Commerce', 'Engineering', 'Medicine', etc.
    education_status VARCHAR(50) CHECK (education_status IN ('studying', 'graduated', 'seeking_employment', 'not_enrolled', 'other')),
    graduation_year INTEGER CHECK (graduation_year >= 1950 AND graduation_year <= 2100),
    is_student BOOLEAN DEFAULT FALSE,
    
    -- Occupation & Livelihood
    occupation VARCHAR(60), -- 'unemployed', 'salaried_private', 'government_employee', 'self_employed', 'farmer', 'daily_wage', 'homemaker', 'student', 'retired', 'other'
    is_farmer BOOLEAN DEFAULT FALSE,
    landholding_acres NUMERIC(8, 2) DEFAULT 0 CHECK (landholding_acres >= 0),
    
    -- Income & Economic Status
    annual_income_range VARCHAR(50), -- 'below_1_lakh', '1_to_2.5_lakh', '2.5_to_5_lakh', '5_to_8_lakh', 'above_8_lakh'
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

-- Trigger to auto-update profiles.updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically create an empty profile record when a user signs up
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

-- 2. Schemes Table (ZERO preseeded rows - strictly empty at start)
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Search indexes for schemes
CREATE INDEX IF NOT EXISTS idx_schemes_slug ON public.schemes(slug);
CREATE INDEX IF NOT EXISTS idx_schemes_level ON public.schemes(scheme_level);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON public.schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_search ON public.schemes USING gin(to_tsvector('english', name || ' ' || description || ' ' || department || ' ' || category));

-- 3. Dynamic Eligibility Rules Table (ZERO preseeded rows)
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'state', 'district', 'min_age', 'max_age', 'gender',
        'community_category', 'highest_qualification', 'education_status',
        'occupation', 'is_farmer', 'is_student', 'is_woman_head_of_family',
        'ration_card_type', 'annual_income_max', 'disability_required', 'is_tax_payer'
    )),
    required_attribute VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL CHECK (operator IN ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains')),
    rule_value TEXT NOT NULL,
    source_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rules_scheme_id ON public.eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_rules_rule_type ON public.eligibility_rules(rule_type);

-- 4. Scheme Sources Table (ZERO preseeded rows)
CREATE TABLE IF NOT EXISTS public.scheme_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    publisher VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('official_portal', 'gazette', 'ministry_site', 'department_order')),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'stale', 'unverified')),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    content_hash VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sources_scheme_id ON public.scheme_sources(scheme_id);
CREATE INDEX IF NOT EXISTS idx_sources_status ON public.scheme_sources(verification_status);

-- 5. Scheme Versions Table (Provenance & Change tracking)
CREATE TABLE IF NOT EXISTS public.scheme_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_summary TEXT NOT NULL,
    provenance TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_versions_scheme_id ON public.scheme_versions(scheme_id);

-- 6. Saved Schemes Table
CREATE TABLE IF NOT EXISTS public.saved_schemes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_user_id ON public.saved_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scheme_id ON public.saved_schemes(scheme_id);

-- 7. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_events(created_at DESC);

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

-- 1. Profiles Policies (Strict user ownership)
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- 2. Schemes Policies (Public read for published; insert/update restricted)
CREATE POLICY "Public can view published schemes"
    ON public.schemes FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authenticated users with admin role can manage schemes"
    ON public.schemes FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- 3. Eligibility Rules Policies
CREATE POLICY "Public can view eligibility rules for published schemes"
    ON public.eligibility_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = eligibility_rules.scheme_id
            AND s.status = 'published'
        )
    );

CREATE POLICY "Admins can manage eligibility rules"
    ON public.eligibility_rules FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- 4. Scheme Sources Policies
CREATE POLICY "Public can view verified sources for published schemes"
    ON public.scheme_sources FOR SELECT
    USING (
        verification_status = 'verified' AND
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = scheme_sources.scheme_id
            AND s.status = 'published'
        )
    );

CREATE POLICY "Admins can manage scheme sources"
    ON public.scheme_sources FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- 5. Scheme Versions Policies
CREATE POLICY "Public can view versions of published schemes"
    ON public.scheme_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes s
            WHERE s.id = scheme_versions.scheme_id
            AND s.status = 'published'
        )
    );

-- 6. Saved Schemes Policies
CREATE POLICY "Users can view their saved schemes"
    ON public.saved_schemes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save schemes"
    ON public.saved_schemes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete saved schemes"
    ON public.saved_schemes FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Audit Events Policies
CREATE POLICY "System and users can insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (true);

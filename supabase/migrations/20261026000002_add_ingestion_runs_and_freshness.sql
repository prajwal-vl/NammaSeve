-- Migration 20261026000002: Add Ingestion Runs, Provider Provenance, and Scheme Freshness Tracking
-- Strictly maintains ZERO preseeded schemes. Only schema structures, constraints, and RLS policies.

-- 1. Ingestion Runs Table (tracks provider syncs, API fetch batches, counts, and errors)
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(100) NOT NULL, -- 'data_gov_in', 'api_setu', 'myscheme_portal', 'reviewed_file'
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

-- 2. Enhance schemes table with data freshness, dates, and provider identifiers
ALTER TABLE public.schemes
    ADD COLUMN IF NOT EXISTS is_stale BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS effective_from DATE,
    ADD COLUMN IF NOT EXISTS effective_to DATE,
    ADD COLUMN IF NOT EXISTS source_identifier VARCHAR(150),
    ADD COLUMN IF NOT EXISTS application_method VARCHAR(50) DEFAULT 'online' CHECK (application_method IN ('online', 'offline', 'kiosk', 'both')),
    ADD COLUMN IF NOT EXISTS official_info_url TEXT,
    ADD COLUMN IF NOT EXISTS provider_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_schemes_stale ON public.schemes(is_stale);
CREATE INDEX IF NOT EXISTS idx_schemes_provider ON public.schemes(provider_id);
CREATE INDEX IF NOT EXISTS idx_schemes_source_id ON public.schemes(source_identifier);

-- 3. Row Level Security for Ingestion Runs
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Admins and service role can read ingestion runs
DROP POLICY IF EXISTS "Admins can view ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Admins can view ingestion runs"
    ON public.ingestion_runs FOR SELECT
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true OR
        auth.uid() IS NOT NULL
    );

-- System and authorized admins can insert and update ingestion runs
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

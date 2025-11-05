-- Migration: global_foods_api_tables
-- Created at: 1762274914

-- API configurations table
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  base_url TEXT NOT NULL,
  rate_limit_per_hour INTEGER,
  rate_limit_per_minute INTEGER,
  is_enabled BOOLEAN DEFAULT true,
  last_request_at TIMESTAMPTZ,
  request_count_hour INTEGER DEFAULT 0,
  request_count_minute INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API request cache
CREATE TABLE IF NOT EXISTS public.api_request_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  api_name TEXT NOT NULL REFERENCES public.api_configurations(api_name),
  response_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food import jobs
CREATE TABLE IF NOT EXISTS public.food_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  api_source TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  success_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);;
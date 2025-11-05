-- ============================================================================
-- GLOBAL FOOD DATABASE SCHEMA
-- Comprehensive food nutrition database supporting foods from around the world
-- ============================================================================

-- Main global foods table (replaces nepal_food_composition with backwards compatibility)
CREATE TABLE IF NOT EXISTS public.global_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id TEXT UNIQUE NOT NULL, -- Unique identifier (can be USDA fdc_id, OFF barcode, or custom)
  name TEXT NOT NULL, -- Primary display name
  alternative_names TEXT[], -- Local names, scientific names, common names
  category TEXT NOT NULL, -- fruits, vegetables, grains, dairy, proteins, beverages, snacks, etc.
  subcategory TEXT, -- More specific classification
  food_group TEXT, -- USDA food groups
  origin_country TEXT, -- Country of origin
  origin_region TEXT, -- Region (e.g., South Asia, Mediterranean, etc.)
  description TEXT,
  
  -- Nutritional data (per 100g)
  energy_kcal FLOAT,
  protein_g FLOAT,
  carbohydrate_g FLOAT,
  total_fat_g FLOAT,
  dietary_fiber_g FLOAT,
  total_sugar_g FLOAT,
  
  -- Micronutrients
  vitamin_a_ug FLOAT,
  vitamin_c_mg FLOAT,
  vitamin_d_ug FLOAT,
  vitamin_e_mg FLOAT,
  vitamin_k_ug FLOAT,
  thiamin_b1_mg FLOAT,
  riboflavin_b2_mg FLOAT,
  niacin_b3_mg FLOAT,
  vitamin_b6_mg FLOAT,
  folate_b9_ug FLOAT,
  vitamin_b12_ug FLOAT,
  
  -- Minerals
  calcium_mg FLOAT,
  iron_mg FLOAT,
  magnesium_mg FLOAT,
  phosphorus_mg FLOAT,
  potassium_mg FLOAT,
  sodium_mg FLOAT,
  zinc_mg FLOAT,
  copper_mg FLOAT,
  manganese_mg FLOAT,
  selenium_ug FLOAT,
  
  -- Fats breakdown
  saturated_fat_g FLOAT,
  monounsaturated_fat_g FLOAT,
  polyunsaturated_fat_g FLOAT,
  trans_fat_g FLOAT,
  cholesterol_mg FLOAT,
  
  -- Additional data
  water_g FLOAT,
  ash_g FLOAT,
  caffeine_mg FLOAT,
  alcohol_g FLOAT,
  
  -- Metadata
  data_source TEXT NOT NULL, -- USDA, OpenFoodFacts, Manual, Legacy_Nepal
  source_id TEXT, -- Original ID from data source
  image_url TEXT,
  barcode TEXT, -- For packaged foods
  brand TEXT, -- Brand name if applicable
  serving_size_g FLOAT, -- Default serving size
  is_verified BOOLEAN DEFAULT false, -- Admin verified data quality
  popularity_score INTEGER DEFAULT 0, -- Usage frequency
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhanced portion mappings
CREATE TABLE IF NOT EXISTS public.global_food_portions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id TEXT NOT NULL REFERENCES global_foods(food_id) ON DELETE CASCADE,
  portion_name TEXT NOT NULL, -- e.g., "1 cup", "1 medium apple", "100g"
  portion_size_g FLOAT NOT NULL, -- Weight in grams
  is_standard BOOLEAN DEFAULT false, -- Standard metric portions (100g, 1kg, etc.)
  region TEXT, -- Region-specific portions (e.g., "US", "Metric", "Nepal")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Food categories master table
CREATE TABLE IF NOT EXISTS public.food_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  parent_category TEXT, -- For hierarchical categories
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User favorite foods
CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id TEXT NOT NULL REFERENCES global_foods(food_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, food_id)
);

-- User food search history
CREATE TABLE IF NOT EXISTS public.user_food_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id TEXT NOT NULL REFERENCES global_foods(food_id) ON DELETE CASCADE,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, food_id)
);

-- Custom foods created by users
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  energy_kcal FLOAT,
  protein_g FLOAT,
  carbohydrate_g FLOAT,
  total_fat_g FLOAT,
  dietary_fiber_g FLOAT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- API configuration and rate limiting
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name TEXT NOT NULL UNIQUE, -- USDA, OpenFoodFacts, Edamam, etc.
  api_key TEXT, -- Encrypted API key
  base_url TEXT NOT NULL,
  rate_limit_per_hour INTEGER,
  rate_limit_per_minute INTEGER,
  is_enabled BOOLEAN DEFAULT true,
  last_request_at TIMESTAMP WITH TIME ZONE,
  request_count_hour INTEGER DEFAULT 0,
  request_count_minute INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- API request cache
CREATE TABLE IF NOT EXISTS public.api_request_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name TEXT NOT NULL,
  request_key TEXT NOT NULL, -- Hash of request parameters
  response_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(api_name, request_key)
);

-- Food import jobs (for tracking bulk imports)
CREATE TABLE IF NOT EXISTS public.food_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  api_source TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.global_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_food_portions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Global foods - public read
DROP POLICY IF EXISTS "Allow public read access for global_foods" ON public.global_foods;
CREATE POLICY "Allow public read access for global_foods"
  ON public.global_foods FOR SELECT
  TO public USING (true);

-- Global food portions - public read
DROP POLICY IF EXISTS "Allow public read access for global_food_portions" ON public.global_food_portions;
CREATE POLICY "Allow public read access for global_food_portions"
  ON public.global_food_portions FOR SELECT
  TO public USING (true);

-- Food categories - public read
DROP POLICY IF EXISTS "Allow public read access for food_categories" ON public.food_categories;
CREATE POLICY "Allow public read access for food_categories"
  ON public.food_categories FOR SELECT
  TO public USING (true);

-- User favorite foods - user-specific
DROP POLICY IF EXISTS "Users can manage their own favorite foods" ON public.user_favorite_foods;
CREATE POLICY "Users can manage their own favorite foods"
  ON public.user_favorite_foods
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User food history - user-specific
DROP POLICY IF EXISTS "Users can manage their own food history" ON public.user_food_history;
CREATE POLICY "Users can manage their own food history"
  ON public.user_food_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Custom foods - user-specific or public
DROP POLICY IF EXISTS "Users can manage their own custom foods" ON public.custom_foods;
CREATE POLICY "Users can manage their own custom foods"
  ON public.custom_foods
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public custom foods" ON public.custom_foods;
CREATE POLICY "Users can view public custom foods"
  ON public.custom_foods
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- API configurations - admin only (authenticated users can read)
DROP POLICY IF EXISTS "Authenticated users can read API configurations" ON public.api_configurations;
CREATE POLICY "Authenticated users can read API configurations"
  ON public.api_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- API request cache - public read
DROP POLICY IF EXISTS "Allow public read access for api_request_cache" ON public.api_request_cache;
CREATE POLICY "Allow public read access for api_request_cache"
  ON public.api_request_cache FOR SELECT
  TO public USING (true);

-- Food import jobs - authenticated users can read own jobs
DROP POLICY IF EXISTS "Users can read their own import jobs" ON public.food_import_jobs;
CREATE POLICY "Users can read their own import jobs"
  ON public.food_import_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by OR created_by IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_foods_category ON public.global_foods(category);
CREATE INDEX IF NOT EXISTS idx_global_foods_origin_country ON public.global_foods(origin_country);
CREATE INDEX IF NOT EXISTS idx_global_foods_data_source ON public.global_foods(data_source);
CREATE INDEX IF NOT EXISTS idx_global_foods_name ON public.global_foods USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_global_foods_alternative_names ON public.global_foods USING gin(alternative_names);
CREATE INDEX IF NOT EXISTS idx_global_foods_popularity ON public.global_foods(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_global_foods_food_id ON public.global_foods(food_id);

CREATE INDEX IF NOT EXISTS idx_global_food_portions_food_id ON public.global_food_portions(food_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_foods_user_id ON public.user_favorite_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_food_history_user_id ON public.user_food_history(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_user_id ON public.custom_foods(user_id);

CREATE INDEX IF NOT EXISTS idx_api_request_cache_lookup ON public.api_request_cache(api_name, request_key);
CREATE INDEX IF NOT EXISTS idx_api_request_cache_expires ON public.api_request_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_food_import_jobs_status ON public.food_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_food_import_jobs_created_by ON public.food_import_jobs(created_by);

-- ============================================================================
-- SEED DATA: Food Categories
-- ============================================================================

INSERT INTO public.food_categories (name, parent_category, description, icon, color, display_order) VALUES
('Fruits', NULL, 'Fresh and dried fruits from around the world', 'apple', '#ef4444', 1),
('Vegetables', NULL, 'All types of vegetables and greens', 'carrot', '#22c55e', 2),
('Grains & Cereals', NULL, 'Rice, wheat, oats, and other grains', 'wheat', '#f59e0b', 3),
('Dairy & Eggs', NULL, 'Milk, cheese, yogurt, and egg products', 'milk', '#3b82f6', 4),
('Meat & Poultry', NULL, 'Beef, chicken, pork, and other meats', 'beef', '#dc2626', 5),
('Seafood', NULL, 'Fish, shellfish, and aquatic foods', 'fish', '#06b6d4', 6),
('Legumes & Nuts', NULL, 'Beans, lentils, nuts, and seeds', 'nut', '#a16207', 7),
('Beverages', NULL, 'Drinks and liquid refreshments', 'cup-soda', '#8b5cf6', 8),
('Oils & Fats', NULL, 'Cooking oils, butter, and fats', 'droplet', '#eab308', 9),
('Snacks & Sweets', NULL, 'Processed snacks and sweet treats', 'candy', '#ec4899', 10),
('Herbs & Spices', NULL, 'Seasonings and flavorings', 'leaf', '#10b981', 11),
('Prepared Foods', NULL, 'Ready-to-eat and processed foods', 'utensils', '#6b7280', 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: API Configurations (Default setup - keys to be added by user)
-- ============================================================================

INSERT INTO public.api_configurations (api_name, base_url, rate_limit_per_hour, rate_limit_per_minute, is_enabled) VALUES
('USDA_FoodData_Central', 'https://api.nal.usda.gov/fdc/v1', 1000, 60, false), -- Disabled until API key added
('Open_Food_Facts', 'https://world.openfoodfacts.org', NULL, 100, true) -- No API key required
ON CONFLICT (api_name) DO NOTHING;

-- ============================================================================
-- DATA MIGRATION: Migrate existing Nepal food data to global_foods table
-- ============================================================================

-- Note: This migration should be run AFTER the global_foods table is created
-- and BEFORE dropping the old nepal_food_composition table

-- Example migration (adjust field mappings as needed):
/*
INSERT INTO public.global_foods (
  food_id, name, category, origin_country, origin_region,
  energy_kcal, protein_g, carbohydrate_g, total_fat_g, dietary_fiber_g,
  calcium_mg, iron_mg, vitamin_a_ug, vitamin_c_mg,
  data_source, is_verified
)
SELECT 
  'NEPAL_' || id::text as food_id,
  food_name as name,
  food_group as category,
  'Nepal' as origin_country,
  'South Asia' as origin_region,
  energy_kcal,
  protein_g,
  carbohydrate_g,
  total_fat_g,
  fiber_g as dietary_fiber_g,
  calcium_mg,
  iron_mg,
  vitamin_a_ug,
  vitamin_c_mg,
  'Legacy_Nepal' as data_source,
  true as is_verified
FROM public.nepal_food_composition
ON CONFLICT (food_id) DO NOTHING;

-- Migrate portion mappings
INSERT INTO public.global_food_portions (food_id, portion_name, portion_size_g, region)
SELECT 
  'NEPAL_' || food_id::text,
  portion_description,
  weight_g,
  'Nepal'
FROM public.food_portions
ON CONFLICT DO NOTHING;
*/

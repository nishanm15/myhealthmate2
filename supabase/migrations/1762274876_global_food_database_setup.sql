-- Migration: global_food_database_setup
-- Created at: 1762274876

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
  cholesterol_mg FLOAT,
  
  -- Other nutrients
  caffeine_mg FLOAT,
  alcohol_g FLOAT,
  water_g FLOAT,
  ash_g FLOAT,
  
  -- Data source information
  data_source TEXT, -- USDA, OpenFoodFacts, Custom, etc.
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast search
CREATE INDEX IF NOT EXISTS idx_global_foods_name ON public.global_foods USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_global_foods_category ON public.global_foods(category);
CREATE INDEX IF NOT EXISTS idx_global_foods_food_id ON public.global_foods(food_id);

-- ============================================================================
-- GLOBAL FOOD PORTIONS TABLE
-- Standardized portion sizes and conversions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.global_food_portions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID REFERENCES public.global_foods(id) ON DELETE CASCADE,
  portion_name TEXT NOT NULL, -- e.g., "cup", "piece", "tablespoon"
  portion_amount FLOAT NOT NULL, -- Amount in grams
  portion_unit TEXT NOT NULL, -- g, ml, piece, cup, tbsp, tsp
  description TEXT, -- Human readable description
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOOD CATEGORIES TABLE
-- Hierarchical food categorization system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  parent_category TEXT, -- For hierarchical categories
  description TEXT,
  icon TEXT, -- Icon class or name
  color TEXT, -- Color code for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default food categories
INSERT INTO public.food_categories (name, parent_category, description, icon, color) VALUES
('Fruits', NULL, 'Fresh and dried fruits', '🍎', '#ff6b6b'),
('Vegetables', NULL, 'All types of vegetables', '🥬', '#4ecdc4'),
('Grains & Cereals', NULL, 'Grains, cereals, and grain products', '🌾', '#ffe66d'),
('Dairy Products', NULL, 'Milk, cheese, yogurt, and dairy alternatives', '🥛', '#a8e6cf'),
('Proteins', NULL, 'Meat, fish, eggs, legumes, and protein sources', '🥩', '#ffaaa5'),
('Beverages', NULL, 'Drinks, juices, teas, and coffee', '🧃', '#74b9ff'),
('Snacks', NULL, 'Processed and packaged snacks', '🍿', '#fdcb6e'),
('Sweets & Desserts', NULL, 'Sweet foods and desserts', '🍰', '#fd79a8'),
('Oils & Fats', NULL, 'Cooking oils, butter, and fats', '🫒', '#6c5ce7'),
('Herbs & Spices', NULL, 'Herbs, spices, and seasonings', '🌿', '#00b894'),
('Nuts & Seeds', NULL, 'Nuts, seeds, and nut butters', '🥜', '#a29bfe'),
('Condiments & Sauces', NULL, 'Sauces, condiments, and dressings', '🧂', '#636e72')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- USER FAVORITE FOODS TABLE
-- Track user food preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.global_foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);

-- ============================================================================
-- USER FOOD HISTORY TABLE
-- Track user food searches and consumption
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_food_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.global_foods(id) ON DELETE SET NULL,
  search_query TEXT, -- The search that led to this food
  frequency INTEGER DEFAULT 1, -- How many times searched
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CUSTOM FOODS TABLE
-- Allow users to create their own food entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  -- Nutritional data (per 100g)
  energy_kcal FLOAT,
  protein_g FLOAT,
  carbohydrate_g FLOAT,
  total_fat_g FLOAT,
  dietary_fiber_g FLOAT,
  total_sugar_g FLOAT,
  vitamin_c_mg FLOAT,
  iron_mg FLOAT,
  calcium_mg FLOAT,
  sodium_mg FLOAT,
  is_public BOOLEAN DEFAULT FALSE, -- Allow sharing with other users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- API CONFIGURATIONS TABLE
-- Store API keys and settings for external food APIs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name TEXT UNIQUE NOT NULL, -- 'USDA', 'OpenFoodFacts', etc.
  api_endpoint TEXT NOT NULL,
  api_key_encrypted TEXT, -- Encrypted API key
  rate_limit_per_hour INTEGER,
  rate_limit_per_minute INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  configuration JSONB, -- Additional configuration as JSON
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default API configurations
INSERT INTO public.api_configurations (api_name, api_endpoint, configuration, is_active) VALUES
('USDA', 'https://api.nal.usda.gov/fdc/v1/foods/search', '{"search_fields": ["description", "brandOwner", "ingredients"], "pageSize": 200}', TRUE),
('OpenFoodFacts', 'https://world.openfoodfacts.org/cgi/search.pl', '{"action": "process", "json": "1", "page_size": 100}', TRUE)
ON CONFLICT (api_name) DO NOTHING;

-- ============================================================================
-- API REQUEST CACHE TABLE
-- Cache API responses to avoid rate limits
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_request_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL, -- Hash of request parameters
  api_name TEXT NOT NULL REFERENCES public.api_configurations(api_name),
  response_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOOD IMPORT JOBS TABLE
-- Track bulk import operations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  api_source TEXT NOT NULL, -- 'USDA', 'OpenFoodFacts', etc.
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  success_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES FOR USER DATA
-- ============================================================================

-- Enable RLS on user-related tables
ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- User favorite foods policies
CREATE POLICY "Users can view their own favorite foods" ON public.user_favorite_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite foods" ON public.user_favorite_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite foods" ON public.user_favorite_foods
  FOR DELETE USING (auth.uid() = user_id);

-- User food history policies
CREATE POLICY "Users can view their own food history" ON public.user_food_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food history" ON public.user_food_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food history" ON public.user_food_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Custom foods policies
CREATE POLICY "Users can view their own custom foods" ON public.custom_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public custom foods" ON public.custom_foods
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert their own custom foods" ON public.custom_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods" ON public.custom_foods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods" ON public.custom_foods
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR EASY QUERIES
-- ============================================================================

-- Popular foods view (based on search history)
CREATE OR REPLACE VIEW public.popular_foods AS
SELECT 
  gf.id,
  gf.food_id,
  gf.name,
  gf.category,
  gf.origin_country,
  gf.data_source,
  COALESCE(frequency, 0) as search_frequency
FROM public.global_foods gf
LEFT JOIN (
  SELECT food_id, SUM(frequency) as frequency
  FROM public.user_food_history
  GROUP BY food_id
) uh ON gf.id = uh.food_id
ORDER BY search_frequency DESC NULLS LAST, gf.name;

-- Foods with complete nutritional data
CREATE OR REPLACE VIEW public.complete_foods AS
SELECT *
FROM public.global_foods
WHERE energy_kcal IS NOT NULL
  AND protein_g IS NOT NULL
  AND carbohydrate_g IS NOT NULL
  AND total_fat_g IS NOT NULL;;
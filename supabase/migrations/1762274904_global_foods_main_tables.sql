-- Migration: global_foods_main_tables
-- Created at: 1762274904

-- Create main global foods table
CREATE TABLE IF NOT EXISTS public.global_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  alternative_names TEXT[],
  category TEXT NOT NULL,
  subcategory TEXT,
  food_group TEXT,
  origin_country TEXT,
  origin_region TEXT,
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
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create supporting tables
CREATE TABLE IF NOT EXISTS public.global_food_portions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID REFERENCES public.global_foods(id) ON DELETE CASCADE,
  portion_name TEXT NOT NULL,
  portion_amount FLOAT NOT NULL,
  portion_unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.food_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  parent_category TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.global_foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);

CREATE TABLE IF NOT EXISTS public.user_food_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.global_foods(id) ON DELETE SET NULL,
  search_query TEXT,
  frequency INTEGER DEFAULT 1,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
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
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_global_foods_name ON public.global_foods USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_global_foods_category ON public.global_foods(category);
CREATE INDEX IF NOT EXISTS idx_global_foods_food_id ON public.global_foods(food_id);;
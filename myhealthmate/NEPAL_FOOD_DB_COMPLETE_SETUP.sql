-- Complete Nepal Food Database Setup (Handles existing tables/policies)
-- Run this SQL in your Supabase SQL Editor - it will handle everything

-- Create Nepal Food Composition Table (if not exists)
CREATE TABLE IF NOT EXISTS public.nepal_food_composition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_name TEXT NOT NULL UNIQUE,
  calories_per_100g FLOAT NOT NULL,
  protein_per_100g FLOAT NOT NULL,
  fat_per_100g FLOAT NOT NULL,
  carbs_per_100g FLOAT NOT NULL,
  fiber_per_100g FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Food Portions Table (if not exists)
CREATE TABLE IF NOT EXISTS public.food_portions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_name TEXT NOT NULL,
  portion_name TEXT NOT NULL,
  grams FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Exercise MET Values Table (if not exists)
CREATE TABLE IF NOT EXISTS public.exercise_met_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_name TEXT NOT NULL UNIQUE,
  met FLOAT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.nepal_food_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_portions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_met_values ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if they exist) to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access for nepal_food_composition" ON public.nepal_food_composition;
DROP POLICY IF EXISTS "Allow public read access for food_portions" ON public.food_portions;
DROP POLICY IF EXISTS "Allow public read access for exercise_met_values" ON public.exercise_met_values;
DROP POLICY IF EXISTS "Allow public insert for nepal_food_composition" ON public.nepal_food_composition;
DROP POLICY IF EXISTS "Allow public insert for food_portions" ON public.food_portions;
DROP POLICY IF EXISTS "Allow public insert for exercise_met_values" ON public.exercise_met_values;
DROP POLICY IF EXISTS "Allow public update for nepal_food_composition" ON public.nepal_food_composition;
DROP POLICY IF EXISTS "Allow public update for food_portions" ON public.food_portions;
DROP POLICY IF EXISTS "Allow public update for exercise_met_values" ON public.exercise_met_values;
DROP POLICY IF EXISTS "Allow public delete for nepal_food_composition" ON public.nepal_food_composition;
DROP POLICY IF EXISTS "Allow public delete for food_portions" ON public.food_portions;
DROP POLICY IF EXISTS "Allow public delete for exercise_met_values" ON public.exercise_met_values;

-- Create comprehensive policies for nepal_food_composition
CREATE POLICY "Public read access for nepal_food_composition"
  ON public.nepal_food_composition FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for nepal_food_composition"
  ON public.nepal_food_composition FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for nepal_food_composition"
  ON public.nepal_food_composition FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for nepal_food_composition"
  ON public.nepal_food_composition FOR DELETE
  TO public
  USING (true);

-- Create comprehensive policies for food_portions
CREATE POLICY "Public read access for food_portions"
  ON public.food_portions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for food_portions"
  ON public.food_portions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for food_portions"
  ON public.food_portions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for food_portions"
  ON public.food_portions FOR DELETE
  TO public
  USING (true);

-- Create comprehensive policies for exercise_met_values
CREATE POLICY "Public read access for exercise_met_values"
  ON public.exercise_met_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for exercise_met_values"
  ON public.exercise_met_values FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for exercise_met_values"
  ON public.exercise_met_values FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for exercise_met_values"
  ON public.exercise_met_values FOR DELETE
  TO public
  USING (true);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_nepal_food_composition_food_name ON public.nepal_food_composition(food_name);
CREATE INDEX IF NOT EXISTS idx_food_portions_food_name ON public.food_portions(food_name);
CREATE INDEX IF NOT EXISTS idx_exercise_met_values_activity_name ON public.exercise_met_values(activity_name);

-- Verify setup
SELECT 'Tables and policies created successfully!' as status;
-- Add INSERT and UPDATE policies for Nepal Food Database tables
-- Run this SQL after creating the tables to allow data initialization

-- Enable INSERT policy for nepal_food_composition
CREATE POLICY "Allow public insert for nepal_food_composition"
  ON public.nepal_food_composition FOR INSERT
  TO public
  WITH CHECK (true);

-- Enable UPDATE policy for nepal_food_composition
CREATE POLICY "Allow public update for nepal_food_composition"
  ON public.nepal_food_composition FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Enable DELETE policy for nepal_food_composition (for cleanup/reset)
CREATE POLICY "Allow public delete for nepal_food_composition"
  ON public.nepal_food_composition FOR DELETE
  TO public
  USING (true);

-- Enable INSERT policy for food_portions
CREATE POLICY "Allow public insert for food_portions"
  ON public.food_portions FOR INSERT
  TO public
  WITH CHECK (true);

-- Enable UPDATE policy for food_portions
CREATE POLICY "Allow public update for food_portions"
  ON public.food_portions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Enable DELETE policy for food_portions (for cleanup/reset)
CREATE POLICY "Allow public delete for food_portions"
  ON public.food_portions FOR DELETE
  TO public
  USING (true);

-- Enable INSERT policy for exercise_met_values
CREATE POLICY "Allow public insert for exercise_met_values"
  ON public.exercise_met_values FOR INSERT
  TO public
  WITH CHECK (true);

-- Enable UPDATE policy for exercise_met_values
CREATE POLICY "Allow public update for exercise_met_values"
  ON public.exercise_met_values FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Enable DELETE policy for exercise_met_values (for cleanup/reset)
CREATE POLICY "Allow public delete for exercise_met_values"
  ON public.exercise_met_values FOR DELETE
  TO public
  USING (true);

-- Add comment for documentation
COMMENT ON POLICY "Allow public insert for nepal_food_composition" ON public.nepal_food_composition IS 'Allows public users to insert food composition data for Nepal food database initialization';
COMMENT ON POLICY "Allow public insert for food_portions" ON public.food_portions IS 'Allows public users to insert portion mapping data for Nepal food database initialization';
COMMENT ON POLICY "Allow public insert for exercise_met_values" ON public.exercise_met_values IS 'Allows public users to insert exercise MET values for Nepal food database initialization';
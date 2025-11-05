-- Migration: global_foods_policies_and_data
-- Created at: 1762274932

-- Enable RLS on user-related tables
ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- Public read access for global foods
DROP POLICY IF EXISTS "Allow public read access for global_foods" ON public.global_foods;
CREATE POLICY "Allow public read access for global_foods"
  ON public.global_foods FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access for global_food_portions" ON public.global_food_portions;
CREATE POLICY "Allow public read access for global_food_portions"
  ON public.global_food_portions FOR SELECT
  TO public USING (true);

DROP POLICY IF EXISTS "Allow public read access for food_categories" ON public.food_categories;
CREATE POLICY "Allow public read access for food_categories"
  ON public.food_categories FOR SELECT
  TO public USING (true);

-- Insert food categories
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

-- Insert default API configurations
INSERT INTO public.api_configurations (api_name, base_url, is_enabled) VALUES
('USDA', 'https://api.nal.usda.gov/fdc/v1/foods/search', true),
('OpenFoodFacts', 'https://world.openfoodfacts.org/cgi/search.pl', true)
ON CONFLICT (api_name) DO NOTHING;

-- RLS policies for user data
CREATE POLICY "Users can view their own favorite foods" ON public.user_favorite_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite foods" ON public.user_favorite_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite foods" ON public.user_favorite_foods
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own food history" ON public.user_food_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food history" ON public.user_food_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food history" ON public.user_food_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own custom foods" ON public.custom_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public custom foods" ON public.custom_foods
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own custom foods" ON public.custom_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods" ON public.custom_foods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods" ON public.custom_foods
  FOR DELETE USING (auth.uid() = user_id);;
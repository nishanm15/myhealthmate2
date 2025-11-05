Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create tables
    const createTablesSQL = `
      -- Nepal food composition data
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

      -- Standard portion mappings
      CREATE TABLE IF NOT EXISTS public.food_portions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        food_name TEXT NOT NULL,
        portion_name TEXT NOT NULL,
        grams FLOAT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Exercise MET values
      CREATE TABLE IF NOT EXISTS public.exercise_met_values (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        activity_name TEXT NOT NULL UNIQUE,
        met FLOAT NOT NULL,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Enable RLS
      ALTER TABLE public.nepal_food_composition ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.food_portions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.exercise_met_values ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Allow public read access for nepal_food_composition" ON public.nepal_food_composition;
      DROP POLICY IF EXISTS "Allow public read access for food_portions" ON public.food_portions;
      DROP POLICY IF EXISTS "Allow public read access for exercise_met_values" ON public.exercise_met_values;

      -- Public read access
      CREATE POLICY "Allow public read access for nepal_food_composition"
        ON public.nepal_food_composition FOR SELECT
        TO public USING (true);

      CREATE POLICY "Allow public read access for food_portions"
        ON public.food_portions FOR SELECT
        TO public USING (true);

      CREATE POLICY "Allow public read access for exercise_met_values"
        ON public.exercise_met_values FOR SELECT
        TO public USING (true);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_nepal_food_composition_food_name ON public.nepal_food_composition(food_name);
      CREATE INDEX IF NOT EXISTS idx_food_portions_food_name ON public.food_portions(food_name);
      CREATE INDEX IF NOT EXISTS idx_exercise_met_values_activity_name ON public.exercise_met_values(activity_name);
    `;

    // Execute table creation
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: createTablesSQL }),
    });

    // Insert Nepal food data
    const nepalFoods = [
      { food_name: 'Rice (cooked)', calories_per_100g: 130, protein_per_100g: 2.7, fat_per_100g: 0.3, carbs_per_100g: 28, fiber_per_100g: 0.4 },
      { food_name: 'Dal (cooked)', calories_per_100g: 116, protein_per_100g: 9, fat_per_100g: 0.4, carbs_per_100g: 20, fiber_per_100g: 8 },
      { food_name: 'Momo (steamed)', calories_per_100g: 250, protein_per_100g: 12, fat_per_100g: 8, carbs_per_100g: 35, fiber_per_100g: 2 },
      { food_name: 'Chapati', calories_per_100g: 290, protein_per_100g: 8, fat_per_100g: 4, carbs_per_100g: 55, fiber_per_100g: 3 },
      { food_name: 'Chicken curry', calories_per_100g: 165, protein_per_100g: 25, fat_per_100g: 6, carbs_per_100g: 2, fiber_per_100g: 0.5 },
      { food_name: 'Aloo curry', calories_per_100g: 90, protein_per_100g: 2, fat_per_100g: 3, carbs_per_100g: 15, fiber_per_100g: 2 },
      { food_name: 'Saag (spinach)', calories_per_100g: 30, protein_per_100g: 3, fat_per_100g: 2, carbs_per_100g: 4, fiber_per_100g: 2.2 },
      { food_name: 'Buffalo meat', calories_per_100g: 240, protein_per_100g: 26, fat_per_100g: 14, carbs_per_100g: 0, fiber_per_100g: 0 },
      { food_name: 'Dhedo', calories_per_100g: 350, protein_per_100g: 7, fat_per_100g: 1, carbs_per_100g: 75, fiber_per_100g: 3 },
      { food_name: 'Bajra', calories_per_100g: 364, protein_per_100g: 11, fat_per_100g: 5, carbs_per_100g: 63, fiber_per_100g: 8 },
      { food_name: 'Sel roti', calories_per_100g: 350, protein_per_100g: 6, fat_per_100g: 15, carbs_per_100g: 48, fiber_per_100g: 1 },
      { food_name: 'Gundruk', calories_per_100g: 50, protein_per_100g: 4, fat_per_100g: 0.5, carbs_per_100g: 9, fiber_per_100g: 6 },
      { food_name: 'Samosa', calories_per_100g: 262, protein_per_100g: 4, fat_per_100g: 13, carbs_per_100g: 32, fiber_per_100g: 2 },
      { food_name: 'Puri', calories_per_100g: 375, protein_per_100g: 6, fat_per_100g: 23, carbs_per_100g: 37, fiber_per_100g: 1.5 },
      { food_name: 'Yogurt (dahi)', calories_per_100g: 60, protein_per_100g: 3.5, fat_per_100g: 3.3, carbs_per_100g: 4.7, fiber_per_100g: 0 },
      { food_name: 'Paneer', calories_per_100g: 265, protein_per_100g: 18, fat_per_100g: 20, carbs_per_100g: 3, fiber_per_100g: 0 },
      { food_name: 'Egg (boiled)', calories_per_100g: 155, protein_per_100g: 13, fat_per_100g: 11, carbs_per_100g: 1.1, fiber_per_100g: 0 },
      { food_name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, fat_per_100g: 0.3, carbs_per_100g: 23, fiber_per_100g: 2.6 },
      { food_name: 'Apple', calories_per_100g: 52, protein_per_100g: 0.3, fat_per_100g: 0.2, carbs_per_100g: 14, fiber_per_100g: 2.4 },
      { food_name: 'Milk (full fat)', calories_per_100g: 61, protein_per_100g: 3.2, fat_per_100g: 3.3, carbs_per_100g: 4.8, fiber_per_100g: 0 },
    ];

    const foodResponse = await fetch(`${SUPABASE_URL}/rest/v1/nepal_food_composition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(nepalFoods),
    });

    // Insert portion mappings
    const portions = [
      { food_name: 'Rice (cooked)', portion_name: '1 cup', grams: 210 },
      { food_name: 'Rice (cooked)', portion_name: '1 bowl', grams: 300 },
      { food_name: 'Rice (cooked)', portion_name: '1 plate', grams: 200 },
      { food_name: 'Dal (cooked)', portion_name: '1 bowl', grams: 200 },
      { food_name: 'Dal (cooked)', portion_name: '1 cup', grams: 150 },
      { food_name: 'Momo (steamed)', portion_name: '1 plate (6 pieces)', grams: 200 },
      { food_name: 'Momo (steamed)', portion_name: '1 piece', grams: 33 },
      { food_name: 'Chapati', portion_name: '1 piece', grams: 45 },
      { food_name: 'Chicken curry', portion_name: '1 serving', grams: 150 },
      { food_name: 'Chicken curry', portion_name: '1 bowl', grams: 200 },
      { food_name: 'Aloo curry', portion_name: '1 serving', grams: 150 },
      { food_name: 'Aloo curry', portion_name: '1 bowl', grams: 200 },
      { food_name: 'Saag (spinach)', portion_name: '1 serving', grams: 100 },
      { food_name: 'Saag (spinach)', portion_name: '1 bowl', grams: 150 },
      { food_name: 'Buffalo meat', portion_name: '1 serving', grams: 120 },
      { food_name: 'Buffalo meat', portion_name: '1 piece', grams: 100 },
      { food_name: 'Dhedo', portion_name: '1 serving', grams: 200 },
      { food_name: 'Dhedo', portion_name: '1 bowl', grams: 250 },
      { food_name: 'Bajra', portion_name: '1 serving', grams: 100 },
      { food_name: 'Bajra', portion_name: '1 cup', grams: 150 },
      { food_name: 'Sel roti', portion_name: '1 piece', grams: 50 },
      { food_name: 'Gundruk', portion_name: '1 serving', grams: 100 },
      { food_name: 'Samosa', portion_name: '1 piece', grams: 80 },
      { food_name: 'Puri', portion_name: '1 piece', grams: 40 },
      { food_name: 'Yogurt (dahi)', portion_name: '1 cup', grams: 240 },
      { food_name: 'Paneer', portion_name: '1 serving', grams: 100 },
      { food_name: 'Egg (boiled)', portion_name: '1 egg', grams: 50 },
      { food_name: 'Banana', portion_name: '1 medium', grams: 118 },
      { food_name: 'Apple', portion_name: '1 medium', grams: 182 },
      { food_name: 'Milk (full fat)', portion_name: '1 glass', grams: 240 },
    ];

    const portionResponse = await fetch(`${SUPABASE_URL}/rest/v1/food_portions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(portions),
    });

    // Insert exercise MET values
    const exercises = [
      { activity_name: 'Walking (3 mph)', met: 3.3, category: 'Light' },
      { activity_name: 'Running (6 mph)', met: 9.8, category: 'Vigorous' },
      { activity_name: 'Cycling (moderate)', met: 6.0, category: 'Moderate' },
      { activity_name: 'Yoga', met: 2.5, category: 'Light' },
      { activity_name: 'Dancing', met: 6.5, category: 'Moderate' },
      { activity_name: 'Swimming (moderate)', met: 6.0, category: 'Moderate' },
      { activity_name: 'Weight training', met: 5.0, category: 'Moderate' },
      { activity_name: 'Hiking', met: 6.0, category: 'Moderate' },
      { activity_name: 'Basketball', met: 6.5, category: 'Vigorous' },
      { activity_name: 'Football', met: 7.0, category: 'Vigorous' },
    ];

    const exerciseResponse = await fetch(`${SUPABASE_URL}/rest/v1/exercise_met_values`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(exercises),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Nepal food database setup complete',
        foods_inserted: nepalFoods.length,
        portions_inserted: portions.length,
        exercises_inserted: exercises.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to setup Nepal food database'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

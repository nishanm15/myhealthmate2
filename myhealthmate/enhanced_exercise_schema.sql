-- Enhanced Exercise Library Schema

-- Exercise categories
CREATE TABLE IF NOT EXISTS public.exercise_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comprehensive exercise library
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  met FLOAT NOT NULL,
  difficulty TEXT NOT NULL,
  equipment TEXT,
  muscle_groups TEXT[],
  duration_suggestions INTEGER[],
  description TEXT,
  tips TEXT,
  variations TEXT[],
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User exercise favorites
CREATE TABLE IF NOT EXISTS public.user_exercise_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, exercise_id)
);

-- User exercise search history
CREATE TABLE IF NOT EXISTS public.user_exercise_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, exercise_id)
);

-- Custom exercises created by users
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  met FLOAT NOT NULL,
  category TEXT,
  equipment TEXT,
  muscle_groups TEXT[],
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Exercise categories - public read
DROP POLICY IF EXISTS "Allow public read access for exercise_categories" ON public.exercise_categories;
CREATE POLICY "Allow public read access for exercise_categories"
  ON public.exercise_categories FOR SELECT
  TO public USING (true);

-- Exercise library - public read
DROP POLICY IF EXISTS "Allow public read access for exercise_library" ON public.exercise_library;
CREATE POLICY "Allow public read access for exercise_library"
  ON public.exercise_library FOR SELECT
  TO public USING (true);

-- User favorites - user-specific
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_exercise_favorites;
CREATE POLICY "Users can manage their own favorites"
  ON public.user_exercise_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User history - user-specific
DROP POLICY IF EXISTS "Users can manage their own history" ON public.user_exercise_history;
CREATE POLICY "Users can manage their own history"
  ON public.user_exercise_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Custom exercises - user-specific or public
DROP POLICY IF EXISTS "Users can manage their own custom exercises" ON public.custom_exercises;
CREATE POLICY "Users can manage their own custom exercises"
  ON public.custom_exercises
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public custom exercises" ON public.custom_exercises;
CREATE POLICY "Users can view public custom exercises"
  ON public.custom_exercises
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON public.exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_difficulty ON public.exercise_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercise_library_equipment ON public.exercise_library(equipment);
CREATE INDEX IF NOT EXISTS idx_exercise_library_popularity ON public.exercise_library(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_exercise_favorites_user_id ON public.user_exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_history_user_id ON public.user_exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON public.custom_exercises(user_id);


-- ============================================================================
-- SEED DATA: Exercise Categories
-- ============================================================================

INSERT INTO public.exercise_categories (name, description, icon, color) VALUES
('Strength Training', 'Build muscle and increase strength', 'dumbbell', '#ef4444'),
('Cardio', 'Improve cardiovascular health and endurance', 'heart-pulse', '#f97316'),
('Sports', 'Team and individual sports activities', 'trophy', '#eab308'),
('Dance & Aerobics', 'Fun rhythmic movements and aerobic workouts', 'music', '#84cc16'),
('Home & Bodyweight', 'No-equipment exercises you can do anywhere', 'home', '#06b6d4'),
('Outdoor', 'Activities in nature and fresh air', 'trees', '#10b981'),
('Yoga & Flexibility', 'Improve flexibility and mind-body connection', 'user-round', '#8b5cf6'),
('Daily Activities', 'Everyday movements and chores', 'calendar', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: Exercise Library (60 exercises)
-- ============================================================================

-- Strength Training (10 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Weight Lifting (Light-Moderate)', 'Strength Training', 3.5, 'Beginner', 'Dumbbells, Barbells', ARRAY['Full Body', 'Arms', 'Legs'], ARRAY[15, 30, 45, 60], 'General weight training with lighter weights and higher repetitions', 'Focus on form over weight. Start with comfortable resistance.', ARRAY['Dumbbell curls', 'Bench press', 'Squats', 'Lunges']),
('Weight Lifting (Vigorous)', 'Strength Training', 6.0, 'Advanced', 'Dumbbells, Barbells', ARRAY['Full Body', 'Chest', 'Back', 'Legs'], ARRAY[30, 45, 60], 'Intense weight training with heavier loads and compound movements', 'Always warm up properly. Use spotter for heavy lifts.', ARRAY['Deadlifts', 'Squats', 'Bench press', 'Overhead press']),
('Bodyweight Resistance Training', 'Strength Training', 3.8, 'Beginner', 'None', ARRAY['Full Body', 'Core', 'Arms'], ARRAY[15, 20, 30, 45], 'Strength training using your own body weight', 'Maintain proper form throughout. Progress gradually.', ARRAY['Push-ups', 'Pull-ups', 'Squats', 'Planks']),
('Kettlebell Training', 'Strength Training', 6.0, 'Intermediate', 'Kettlebells', ARRAY['Full Body', 'Core', 'Shoulders'], ARRAY[20, 30, 45], 'Dynamic strength training with kettlebells', 'Start with lighter weight to master technique first.', ARRAY['Swings', 'Turkish get-ups', 'Snatches', 'Goblet squats']),
('Circuit Training', 'Strength Training', 8.0, 'Intermediate', 'Various', ARRAY['Full Body', 'Cardio'], ARRAY[20, 30, 45], 'High-intensity rotation through multiple exercises', 'Keep rest periods short. Maintain intensity throughout.', ARRAY['Station circuits', 'Timed circuits', 'AMRAP']),
('CrossFit Training', 'Strength Training', 9.0, 'Advanced', 'Various', ARRAY['Full Body', 'Cardio'], ARRAY[30, 45, 60], 'High-intensity functional fitness combining multiple disciplines', 'Proper form is crucial. Scale workouts to your level.', ARRAY['WODs', 'EMOM', 'AMRAP', 'Chipper']),
('Power Lifting', 'Strength Training', 6.0, 'Advanced', 'Barbells, Racks', ARRAY['Legs', 'Back', 'Chest'], ARRAY[45, 60, 90], 'Heavy compound lifts: squat, bench, deadlift', 'Always use proper technique. Rest adequately between sets.', ARRAY['Squat variations', 'Bench variations', 'Deadlift variations']),
('TRX Suspension Training', 'Strength Training', 5.5, 'Intermediate', 'TRX Straps', ARRAY['Full Body', 'Core'], ARRAY[20, 30, 45], 'Bodyweight exercises using suspension straps', 'Adjust angle to change difficulty. Keep core engaged.', ARRAY['TRX rows', 'Push-ups', 'Planks', 'Squats']),
('Resistance Band Training', 'Strength Training', 3.5, 'Beginner', 'Resistance Bands', ARRAY['Full Body', 'Arms', 'Legs'], ARRAY[15, 20, 30], 'Strength training using elastic resistance bands', 'Maintain constant tension. Control the movement.', ARRAY['Bicep curls', 'Chest press', 'Leg extensions', 'Lateral raises']),
('Calisthenics', 'Strength Training', 4.5, 'Intermediate', 'None', ARRAY['Full Body', 'Core', 'Arms'], ARRAY[20, 30, 45], 'Advanced bodyweight exercises and gymnastics', 'Master basics first. Progress slowly to advanced moves.', ARRAY['Muscle-ups', 'Handstands', 'Levers', 'Pistol squats']);

-- Cardio (10 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Walking (Slow)', 'Cardio', 3.3, 'Beginner', 'None', ARRAY['Legs', 'Cardio'], ARRAY[15, 30, 45, 60], 'Leisurely walking at 2-3 mph', 'Great for beginners. Maintain good posture.', ARRAY['Flat surface', 'Incline walking', 'Nature trails']),
('Walking (Moderate)', 'Cardio', 4.3, 'Beginner', 'None', ARRAY['Legs', 'Cardio'], ARRAY[20, 30, 45, 60], 'Brisk walking at 3-4 mph', 'Swing arms naturally. Breathe rhythmically.', ARRAY['Power walking', 'Nordic walking', 'Hill walking']),
('Running (Jogging)', 'Cardio', 7.0, 'Intermediate', 'Running Shoes', ARRAY['Legs', 'Cardio'], ARRAY[15, 20, 30, 45], 'Steady pace running at 5-6 mph', 'Land mid-foot. Keep shoulders relaxed.', ARRAY['Tempo runs', 'Easy runs', 'Recovery runs']),
('Running (Fast)', 'Cardio', 11.5, 'Advanced', 'Running Shoes', ARRAY['Legs', 'Cardio'], ARRAY[15, 20, 30], 'High-intensity running at 7+ mph', 'Warm up thoroughly. Build endurance gradually.', ARRAY['Interval training', 'Sprints', 'Fartlek']),
('Cycling (Leisure)', 'Cardio', 4.0, 'Beginner', 'Bicycle', ARRAY['Legs', 'Cardio'], ARRAY[20, 30, 45, 60], 'Casual cycling at 5-9 mph', 'Adjust seat height properly. Start on flat terrain.', ARRAY['Neighborhood rides', 'Bike paths', 'Scenic routes']),
('Cycling (Moderate)', 'Cardio', 6.8, 'Intermediate', 'Bicycle', ARRAY['Legs', 'Cardio'], ARRAY[20, 30, 45, 60], 'Moderate cycling at 10-12 mph', 'Maintain steady cadence. Use appropriate gears.', ARRAY['Road cycling', 'Commuting', 'Group rides']),
('Swimming (Light)', 'Cardio', 6.0, 'Beginner', 'Pool Access', ARRAY['Full Body', 'Cardio'], ARRAY[20, 30, 45], 'Leisurely swimming with frequent rest', 'Focus on technique. Breathe properly.', ARRAY['Freestyle', 'Backstroke', 'Water walking']),
('Swimming (Vigorous)', 'Cardio', 10.0, 'Intermediate', 'Pool Access', ARRAY['Full Body', 'Cardio'], ARRAY[20, 30, 45, 60], 'Continuous swimming with minimal rest', 'Maintain form even when tired. Pace yourself.', ARRAY['Lap swimming', 'Interval sets', 'Mixed strokes']),
('Jump Rope', 'Cardio', 12.3, 'Intermediate', 'Jump Rope', ARRAY['Legs', 'Cardio', 'Shoulders'], ARRAY[5, 10, 15, 20], 'Continuous jumping rope exercise', 'Land softly on balls of feet. Keep elbows close.', ARRAY['Single unders', 'Double unders', 'Criss-cross']),
('Elliptical Machine', 'Cardio', 5.0, 'Beginner', 'Elliptical', ARRAY['Legs', 'Cardio'], ARRAY[15, 20, 30, 45], 'Low-impact cardio on elliptical trainer', 'Stand tall. Use handles for upper body work.', ARRAY['Forward motion', 'Reverse motion', 'High resistance']);

-- Sports (8 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Football (Soccer)', 'Sports', 10.0, 'Intermediate', 'Soccer Ball', ARRAY['Legs', 'Cardio'], ARRAY[30, 45, 60, 90], 'Playing football/soccer casually or competitively', 'Stay hydrated. Warm up thoroughly before playing.', ARRAY['Casual game', 'Competitive match', 'Practice drills']),
('Basketball', 'Sports', 8.0, 'Intermediate', 'Basketball', ARRAY['Legs', 'Cardio', 'Arms'], ARRAY[30, 45, 60], 'Playing basketball game or practice', 'Work on both offense and defense. Practice ball handling.', ARRAY['Full court', 'Half court', 'Shooting practice']),
('Tennis', 'Sports', 7.3, 'Intermediate', 'Racket, Balls', ARRAY['Legs', 'Arms', 'Cardio'], ARRAY[30, 45, 60], 'Playing tennis singles or doubles', 'Move feet quickly. Focus on form.', ARRAY['Singles', 'Doubles', 'Wall practice']),
('Badminton', 'Sports', 5.5, 'Beginner', 'Racket, Shuttlecock', ARRAY['Legs', 'Arms', 'Cardio'], ARRAY[30, 45, 60], 'Playing badminton recreationally', 'Keep light on feet. Watch the shuttlecock.', ARRAY['Singles', 'Doubles', 'Casual play']),
('Volleyball', 'Sports', 4.0, 'Beginner', 'Volleyball', ARRAY['Legs', 'Arms', 'Core'], ARRAY[30, 45, 60], 'Playing volleyball recreationally', 'Communicate with teammates. Bend knees for receives.', ARRAY['Beach volleyball', 'Indoor', 'Sand volleyball']),
('Cricket', 'Sports', 4.8, 'Beginner', 'Bat, Ball', ARRAY['Legs', 'Arms'], ARRAY[45, 60, 90, 120], 'Playing cricket batting or bowling', 'Wear protective gear. Stay alert in field.', ARRAY['Batting', 'Bowling', 'Fielding']),
('Table Tennis', 'Sports', 4.0, 'Beginner', 'Paddle, Ball', ARRAY['Arms', 'Core'], ARRAY[15, 30, 45], 'Playing table tennis (ping pong)', 'Keep eyes on ball. Use wrist for spin.', ARRAY['Singles', 'Doubles', 'Rally practice']),
('Boxing (Training)', 'Sports', 8.0, 'Intermediate', 'Gloves, Bag', ARRAY['Full Body', 'Cardio', 'Arms'], ARRAY[20, 30, 45], 'Boxing training including bag work and sparring', 'Protect your head. Keep moving.', ARRAY['Heavy bag', 'Speed bag', 'Shadow boxing', 'Sparring']);

-- Dance & Aerobics (6 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Zumba', 'Dance & Aerobics', 7.3, 'Beginner', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[30, 45, 60], 'High-energy dance fitness with Latin music', 'Follow the instructor. Have fun and move freely.', ARRAY['Zumba Gold', 'Aqua Zumba', 'Zumba Toning']),
('Aerobic Dance', 'Dance & Aerobics', 6.6, 'Beginner', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[30, 45, 60], 'Rhythmic aerobic movements to music', 'Stay on beat. Maintain continuous movement.', ARRAY['Low-impact', 'High-impact', 'Step aerobics']),
('Hip Hop Dance', 'Dance & Aerobics', 5.0, 'Intermediate', 'None', ARRAY['Full Body', 'Core'], ARRAY[30, 45, 60], 'Urban dance style with hip hop moves', 'Learn basic moves first. Feel the rhythm.', ARRAY['Old school', 'New school', 'Choreography']),
('Ballet', 'Dance & Aerobics', 4.8, 'Intermediate', 'None', ARRAY['Legs', 'Core', 'Balance'], ARRAY[30, 45, 60, 90], 'Classical ballet training and practice', 'Focus on posture and grace. Build strength gradually.', ARRAY['Barre work', 'Center work', 'Pointe work']),
('Jazz Dance', 'Dance & Aerobics', 5.0, 'Intermediate', 'None', ARRAY['Full Body', 'Flexibility'], ARRAY[30, 45, 60], 'Energetic jazz dance routines', 'Extend movements fully. Express yourself.', ARRAY['Contemporary jazz', 'Broadway jazz', 'Modern jazz']),
('Step Aerobics', 'Dance & Aerobics', 7.0, 'Beginner', 'Step Platform', ARRAY['Legs', 'Cardio'], ARRAY[30, 45, 60], 'Aerobic exercise using raised step platform', 'Watch foot placement. Start with low step height.', ARRAY['Basic step', 'Advanced combos', 'High-low']);

-- Home & Bodyweight (8 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Push-ups', 'Home & Bodyweight', 3.8, 'Beginner', 'None', ARRAY['Chest', 'Arms', 'Core'], ARRAY[5, 10, 15, 20], 'Classic push-up exercise for upper body', 'Keep body straight. Lower chest to floor.', ARRAY['Wide grip', 'Diamond', 'Decline', 'Incline']),
('Squats', 'Home & Bodyweight', 5.5, 'Beginner', 'None', ARRAY['Legs', 'Glutes'], ARRAY[10, 15, 20, 30], 'Bodyweight squats for lower body strength', 'Keep knees aligned with toes. Go deep.', ARRAY['Regular', 'Sumo', 'Jump squats', 'Pistol']),
('Plank', 'Home & Bodyweight', 4.0, 'Beginner', 'None', ARRAY['Core', 'Shoulders'], ARRAY[1, 2, 3, 5], 'Isometric core strengthening exercise', 'Keep body in straight line. Breathe normally.', ARRAY['Front plank', 'Side plank', 'Plank jacks']),
('Burpees', 'Home & Bodyweight', 8.0, 'Intermediate', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[5, 10, 15, 20], 'Full-body high-intensity exercise', 'Maintain pace. Land softly from jump.', ARRAY['Standard', 'Without jump', 'With push-up']),
('Mountain Climbers', 'Home & Bodyweight', 8.0, 'Intermediate', 'None', ARRAY['Core', 'Cardio', 'Shoulders'], ARRAY[5, 10, 15, 20], 'Dynamic core and cardio exercise', 'Keep hips low. Drive knees fast.', ARRAY['Slow', 'Fast', 'Cross-body']),
('Lunges', 'Home & Bodyweight', 4.0, 'Beginner', 'None', ARRAY['Legs', 'Glutes'], ARRAY[10, 15, 20], 'Single-leg strength exercise', 'Keep front knee over ankle. Step far enough.', ARRAY['Forward', 'Reverse', 'Walking', 'Jumping']),
('High Knees', 'Home & Bodyweight', 8.0, 'Intermediate', 'None', ARRAY['Legs', 'Cardio'], ARRAY[5, 10, 15], 'Running in place with high knee lifts', 'Lift knees to hip height. Pump arms.', ARRAY['In place', 'Moving forward', 'With arm movements']),
('Jumping Jacks', 'Home & Bodyweight', 8.0, 'Beginner', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[5, 10, 15, 20], 'Classic full-body aerobic exercise', 'Land softly. Coordinate arms and legs.', ARRAY['Standard', 'Modified', 'Star jumps']);

-- Outdoor (6 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Hiking', 'Outdoor', 6.0, 'Intermediate', 'Hiking Boots', ARRAY['Legs', 'Cardio'], ARRAY[30, 45, 60, 90, 120], 'Walking on trails and hills in nature', 'Wear proper footwear. Bring water and snacks.', ARRAY['Easy trails', 'Moderate hills', 'Mountain hiking']),
('Trail Running', 'Outdoor', 9.0, 'Advanced', 'Running Shoes', ARRAY['Legs', 'Cardio'], ARRAY[20, 30, 45, 60], 'Running on natural terrain and trails', 'Watch footing. Adjust pace for terrain.', ARRAY['Forest trails', 'Mountain trails', 'Technical terrain']),
('Rock Climbing', 'Outdoor', 8.0, 'Advanced', 'Climbing Gear', ARRAY['Full Body', 'Grip Strength'], ARRAY[30, 45, 60, 90], 'Climbing natural or artificial rock surfaces', 'Safety first. Build strength progressively.', ARRAY['Bouldering', 'Top rope', 'Lead climbing']),
('Mountain Biking', 'Outdoor', 8.5, 'Intermediate', 'Mountain Bike', ARRAY['Legs', 'Cardio', 'Core'], ARRAY[30, 45, 60, 90], 'Cycling on off-road trails and terrain', 'Wear helmet. Start on easier trails.', ARRAY['Cross-country', 'Downhill', 'Trail riding']),
('Kayaking', 'Outdoor', 5.0, 'Beginner', 'Kayak, Paddle', ARRAY['Arms', 'Core', 'Back'], ARRAY[30, 45, 60], 'Paddling a kayak on water', 'Wear life jacket. Learn proper paddle technique.', ARRAY['Flat water', 'River', 'Sea kayaking']),
('Stand-Up Paddleboarding', 'Outdoor', 6.0, 'Beginner', 'SUP Board', ARRAY['Core', 'Legs', 'Arms'], ARRAY[30, 45, 60], 'Standing and paddling on a board', 'Start on calm water. Engage core for balance.', ARRAY['Flatwater', 'SUP yoga', 'Wave riding']);

-- Yoga & Flexibility (6 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Hatha Yoga', 'Yoga & Flexibility', 2.5, 'Beginner', 'Yoga Mat', ARRAY['Full Body', 'Flexibility'], ARRAY[30, 45, 60], 'Gentle yoga with basic poses and breathing', 'Focus on breath. Don''t force stretches.', ARRAY['Beginner flow', 'Mixed poses', 'Restorative']),
('Vinyasa Yoga', 'Yoga & Flexibility', 4.0, 'Intermediate', 'Yoga Mat', ARRAY['Full Body', 'Core', 'Flexibility'], ARRAY[45, 60, 75], 'Dynamic flowing yoga with breath synchronization', 'Link breath to movement. Build heat gradually.', ARRAY['Power vinyasa', 'Slow flow', 'Creative sequencing']),
('Power Yoga', 'Yoga & Flexibility', 4.5, 'Intermediate', 'Yoga Mat', ARRAY['Full Body', 'Strength'], ARRAY[45, 60, 75], 'Vigorous yoga focused on strength and stamina', 'Maintain strong foundation. Challenge yourself safely.', ARRAY['Athletic yoga', 'Strength building', 'Intense flows']),
('Yin Yoga', 'Yoga & Flexibility', 1.5, 'Beginner', 'Yoga Mat', ARRAY['Flexibility', 'Relaxation'], ARRAY[45, 60, 75], 'Slow-paced yoga with long-held passive stretches', 'Relax into poses. Hold for 3-5 minutes.', ARRAY['Deep stretching', 'Meditative practice']),
('Hot Yoga (Bikram)', 'Yoga & Flexibility', 5.0, 'Intermediate', 'Yoga Mat', ARRAY['Full Body', 'Flexibility'], ARRAY[60, 90], 'Yoga practiced in heated room (95-105°F)', 'Stay hydrated. Listen to your body in heat.', ARRAY['Bikram series', '26 postures', 'Hot vinyasa']),
('Stretching (General)', 'Yoga & Flexibility', 2.3, 'Beginner', 'None', ARRAY['Flexibility', 'Full Body'], ARRAY[10, 15, 20, 30], 'General flexibility and stretching exercises', 'Warm up first. Hold stretches 15-30 seconds.', ARRAY['Static stretching', 'Dynamic stretching', 'PNF stretching']);

-- Daily Activities (6 exercises)
INSERT INTO public.exercise_library (name, category, met, difficulty, equipment, muscle_groups, duration_suggestions, description, tips, variations) VALUES
('Household Cleaning', 'Daily Activities', 3.5, 'Beginner', 'None', ARRAY['Full Body'], ARRAY[15, 30, 45, 60], 'General housework and cleaning activities', 'Turn on music. Make it enjoyable.', ARRAY['Vacuuming', 'Mopping', 'Dusting', 'Organizing']),
('Gardening', 'Daily Activities', 4.0, 'Beginner', 'Garden Tools', ARRAY['Full Body', 'Core'], ARRAY[30, 45, 60], 'General gardening and yard work', 'Use proper lifting technique. Take breaks.', ARRAY['Weeding', 'Planting', 'Raking', 'Mowing']),
('Playing with Children', 'Daily Activities', 5.8, 'Beginner', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[15, 30, 45], 'Active play and games with children', 'Stay engaged. Match their energy level.', ARRAY['Running games', 'Sports', 'Playground activities']),
('Dancing (Social)', 'Daily Activities', 4.5, 'Beginner', 'None', ARRAY['Full Body', 'Cardio'], ARRAY[15, 30, 45, 60], 'Social dancing at parties or events', 'Let loose. Enjoy the music and movement.', ARRAY['Club dancing', 'Wedding dancing', 'Party dancing']),
('Stair Climbing', 'Daily Activities', 8.0, 'Intermediate', 'None', ARRAY['Legs', 'Cardio'], ARRAY[5, 10, 15, 20], 'Walking or running up stairs', 'Use handrail if needed. Maintain steady pace.', ARRAY['Slow pace', 'Fast pace', 'Skipping steps']),
('Carrying Groceries', 'Daily Activities', 3.0, 'Beginner', 'None', ARRAY['Arms', 'Core'], ARRAY[5, 10, 15], 'Carrying shopping bags and groceries', 'Distribute weight evenly. Use proper grip.', ARRAY['Light load', 'Heavy load', 'Multiple trips']);


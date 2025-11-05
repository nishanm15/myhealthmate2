import { supabase } from './supabase';

export async function initializeExerciseLibrary() {
  console.log('Starting exercise library initialization...');

  try {
    // Step 1: Create tables (will be done manually via SQL editor)
    console.log('Note: Tables should be created via SQL editor first');

    // Step 2: Check if data already exists
    const { data: existingCategories } = await supabase
      .from('exercise_categories')
      .select('id')
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      console.log('Exercise library already initialized');
      return { success: true, message: 'Exercise library already initialized' };
    }

    // Step 3: Insert categories
    console.log('Inserting exercise categories...');
    const categories = [
      { name: 'Strength Training', description: 'Build muscle and increase strength', icon: 'dumbbell', color: '#ef4444' },
      { name: 'Cardio', description: 'Improve cardiovascular health and endurance', icon: 'heart-pulse', color: '#f97316' },
      { name: 'Sports', description: 'Team and individual sports activities', icon: 'trophy', color: '#eab308' },
      { name: 'Dance & Aerobics', description: 'Fun rhythmic movements and aerobic workouts', icon: 'music', color: '#84cc16' },
      { name: 'Home & Bodyweight', description: 'No-equipment exercises you can do anywhere', icon: 'home', color: '#06b6d4' },
      { name: 'Outdoor', description: 'Activities in nature and fresh air', icon: 'trees', color: '#10b981' },
      { name: 'Yoga & Flexibility', description: 'Improve flexibility and mind-body connection', icon: 'user-round', color: '#8b5cf6' },
      { name: 'Daily Activities', description: 'Everyday movements and chores', icon: 'calendar', color: '#6b7280' }
    ];

    const { error: catError } = await supabase
      .from('exercise_categories')
      .insert(categories);

    if (catError) throw catError;
    console.log(`✓ Inserted ${categories.length} categories`);

    // Step 4: Insert exercises
    console.log('Inserting exercises...');
    const exercises = [
      // Strength Training (10)
      { name: 'Weight Lifting (Light-Moderate)', category: 'Strength Training', met: 3.5, difficulty: 'Beginner', equipment: 'Dumbbells, Barbells', muscle_groups: ['Full Body', 'Arms', 'Legs'], duration_suggestions: [15, 30, 45, 60], description: 'General weight training with lighter weights and higher repetitions', tips: 'Focus on form over weight. Start with comfortable resistance.', variations: ['Dumbbell curls', 'Bench press', 'Squats', 'Lunges'], popularity_score: 85 },
      { name: 'Weight Lifting (Vigorous)', category: 'Strength Training', met: 6.0, difficulty: 'Advanced', equipment: 'Dumbbells, Barbells', muscle_groups: ['Full Body', 'Chest', 'Back', 'Legs'], duration_suggestions: [30, 45, 60], description: 'Intense weight training with heavier loads and compound movements', tips: 'Always warm up properly. Use spotter for heavy lifts.', variations: ['Deadlifts', 'Squats', 'Bench press', 'Overhead press'], popularity_score: 90 },
      { name: 'Bodyweight Resistance Training', category: 'Strength Training', met: 3.8, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Core', 'Arms'], duration_suggestions: [15, 20, 30, 45], description: 'Strength training using your own body weight', tips: 'Maintain proper form throughout. Progress gradually.', variations: ['Push-ups', 'Pull-ups', 'Squats', 'Planks'], popularity_score: 80 },
      { name: 'Kettlebell Training', category: 'Strength Training', met: 6.0, difficulty: 'Intermediate', equipment: 'Kettlebells', muscle_groups: ['Full Body', 'Core', 'Shoulders'], duration_suggestions: [20, 30, 45], description: 'Dynamic strength training with kettlebells', tips: 'Start with lighter weight to master technique first.', variations: ['Swings', 'Turkish get-ups', 'Snatches', 'Goblet squats'], popularity_score: 70 },
      { name: 'Circuit Training', category: 'Strength Training', met: 8.0, difficulty: 'Intermediate', equipment: 'Various', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [20, 30, 45], description: 'High-intensity rotation through multiple exercises', tips: 'Keep rest periods short. Maintain intensity throughout.', variations: ['Station circuits', 'Timed circuits', 'AMRAP'], popularity_score: 75 },
      { name: 'CrossFit Training', category: 'Strength Training', met: 9.0, difficulty: 'Advanced', equipment: 'Various', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'High-intensity functional fitness combining multiple disciplines', tips: 'Proper form is crucial. Scale workouts to your level.', variations: ['WODs', 'EMOM', 'AMRAP', 'Chipper'], popularity_score: 80 },
      { name: 'Power Lifting', category: 'Strength Training', met: 6.0, difficulty: 'Advanced', equipment: 'Barbells, Racks', muscle_groups: ['Legs', 'Back', 'Chest'], duration_suggestions: [45, 60, 90], description: 'Heavy compound lifts: squat, bench, deadlift', tips: 'Always use proper technique. Rest adequately between sets.', variations: ['Squat variations', 'Bench variations', 'Deadlift variations'], popularity_score: 65 },
      { name: 'TRX Suspension Training', category: 'Strength Training', met: 5.5, difficulty: 'Intermediate', equipment: 'TRX Straps', muscle_groups: ['Full Body', 'Core'], duration_suggestions: [20, 30, 45], description: 'Bodyweight exercises using suspension straps', tips: 'Adjust angle to change difficulty. Keep core engaged.', variations: ['TRX rows', 'Push-ups', 'Planks', 'Squats'], popularity_score: 60 },
      { name: 'Resistance Band Training', category: 'Strength Training', met: 3.5, difficulty: 'Beginner', equipment: 'Resistance Bands', muscle_groups: ['Full Body', 'Arms', 'Legs'], duration_suggestions: [15, 20, 30], description: 'Strength training using elastic resistance bands', tips: 'Maintain constant tension. Control the movement.', variations: ['Bicep curls', 'Chest press', 'Leg extensions', 'Lateral raises'], popularity_score: 70 },
      { name: 'Calisthenics', category: 'Strength Training', met: 4.5, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Full Body', 'Core', 'Arms'], duration_suggestions: [20, 30, 45], description: 'Advanced bodyweight exercises and gymnastics', tips: 'Master basics first. Progress slowly to advanced moves.', variations: ['Muscle-ups', 'Handstands', 'Levers', 'Pistol squats'], popularity_score: 75 },

      // Cardio (10)
      { name: 'Walking (Slow)', category: 'Cardio', met: 3.3, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [15, 30, 45, 60], description: 'Leisurely walking at 2-3 mph', tips: 'Great for beginners. Maintain good posture.', variations: ['Flat surface', 'Incline walking', 'Nature trails'], popularity_score: 95 },
      { name: 'Walking (Moderate)', category: 'Cardio', met: 4.3, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [20, 30, 45, 60], description: 'Brisk walking at 3-4 mph', tips: 'Swing arms naturally. Breathe rhythmically.', variations: ['Power walking', 'Nordic walking', 'Hill walking'], popularity_score: 90 },
      { name: 'Running (Jogging)', category: 'Cardio', met: 7.0, difficulty: 'Intermediate', equipment: 'Running Shoes', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [15, 20, 30, 45], description: 'Steady pace running at 5-6 mph', tips: 'Land mid-foot. Keep shoulders relaxed.', variations: ['Tempo runs', 'Easy runs', 'Recovery runs'], popularity_score: 85 },
      { name: 'Running (Fast)', category: 'Cardio', met: 11.5, difficulty: 'Advanced', equipment: 'Running Shoes', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [15, 20, 30], description: 'High-intensity running at 7+ mph', tips: 'Warm up thoroughly. Build endurance gradually.', variations: ['Interval training', 'Sprints', 'Fartlek'], popularity_score: 75 },
      { name: 'Cycling (Leisure)', category: 'Cardio', met: 4.0, difficulty: 'Beginner', equipment: 'Bicycle', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [20, 30, 45, 60], description: 'Casual cycling at 5-9 mph', tips: 'Adjust seat height properly. Start on flat terrain.', variations: ['Neighborhood rides', 'Bike paths', 'Scenic routes'], popularity_score: 80 },
      { name: 'Cycling (Moderate)', category: 'Cardio', met: 6.8, difficulty: 'Intermediate', equipment: 'Bicycle', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [20, 30, 45, 60], description: 'Moderate cycling at 10-12 mph', tips: 'Maintain steady cadence. Use appropriate gears.', variations: ['Road cycling', 'Commuting', 'Group rides'], popularity_score: 75 },
      { name: 'Swimming (Light)', category: 'Cardio', met: 6.0, difficulty: 'Beginner', equipment: 'Pool Access', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [20, 30, 45], description: 'Leisurely swimming with frequent rest', tips: 'Focus on technique. Breathe properly.', variations: ['Freestyle', 'Backstroke', 'Water walking'], popularity_score: 70 },
      { name: 'Swimming (Vigorous)', category: 'Cardio', met: 10.0, difficulty: 'Intermediate', equipment: 'Pool Access', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [20, 30, 45, 60], description: 'Continuous swimming with minimal rest', tips: 'Maintain form even when tired. Pace yourself.', variations: ['Lap swimming', 'Interval sets', 'Mixed strokes'], popularity_score: 75 },
      { name: 'Jump Rope', category: 'Cardio', met: 12.3, difficulty: 'Intermediate', equipment: 'Jump Rope', muscle_groups: ['Legs', 'Cardio', 'Shoulders'], duration_suggestions: [5, 10, 15, 20], description: 'Continuous jumping rope exercise', tips: 'Land softly on balls of feet. Keep elbows close.', variations: ['Single unders', 'Double unders', 'Criss-cross'], popularity_score: 70 },
      { name: 'Elliptical Machine', category: 'Cardio', met: 5.0, difficulty: 'Beginner', equipment: 'Elliptical', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [15, 20, 30, 45], description: 'Low-impact cardio on elliptical trainer', tips: 'Stand tall. Use handles for upper body work.', variations: ['Forward motion', 'Reverse motion', 'High resistance'], popularity_score: 65 },

      // Sports (8)
      { name: 'Football (Soccer)', category: 'Sports', met: 10.0, difficulty: 'Intermediate', equipment: 'Soccer Ball', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [30, 45, 60, 90], description: 'Playing football/soccer casually or competitively', tips: 'Stay hydrated. Warm up thoroughly before playing.', variations: ['Casual game', 'Competitive match', 'Practice drills'], popularity_score: 85 },
      { name: 'Basketball', category: 'Sports', met: 8.0, difficulty: 'Intermediate', equipment: 'Basketball', muscle_groups: ['Legs', 'Cardio', 'Arms'], duration_suggestions: [30, 45, 60], description: 'Playing basketball game or practice', tips: 'Work on both offense and defense. Practice ball handling.', variations: ['Full court', 'Half court', 'Shooting practice'], popularity_score: 80 },
      { name: 'Tennis', category: 'Sports', met: 7.3, difficulty: 'Intermediate', equipment: 'Racket, Balls', muscle_groups: ['Legs', 'Arms', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'Playing tennis singles or doubles', tips: 'Move feet quickly. Focus on form.', variations: ['Singles', 'Doubles', 'Wall practice'], popularity_score: 70 },
      { name: 'Badminton', category: 'Sports', met: 5.5, difficulty: 'Beginner', equipment: 'Racket, Shuttlecock', muscle_groups: ['Legs', 'Arms', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'Playing badminton recreationally', tips: 'Keep light on feet. Watch the shuttlecock.', variations: ['Singles', 'Doubles', 'Casual play'], popularity_score: 65 },
      { name: 'Volleyball', category: 'Sports', met: 4.0, difficulty: 'Beginner', equipment: 'Volleyball', muscle_groups: ['Legs', 'Arms', 'Core'], duration_suggestions: [30, 45, 60], description: 'Playing volleyball recreationally', tips: 'Communicate with teammates. Bend knees for receives.', variations: ['Beach volleyball', 'Indoor', 'Sand volleyball'], popularity_score: 60 },
      { name: 'Cricket', category: 'Sports', met: 4.8, difficulty: 'Beginner', equipment: 'Bat, Ball', muscle_groups: ['Legs', 'Arms'], duration_suggestions: [45, 60, 90, 120], description: 'Playing cricket batting or bowling', tips: 'Wear protective gear. Stay alert in field.', variations: ['Batting', 'Bowling', 'Fielding'], popularity_score: 55 },
      { name: 'Table Tennis', category: 'Sports', met: 4.0, difficulty: 'Beginner', equipment: 'Paddle, Ball', muscle_groups: ['Arms', 'Core'], duration_suggestions: [15, 30, 45], description: 'Playing table tennis (ping pong)', tips: 'Keep eyes on ball. Use wrist for spin.', variations: ['Singles', 'Doubles', 'Rally practice'], popularity_score: 60 },
      { name: 'Boxing (Training)', category: 'Sports', met: 8.0, difficulty: 'Intermediate', equipment: 'Gloves, Bag', muscle_groups: ['Full Body', 'Cardio', 'Arms'], duration_suggestions: [20, 30, 45], description: 'Boxing training including bag work and sparring', tips: 'Protect your head. Keep moving.', variations: ['Heavy bag', 'Speed bag', 'Shadow boxing', 'Sparring'], popularity_score: 70 },

      // Dance & Aerobics (6)
      { name: 'Zumba', category: 'Dance & Aerobics', met: 7.3, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'High-energy dance fitness with Latin music', tips: 'Follow the instructor. Have fun and move freely.', variations: ['Zumba Gold', 'Aqua Zumba', 'Zumba Toning'], popularity_score: 80 },
      { name: 'Aerobic Dance', category: 'Dance & Aerobics', met: 6.6, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'Rhythmic aerobic movements to music', tips: 'Stay on beat. Maintain continuous movement.', variations: ['Low-impact', 'High-impact', 'Step aerobics'], popularity_score: 70 },
      { name: 'Hip Hop Dance', category: 'Dance & Aerobics', met: 5.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Full Body', 'Core'], duration_suggestions: [30, 45, 60], description: 'Urban dance style with hip hop moves', tips: 'Learn basic moves first. Feel the rhythm.', variations: ['Old school', 'New school', 'Choreography'], popularity_score: 65 },
      { name: 'Ballet', category: 'Dance & Aerobics', met: 4.8, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Legs', 'Core', 'Balance'], duration_suggestions: [30, 45, 60, 90], description: 'Classical ballet training and practice', tips: 'Focus on posture and grace. Build strength gradually.', variations: ['Barre work', 'Center work', 'Pointe work'], popularity_score: 60 },
      { name: 'Jazz Dance', category: 'Dance & Aerobics', met: 5.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Full Body', 'Flexibility'], duration_suggestions: [30, 45, 60], description: 'Energetic jazz dance routines', tips: 'Extend movements fully. Express yourself.', variations: ['Contemporary jazz', 'Broadway jazz', 'Modern jazz'], popularity_score: 55 },
      { name: 'Step Aerobics', category: 'Dance & Aerobics', met: 7.0, difficulty: 'Beginner', equipment: 'Step Platform', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [30, 45, 60], description: 'Aerobic exercise using raised step platform', tips: 'Watch foot placement. Start with low step height.', variations: ['Basic step', 'Advanced combos', 'High-low'], popularity_score: 65 },

      // Home & Bodyweight (8)
      { name: 'Push-ups', category: 'Home & Bodyweight', met: 3.8, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Chest', 'Arms', 'Core'], duration_suggestions: [5, 10, 15, 20], description: 'Classic push-up exercise for upper body', tips: 'Keep body straight. Lower chest to floor.', variations: ['Wide grip', 'Diamond', 'Decline', 'Incline'], popularity_score: 90 },
      { name: 'Squats', category: 'Home & Bodyweight', met: 5.5, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Legs', 'Glutes'], duration_suggestions: [10, 15, 20, 30], description: 'Bodyweight squats for lower body strength', tips: 'Keep knees aligned with toes. Go deep.', variations: ['Regular', 'Sumo', 'Jump squats', 'Pistol'], popularity_score: 95 },
      { name: 'Plank', category: 'Home & Bodyweight', met: 4.0, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Core', 'Shoulders'], duration_suggestions: [1, 2, 3, 5], description: 'Isometric core strengthening exercise', tips: 'Keep body in straight line. Breathe normally.', variations: ['Front plank', 'Side plank', 'Plank jacks'], popularity_score: 85 },
      { name: 'Burpees', category: 'Home & Bodyweight', met: 8.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [5, 10, 15, 20], description: 'Full-body high-intensity exercise', tips: 'Maintain pace. Land softly from jump.', variations: ['Standard', 'Without jump', 'With push-up'], popularity_score: 75 },
      { name: 'Mountain Climbers', category: 'Home & Bodyweight', met: 8.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Core', 'Cardio', 'Shoulders'], duration_suggestions: [5, 10, 15, 20], description: 'Dynamic core and cardio exercise', tips: 'Keep hips low. Drive knees fast.', variations: ['Slow', 'Fast', 'Cross-body'], popularity_score: 70 },
      { name: 'Lunges', category: 'Home & Bodyweight', met: 4.0, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Legs', 'Glutes'], duration_suggestions: [10, 15, 20], description: 'Single-leg strength exercise', tips: 'Keep front knee over ankle. Step far enough.', variations: ['Forward', 'Reverse', 'Walking', 'Jumping'], popularity_score: 80 },
      { name: 'High Knees', category: 'Home & Bodyweight', met: 8.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [5, 10, 15], description: 'Running in place with high knee lifts', tips: 'Lift knees to hip height. Pump arms.', variations: ['In place', 'Moving forward', 'With arm movements'], popularity_score: 65 },
      { name: 'Jumping Jacks', category: 'Home & Bodyweight', met: 8.0, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [5, 10, 15, 20], description: 'Classic full-body aerobic exercise', tips: 'Land softly. Coordinate arms and legs.', variations: ['Standard', 'Modified', 'Star jumps'], popularity_score: 85 },

      // Outdoor (6)
      { name: 'Hiking', category: 'Outdoor', met: 6.0, difficulty: 'Intermediate', equipment: 'Hiking Boots', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [30, 45, 60, 90, 120], description: 'Walking on trails and hills in nature', tips: 'Wear proper footwear. Bring water and snacks.', variations: ['Easy trails', 'Moderate hills', 'Mountain hiking'], popularity_score: 80 },
      { name: 'Trail Running', category: 'Outdoor', met: 9.0, difficulty: 'Advanced', equipment: 'Running Shoes', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [20, 30, 45, 60], description: 'Running on natural terrain and trails', tips: 'Watch footing. Adjust pace for terrain.', variations: ['Forest trails', 'Mountain trails', 'Technical terrain'], popularity_score: 65 },
      { name: 'Rock Climbing', category: 'Outdoor', met: 8.0, difficulty: 'Advanced', equipment: 'Climbing Gear', muscle_groups: ['Full Body', 'Grip Strength'], duration_suggestions: [30, 45, 60, 90], description: 'Climbing natural or artificial rock surfaces', tips: 'Safety first. Build strength progressively.', variations: ['Bouldering', 'Top rope', 'Lead climbing'], popularity_score: 60 },
      { name: 'Mountain Biking', category: 'Outdoor', met: 8.5, difficulty: 'Intermediate', equipment: 'Mountain Bike', muscle_groups: ['Legs', 'Cardio', 'Core'], duration_suggestions: [30, 45, 60, 90], description: 'Cycling on off-road trails and terrain', tips: 'Wear helmet. Start on easier trails.', variations: ['Cross-country', 'Downhill', 'Trail riding'], popularity_score: 70 },
      { name: 'Kayaking', category: 'Outdoor', met: 5.0, difficulty: 'Beginner', equipment: 'Kayak, Paddle', muscle_groups: ['Arms', 'Core', 'Back'], duration_suggestions: [30, 45, 60], description: 'Paddling a kayak on water', tips: 'Wear life jacket. Learn proper paddle technique.', variations: ['Flatwater', 'River', 'Sea kayaking'], popularity_score: 55 },
      { name: 'Stand-Up Paddleboarding', category: 'Outdoor', met: 6.0, difficulty: 'Beginner', equipment: 'SUP Board', muscle_groups: ['Core', 'Legs', 'Arms'], duration_suggestions: [30, 45, 60], description: 'Standing and paddling on a board', tips: 'Start on calm water. Engage core for balance.', variations: ['Flatwater', 'SUP yoga', 'Wave riding'], popularity_score: 60 },

      // Yoga & Flexibility (6)
      { name: 'Hatha Yoga', category: 'Yoga & Flexibility', met: 2.5, difficulty: 'Beginner', equipment: 'Yoga Mat', muscle_groups: ['Full Body', 'Flexibility'], duration_suggestions: [30, 45, 60], description: 'Gentle yoga with basic poses and breathing', tips: 'Focus on breath. Don\'t force stretches.', variations: ['Beginner flow', 'Mixed poses', 'Restorative'], popularity_score: 75 },
      { name: 'Vinyasa Yoga', category: 'Yoga & Flexibility', met: 4.0, difficulty: 'Intermediate', equipment: 'Yoga Mat', muscle_groups: ['Full Body', 'Core', 'Flexibility'], duration_suggestions: [45, 60, 75], description: 'Dynamic flowing yoga with breath synchronization', tips: 'Link breath to movement. Build heat gradually.', variations: ['Power vinyasa', 'Slow flow', 'Creative sequencing'], popularity_score: 80 },
      { name: 'Power Yoga', category: 'Yoga & Flexibility', met: 4.5, difficulty: 'Intermediate', equipment: 'Yoga Mat', muscle_groups: ['Full Body', 'Strength'], duration_suggestions: [45, 60, 75], description: 'Vigorous yoga focused on strength and stamina', tips: 'Maintain strong foundation. Challenge yourself safely.', variations: ['Athletic yoga', 'Strength building', 'Intense flows'], popularity_score: 70 },
      { name: 'Yin Yoga', category: 'Yoga & Flexibility', met: 1.5, difficulty: 'Beginner', equipment: 'Yoga Mat', muscle_groups: ['Flexibility', 'Relaxation'], duration_suggestions: [45, 60, 75], description: 'Slow-paced yoga with long-held passive stretches', tips: 'Relax into poses. Hold for 3-5 minutes.', variations: ['Deep stretching', 'Meditative practice'], popularity_score: 65 },
      { name: 'Hot Yoga (Bikram)', category: 'Yoga & Flexibility', met: 5.0, difficulty: 'Intermediate', equipment: 'Yoga Mat', muscle_groups: ['Full Body', 'Flexibility'], duration_suggestions: [60, 90], description: 'Yoga practiced in heated room (95-105°F)', tips: 'Stay hydrated. Listen to your body in heat.', variations: ['Bikram series', '26 postures', 'Hot vinyasa'], popularity_score: 60 },
      { name: 'Stretching (General)', category: 'Yoga & Flexibility', met: 2.3, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Flexibility', 'Full Body'], duration_suggestions: [10, 15, 20, 30], description: 'General flexibility and stretching exercises', tips: 'Warm up first. Hold stretches 15-30 seconds.', variations: ['Static stretching', 'Dynamic stretching', 'PNF stretching'], popularity_score: 85 },

      // Daily Activities (6)
      { name: 'Household Cleaning', category: 'Daily Activities', met: 3.5, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body'], duration_suggestions: [15, 30, 45, 60], description: 'General housework and cleaning activities', tips: 'Turn on music. Make it enjoyable.', variations: ['Vacuuming', 'Mopping', 'Dusting', 'Organizing'], popularity_score: 50 },
      { name: 'Gardening', category: 'Daily Activities', met: 4.0, difficulty: 'Beginner', equipment: 'Garden Tools', muscle_groups: ['Full Body', 'Core'], duration_suggestions: [30, 45, 60], description: 'General gardening and yard work', tips: 'Use proper lifting technique. Take breaks.', variations: ['Weeding', 'Planting', 'Raking', 'Mowing'], popularity_score: 55 },
      { name: 'Playing with Children', category: 'Daily Activities', met: 5.8, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [15, 30, 45], description: 'Active play and games with children', tips: 'Stay engaged. Match their energy level.', variations: ['Running games', 'Sports', 'Playground activities'], popularity_score: 70 },
      { name: 'Dancing (Social)', category: 'Daily Activities', met: 4.5, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Full Body', 'Cardio'], duration_suggestions: [15, 30, 45, 60], description: 'Social dancing at parties or events', tips: 'Let loose. Enjoy the music and movement.', variations: ['Club dancing', 'Wedding dancing', 'Party dancing'], popularity_score: 65 },
      { name: 'Stair Climbing', category: 'Daily Activities', met: 8.0, difficulty: 'Intermediate', equipment: 'None', muscle_groups: ['Legs', 'Cardio'], duration_suggestions: [5, 10, 15, 20], description: 'Walking or running up stairs', tips: 'Use handrail if needed. Maintain steady pace.', variations: ['Slow pace', 'Fast pace', 'Skipping steps'], popularity_score: 75 },
      { name: 'Carrying Groceries', category: 'Daily Activities', met: 3.0, difficulty: 'Beginner', equipment: 'None', muscle_groups: ['Arms', 'Core'], duration_suggestions: [5, 10, 15], description: 'Carrying shopping bags and groceries', tips: 'Distribute weight evenly. Use proper grip.', variations: ['Light load', 'Heavy load', 'Multiple trips'], popularity_score: 45 }
    ];

    // Insert in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);
      const { error: exError } = await supabase
        .from('exercise_library')
        .insert(batch);

      if (exError) throw exError;
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} exercises)`);
    }

    console.log(`✓ Total: ${exercises.length} exercises inserted`);
    console.log('✅ Exercise library initialization complete!');

    return {
      success: true,
      message: `Successfully initialized exercise library with ${categories.length} categories and ${exercises.length} exercises`
    };

  } catch (error) {
    console.error('Error initializing exercise library:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// @ts-nocheck
import { supabase } from './supabase';

export const initializeNepalFoodDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data: existingFoods, error: checkError } = await supabase
      .from('nepal_food_composition')
      .select('id')
      .limit(1);

    // If no error and we have tables, check if they have data
    if (!checkError) {
      if (existingFoods && existingFoods.length > 0) {
        return { success: true, message: 'Database already initialized' };
      }
    }

    // Seed Nepal food data
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
      { food_name: 'Kheer', calories_per_100g: 150, protein_per_100g: 4, fat_per_100g: 5, carbs_per_100g: 22, fiber_per_100g: 0.5 },
      { food_name: 'Jalebi', calories_per_100g: 400, protein_per_100g: 3, fat_per_100g: 16, carbs_per_100g: 62, fiber_per_100g: 0.5 },
      { food_name: 'Roti', calories_per_100g: 270, protein_per_100g: 7, fat_per_100g: 3, carbs_per_100g: 52, fiber_per_100g: 3 },
      { food_name: 'Papad', calories_per_100g: 360, protein_per_100g: 20, fat_per_100g: 2, carbs_per_100g: 60, fiber_per_100g: 7 },
      { food_name: 'Achar (pickle)', calories_per_100g: 65, protein_per_100g: 1, fat_per_100g: 4, carbs_per_100g: 7, fiber_per_100g: 2 },
    ];

    const { error: foodError } = await supabase
      .from('nepal_food_composition')
      .insert(nepalFoods);

    if (foodError && !foodError.message.includes('duplicate')) {
      throw foodError;
    }

    // Seed portion mappings
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
      { food_name: 'Kheer', portion_name: '1 bowl', grams: 150 },
      { food_name: 'Jalebi', portion_name: '1 piece', grams: 30 },
      { food_name: 'Roti', portion_name: '1 piece', grams: 40 },
      { food_name: 'Papad', portion_name: '1 piece', grams: 15 },
      { food_name: 'Achar (pickle)', portion_name: '1 tablespoon', grams: 15 },
    ];

    const { error: portionError } = await supabase
      .from('food_portions')
      .insert(portions);

    if (portionError && !portionError.message.includes('duplicate')) {
      throw portionError;
    }

    // Seed exercise MET values
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
      { activity_name: 'Cricket', met: 5.0, category: 'Moderate' },
      { activity_name: 'Volleyball', met: 4.0, category: 'Moderate' },
    ];

    const { error: exerciseError } = await supabase
      .from('exercise_met_values')
      .insert(exercises);

    if (exerciseError && !exerciseError.message.includes('duplicate')) {
      throw exerciseError;
    }

    return {
      success: true,
      message: 'Nepal food database initialized successfully',
      data: {
        foods: nepalFoods.length,
        portions: portions.length,
        exercises: exercises.length,
      },
    };
  } catch (error) {
    console.error('Database initialization error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to initialize database. Tables may need to be created manually.',
    };
  }
};

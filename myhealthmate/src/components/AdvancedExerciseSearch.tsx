import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, X, Filter, Heart, Clock, Dumbbell, Info, Star, Plus } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  met: number;
  difficulty: string;
  equipment: string;
  muscle_groups: string[];
  duration_suggestions: number[];
  description: string;
  tips: string;
  variations: string[];
  popularity_score: number;
}

interface AdvancedExerciseSearchProps {
  onExerciseSelect: (exercise: {
    type: string;
    duration: number;
    calories: number;
  }) => void;
  userWeight?: number;
}

const AdvancedExerciseSearch: React.FC<AdvancedExerciseSearchProps> = ({
  onExerciseSelect,
  userWeight = 70
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [duration, setDuration] = useState(30);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // Difficulty colors
  const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  };

  // Category colors
  const categoryColors: Record<string, string> = {
    'Strength Training': 'bg-red-50 border-red-200',
    'Cardio': 'bg-orange-50 border-orange-200',
    'Sports': 'bg-yellow-50 border-yellow-200',
    'Dance & Aerobics': 'bg-lime-50 border-lime-200',
    'Home & Bodyweight': 'bg-cyan-50 border-cyan-200',
    'Outdoor': 'bg-emerald-50 border-emerald-200',
    'Yoga & Flexibility': 'bg-purple-50 border-purple-200',
    'Daily Activities': 'bg-gray-50 border-gray-200'
  };

  // Load exercises and categories
  useEffect(() => {
    loadExercises();
    loadCategories();
    loadFavorites();
  }, []);

  // Apply filters
  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedCategory, selectedDifficulty, selectedEquipment, selectedMuscleGroup]);

  // Calculate calories when exercise or duration changes
  useEffect(() => {
    if (selectedExercise) {
      const hours = duration / 60;
      const calories = Math.round(selectedExercise.met * userWeight * hours);
      setCalculatedCalories(calories);
    }
  }, [selectedExercise, duration, userWeight]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .order('popularity_score', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_exercise_favorites')
        .select('exercise_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.exercise_id) || []));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (exerciseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (favorites.has(exerciseId)) {
        await supabase
          .from('user_exercise_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(exerciseId);
          return next;
        });
      } else {
        await supabase
          .from('user_exercise_favorites')
          .insert({ user_id: user.id, exercise_id: exerciseId });
        
        setFavorites(prev => new Set(prev).add(exerciseId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty);
    }

    // Equipment filter
    if (selectedEquipment !== 'All') {
      if (selectedEquipment === 'None') {
        filtered = filtered.filter(ex => !ex.equipment || ex.equipment === 'None');
      } else {
        filtered = filtered.filter(ex => ex.equipment?.includes(selectedEquipment));
      }
    }

    // Muscle group filter
    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(ex =>
        ex.muscle_groups?.some(mg => mg.includes(selectedMuscleGroup))
      );
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDuration(exercise.duration_suggestions?.[0] || 30);
  };

  const handleAddWorkout = () => {
    if (!selectedExercise) return;

    onExerciseSelect({
      type: selectedExercise.name,
      duration,
      calories: calculatedCalories
    });

    // Reset selection
    setSelectedExercise(null);
    setSearchQuery('');
  };

  const getEquipmentOptions = () => {
    const equipmentSet = new Set<string>();
    exercises.forEach(ex => {
      if (ex.equipment) {
        ex.equipment.split(',').forEach(e => equipmentSet.add(e.trim()));
      }
    });
    return ['All', 'None', ...Array.from(equipmentSet).sort()];
  };

  const getMuscleGroupOptions = () => {
    const muscleSet = new Set<string>();
    exercises.forEach(ex => {
      ex.muscle_groups?.forEach(mg => muscleSet.add(mg));
    });
    return ['All', ...Array.from(muscleSet).sort()];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises by name or description..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {getEquipmentOptions().map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {/* Muscle Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Group</label>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {getMuscleGroupOptions().map(mg => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Selected Exercise Detail & Calculator */}
      {selectedExercise && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{selectedExercise.name}</h3>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[selectedExercise.difficulty]}`}>
                  {selectedExercise.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  MET: {selectedExercise.met}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <div className="flex gap-2 mb-2">
                {selectedExercise.duration_suggestions?.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      duration === d
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Calorie Display */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Estimated Calories Burned</div>
                <div className="text-3xl font-bold">{calculatedCalories}</div>
                <div className="text-xs opacity-75 mt-1">
                  {selectedExercise.met} MET × {userWeight}kg × {(duration / 60).toFixed(2)}hr
                </div>
              </div>
            </div>

            {/* Add Workout Button */}
            <button
              onClick={handleAddWorkout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Add Workout
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredExercises.length} of {exercises.length} exercises
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map(exercise => (
          <div
            key={exercise.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
              selectedExercise?.id === exercise.id
                ? 'border-purple-500 bg-purple-50'
                : categoryColors[exercise.category] || 'bg-white border-gray-200'
            }`}
            onClick={() => handleExerciseSelect(exercise)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{exercise.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(exercise.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${favorites.has(exercise.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                  {exercise.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {exercise.met} MET
                </span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">{exercise.description}</p>

              {exercise.equipment && exercise.equipment !== 'None' && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Dumbbell className="h-3 w-3" />
                  <span>{exercise.equipment}</span>
                </div>
              )}

              {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.slice(0, 3).map((mg, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {mg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No exercises found matching your criteria.</p>
          <p className="text-sm mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedExerciseSearch;

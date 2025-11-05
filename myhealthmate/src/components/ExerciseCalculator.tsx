// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, X, Activity, Zap, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercise {
  activity_name: string;
  met: number;
  category: string;
}

interface ExerciseCalculatorProps {
  onCalculate: (data: {
    type: string;
    duration: number;
    calories: number;
  }) => void;
  onManualEntry: () => void;
  initialData?: {
    type: string;
    duration: number;
    calories: number;
  };
}

export default function ExerciseCalculator({ onCalculate, onManualEntry, initialData }: ExerciseCalculatorProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialData?.type || '');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number>(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const quickDurations = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hr', value: 60 },
  ];

  // Load exercises and user weight on mount
  useEffect(() => {
    loadExercises();
    loadUserWeight();
  }, []);

  // If initialData is provided, search for it
  useEffect(() => {
    if (initialData && exercises.length > 0 && !selectedExercise) {
      const found = exercises.find(ex => 
        ex.activity_name.toLowerCase().includes(initialData.type.toLowerCase())
      );
      if (found) {
        setSelectedExercise(found);
        setSearchQuery(found.activity_name);
      }
    }
  }, [initialData, exercises]);

  // Filter exercises based on search query
  useEffect(() => {
    if (searchQuery.trim() && !selectedExercise) {
      const filtered = exercises.filter(exercise =>
        exercise.activity_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredExercises([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, exercises, selectedExercise]);

  // Calculate calories when exercise, duration, or weight changes
  useEffect(() => {
    if (selectedExercise && duration && userWeight) {
      const durationInHours = parseFloat(duration) / 60;
      const calories = Math.round(selectedExercise.met * userWeight * durationInHours);
      setCalculatedCalories(calories);
    } else {
      setCalculatedCalories(0);
    }
  }, [selectedExercise, duration, userWeight]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('exercise_met_values')
      .select('*')
      .order('activity_name');

    if (!error && data) {
      setExercises(data);
    }
  };

  const loadUserWeight = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('weight')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data && data.weight) {
      setUserWeight(data.weight);
    } else {
      // Default weight if not set
      setUserWeight(70);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSearchQuery(exercise.activity_name);
    setShowSuggestions(false);
  };

  const handleQuickDuration = (minutes: number) => {
    setDuration(minutes.toString());
  };

  const handleCalculateAndSubmit = () => {
    if (selectedExercise && duration && calculatedCalories > 0) {
      onCalculate({
        type: selectedExercise.activity_name,
        duration: parseInt(duration),
        calories: calculatedCalories,
      });
      resetCalculator();
    }
  };

  const resetCalculator = () => {
    setSearchQuery('');
    setSelectedExercise(null);
    setDuration('');
    setCalculatedCalories(0);
    setShowSuggestions(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Light':
        return 'bg-green-100 text-green-700';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Vigorous':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Activity Search */}
      <div ref={searchRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Activity
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedExercise(null);
            }}
            onFocus={() => searchQuery && !selectedExercise && setShowSuggestions(true)}
            className="w-full pl-10 pr-10 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type activity (e.g., walking, running)"
          />
          {searchQuery && (
            <button
              onClick={resetCalculator}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && filteredExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredExercises.map((exercise, index) => (
                <button
                  key={index}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{exercise.activity_name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        MET: {exercise.met} • Intensity: {exercise.category}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results message */}
        {showSuggestions && searchQuery && filteredExercises.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center">No activities found.</p>
            <button
              onClick={onManualEntry}
              className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
            >
              Enter workout manually instead
            </button>
          </div>
        )}
      </div>

      {/* Calculator Section */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100"
          >
            {/* Selected Activity Info */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">{selectedExercise.activity_name}</div>
                  <div className="text-sm text-gray-600">MET: {selectedExercise.met}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedExercise.category)}`}>
                {selectedExercise.category}
              </span>
            </div>

            {/* User Weight Display */}
            {userWeight && (
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4" />
                  <span>Your weight: <strong>{userWeight} kg</strong></span>
                  <span className="text-xs text-gray-500">(from profile)</span>
                </div>
              </div>
            )}

            {/* Duration Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              
              {/* Quick Duration Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickDurations.map((qd) => (
                  <button
                    key={qd.value}
                    type="button"
                    onClick={() => handleQuickDuration(qd.value)}
                    className={`px-3 py-2 min-h-[44px] rounded-lg font-medium transition-colors ${
                      duration === qd.value.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>

              {/* Custom Duration Input */}
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom duration"
                min="1"
              />
            </div>

            {/* Calculated Calories Display */}
            {calculatedCalories > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Estimated Calories Burned</div>
                    <div className="text-3xl font-bold">{calculatedCalories} kcal</div>
                    <div className="text-xs opacity-75 mt-1">
                      Based on {selectedExercise.met} MET × {userWeight} kg × {(parseFloat(duration) / 60).toFixed(2)} hrs
                    </div>
                  </div>
                  <Flame className="w-10 h-10" />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCalculateAndSubmit}
                disabled={!selectedExercise || !duration || calculatedCalories === 0}
                className="flex-1 px-4 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                Add Workout
              </button>
              <button
                onClick={resetCalculator}
                className="px-4 py-3 min-h-[48px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Entry Option */}
      {!selectedExercise && (
        <div className="text-center">
          <button
            onClick={onManualEntry}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Or enter workout details manually
          </button>
        </div>
      )}
    </div>
  );
}

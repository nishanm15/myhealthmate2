// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodItem {
  food_name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
}

interface Portion {
  portion_name: string;
  grams: number;
}

interface FoodSearchProps {
  onFoodSelect: (nutritionData: {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
  onManualEntry: () => void;
}

export default function FoodSearch({ onFoodSelect, onManualEntry }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portions, setPortions] = useState<Portion[]>([]);
  const [selectedPortion, setSelectedPortion] = useState<Portion | null>(null);
  const [customGrams, setCustomGrams] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPortions, setShowPortions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all foods on mount
  useEffect(() => {
    loadFoods();
  }, []);

  // Filter foods based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = foods.filter(food =>
        food.food_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredFoods([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, foods]);

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

  const loadFoods = async () => {
    const { data, error } = await supabase
      .from('nepal_food_composition')
      .select('*')
      .order('food_name');

    if (!error && data) {
      setFoods(data);
    }
  };

  const loadPortions = async (foodName: string) => {
    const { data, error } = await supabase
      .from('food_portions')
      .select('portion_name, grams')
      .eq('food_name', foodName);

    if (!error && data) {
      setPortions(data);
    }
  };

  const handleFoodSelect = async (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.food_name);
    setShowSuggestions(false);
    setShowPortions(true);
    await loadPortions(food.food_name);
  };

  const handlePortionSelect = (portion: Portion) => {
    setSelectedPortion(portion);
    calculateAndSubmit(portion.grams);
  };

  const handleCustomGramsSubmit = () => {
    const grams = parseFloat(customGrams);
    if (grams > 0) {
      calculateAndSubmit(grams);
    }
  };

  const calculateAndSubmit = (grams: number) => {
    if (!selectedFood) return;

    const multiplier = grams / 100;
    const nutritionData = {
      food_name: selectedFood.food_name,
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein: parseFloat((selectedFood.protein_per_100g * multiplier).toFixed(1)),
      carbs: parseFloat((selectedFood.carbs_per_100g * multiplier).toFixed(1)),
      fat: parseFloat((selectedFood.fat_per_100g * multiplier).toFixed(1)),
    };

    onFoodSelect(nutritionData);
    resetSearch();
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setSelectedPortion(null);
    setPortions([]);
    setCustomGrams('');
    setShowPortions(false);
    setShowSuggestions(false);
  };

  const calculateNutrition = (grams: number) => {
    if (!selectedFood) return null;
    
    const multiplier = grams / 100;
    return {
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein: (selectedFood.protein_per_100g * multiplier).toFixed(1),
      carbs: (selectedFood.carbs_per_100g * multiplier).toFixed(1),
      fat: (selectedFood.fat_per_100g * multiplier).toFixed(1),
    };
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Nepal Food
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            className="w-full pl-10 pr-10 py-3 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type food name (e.g., rice, dal, momo)"
          />
          {searchQuery && (
            <button
              onClick={resetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && filteredFoods.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredFoods.map((food, index) => (
                <button
                  key={index}
                  onClick={() => handleFoodSelect(food)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{food.food_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {food.calories_per_100g} cal/100g • P: {food.protein_per_100g}g • C: {food.carbs_per_100g}g • F: {food.fat_per_100g}g
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results message */}
        {showSuggestions && searchQuery && filteredFoods.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center">No Nepal foods found.</p>
            <button
              onClick={onManualEntry}
              className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
            >
              Enter nutrition manually instead
            </button>
          </div>
        )}
      </div>

      {/* Portion Selection */}
      <AnimatePresence>
        {showPortions && selectedFood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100"
          >
            <h4 className="font-semibold text-gray-900">Select Portion Size</h4>
            
            {/* Standard Portions */}
            {portions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {portions.map((portion, index) => {
                  const nutrition = calculateNutrition(portion.grams);
                  return (
                    <button
                      key={index}
                      onClick={() => handlePortionSelect(portion)}
                      className="p-3 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">{portion.portion_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {portion.grams}g • {nutrition?.calories} cal
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom Amount */}
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount (grams)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                  className="flex-1 px-3 py-2 min-h-[44px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter grams"
                  min="1"
                />
                <button
                  onClick={handleCustomGramsSubmit}
                  disabled={!customGrams || parseFloat(customGrams) <= 0}
                  className="px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {customGrams && parseFloat(customGrams) > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const nutrition = calculateNutrition(parseFloat(customGrams));
                    return nutrition ? (
                      <div>
                        Nutrition: {nutrition.calories} cal • P: {nutrition.protein}g • C: {nutrition.carbs}g • F: {nutrition.fat}g
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <button
              onClick={resetSearch}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Entry Option */}
      {!selectedFood && (
        <div className="text-center">
          <button
            onClick={onManualEntry}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Or enter nutrition manually
          </button>
        </div>
      )}
    </div>
  );
}

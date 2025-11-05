import React, { useState } from 'react';
import { Search, X, Info, Database, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DatabaseFood {
  id: string;
  food_id: string;
  name: string;
  category: string;
  origin_country: string;
  origin_region: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  total_fat_g: number;
  dietary_fiber_g?: number;
  total_sugar_g?: number;
  data_source: string;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
}

interface UnifiedFoodSearchProps {
  onFoodSelect: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    source: string;
  }) => void;
}

const UnifiedFoodSearch: React.FC<UnifiedFoodSearchProps> = ({ onFoodSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [databaseResults, setDatabaseResults] = useState<DatabaseFood[]>([]);
  const [usdaResults, setUsdaResults] = useState<USDAFoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<DatabaseFood | USDAFoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const USDA_API_KEY = 'DLfkdtQae52XQh58IkXUiUEbAdHjmdFO0tvBPoFm';

  const searchDatabaseFoods = async (query: string) => {
    const { data, error } = await supabase
      .from('global_foods')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);

    if (!error && data) {
      return data;
    }
    return [];
  };

  const searchUSDAFoods = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy,Survey&pageSize=10`
      );
      
      if (!response.ok) {
        throw new Error('USDA API request failed');
      }
      
      const data = await response.json();
      return data.foods || [];
    } catch (err) {
      console.error('USDA search error:', err);
      return [];
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSearchPerformed(true);
    
    try {
      // Search both database and USDA API simultaneously
      const [dbResults, usdaFoods] = await Promise.all([
        searchDatabaseFoods(searchQuery),
        searchUSDAFoods(searchQuery)
      ]);
      
      setDatabaseResults(dbResults);
      setUsdaResults(usdaFoods);
    } catch (err) {
      setError('Failed to search foods. Please check your connection.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNutrientValue = (nutrients: any[], nutrientName: string) => {
    const nutrient = nutrients.find(n => 
      n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
    );
    return nutrient ? nutrient.value : 0;
  };

  const handleDatabaseFoodSelect = (food: DatabaseFood) => {
    const foodData = {
      name: food.name,
      calories: Math.round(food.energy_kcal || 0),
      protein: Math.round((food.protein_g || 0) * 100) / 100,
      carbs: Math.round((food.carbohydrate_g || 0) * 100) / 100,
      fats: Math.round((food.total_fat_g || 0) * 100) / 100,
      fiber: Math.round((food.dietary_fiber_g || 0) * 100) / 100,
      sugar: Math.round((food.total_sugar_g || 0) * 100) / 100,
      source: 'database'
    };
    
    onFoodSelect(foodData);
    setSelectedFood(food);
  };

  const handleUSDAFoodSelect = (food: USDAFoodItem) => {
    const nutrients = food.foodNutrients || [];
    
    const foodData = {
      name: food.description,
      calories: Math.round(getNutrientValue(nutrients, 'energy') || 0),
      protein: Math.round(getNutrientValue(nutrients, 'protein') * 100) / 100,
      carbs: Math.round(getNutrientValue(nutrients, 'carbohydrate') * 100) / 100,
      fats: Math.round(getNutrientValue(nutrients, 'total lipid') * 100) / 100,
      fiber: Math.round(getNutrientValue(nutrients, 'fiber') * 100) / 100,
      sugar: Math.round(getNutrientValue(nutrients, 'sugars') * 100) / 100,
      source: 'usda'
    };
    
    onFoodSelect(foodData);
    setSelectedFood(food);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDatabaseResults([]);
    setUsdaResults([]);
    setSelectedFood(null);
    setError('');
    setSearchPerformed(false);
  };

  const hasResults = databaseResults.length > 0 || usdaResults.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Universal Food Search</h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Database + Global</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchFoods()}
              placeholder="Search any food worldwide (e.g., 'mango', 'quinoa', 'dal bhat', 'salmon')"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={searchFoods}
            disabled={isLoading || !searchQuery.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Search</span>
          </button>
          {(searchQuery || searchPerformed) && (
            <button
              onClick={clearSearch}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* No Results */}
      {searchPerformed && !hasResults && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No foods found. Try searching for something else!</p>
        </div>
      )}

      {/* Database Results */}
      {databaseResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-green-50">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-gray-900">
                Your Database Foods ({databaseResults.length})
              </h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Local + Global</span>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {databaseResults.map((food) => (
              <div
                key={food.id}
                className="p-4 border-b hover:bg-green-50 cursor-pointer transition-colors"
                onClick={() => handleDatabaseFoodSelect(food)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{food.name}</h5>
                    <p className="text-sm text-gray-500 mt-1">
                      {food.category} • {food.origin_country}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {Math.round(food.energy_kcal)} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USDA Results */}
      {usdaResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">
                USDA Global Database ({usdaResults.length})
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">400K+ Foods</span>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {usdaResults.map((food) => (
              <div
                key={food.fdcId}
                className="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleUSDAFoodSelect(food)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{food.description}</h5>
                    <p className="text-sm text-gray-500 mt-1">
                      {food.dataType} • USDA Database
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {getNutrientValue(food.foodNutrients || [], 'energy')} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Food Details */}
      {selectedFood && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Selected Food Details</h4>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
              {'food_id' in selectedFood ? 'Your Database' : 'USDA Database'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">
                  {'name' in selectedFood ? selectedFood.name : selectedFood.description}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <p className="text-gray-900">
                  {'food_id' in selectedFood ? 'Your Database' : 'USDA Global'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <div>
                <span className="font-medium text-gray-700">Calories:</span>
                <p className="text-gray-900">
                  {'energy_kcal' in selectedFood 
                    ? Math.round(selectedFood.energy_kcal)
                    : Math.round(getNutrientValue(selectedFood.foodNutrients || [], 'energy'))
                  } kcal
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Protein:</span>
                <p className="text-gray-900">
                  {'protein_g' in selectedFood
                    ? Math.round((selectedFood.protein_g || 0) * 100) / 100
                    : Math.round(getNutrientValue(selectedFood.foodNutrients || [], 'protein') * 100) / 100
                  } g
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Carbs:</span>
                <p className="text-gray-900">
                  {'carbohydrate_g' in selectedFood
                    ? Math.round((selectedFood.carbohydrate_g || 0) * 100) / 100
                    : Math.round(getNutrientValue(selectedFood.foodNutrients || [], 'carbohydrate') * 100) / 100
                  } g
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fat:</span>
                <p className="text-gray-900">
                  {'total_fat_g' in selectedFood
                    ? Math.round((selectedFood.total_fat_g || 0) * 100) / 100
                    : Math.round(getNutrientValue(selectedFood.foodNutrients || [], 'total lipid') * 100) / 100
                  } g
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fiber:</span>
                <p className="text-gray-900">
                  {'dietary_fiber_g' in selectedFood
                    ? Math.round((selectedFood.dietary_fiber_g || 0) * 100) / 100
                    : Math.round(getNutrientValue((selectedFood as USDAFoodItem).foodNutrients || [], 'fiber') * 100) / 100
                  } g
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sugar:</span>
                <p className="text-gray-900">
                  {'total_sugar_g' in selectedFood
                    ? Math.round((selectedFood.total_sugar_g || 0) * 100) / 100
                    : Math.round(getNutrientValue((selectedFood as USDAFoodItem).foodNutrients || [], 'sugars') * 100) / 100
                  } g
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!searchQuery && !searchPerformed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Try searching for:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'dal bhat',     // Nepali food
              'momo',         // Nepali food  
              'apple',        // Database food
              'quinoa',       // USDA food
              'salmon',       // USDA food
              'chicken',      // Both databases
              'rice',         // Both databases
              'mango'         // Database food
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedFoodSearch;
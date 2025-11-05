import { supabase } from './supabase';

// ============================================================================
// API Integration System for Global Food Database
// Supports USDA FoodData Central and Open Food Facts
// ============================================================================

interface APIConfig {
  apiName: string;
  baseUrl: string;
  apiKey?: string;
  rateLimitPerHour?: number;
  rateLimitPerMinute?: number;
  isEnabled: boolean;
}

interface CachedResponse {
  data: any;
  cachedAt: Date;
  expiresAt: Date;
}

// ============================================================================
// Cache Management
// ============================================================================

const CACHE_DURATION_HOURS = 24; // Cache API responses for 24 hours

async function getCachedResponse(apiName: string, requestKey: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('api_request_cache')
      .select('response_data, expires_at')
      .eq('api_name', apiName)
      .eq('request_key', requestKey)
      .single();

    if (error || !data) return null;

    // Check if cache is still valid
    if (new Date(data.expires_at) > new Date()) {
      return data.response_data;
    }

    // Cache expired, delete it
    await supabase
      .from('api_request_cache')
      .delete()
      .eq('api_name', apiName)
      .eq('request_key', requestKey);

    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

async function setCachedResponse(apiName: string, requestKey: string, responseData: any): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    await supabase
      .from('api_request_cache')
      .upsert({
        api_name: apiName,
        request_key: requestKey,
        response_data: responseData,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'api_name,request_key'
      });
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

async function checkRateLimit(apiName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('api_name', apiName)
      .single();

    if (error || !data || !data.is_enabled) return false;

    const now = new Date();
    const lastRequest = data.last_request_at ? new Date(data.last_request_at) : new Date(0);
    
    // Reset counters if hour or minute has passed
    const hourDiff = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60);
    const minuteDiff = (now.getTime() - lastRequest.getTime()) / (1000 * 60);

    let requestCountHour = data.request_count_hour || 0;
    let requestCountMinute = data.request_count_minute || 0;

    if (hourDiff >= 1) requestCountHour = 0;
    if (minuteDiff >= 1) requestCountMinute = 0;

    // Check limits
    if (data.rate_limit_per_hour && requestCountHour >= data.rate_limit_per_hour) {
      console.warn(`Rate limit exceeded for ${apiName}: ${requestCountHour}/${data.rate_limit_per_hour} per hour`);
      return false;
    }

    if (data.rate_limit_per_minute && requestCountMinute >= data.rate_limit_per_minute) {
      console.warn(`Rate limit exceeded for ${apiName}: ${requestCountMinute}/${data.rate_limit_per_minute} per minute`);
      return false;
    }

    // Update counters
    await supabase
      .from('api_configurations')
      .update({
        last_request_at: now.toISOString(),
        request_count_hour: requestCountHour + 1,
        request_count_minute: requestCountMinute + 1
      })
      .eq('api_name', apiName);

    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return false;
  }
}

// ============================================================================
// USDA FoodData Central API Integration
// ============================================================================

export const USDA_API = {
  async getConfig(): Promise<APIConfig | null> {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('api_name', 'USDA_FoodData_Central')
      .single();

    if (error || !data) return null;
    return data as APIConfig;
  },

  async searchFoods(query: string, pageSize: number = 25): Promise<any> {
    const config = await this.getConfig();
    if (!config || !config.isEnabled || !config.apiKey) {
      throw new Error('USDA API is not configured or enabled');
    }

    const requestKey = `search_${query}_${pageSize}`;
    
    // Check cache first
    const cached = await getCachedResponse('USDA_FoodData_Central', requestKey);
    if (cached) {
      console.log('Returning cached USDA search results');
      return cached;
    }

    // Check rate limit
    if (!await checkRateLimit('USDA_FoodData_Central')) {
      throw new Error('USDA API rate limit exceeded');
    }

    try {
      const url = `${config.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      await setCachedResponse('USDA_FoodData_Central', requestKey, data);
      
      return data;
    } catch (error) {
      console.error('USDA API search error:', error);
      throw error;
    }
  },

  async getFoodById(fdcId: string): Promise<any> {
    const config = await this.getConfig();
    if (!config || !config.isEnabled || !config.apiKey) {
      throw new Error('USDA API is not configured or enabled');
    }

    const requestKey = `food_${fdcId}`;
    
    // Check cache first
    const cached = await getCachedResponse('USDA_FoodData_Central', requestKey);
    if (cached) {
      console.log('Returning cached USDA food details');
      return cached;
    }

    // Check rate limit
    if (!await checkRateLimit('USDA_FoodData_Central')) {
      throw new Error('USDA API rate limit exceeded');
    }

    try {
      const url = `${config.baseUrl}/food/${fdcId}?api_key=${config.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      await setCachedResponse('USDA_FoodData_Central', requestKey, data);
      
      return data;
    } catch (error) {
      console.error('USDA API getFoodById error:', error);
      throw error;
    }
  },

  // Normalize USDA food data to our global_foods schema
  normalizeFood(usdaFood: any): any {
    const nutrients: any = {};
    
    // Map USDA nutrients to our schema
    usdaFood.foodNutrients?.forEach((nutrient: any) => {
      const name = nutrient.nutrient?.name?.toLowerCase() || '';
      const value = nutrient.amount;
      
      if (name.includes('energy')) nutrients.energy_kcal = value;
      else if (name.includes('protein')) nutrients.protein_g = value;
      else if (name.includes('carbohydrate')) nutrients.carbohydrate_g = value;
      else if (name.includes('total fat') || name === 'fat') nutrients.total_fat_g = value;
      else if (name.includes('fiber')) nutrients.dietary_fiber_g = value;
      else if (name.includes('sugars, total')) nutrients.total_sugar_g = value;
      else if (name.includes('calcium')) nutrients.calcium_mg = value;
      else if (name.includes('iron')) nutrients.iron_mg = value;
      else if (name.includes('vitamin a')) nutrients.vitamin_a_ug = value;
      else if (name.includes('vitamin c')) nutrients.vitamin_c_mg = value;
      else if (name.includes('vitamin d')) nutrients.vitamin_d_ug = value;
      else if (name.includes('sodium')) nutrients.sodium_mg = value;
      else if (name.includes('potassium')) nutrients.potassium_mg = value;
      // Add more nutrient mappings as needed
    });

    return {
      food_id: `USDA_${usdaFood.fdcId}`,
      name: usdaFood.description,
      alternative_names: usdaFood.additionalDescriptions || [],
      category: usdaFood.foodCategory?.description || 'Unknown',
      food_group: usdaFood.foodCategory?.description,
      description: usdaFood.description,
      ...nutrients,
      data_source: 'USDA',
      source_id: usdaFood.fdcId.toString(),
      serving_size_g: 100 // USDA data is per 100g
    };
  }
};

// ============================================================================
// Open Food Facts API Integration
// ============================================================================

export const OpenFoodFacts_API = {
  async getConfig(): Promise<APIConfig | null> {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('api_name', 'Open_Food_Facts')
      .single();

    if (error || !data) return null;
    return data as APIConfig;
  },

  async searchProducts(query: string, page: number = 1, pageSize: number = 25): Promise<any> {
    const config = await this.getConfig();
    if (!config || !config.isEnabled) {
      throw new Error('Open Food Facts API is not enabled');
    }

    const requestKey = `search_${query}_${page}_${pageSize}`;
    
    // Check cache first
    const cached = await getCachedResponse('Open_Food_Facts', requestKey);
    if (cached) {
      console.log('Returning cached Open Food Facts search results');
      return cached;
    }

    // Check rate limit
    if (!await checkRateLimit('Open_Food_Facts')) {
      throw new Error('Open Food Facts API rate limit exceeded');
    }

    try {
      const url = `${config.baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&json=true`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MyHealthMate - Nutrition Tracker - https://myhealthmate.app'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Open Food Facts API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      await setCachedResponse('Open_Food_Facts', requestKey, data);
      
      return data;
    } catch (error) {
      console.error('Open Food Facts API search error:', error);
      throw error;
    }
  },

  async getProductByBarcode(barcode: string): Promise<any> {
    const config = await this.getConfig();
    if (!config || !config.isEnabled) {
      throw new Error('Open Food Facts API is not enabled');
    }

    const requestKey = `product_${barcode}`;
    
    // Check cache first
    const cached = await getCachedResponse('Open_Food_Facts', requestKey);
    if (cached) {
      console.log('Returning cached Open Food Facts product');
      return cached;
    }

    // Check rate limit
    if (!await checkRateLimit('Open_Food_Facts')) {
      throw new Error('Open Food Facts API rate limit exceeded');
    }

    try {
      const url = `${config.baseUrl}/api/v2/product/${barcode}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MyHealthMate - Nutrition Tracker - https://myhealthmate.app'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Open Food Facts API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      await setCachedResponse('Open_Food_Facts', requestKey, data);
      
      return data;
    } catch (error) {
      console.error('Open Food Facts API getProductByBarcode error:', error);
      throw error;
    }
  },

  // Normalize Open Food Facts product data to our global_foods schema
  normalizeProduct(offProduct: any): any {
    const product = offProduct.product;
    const nutriments = product.nutriments || {};

    return {
      food_id: `OFF_${product.code}`,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      alternative_names: [
        product.product_name_en,
        product.generic_name,
        product.brands
      ].filter(Boolean),
      category: product.categories || 'Packaged Food',
      subcategory: product.categories_tags?.[0]?.replace('en:', ''),
      description: product.generic_name || product.product_name,
      
      // Nutritional data (per 100g)
      energy_kcal: nutriments['energy-kcal_100g'] || nutriments.energy_100g / 4.184,
      protein_g: nutriments.proteins_100g,
      carbohydrate_g: nutriments.carbohydrates_100g,
      total_fat_g: nutriments.fat_100g,
      dietary_fiber_g: nutriments.fiber_100g,
      total_sugar_g: nutriments.sugars_100g,
      
      // Minerals
      calcium_mg: nutriments.calcium_100g ? nutriments.calcium_100g * 1000 : undefined,
      iron_mg: nutriments.iron_100g ? nutriments.iron_100g * 1000 : undefined,
      sodium_mg: nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : undefined,
      
      // Fats
      saturated_fat_g: nutriments['saturated-fat_100g'],
      trans_fat_g: nutriments['trans-fat_100g'],
      cholesterol_mg: nutriments.cholesterol_100g ? nutriments.cholesterol_100g * 1000 : undefined,
      
      // Metadata
      data_source: 'OpenFoodFacts',
      source_id: product.code,
      image_url: product.image_url,
      barcode: product.code,
      brand: product.brands,
      serving_size_g: product.serving_quantity ? parseFloat(product.serving_quantity) : 100,
      origin_country: product.countries,
      water_g: nutriments.water_100g,
      alcohol_g: nutriments.alcohol_100g
    };
  }
};

// ============================================================================
// Food Import Functions
// ============================================================================

export async function importFoodFromUSDA(fdcId: string): Promise<boolean> {
  try {
    const usdaFood = await USDA_API.getFoodById(fdcId);
    const normalizedFood = USDA_API.normalizeFood(usdaFood);

    const { error } = await supabase
      .from('global_foods')
      .upsert(normalizedFood, { onConflict: 'food_id' });

    if (error) {
      console.error('Error importing USDA food:', error);
      return false;
    }

    console.log(`Successfully imported USDA food: ${normalizedFood.name}`);
    return true;
  } catch (error) {
    console.error('Error in importFoodFromUSDA:', error);
    return false;
  }
}

export async function importFoodFromOpenFoodFacts(barcode: string): Promise<boolean> {
  try {
    const offProduct = await OpenFoodFacts_API.getProductByBarcode(barcode);
    if (offProduct.status !== 1) {
      console.error('Product not found in Open Food Facts');
      return false;
    }

    const normalizedFood = OpenFoodFacts_API.normalizeProduct(offProduct);

    const { error } = await supabase
      .from('global_foods')
      .upsert(normalizedFood, { onConflict: 'food_id' });

    if (error) {
      console.error('Error importing Open Food Facts product:', error);
      return false;
    }

    console.log(`Successfully imported Open Food Facts product: ${normalizedFood.name}`);
    return true;
  } catch (error) {
    console.error('Error in importFoodFromOpenFoodFacts:', error);
    return false;
  }
}

// ============================================================================
// Bulk Import Functions
// ============================================================================

export async function bulkImportFromUSDA(
  searchQuery: string, 
  maxResults: number = 100,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const searchResults = await USDA_API.searchFoods(searchQuery, maxResults);
    const foods = searchResults.foods || [];

    for (let i = 0; i < foods.length; i++) {
      try {
        const normalizedFood = USDA_API.normalizeFood(foods[i]);
        
        const { error } = await supabase
          .from('global_foods')
          .upsert(normalizedFood, { onConflict: 'food_id' });

        if (error) {
          console.error(`Error importing food ${foods[i].fdcId}:`, error);
          failed++;
        } else {
          success++;
        }

        if (onProgress) {
          onProgress(i + 1, foods.length);
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing food ${foods[i].fdcId}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('Bulk import error:', error);
  }

  return { success, failed };
}

export async function configureUSDAAPI(apiKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_configurations')
      .update({
        api_key: apiKey,
        is_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'USDA_FoodData_Central');

    if (error) {
      console.error('Error configuring USDA API:', error);
      return false;
    }

    console.log('USDA API configured successfully');
    return true;
  } catch (error) {
    console.error('Error in configureUSDAAPI:', error);
    return false;
  }
}

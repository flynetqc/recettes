import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Recipe, WeeklyMealPlan, PurchaseRule } from './types';
import { INITIAL_RECIPES } from './mock-data';
import { DEFAULT_PURCHASE_RULES, getPurchaseRules, savePurchaseRules } from './purchase-rules';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_RECIPES_KEY = 'recettes_db_recipes_v1';
const STORAGE_MEALPLAN_KEY = 'recettes_db_mealplan_v1';

// Initialize local storage with mock data if empty
function getLocalRecipes(): Recipe[] {
  if (typeof window === 'undefined') return INITIAL_RECIPES;
  try {
    const data = localStorage.getItem(STORAGE_RECIPES_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_RECIPES_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_RECIPES;
  }
}

function saveLocalRecipes(recipes: Recipe[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_RECIPES_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed to save recipes locally', e);
  }
}

// ----------------- RECIPES CRUD ----------------- //

export async function fetchAllRecipes(): Promise<Recipe[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, fallback to local storage:', error.message);
        return getLocalRecipes();
      }

      if (data && data.length > 0) {
        return data as Recipe[];
      }
      // If table is empty on first Supabase run, return local/mock
      return getLocalRecipes();
    } catch (err) {
      console.warn('Supabase connection error:', err);
      return getLocalRecipes();
    }
  }

  return getLocalRecipes();
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as Recipe;
      }
    } catch (e) {
      console.warn('Supabase fetch by ID error', e);
    }
  }

  const list = getLocalRecipes();
  return list.find(r => r.id === id) || null;
}

export async function createOrUpdateRecipe(recipe: Recipe): Promise<Recipe> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .upsert({
          ...recipe,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        return data as Recipe;
      } else if (error) {
        console.error('Supabase save error:', error.message);
      }
    } catch (err) {
      console.error('Supabase write exception:', err);
    }
  }

  // Fallback to local storage
  const list = getLocalRecipes();
  const index = list.findIndex(r => r.id === recipe.id);
  if (index >= 0) {
    list[index] = { ...recipe, updated_at: new Date().toISOString() };
  } else {
    list.unshift({ ...recipe, created_at: new Date().toISOString() });
  }
  saveLocalRecipes(list);
  return recipe;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error.message);
      }
    } catch (e) {
      console.error('Supabase delete exception:', e);
    }
  }

  const list = getLocalRecipes().filter(r => r.id !== id);
  saveLocalRecipes(list);

  // Clean up deleted recipe from meal plan as well
  try {
    const plan = getStoredMealPlan();
    if (plan.selected_recipe_ids.includes(id)) {
      plan.selected_recipe_ids = plan.selected_recipe_ids.filter(rId => rId !== id);
      delete plan.servings_multiplier[id];
      saveStoredMealPlan(plan);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('mealplan-updated'));
      }
    }
  } catch (e) {
    console.error('Error cleaning up meal plan after recipe deletion', e);
  }

  return true;
}

export async function updateRecipeRating(id: string, rating: number): Promise<void> {
  if (supabase) {
    try {
      await supabase
        .from('recipes')
        .update({ rating })
        .eq('id', id);
    } catch (e) {
      console.warn('Failed to update rating in supabase', e);
    }
  }

  const list = getLocalRecipes();
  const target = list.find(r => r.id === id);
  if (target) {
    target.rating = rating;
    saveLocalRecipes(list);
  }
}

export async function toggleRecipeFavorite(id: string): Promise<boolean> {
  const list = getLocalRecipes();
  const target = list.find(r => r.id === id);
  const newFav = target ? !target.is_favorite : true;

  if (supabase) {
    try {
      await supabase
        .from('recipes')
        .update({ is_favorite: newFav })
        .eq('id', id);
    } catch (e) {
      console.warn('Failed to update favorite in supabase', e);
    }
  }

  if (target) {
    target.is_favorite = newFav;
    saveLocalRecipes(list);
  }
  return newFav;
}

// ----------------- PHOTO STORAGE UPLOAD ----------------- //

export async function uploadRecipePhoto(file: File): Promise<string> {
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `recipes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError.message);
        return URL.createObjectURL(file);
      }

      const { data } = supabase.storage
        .from('recipe-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.warn('Storage exception, returning object url fallback', err);
      return URL.createObjectURL(file);
    }
  }

  // Local fallback: convert to base64 or temporary URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// ----------------- MEAL PLAN & GROCERY PERSISTENCE ----------------- //

export function getStoredMealPlan(): WeeklyMealPlan {
  if (typeof window === 'undefined') {
    return {
      week_start_date: new Date().toISOString(),
      selected_recipe_ids: [],
      servings_multiplier: {},
      custom_grocery_items: []
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_MEALPLAN_KEY);
    if (!saved) {
      const initial: WeeklyMealPlan = {
        week_start_date: new Date().toISOString(),
        selected_recipe_ids: [],
        servings_multiplier: {},
        custom_grocery_items: []
      };
      localStorage.setItem(STORAGE_MEALPLAN_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(saved);
  } catch {
    return {
      week_start_date: new Date().toISOString(),
      selected_recipe_ids: [],
      servings_multiplier: {},
      custom_grocery_items: []
    };
  }
}

export function saveStoredMealPlan(plan: WeeklyMealPlan): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MEALPLAN_KEY, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save meal plan', e);
  }
}

// ----------------- MEAL PLAN ARCHIVES (SEMAINES PASSÉES) ----------------- //

const STORAGE_ARCHIVES_KEY = 'recettes_meal_plan_archives_v1';

export function getMealPlanArchives(): import('./types').MealPlanArchive[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_ARCHIVES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveMealPlanArchive(archive: import('./types').MealPlanArchive): void {
  if (typeof window === 'undefined') return;
  try {
    const archives = getMealPlanArchives();
    const updated = [archive, ...archives.filter(a => a.id !== archive.id)];
    localStorage.setItem(STORAGE_ARCHIVES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save meal plan archive', e);
  }
}

export function deleteMealPlanArchive(archiveId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const archives = getMealPlanArchives().filter(a => a.id !== archiveId);
    localStorage.setItem(STORAGE_ARCHIVES_KEY, JSON.stringify(archives));
  } catch (e) {
    console.error('Failed to delete meal plan archive', e);
  }
}

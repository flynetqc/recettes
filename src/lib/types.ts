export type Difficulty = 'Facile' | 'Moyen' | 'Difficile';

export type Category = 
  | 'Plats principaux'
  | 'Entrées & Bouchées'
  | 'Desserts & Pâtisseries'
  | 'Déjeuners & Brunch'
  | 'Soupes & Salades'
  | 'Pâtes & Pizzas'
  | 'Collations'
  | 'Sauces & Marinades'
  | 'Boissons';

export type GroceryAisle = 
  | 'Fruits & Légumes'
  | 'Boucherie & Volailles'
  | 'Poissonnerie & Fruits de mer'
  | 'Produits laitiers & Œufs'
  | 'Boulangerie & Pâtisserie'
  | 'Épicerie & Garde-manger'
  | 'Épices & Condiments'
  | 'Surgelés'
  | 'Boissons'
  | 'Divers';

export interface IngredientItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  aisle: GroceryAisle;
  section?: string; // e.g. "Salade", "Vinaigrette", "Marinade", "Sauce", "Pâte"
  notes?: string;
}

export interface StepItem {
  id: string;
  step_number: number;
  instruction: string;
  section?: string;
  title?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  difficulty: Difficulty;
  category: Category;
  tags: string[];
  image_url: string;
  rating: number; // 1 to 5
  ingredients: IngredientItem[];
  steps: StepItem[];
  created_at: string;
  updated_at?: string;
  is_favorite?: boolean;
}

export interface PurchaseRule {
  id: string;
  ingredient_pattern: string; // e.g. "beurre", "oeuf", "farine"
  display_name: string; // e.g. "Beurre"
  standard_quantity: number; // e.g. 454 (or 1)
  standard_unit: string; // e.g. "g" or "unité"
  package_label: string; // e.g. "1 livre (454g)" or "1 boîte de 12"
  aisle: GroceryAisle;
  notes?: string;
}

export interface GroceryCompiledItem {
  id: string;
  name: string;
  raw_quantity: number;
  unit: string;
  aisle: GroceryAisle;
  purchase_packages_count: number | null;
  purchase_package_label: string | null;
  display_quantity_str: string;
  recipes_sources: {
    recipe_id: string;
    recipe_title: string;
    quantity: number | null;
    unit: string;
  }[];
  checked: boolean;
  is_custom?: boolean;
}

export interface WeeklyMealPlan {
  id?: string;
  week_start_date: string;
  selected_recipe_ids: string[];
  servings_multiplier: Record<string, number>; // recipe_id -> multiplier
  custom_grocery_items: {
    id: string;
    name: string;
    quantity_str: string;
    aisle: GroceryAisle;
    checked: boolean;
  }[];
}

export interface MealPlanArchive {
  id: string;
  name: string; // e.g. "Semaine du 21 août 2026"
  archived_at: string;
  recipe_ids: string[];
  servings_multiplier: Record<string, number>;
}

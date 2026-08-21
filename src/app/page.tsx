'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Recipe, Category } from '@/lib/types';
import { fetchAllRecipes, getStoredMealPlan } from '@/lib/supabase';
import { RecipeCard } from '@/components/recipe-card';
import { 
  PlusCircle, 
  Scan, 
  ShoppingCart, 
  Search, 
  Heart, 
  Star, 
  Clock, 
  ChefHat, 
  Sparkles,
  SlidersHorizontal,
  Utensils
} from 'lucide-react';

const CATEGORIES: ('Toutes' | Category)[] = [
  'Toutes',
  'Plats principaux',
  'Entrées & Bouchées',
  'Desserts & Pâtisseries',
  'Déjeuners & Brunch',
  'Soupes & Salades',
  'Pâtes & Pizzas',
  'Collations',
  'Sauces & Marinades',
  'Boissons'
];

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Toutes' | Category>('Toutes');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [maxTime, setMaxTime] = useState<number>(0); // 0 = all
  const [isLoading, setIsLoading] = useState(true);
  const [plannedCount, setPlannedCount] = useState(0);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchAllRecipes();
      setRecipes(data);
      const plan = getStoredMealPlan();
      setPlannedCount(plan.selected_recipe_ids.length);
      setIsLoading(false);
    }
    load();

    const handleUpdate = () => {
      const plan = getStoredMealPlan();
      setPlannedCount(plan.selected_recipe_ids.length);
    };
    window.addEventListener('mealplan-updated', handleUpdate);
    return () => window.removeEventListener('mealplan-updated', handleUpdate);
  }, []);

  const handleRatingUpdate = (recipeId: string, newRating: number) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, rating: newRating } : r));
  };

  const handleFavoriteToggle = (recipeId: string, isFav: boolean) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, is_favorite: isFav } : r));
  };

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesDesc = (recipe.description || '').toLowerCase().includes(q);
        const matchesTags = (recipe.tags || []).some(t => t.toLowerCase().includes(q));
        const matchesIng = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesIng) return false;
      }

      // Category
      if (selectedCategory !== 'Toutes' && recipe.category !== selectedCategory) {
        return false;
      }

      // Favorites
      if (onlyFavorites && !recipe.is_favorite) {
        return false;
      }

      // Min Rating
      if (minRating > 0 && (recipe.rating || 0) < minRating) {
        return false;
      }

      // Max Time
      if (maxTime > 0) {
        const total = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
        if (total > maxTime) return false;
      }

      return true;
    });
  }, [recipes, searchQuery, selectedCategory, onlyFavorites, minRating, maxTime]);

  const favoritesCount = recipes.filter(r => r.is_favorite).length;
  const topRatedCount = recipes.filter(r => r.rating === 5).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Votre livre de recettes numérique & intelligent</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Cuisinez vos meilleures <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                recettes préférées
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Conservez vos recettes dans Supabase, numérisez des pages de livres de cuisine par photo grâce à l&apos;OCR, et planifiez vos repas avec compilation d&apos;épicerie et export PDF.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/recettes/nouvelle"
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-emerald-900 shadow-lg shadow-black/10 hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>Ajouter manuellement</span>
              </Link>

              <Link
                href="/recettes/ocr"
                className="flex items-center gap-2 rounded-2xl bg-emerald-600/60 border border-emerald-300/30 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg backdrop-blur-md hover:bg-emerald-600/80 active:scale-95 transition-all"
              >
                <Scan className="h-4 w-4 text-emerald-200 animate-pulse" />
                <span>Scanner une photo OCR</span>
              </Link>

              <Link
                href="/epicerie"
                className="flex items-center gap-2 rounded-2xl bg-black/25 border border-white/15 px-5 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md hover:bg-black/40 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-4 w-4 text-emerald-300" />
                <span>Menu de la semaine ({plannedCount})</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white">{recipes.length}</span>
              <span className="text-[11px] font-semibold text-emerald-200">Recettes au total</span>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">{topRatedCount}</span>
              <span className="text-[11px] font-semibold text-emerald-200">5 Étoiles</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-rose-300">{favoritesCount}</span>
              <span className="text-[11px] font-semibold text-emerald-200">Coups de cœur</span>
            </div>
          </div>

        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, ingrédient (ex: poulet, beurre), étiquette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200/80 bg-white pl-12 pr-4 py-3.5 text-sm font-medium text-zinc-900 shadow-sm placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs font-bold text-zinc-400 hover:text-zinc-600"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sub-Filters (Favorites toggle, 5 stars only, Fast meals) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Favorites toggle */}
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
              onlyFavorites
                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Coups de cœur</span>
          </button>

          {/* Min 5 stars */}
          <button
            type="button"
            onClick={() => setMinRating(minRating === 5 ? 0 : 5)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
              minRating === 5
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${minRating === 5 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>5 étoiles seulement</span>
          </button>

          {/* Min 4+ stars */}
          <button
            type="button"
            onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
              minRating === 4
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${minRating === 4 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>4 étoiles et +</span>
          </button>

          {/* Quick meals (<= 30 min) */}
          <button
            type="button"
            onClick={() => setMaxTime(maxTime === 30 ? 0 : 30)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
              maxTime === 30
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Prêt en 30 min max</span>
          </button>

          {/* Reset filters if any applied */}
          {(searchQuery || selectedCategory !== 'Toutes' || onlyFavorites || minRating > 0 || maxTime > 0) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Toutes');
                setOnlyFavorites(false);
                setMinRating(0);
                setMaxTime(0);
              }}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline ml-auto"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

      </div>

      {/* Recipe Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {selectedCategory === 'Toutes' ? 'Toutes les recettes' : selectedCategory}
            <span className="ml-2 text-xs font-semibold text-zinc-400">({filteredRecipes.length})</span>
          </h2>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <ChefHat className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="mt-3 text-base font-bold text-zinc-800 dark:text-zinc-200">
              Aucune recette trouvée
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Essayez de modifier vos termes de recherche ou ajoutez une nouvelle recette dès maintenant !
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/recettes/nouvelle"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                + Ajouter une recette
              </Link>
              <Link
                href="/recettes/ocr"
                className="rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Scanner une photo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onRatingUpdate={handleRatingUpdate}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

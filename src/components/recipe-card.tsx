'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { StarRating } from './star-rating';
import { 
  Clock, 
  Users, 
  Heart, 
  Plus, 
  Check, 
  ChefHat,
  Sparkles
} from 'lucide-react';
import { updateRecipeRating, toggleRecipeFavorite, getStoredMealPlan, saveStoredMealPlan } from '@/lib/supabase';

interface RecipeCardProps {
  recipe: Recipe;
  onRatingUpdate?: (recipeId: string, newRating: number) => void;
  onFavoriteToggle?: (recipeId: string, isFav: boolean) => void;
}

export function RecipeCard({ recipe, onRatingUpdate, onFavoriteToggle }: RecipeCardProps) {
  const [isFav, setIsFav] = useState(Boolean(recipe.is_favorite));
  const [currentRating, setCurrentRating] = useState(recipe.rating || 5);
  const [isPlanned, setIsPlanned] = useState(() => {
    const plan = getStoredMealPlan();
    return plan.selected_recipe_ids.includes(recipe.id);
  });

  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFav;
    setIsFav(nextState);
    await toggleRecipeFavorite(recipe.id);
    onFavoriteToggle?.(recipe.id, nextState);
  };

  const handleRatingChange = async (newRating: number) => {
    setCurrentRating(newRating);
    await updateRecipeRating(recipe.id, newRating);
    onRatingUpdate?.(recipe.id, newRating);
  };

  const handleToggleMealPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const plan = getStoredMealPlan();
    let updatedIds: string[];

    if (plan.selected_recipe_ids.includes(recipe.id)) {
      updatedIds = plan.selected_recipe_ids.filter(id => id !== recipe.id);
      setIsPlanned(false);
    } else {
      updatedIds = [...plan.selected_recipe_ids, recipe.id];
      setIsPlanned(true);
    }

    const updatedPlan = {
      ...plan,
      selected_recipe_ids: updatedIds,
      servings_multiplier: {
        ...plan.servings_multiplier,
        [recipe.id]: plan.servings_multiplier[recipe.id] || 1
      }
    };

    saveStoredMealPlan(updatedPlan);
    window.dispatchEvent(new Event('mealplan-updated'));
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900">
      
      {/* Image Thumbnail & Overlays */}
      <Link href={`/recettes/${recipe.id}`} className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 dark:from-emerald-950/40 dark:to-teal-950/40 dark:text-emerald-400">
            <ChefHat className="h-14 w-14 opacity-50" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-900 shadow-sm backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-100">
          {recipe.category || 'Plat'}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur-md transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-900/90 dark:text-zinc-200"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-600 dark:text-zinc-300'
            }`}
          />
        </button>

        {/* Quick prep & cook time overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>{totalTime > 0 ? `${totalTime} min` : 'Rapide'}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>{recipe.servings} pers.</span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Title */}
        <Link href={`/recettes/${recipe.id}`} className="group-hover:text-emerald-600 transition-colors">
          <h3 className="line-clamp-1 font-bold text-zinc-900 text-base sm:text-lg dark:text-zinc-50">
            {recipe.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {recipe.description || 'Une délicieuse recette maison à savourer en famille.'}
        </p>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer: Rating & Action Button */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
          {/* 5-star rating */}
          <div className="flex flex-col gap-0.5">
            <StarRating
              rating={currentRating}
              interactive={true}
              size="sm"
              onRatingChange={handleRatingChange}
              showScore={true}
            />
          </div>

          {/* Add to grocery/meal plan button */}
          <button
            onClick={handleToggleMealPlan}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              isPlanned
                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
            }`}
          >
            {isPlanned ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Au menu</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Planifier</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

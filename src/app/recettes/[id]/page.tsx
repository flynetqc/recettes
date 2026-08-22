'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { 
  fetchRecipeById, 
  deleteRecipe, 
  updateRecipeRating, 
  toggleRecipeFavorite, 
  getStoredMealPlan, 
  saveStoredMealPlan 
} from '@/lib/supabase';
import { StarRating } from '@/components/star-rating';
import { 
  Clock, 
  Users, 
  Heart, 
  ChefHat, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  Flame, 
  CheckSquare, 
  Square,
  Sparkles,
  Share2
} from 'lucide-react';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servingsCount, setServingsCount] = useState<number>(4);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isFav, setIsFav] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await fetchRecipeById(id);
      if (data) {
        setRecipe(data);
        setServingsCount(data.servings || 4);
        setIsFav(Boolean(data.is_favorite));

        const plan = getStoredMealPlan();
        setIsPlanned(plan.selected_recipe_ids.includes(data.id));
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-zinc-500">Chargement de la recette...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <ChefHat className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Recette introuvable</h2>
        <p className="mt-1 text-xs text-zinc-500">Cette recette a peut-être été supprimée.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux recettes</span>
        </Link>
      </div>
    );
  }

  const baseServings = recipe.servings || 4;
  const ratio = servingsCount / (baseServings > 0 ? baseServings : 4);

  const handleRatingChange = async (newRating: number) => {
    setRecipe(prev => prev ? { ...prev, rating: newRating } : null);
    await updateRecipeRating(recipe.id, newRating);
  };

  const handleFavoriteToggle = async () => {
    const next = !isFav;
    setIsFav(next);
    await toggleRecipeFavorite(recipe.id);
  };

  const handleToggleMealPlan = () => {
    const plan = getStoredMealPlan();
    let updatedIds: string[];

    if (plan.selected_recipe_ids.includes(recipe.id)) {
      updatedIds = plan.selected_recipe_ids.filter(rId => rId !== recipe.id);
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
        [recipe.id]: 1
      }
    };

    saveStoredMealPlan(updatedPlan);
    window.dispatchEvent(new Event('mealplan-updated'));
  };

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement la recette "${recipe.title}" ?`)) {
      setIsDeleting(true);
      await deleteRecipe(recipe.id);
      router.push('/');
      router.refresh();
    }
  };

  const toggleCheckIngredient = (ingId: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ingId]: !prev[ingId]
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Toutes les recettes</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Add to weekly plan button */}
          <button
            type="button"
            onClick={handleToggleMealPlan}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
              isPlanned
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {isPlanned ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Au menu de la semaine</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Ajouter au menu</span>
              </>
            )}
          </button>

          {/* Edit button */}
          <Link
            href={`/recettes/${recipe.id}/modifier`}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Edit3 className="h-4 w-4 text-zinc-500" />
            <span>Modifier</span>
          </Link>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-zinc-900 dark:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Main Photo Banner */}
        <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-800">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 dark:from-emerald-950/40 dark:to-teal-950/40 dark:text-emerald-400">
              <ChefHat className="h-16 w-16 opacity-40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-zinc-900 dark:bg-zinc-900/90 dark:text-zinc-50">
              {recipe.category}
            </span>
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              {recipe.difficulty}
            </span>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-zinc-700 shadow-md hover:scale-110 active:scale-95 transition-transform dark:bg-zinc-900/90 dark:text-zinc-200"
          >
            <Heart
              className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}
            />
          </button>

          {/* Title on bottom of hero */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Info & Rating bar */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
            {/* 5-Star Rating */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Note :</span>
              <StarRating
                rating={recipe.rating || 5}
                interactive={true}
                size="lg"
                onRatingChange={handleRatingChange}
                showScore={true}
              />
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Préparation : {recipe.prep_time_min} min</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Cuisson : {recipe.cook_time_min} min</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
                <Clock className="h-4 w-4 text-teal-600" />
                <span>Total : {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 italic">
              « {recipe.description} »
            </p>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recipe.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Main Content Grid: Scalable Ingredients & Ordered Steps */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        
        {/* Ingredients Column (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Ingrédients
                </h3>
                <span className="text-xs text-zinc-400">
                  ({recipe.ingredients.length} éléments)
                </span>
              </div>

              {/* Servings multiplier adjuster */}
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setServingsCount(Math.max(1, servingsCount - 1))}
                  className="h-7 w-7 rounded-lg font-bold text-xs hover:bg-white text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  -
                </button>
                <span className="px-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {servingsCount} pers.
                </span>
                <button
                  type="button"
                  onClick={() => setServingsCount(servingsCount + 1)}
                  className="h-7 w-7 rounded-lg font-bold text-xs hover:bg-white text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Checklist of ingredients grouped by section */}
            <div className="space-y-4 pt-1">
              {(() => {
                // Group by section
                const sectionsMap = new Map<string, typeof recipe.ingredients>();
                for (const ing of recipe.ingredients) {
                  const secName = ing.section?.trim() || '';
                  if (!sectionsMap.has(secName)) sectionsMap.set(secName, []);
                  sectionsMap.get(secName)!.push(ing);
                }

                return Array.from(sectionsMap.entries()).map(([secName, sectionIngs]) => (
                  <div key={secName || 'main'} className="space-y-2">
                    {secName && (
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          {secName}
                        </h4>
                      </div>
                    )}

                    <div className="space-y-1">
                      {sectionIngs.map((ing) => {
                        const scaledQty = ing.quantity !== null ? Math.round(ing.quantity * ratio * 100) / 100 : null;
                        const isChecked = checkedIngredients[ing.id];

                        return (
                          <div
                            key={ing.id}
                            onClick={() => toggleCheckIngredient(ing.id)}
                            className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-zinc-50 opacity-50 dark:bg-zinc-800/40'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-emerald-600 shrink-0 focus:outline-none"
                            >
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 fill-emerald-600 text-white" />
                              ) : (
                                <Square className="h-4 w-4 text-zinc-400 hover:text-emerald-600" />
                              )}
                            </button>

                            <div className="flex-1 text-xs">
                              <span className={`font-semibold ${isChecked ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                {scaledQty !== null && `${scaledQty} `}
                                {ing.unit && `${ing.unit} `}
                                {ing.name}
                              </span>
                              {ing.notes && (
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic ml-1">
                                  ({ing.notes})
                                </span>
                              )}
                              <span className="block text-[11px] text-zinc-400">{ing.aisle}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>

          </div>
        </div>

        {/* Steps Column (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              Étapes de préparation
            </h3>

            <div className="space-y-6">
              {recipe.steps.map((step, idx) => (
                <div key={step.id || idx} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-black text-xs text-white shadow-md shadow-emerald-600/20">
                    {step.step_number || idx + 1}
                  </div>
                  <div className="flex-1 pt-1 space-y-1">
                    {step.title && (
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        {step.title}
                      </h4>
                    )}
                    <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {step.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

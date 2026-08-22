'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Recipe, 
  Category, 
  Difficulty, 
  GroceryAisle, 
  IngredientItem, 
  StepItem 
} from '@/lib/types';
import { guessAisle } from '@/lib/ocr-parser';
import { createOrUpdateRecipe, uploadRecipePhoto } from '@/lib/supabase';
import { StarRating } from './star-rating';
import { IngredientCombobox } from './ingredient-combobox';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Clock, 
  Users, 
  Sparkles, 
  Save, 
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface RecipeFormProps {
  initialRecipe?: Partial<Recipe>;
  isEditing?: boolean;
  onSuccessRedirect?: string;
}

const CATEGORIES: Category[] = [
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

const AISLES: GroceryAisle[] = [
  'Fruits & Légumes',
  'Boucherie & Volailles',
  'Poissonnerie & Fruits de mer',
  'Produits laitiers & Œufs',
  'Boulangerie & Pâtisserie',
  'Épicerie & Garde-manger',
  'Épices & Condiments',
  'Surgelés',
  'Boissons',
  'Divers'
];

const COMMON_UNITS = [
  '',
  'g',
  'kg',
  'ml',
  'L',
  'c. à soupe',
  'c. à thé',
  'tasse',
  'unité',
  'pincée',
  'gousse',
  'tranche',
  'branche',
  'boîte'
];

export function RecipeForm({ initialRecipe, isEditing = false, onSuccessRedirect = '/' }: RecipeFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prep_time_min ?? 15);
  const [cookTime, setCookTime] = useState(initialRecipe?.cook_time_min ?? 25);
  const [servings, setServings] = useState(initialRecipe?.servings ?? 4);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialRecipe?.difficulty || 'Facile');
  const [category, setCategory] = useState<Category>(initialRecipe?.category || 'Plats principaux');
  const [rating, setRating] = useState(initialRecipe?.rating ?? 5);
  const [imageUrl, setImageUrl] = useState(initialRecipe?.image_url || '');
  const [tagInput, setTagInput] = useState((initialRecipe?.tags || []).join(', '));

  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initialRecipe?.ingredients && initialRecipe.ingredients.length > 0
      ? initialRecipe.ingredients
      : [
          { id: '1', name: '', quantity: null, unit: '', aisle: 'Fruits & Légumes' },
          { id: '2', name: '', quantity: null, unit: '', aisle: 'Épicerie & Garde-manger' }
        ]
  );

  const [steps, setSteps] = useState<StepItem[]>(
    initialRecipe?.steps && initialRecipe.steps.length > 0
      ? initialRecipe.steps
      : [
          { id: 's-1', step_number: 1, instruction: '' },
          { id: 's-2', step_number: 2, instruction: '' }
        ]
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg('');
      const uploadedUrl = await uploadRecipePhoto(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors du téléversement de l\'image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Dynamic Ingredients operations
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        quantity: null,
        unit: '',
        aisle: 'Épicerie & Garde-manger'
      }
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof IngredientItem, value: any) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };

    // Auto-suggest aisle when name is typed
    if (field === 'name' && value && next[index].aisle === 'Épicerie & Garde-manger') {
      const guessed = guessAisle(value);
      if (guessed !== 'Épicerie & Garde-manger') {
        next[index].aisle = guessed;
      }
    }

    setIngredients(next);
  };

  const handleComboboxIngredientChange = (
    index: number,
    name: string,
    suggestedAisle?: GroceryAisle,
    defaultUnit?: string
  ) => {
    const next = [...ingredients];
    next[index].name = name;
    if (suggestedAisle) {
      next[index].aisle = suggestedAisle;
    } else if (name) {
      const guessed = guessAisle(name);
      if (guessed !== 'Épicerie & Garde-manger') {
        next[index].aisle = guessed;
      }
    }
    if (defaultUnit && !next[index].unit) {
      next[index].unit = defaultUnit;
    }
    setIngredients(next);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Dynamic Steps operations
  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}`,
        step_number: nextNum,
        instruction: ''
      }
    ]);
  };

  const handleUpdateStep = (index: number, instruction: string) => {
    const next = [...steps];
    next[index] = { ...next[index], instruction };
    setSteps(next);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const filtered = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      step_number: idx + 1
    }));
    setSteps(renumbered);
  };

  // Save recipe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Veuillez entrer un titre pour la recette.');
      return;
    }

    const cleanIngredients = ingredients
      .map(i => ({ ...i, name: i.name.trim() }))
      .filter(i => i.name.length > 0);

    if (cleanIngredients.length === 0) {
      setErrorMsg('Veuillez ajouter au moins un ingrédient.');
      return;
    }

    const cleanSteps = steps
      .map((s, idx) => ({ ...s, step_number: idx + 1, instruction: s.instruction.trim() }))
      .filter(s => s.instruction.length > 0);

    if (cleanSteps.length === 0) {
      setErrorMsg('Veuillez ajouter au moins une étape de préparation.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');

      const tags = tagInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t.length > 0);

      const recipeData: Recipe = {
        id: initialRecipe?.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: title.trim(),
        description: description.trim(),
        prep_time_min: Number(prepTime) || 0,
        cook_time_min: Number(cookTime) || 0,
        servings: Number(servings) || 4,
        difficulty,
        category,
        tags,
        image_url: imageUrl.trim(),
        rating,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        created_at: initialRecipe?.created_at || new Date().toISOString(),
        is_favorite: initialRecipe?.is_favorite || false
      };

      await createOrUpdateRecipe(recipeData);
      setSavedSuccess(true);

      setTimeout(() => {
        router.push(onSuccessRedirect || `/recettes/${recipeData.id}`);
        router.refresh();
      }, 700);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      
      {/* Top Banner Alert if any */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Recette enregistrée avec succès ! Redirection en cours...</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Informations générales
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Titre de la recette *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Poulet rôti au citron et romarin"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-base font-medium text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description ou notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Court résumé, arômes, conseils du chef..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Niveau de difficulté
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            >
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>

          {/* Prep time */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Temps de préparation (min)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 pl-10 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
              <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Cook time */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Temps de cuisson (min)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 pl-10 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
              <Flame className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de portions
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 pl-10 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
              <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Note (sur 5 étoiles)
            </label>
            <div className="flex h-11 items-center rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <StarRating
                rating={rating}
                interactive={true}
                size="md"
                onRatingChange={setRating}
                showScore={true}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Étiquettes / Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ex: Poulet, Érable, Rapide, Sans gluten"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            />
          </div>

        </div>

        {/* Photo Upload / URL Section */}
        <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Photo de la recette
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            
            {/* Preview Box */}
            <div className="relative aspect-video w-full sm:w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Aperçu recette"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-zinc-400" />
              )}
            </div>

            {/* Upload & Link Controls */}
            <div className="flex-1 space-y-3 w-full">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-50/50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800">
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Téléversement...' : 'Téléverser une photo (ordinateur ou mobile)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ou collez l'URL d'une photo en ligne (https://...)"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Ingredients Section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Ingrédients requis ({ingredients.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Les rayons sont automatiquement suggérés pour optimiser votre liste d&apos;épicerie.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un ingrédient</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {ingredients.map((ing, index) => (
            <div
              key={ing.id || index}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              {/* Quantity */}
              <div className="w-full sm:w-24">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Qté"
                  value={ing.quantity ?? ''}
                  onChange={(e) =>
                    handleUpdateIngredient(
                      index,
                      'quantity',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-800"
                />
              </div>

              {/* Unit */}
              <div className="w-full sm:w-32">
                <input
                  type="text"
                  placeholder="Unité (g, ml...)"
                  list="units-list"
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-800"
                />
                <datalist id="units-list">
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              {/* Name with Smart Combobox */}
              <div className="flex-1 w-full sm:min-w-[220px]">
                <IngredientCombobox
                  value={ing.name}
                  aisle={ing.aisle}
                  onChange={(name, suggestedAisle, defaultUnit) =>
                    handleComboboxIngredientChange(index, name, suggestedAisle, defaultUnit)
                  }
                />
              </div>

              {/* Aisle */}
              <div className="w-full sm:w-48">
                <select
                  value={ing.aisle}
                  onChange={(e) =>
                    handleUpdateIngredient(index, 'aisle', e.target.value as GroceryAisle)
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {AISLES.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                disabled={ingredients.length <= 1}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Étapes de préparation ({steps.length})
          </h2>
          <button
            type="button"
            onClick={handleAddStep}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une étape</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {steps.map((step, index) => (
            <div
              key={step.id || index}
              className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-bold text-xs text-white">
                {index + 1}
              </span>

              <textarea
                rows={2}
                required
                placeholder={`Décrivez l'étape ${index + 1}...`}
                value={step.instruction}
                onChange={(e) => handleUpdateStep(index, e.target.value)}
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />

              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                disabled={steps.length <= 1}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Annuler</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Enregistrement en cours...' : isEditing ? 'Sauvegarder les modifications' : 'Créer la recette'}</span>
        </button>
      </div>

    </form>
  );
}

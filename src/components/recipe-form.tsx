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
import { parseRecipeCSV } from '@/lib/csv-recipe-parser';
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
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  X,
  Layers
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
  'boîte',
  'casseau',
  'sachet'
];

const COMMON_SECTIONS = [
  'Salade',
  'Vinaigrette',
  'Sauce',
  'Marinade',
  'Glaçage',
  'Garniture',
  'Pâte',
  'Pâte à tarte',
  'Bouillon',
  'Finition',
  'Principal'
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
          { id: '1', name: '', quantity: null, unit: '', aisle: 'Fruits & Légumes', section: '' },
          { id: '2', name: '', quantity: null, unit: '', aisle: 'Épicerie & Garde-manger', section: '' }
        ]
  );

  const [steps, setSteps] = useState<StepItem[]>(
    initialRecipe?.steps && initialRecipe.steps.length > 0
      ? initialRecipe.steps
      : [
          { id: '1', step_number: 1, instruction: '', title: '' },
          { id: '2', step_number: 2, instruction: '', title: '' }
        ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // CSV Import modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvImportMsg, setCsvImportMsg] = useState('');

  // Handle Photo Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadRecipePhoto(file);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erreur lors du téléversement de la photo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Dynamic Ingredients operations
  const handleAddIngredient = (defaultSection: string = '') => {
    setIngredients([
      ...ingredients,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        quantity: null,
        unit: '',
        aisle: 'Épicerie & Garde-manger',
        section: defaultSection
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
        instruction: '',
        title: ''
      }
    ]);
  };

  const handleUpdateStep = (index: number, field: 'instruction' | 'title', value: string) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: value };
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

  // Handle CSV Import
  const handleImportCsv = () => {
    if (!csvText.trim()) {
      setCsvImportMsg('Veuillez coller le contenu CSV ou charger un fichier.');
      return;
    }

    try {
      const parsed = parseRecipeCSV(csvText);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.servings) setServings(parsed.servings);
      if (parsed.prep_time_min !== undefined) setPrepTime(parsed.prep_time_min);
      if (parsed.cook_time_min !== undefined) setCookTime(parsed.cook_time_min);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.difficulty) setDifficulty(parsed.difficulty);
      if (parsed.ingredients && parsed.ingredients.length > 0) setIngredients(parsed.ingredients);
      if (parsed.steps && parsed.steps.length > 0) setSteps(parsed.steps);
      if (parsed.tags) setTagInput(parsed.tags.join(', '));

      setIsCsvModalOpen(false);
      setCsvText('');
      setCsvImportMsg('');
      setSavedSuccess(false);
    } catch (err: any) {
      console.error(err);
      setCsvImportMsg(`Erreur lors de l'analyse du CSV : ${err.message}`);
    }
  };

  const handleFileUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  // Save recipe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Veuillez entrer un titre pour la recette.');
      return;
    }

    const cleanIngredients = ingredients
      .map(i => ({ ...i, name: i.name.trim(), section: i.section?.trim() || undefined }))
      .filter(i => i.name.length > 0);

    if (cleanIngredients.length === 0) {
      setErrorMsg('Veuillez ajouter au moins un ingrédient.');
      return;
    }

    const cleanSteps = steps
      .map((s, idx) => ({ 
        ...s, 
        step_number: idx + 1, 
        instruction: s.instruction.trim(),
        title: s.title?.trim() || undefined
      }))
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
      
      {/* Top Bar with CSV Import Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {isEditing ? 'Modifier la recette' : 'Créer une nouvelle recette'}
        </h1>

        <button
          type="button"
          onClick={() => setIsCsvModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm transition-all"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Importer un CSV (Template avec sections)</span>
        </button>
      </div>

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
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-base font-bold text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
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
              <Clock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
            </div>
          </div>

          {/* Cook time */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Temps de cuisson (min)
            </label>
            <div className="relative">
              <Flame className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de portions
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Note (Étoiles)
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
              placeholder="ex: poulet, mijoteuse, rapide, santé, sans gluten"
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50 dark:focus:bg-zinc-800"
            />
          </div>

          {/* Image Upload & URL */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
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

      </div>

      {/* Ingredients Section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Ingrédients requis ({ingredients.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Organisez vos ingrédients par section (ex: <em>Salade</em>, <em>Vinaigrette</em>, <em>Sauce</em>...).
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAddIngredient()}
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
              className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              {/* Section Tag / Group */}
              <div className="w-full lg:w-36">
                <input
                  type="text"
                  placeholder="Section (ex: Salade)"
                  list="sections-list"
                  value={ing.section || ''}
                  onChange={(e) => handleUpdateIngredient(index, 'section', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-emerald-300"
                />
              </div>

              {/* Quantity */}
              <div className="w-full sm:w-20 lg:w-20">
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              {/* Unit */}
              <div className="w-full sm:w-28 lg:w-28">
                <input
                  type="text"
                  placeholder="Unité"
                  list="units-list"
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              {/* Name with Smart Combobox */}
              <div className="flex-1 w-full min-w-[200px]">
                <IngredientCombobox
                  value={ing.name}
                  aisle={ing.aisle}
                  onChange={(name, suggestedAisle, defaultUnit) =>
                    handleComboboxIngredientChange(index, name, suggestedAisle, defaultUnit)
                  }
                />
              </div>

              {/* Aisle */}
              <div className="w-full sm:w-44 lg:w-44">
                <select
                  value={ing.aisle}
                  onChange={(e) =>
                    handleUpdateIngredient(index, 'aisle', e.target.value as GroceryAisle)
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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

        {/* Datalists for autocompletion */}
        <datalist id="units-list">
          {COMMON_UNITS.map(u => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <datalist id="sections-list">
          {COMMON_SECTIONS.map(s => (
            <option key={s} value={s} />
          ))}
        </datalist>
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
              className="flex flex-col sm:flex-row items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-bold text-xs text-white">
                {index + 1}
              </span>

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  placeholder="Titre de l'étape optionnel (ex: Cuisson du poulet, Vinaigrette...)"
                  value={step.title || ''}
                  onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />

                <textarea
                  rows={2}
                  required
                  placeholder={`Décrivez l'étape ${index + 1}...`}
                  value={step.instruction}
                  onChange={(e) => handleUpdateStep(index, 'instruction', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                disabled={steps.length <= 1}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la recette'}</span>
        </button>
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 flex flex-col">
            
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Importer une recette depuis un fichier CSV
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Supporte le template avec colonnes Type, Section, Élément / Action, Détail, Remarques.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {csvImportMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                  {csvImportMsg}
                </div>
              )}

              {/* Upload file directly */}
              <div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-50/50 p-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                  <Upload className="h-4 w-4" />
                  <span>Choisir un fichier .CSV sur votre appareil</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUploadCsv}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ou collez directement le texte CSV ici :
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Type,Section,Élément / Action,Détail,Remarques&#10;Information,Général,Titre,Salade Cobb..."
                  className="w-full font-mono text-xs rounded-2xl border border-zinc-300 bg-zinc-50 p-3.5 text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

            </div>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleImportCsv}
                className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                Importer la recette
              </button>
            </div>

          </div>
        </div>
      )}

    </form>
  );
}

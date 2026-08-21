'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Recipe, GroceryAisle, GroceryCompiledItem } from '@/lib/types';
import { fetchAllRecipes, getStoredMealPlan, saveStoredMealPlan } from '@/lib/supabase';
import { getPurchaseRules } from '@/lib/purchase-rules';
import { compileGroceryList } from '@/lib/grocery-aggregator';
import { exportGroceryListPdf } from '@/lib/pdf-exporter';
import { 
  ShoppingCart, 
  FileDown, 
  Plus, 
  Trash2, 
  Check, 
  CheckSquare, 
  Square, 
  Utensils, 
  ChevronRight, 
  Users, 
  Sparkles, 
  Package, 
  Search,
  RotateCcw
} from 'lucide-react';

export function GroceryPlanner() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});
  const [customItems, setCustomItems] = useState<{ id: string; name: string; quantity_str: string; aisle: GroceryAisle; checked: boolean }[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('recettes_checked_items_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Search & add recipe modal state
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New custom item form state
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomQty, setNewCustomQty] = useState('');
  const [newCustomAisle, setNewCustomAisle] = useState<GroceryAisle>('Divers');

  const [isLoading, setIsLoading] = useState(true);

  // Load recipes and stored plan
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const recipes = await fetchAllRecipes();
      setAllRecipes(recipes);

      const storedPlan = getStoredMealPlan();
      setSelectedRecipeIds(storedPlan.selected_recipe_ids || []);
      setMultipliers(storedPlan.servings_multiplier || {});
      setCustomItems(storedPlan.custom_grocery_items || []);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Save changes to storage whenever recipes/multipliers/customItems change
  const persistPlan = (
    newSelectedIds: string[],
    newMultipliers: Record<string, number>,
    newCustoms: typeof customItems
  ) => {
    setSelectedRecipeIds(newSelectedIds);
    setMultipliers(newMultipliers);
    setCustomItems(newCustoms);

    saveStoredMealPlan({
      week_start_date: new Date().toISOString(),
      selected_recipe_ids: newSelectedIds,
      servings_multiplier: newMultipliers,
      custom_grocery_items: newCustoms
    });

    window.dispatchEvent(new Event('mealplan-updated'));
  };

  const handleToggleRecipe = (id: string) => {
    let nextIds: string[];
    let nextMultipliers = { ...multipliers };

    if (selectedRecipeIds.includes(id)) {
      nextIds = selectedRecipeIds.filter(rId => rId !== id);
      delete nextMultipliers[id];
    } else {
      nextIds = [...selectedRecipeIds, id];
      nextMultipliers[id] = 1;
    }

    persistPlan(nextIds, nextMultipliers, customItems);
  };

  const handleMultiplierChange = (id: string, delta: number) => {
    const current = multipliers[id] || 1;
    const nextVal = Math.max(0.5, Math.min(10, current + delta));
    const nextMultipliers = { ...multipliers, [id]: nextVal };
    persistPlan(selectedRecipeIds, nextMultipliers, customItems);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newCustomName.trim(),
      quantity_str: newCustomQty.trim() || '1',
      aisle: newCustomAisle,
      checked: false
    };

    const nextCustoms = [...customItems, newItem];
    setNewCustomName('');
    setNewCustomQty('');
    persistPlan(selectedRecipeIds, multipliers, nextCustoms);
  };

  const handleRemoveCustomItem = (id: string) => {
    const nextCustoms = customItems.filter(c => c.id !== id);
    persistPlan(selectedRecipeIds, multipliers, nextCustoms);
  };

  const handleToggleCheck = (itemId: string) => {
    setCheckedItemIds(prev => {
      const next = {
        ...prev,
        [itemId]: !prev[itemId]
      };
      try {
        localStorage.setItem('recettes_checked_items_v1', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Compile Grocery List
  const { itemsByAisle, totalItemsCount, completedItemsCount, recipeSummary } = useMemo(() => {
    const rules = getPurchaseRules();
    const compiled = compileGroceryList(
      allRecipes,
      selectedRecipeIds,
      multipliers,
      customItems,
      rules
    );

    // Apply checked state
    const aisles = Object.keys(compiled.itemsByAisle) as GroceryAisle[];
    let checkedCount = 0;

    for (const aisle of aisles) {
      for (const item of compiled.itemsByAisle[aisle]) {
        if (checkedItemIds[item.id]) {
          item.checked = true;
          checkedCount++;
        }
      }
    }

    return {
      ...compiled,
      completedItemsCount: checkedCount
    };
  }, [allRecipes, selectedRecipeIds, multipliers, customItems, checkedItemIds]);

  const handleExportPdf = () => {
    exportGroceryListPdf({
      itemsByAisle,
      recipeSummary,
      weekTitle: 'Liste d\'épicerie & Menu de la semaine'
    });
  };

  const handleResetChecklist = () => {
    setCheckedItemIds({});
  };

  const selectedRecipesList = allRecipes.filter(r => selectedRecipeIds.includes(r.id));
  const itemsAtHomeCount = completedItemsCount;
  const itemsToBuyCount = totalItemsCount - itemsAtHomeCount;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Planification & Achats</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Menu de la semaine & Liste d&apos;épicerie
            </h1>
            <p className="mt-1 max-w-xl text-sm text-emerald-100">
              Sélectionnez vos recettes, ajustez les portions et <strong>cochez ce que vous avez déjà à la maison</strong> pour l&apos;exclure automatiquement de votre liste d&apos;épicerie et du PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecipePickerOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs sm:text-sm font-bold text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Recettes au menu ({selectedRecipeIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={itemsToBuyCount === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-900/40 border border-white/20 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-900/60 active:scale-95 transition-all disabled:opacity-40"
            >
              <FileDown className="h-4 w-4" />
              <span>Exporter en PDF ({itemsToBuyCount} à acheter)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Recipes Strip */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-600" />
              Recettes sélectionnées au menu ({selectedRecipesList.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Ajustez le multiplicateur de portions si vous recevez des invités ou préparez des surplus.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRecipePickerOpen(true)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            + Modifier la sélection
          </button>
        </div>

        {selectedRecipesList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <Utensils className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Aucune recette au menu pour le moment.
            </p>
            <button
              onClick={() => setIsRecipePickerOpen(true)}
              className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              Parcourir mes recettes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedRecipesList.map((recipe) => {
              const multiplier = multipliers[recipe.id] || 1;
              const totalServings = Math.round(recipe.servings * multiplier);

              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <Utensils className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/recettes/${recipe.id}`}
                      className="block truncate text-sm font-bold text-zinc-900 hover:text-emerald-600 dark:text-zinc-50"
                    >
                      {recipe.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{totalServings} portions ({multiplier}x)</span>
                    </div>
                  </div>

                  {/* Multiplier controls */}
                  <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleMultiplierChange(recipe.id, -0.5)}
                      className="h-6 w-6 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {multiplier}x
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMultiplierChange(recipe.id, 0.5)}
                      className="h-6 w-6 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleToggleRecipe(recipe.id)}
                    className="h-8 w-8 shrink-0 flex items-center justify-center text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Retirer du menu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grocery List with Shopping Checklist */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left 2 Cols: Compiled Grocery Items categorized by Aisle */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress and status header */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  Articles requis ({totalItemsCount})
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    🛒 {itemsToBuyCount} à acheter (inclus dans le PDF)
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    🏠 {itemsAtHomeCount} déjà à la maison (exclus du PDF)
                  </span>
                </div>
              </div>

              {itemsAtHomeCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Tout marquer à acheter</span>
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              💡 <em>Cochez les ingrédients que vous possédez déjà dans vos armoires/réfrigérateur. Seuls les ingrédients <strong>non cochés</strong> seront inclus dans votre export PDF.</em>
            </p>
          </div>

          {/* Aisles */}
          {totalItemsCount === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <h3 className="mt-3 text-base font-bold text-zinc-800 dark:text-zinc-200">
                Votre liste d&apos;épicerie est vide
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Sélectionnez des recettes ci-dessus ou ajoutez des articles personnalisés pour générer votre liste.
              </p>
            </div>
          ) : (
            (Object.keys(itemsByAisle) as GroceryAisle[]).map((aisle) => {
              const items = itemsByAisle[aisle];
              if (!items || items.length === 0) return null;

              const aisleToBuyCount = items.filter(i => !i.checked).length;

              return (
                <div
                  key={aisle}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm sm:text-base flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {aisle}
                    </h3>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {aisleToBuyCount} à acheter / {items.length} total
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCheck(item.id)}
                        className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                          item.checked
                            ? 'border-zinc-200 bg-zinc-50/50 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/40'
                            : 'border-zinc-200/70 bg-white hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:border-zinc-800 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 text-emerald-600 focus:outline-none"
                          >
                            {item.checked ? (
                              <CheckSquare className="h-5 w-5 fill-emerald-600 text-white" />
                            ) : (
                              <Square className="h-5 w-5 text-zinc-400 hover:text-emerald-600" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-sm ${
                                  item.checked
                                    ? 'line-through text-zinc-400 dark:text-zinc-500'
                                    : 'text-zinc-900 dark:text-zinc-50'
                                }`}
                              >
                                {item.name}
                              </span>

                              {item.checked ? (
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  ✓ Déjà à la maison (exclu du PDF)
                                </span>
                              ) : (
                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                                  À acheter
                                </span>
                              )}
                            </div>

                            {/* Source recipes info */}
                            {item.recipes_sources.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-zinc-400">
                                <span>Recettes :</span>
                                {item.recipes_sources.map((s, idx) => (
                                  <span key={idx} className="font-medium text-zinc-500 dark:text-zinc-400">
                                    {s.recipe_title}{idx < item.recipes_sources.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantities & Packaging rule highlight */}
                        <div className="flex flex-col items-end shrink-0">
                          {/* Recipe needed amount */}
                          <span className={`text-xs font-semibold ${item.checked ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            Besoin : {item.display_quantity_str}
                          </span>

                          {/* Admin Packaging Rule Highlight (ex: 1 livre de beurre) */}
                          {!item.checked && item.purchase_package_label && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                              <Package className="h-3 w-3" />
                              {item.purchase_package_label}
                            </span>
                          )}

                          {/* Custom item delete */}
                          {item.is_custom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomItem(item.id);
                              }}
                              className="mt-1 text-xs text-rose-500 hover:text-rose-700"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* Right Col: Add Custom Items & Admin Rules Shortcut */}
        <div className="space-y-6">
          
          {/* Add custom grocery item card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              Ajouter un article libre
            </h3>
            <p className="text-xs text-zinc-500">
              Essuie-tout, café, savon ou tout autre article hors recette.
            </p>

            <form onSubmit={handleAddCustomItem} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nom de l'article (ex: Café moulu)"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Qté (ex: 1 sac, 500g)"
                  value={newCustomQty}
                  onChange={(e) => setNewCustomQty(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />

                <select
                  value={newCustomAisle}
                  onChange={(e) => setNewCustomAisle(e.target.value as GroceryAisle)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-2 py-2 text-xs text-zinc-700 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Boucherie & Volailles">Boucherie</option>
                  <option value="Poissonnerie & Fruits de mer">Poissonnerie</option>
                  <option value="Produits laitiers & Œufs">Laitiers & Œufs</option>
                  <option value="Boulangerie & Pâtisserie">Boulangerie</option>
                  <option value="Épicerie & Garde-manger">Épicerie</option>
                  <option value="Épices & Condiments">Épices</option>
                  <option value="Surgelés">Surgelés</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition-all"
              >
                + Ajouter à la liste
              </button>
            </form>
          </div>

          {/* Packaging Rules / Admin Info Banner */}
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 dark:border-emerald-950 dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Package className="h-5 w-5 text-emerald-600 shrink-0" />
              <h4 className="font-bold text-sm">Conditionnements d&apos;achat</h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Vos règles d&apos;achat (ex : <strong>1 livre de beurre (454g)</strong>, <strong>douzaine d&apos;œufs</strong>, <strong>sac de farine 1kg</strong>) sont appliquées automatiquement sur la liste et sur l&apos;export PDF.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
            >
              <span>Personnaliser les formats dans le Mode Admin</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Recipe Picker Modal */}
      {isRecipePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Choisir les recettes de la semaine
                </h3>
                <p className="text-xs text-zinc-500">
                  Cochez les plats à préparer pour compiler automatiquement tous les ingrédients nécessaires.
                </p>
              </div>
              <button
                onClick={() => setIsRecipePickerOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher une recette par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 pl-10 pr-4 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* Modal Recipe List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allRecipes
                .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((recipe) => {
                  const isSelected = selectedRecipeIds.includes(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      onClick={() => handleToggleRecipe(recipe.id)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                          {recipe.image_url ? (
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                              <Utensils className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                            {recipe.title}
                          </h4>
                          <span className="text-xs text-zinc-500">
                            {recipe.category} • {recipe.servings} portions • {recipe.ingredients.length} ingrédients
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-300 text-zinc-400 dark:border-zinc-700'
                        }`}
                      >
                        {isSelected ? <Check className="h-4 w-4 stroke-[3]" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRecipePickerOpen(false)}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                Terminer ({selectedRecipeIds.length} sélectionnées)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

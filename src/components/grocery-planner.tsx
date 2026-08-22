'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Recipe, GroceryAisle, GroceryCompiledItem, MealPlanArchive } from '@/lib/types';
import { 
  fetchAllRecipes, 
  getStoredMealPlan, 
  saveStoredMealPlan,
  getMealPlanArchives,
  saveMealPlanArchive,
  deleteMealPlanArchive
} from '@/lib/supabase';
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
  RotateCcw,
  CalendarPlus,
  History,
  Archive,
  Clock,
  ArrowRight,
  Edit2,
  X
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

  // Quantity Overrides state (allows user to click any item and change its quantity)
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('recettes_qty_overrides_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQtyValue, setEditingQtyValue] = useState<string>('');

  // Modals state
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [isArchivesModalOpen, setIsArchivesModalOpen] = useState(false);
  const [newWeekArchiveName, setNewWeekArchiveName] = useState('');
  const [archives, setArchives] = useState<MealPlanArchive[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  // New custom item form state
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomQty, setNewCustomQty] = useState('');
  const [newCustomAisle, setNewCustomAisle] = useState<GroceryAisle>('Divers');

  const [isLoading, setIsLoading] = useState(true);

  // Load recipes, plan and archives
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const recipes = await fetchAllRecipes();
      setAllRecipes(recipes);

      const storedPlan = getStoredMealPlan();
      const existingIds = new Set(recipes.map(r => r.id));
      const validIds = (storedPlan.selected_recipe_ids || []).filter(id => existingIds.has(id));

      setSelectedRecipeIds(validIds);
      setMultipliers(storedPlan.servings_multiplier || {});
      setCustomItems(storedPlan.custom_grocery_items || []);

      if (validIds.length !== (storedPlan.selected_recipe_ids || []).length) {
        saveStoredMealPlan({
          ...storedPlan,
          selected_recipe_ids: validIds
        });
        window.dispatchEvent(new Event('mealplan-updated'));
      }

      setArchives(getMealPlanArchives());
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

  // Quantity Editing handlers
  const handleStartEditQty = (itemId: string, currentQtyStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(itemId);
    setEditingQtyValue(quantityOverrides[itemId] || currentQtyStr || '1');
  };

  const handleSaveQtyOverride = (itemId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (!editingQtyValue.trim()) return;

    const next = {
      ...quantityOverrides,
      [itemId]: editingQtyValue.trim()
    };
    setQuantityOverrides(next);
    try {
      localStorage.setItem('recettes_qty_overrides_v1', JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
    setEditingItemId(null);
  };

  const handleResetQtyOverride = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { ...quantityOverrides };
    delete next[itemId];
    setQuantityOverrides(next);
    try {
      localStorage.setItem('recettes_qty_overrides_v1', JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
    if (editingItemId === itemId) {
      setEditingItemId(null);
    }
  };

  // Compile Grocery List with Quantity Overrides applied
  const { itemsByAisle, totalItemsCount, completedItemsCount, recipeSummary } = useMemo(() => {
    const rules = getPurchaseRules();
    const compiled = compileGroceryList(
      allRecipes,
      selectedRecipeIds,
      multipliers,
      customItems,
      rules
    );

    // Apply checked state and quantity overrides
    const aisles = Object.keys(compiled.itemsByAisle) as GroceryAisle[];
    let checkedCount = 0;

    for (const aisle of aisles) {
      for (const item of compiled.itemsByAisle[aisle]) {
        if (checkedItemIds[item.id]) {
          item.checked = true;
          checkedCount++;
        }

        // Apply custom quantity override if set by user
        if (quantityOverrides[item.id]) {
          item.display_quantity_str = quantityOverrides[item.id];
          item.purchase_package_label = `Acheter : ${quantityOverrides[item.id]}`;
        }
      }
    }

    return {
      ...compiled,
      completedItemsCount: checkedCount
    };
  }, [allRecipes, selectedRecipeIds, multipliers, customItems, checkedItemIds, quantityOverrides]);

  const handleExportPdf = () => {
    exportGroceryListPdf({
      itemsByAisle,
      recipeSummary,
      weekTitle: 'Liste d\'épicerie & Menu de la semaine'
    });
  };

  const handleResetChecklist = () => {
    setCheckedItemIds({});
    try {
      localStorage.removeItem('recettes_checked_items_v1');
    } catch {}
  };

  // Open Start New Week Modal with pre-filled default date name
  const openNewWeekModal = () => {
    const dateFormatted = new Date().toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setNewWeekArchiveName(`Semaine du ${dateFormatted}`);
    setIsNewWeekModalOpen(true);
  };

  // Confirm Start New Week & Archive
  const handleConfirmNewWeek = () => {
    // 1. Archive current selected recipes (without custom items, as requested!)
    if (selectedRecipeIds.length > 0) {
      const newArchive: MealPlanArchive = {
        id: `archive-${Date.now()}`,
        name: newWeekArchiveName.trim() || `Semaine du ${new Date().toISOString().slice(0, 10)}`,
        archived_at: new Date().toISOString(),
        recipe_ids: [...selectedRecipeIds],
        servings_multiplier: { ...multipliers }
      };

      saveMealPlanArchive(newArchive);
      setArchives(getMealPlanArchives());
    }

    // 2. Reset active week completely
    persistPlan([], {}, []);
    handleResetChecklist();
    setQuantityOverrides({});
    try {
      localStorage.removeItem('recettes_qty_overrides_v1');
    } catch {}
    setIsNewWeekModalOpen(false);
  };

  // Restore past archived menu
  const handleRestoreArchive = (archive: MealPlanArchive) => {
    const existingIds = new Set(allRecipes.map(r => r.id));
    const validArchiveIds = archive.recipe_ids.filter(id => existingIds.has(id));

    persistPlan(validArchiveIds, archive.servings_multiplier || {}, []);
    handleResetChecklist();
    setIsArchivesModalOpen(false);
  };

  // Delete an archive
  const handleDeleteArchive = (archiveId: string) => {
    deleteMealPlanArchive(archiveId);
    setArchives(getMealPlanArchives());
  };

  const selectedRecipesList = allRecipes.filter(r => selectedRecipeIds.includes(r.id));
  const itemsAtHomeCount = completedItemsCount;
  const itemsToBuyCount = totalItemsCount - itemsAtHomeCount;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Start New Week Button */}
            <button
              type="button"
              onClick={openNewWeekModal}
              className="flex items-center gap-2 rounded-2xl bg-white/20 border border-white/30 px-3.5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm backdrop-blur-md hover:bg-white/30 active:scale-95 transition-all"
              title="Archiver le menu actuel et démarrer une nouvelle semaine à neuf"
            >
              <CalendarPlus className="h-4 w-4 text-emerald-200" />
              <span>Nouvelle semaine</span>
            </button>

            {/* View Archives Button */}
            <button
              type="button"
              onClick={() => {
                setArchives(getMealPlanArchives());
                setIsArchivesModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/20 border border-white/30 px-3.5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm backdrop-blur-md hover:bg-white/30 active:scale-95 transition-all"
              title="Consulter l'historique des menus passés"
            >
              <History className="h-4 w-4 text-emerald-200" />
              <span>Archives ({archives.length})</span>
            </button>

            {/* Add Recipes Button */}
            <button
              type="button"
              onClick={() => setIsRecipePickerOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs sm:text-sm font-bold text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Recettes au menu ({selectedRecipesList.length})</span>
            </button>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={itemsToBuyCount === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-950/60 border border-white/20 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-950/80 active:scale-95 transition-all disabled:opacity-40"
            >
              <FileDown className="h-4 w-4" />
              <span>Exporter PDF ({itemsToBuyCount})</span>
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setIsRecipePickerOpen(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                + Choisir des recettes
              </button>
              {archives.length > 0 && (
                <button
                  onClick={() => setIsArchivesModalOpen(true)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  📂 Charger un menu archivé
                </button>
              )}
            </div>
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
              💡 <em>Cochez les ingrédients que vous possédez déjà pour les exclure. Cliquez sur une quantité pour la personnaliser au besoin !</em>
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
                    {items.map((item) => {
                      const isEditing = editingItemId === item.id;
                      const hasCustomQty = Boolean(quantityOverrides[item.id]);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCheck(item.id)}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                            item.checked
                              ? 'border-zinc-200 bg-zinc-50/50 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/40'
                              : 'border-zinc-200/70 bg-white hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:border-zinc-800 dark:bg-zinc-800/40'
                          }`}
                        >
                          {/* Left: Checkbox & Name */}
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

                                {hasCustomQty && !item.checked && (
                                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 flex items-center gap-1">
                                    <Edit2 className="h-2.5 w-2.5" />
                                    <span>Personnalisé</span>
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

                          {/* Right: Quantity Display & Inline Modifier */}
                          <div className="flex flex-col sm:items-end shrink-0 pl-8 sm:pl-0">
                            {isEditing ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-xl dark:bg-zinc-800 border border-emerald-500/50"
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingQtyValue}
                                  onChange={(e) => setEditingQtyValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveQtyOverride(item.id);
                                    if (e.key === 'Escape') setEditingItemId(null);
                                  }}
                                  placeholder="ex: 2 unités, 500g"
                                  className="w-28 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-bold text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                />

                                <button
                                  type="button"
                                  onClick={(e) => handleSaveQtyOverride(item.id, e)}
                                  className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                                  title="Enregistrer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>

                                {hasCustomQty && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleResetQtyOverride(item.id, e)}
                                    className="h-7 w-7 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                                    title="Rétablir quantité originale"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItemId(null);
                                  }}
                                  className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-600 flex items-center justify-center"
                                  title="Annuler"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:items-end">
                                {/* Clickable Quantity Chip */}
                                <button
                                  type="button"
                                  onClick={(e) => handleStartEditQty(item.id, item.display_quantity_str, e)}
                                  className={`group/qty flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                                    item.checked
                                      ? 'line-through text-zinc-400'
                                      : hasCustomQty
                                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                      : 'hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-300'
                                  }`}
                                  title="Cliquer pour modifier la quantité à acheter"
                                >
                                  <span>Besoin : {item.display_quantity_str}</span>
                                  <Edit2 className="h-3 w-3 text-zinc-400 opacity-0 group-hover/qty:opacity-100 transition-opacity" />
                                </button>

                                {/* Admin Packaging Rule Highlight (ex: 1 livre de beurre) */}
                                {!item.checked && item.purchase_package_label && !hasCustomQty && (
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
                            )}
                          </div>

                        </div>
                      );
                    })}
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
              Essuie-tout, café, savon ou tout autre article hors recette (non conservé lors de l&apos;archivage).
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

      {/* Start New Week Modal */}
      {isNewWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CalendarPlus className="h-5 w-5" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Démarrer une nouvelle semaine
                </h3>
              </div>
              <button
                onClick={() => setIsNewWeekModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {selectedRecipeIds.length > 0 ? (
                <>
                  Votre menu actuel ({selectedRecipeIds.length} recettes) sera sauvegardé dans vos <strong>archives</strong> afin de pouvoir être rechargé plus tard. Les articles libres et cases cochées seront réinitialisés.
                </>
              ) : (
                <>
                  Réinitialisez votre liste pour planifier votre nouvelle semaine.
                </>
              )}
            </p>

            {selectedRecipeIds.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nom de l&apos;archive :
                </label>
                <input
                  type="text"
                  value={newWeekArchiveName}
                  onChange={(e) => setNewWeekArchiveName(e.target.value)}
                  placeholder="ex: Semaine du 21 août 2026"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewWeekModalOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmNewWeek}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all"
              >
                Archiver et repartir à neuf
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archives Modal */}
      {isArchivesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 flex flex-col">
            
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <History className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Archives des menus passés ({archives.length})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Retrouvez vos menus précédents et rechargez-les en un clic.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsArchivesModalOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {archives.length === 0 ? (
                <div className="py-12 text-center text-zinc-400">
                  <Archive className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p className="text-xs font-medium">Aucun menu archivé pour le moment.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Lorsque vous cliquerez sur « Nouvelle semaine », votre menu actif sera automatiquement archivé ici.
                  </p>
                </div>
              ) : (
                archives.map((arch) => {
                  const archivedRecipes = allRecipes.filter(r => arch.recipe_ids.includes(r.id));

                  return (
                    <div
                      key={arch.id}
                      className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 pb-2 dark:border-zinc-700/60">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                            {arch.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400">
                            Archivé le {new Date(arch.archived_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreArchive(arch)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <span>Charger ce menu</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteArchive(arch.id)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            title="Supprimer l'archive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Archived recipes list */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {archivedRecipes.length > 0 ? (
                          archivedRecipes.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              <Utensils className="h-3 w-3 text-emerald-600" />
                              <span>{r.title}</span>
                              {arch.servings_multiplier[r.id] && arch.servings_multiplier[r.id] !== 1 && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  ({arch.servings_multiplier[r.id]}x)
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            {arch.recipe_ids.length} recette(s) (non trouvées dans la base actuelle)
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsArchivesModalOpen(false)}
                className="rounded-xl border border-zinc-300 px-5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Recipe Picker Modal */}
      {isRecipePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
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
                Terminer ({selectedRecipesList.length} sélectionnées)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

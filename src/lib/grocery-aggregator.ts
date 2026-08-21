import { GroceryAisle, GroceryCompiledItem, Recipe, PurchaseRule } from './types';
import { findMatchingRule } from './purchase-rules';

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(de |d'|du |des |d’)/i, '')
    .replace(/\s+/g, ' ');
}

export function compileGroceryList(
  recipes: Recipe[],
  selectedRecipeIds: string[],
  servingsMultiplier: Record<string, number>,
  customItems: { id: string; name: string; quantity_str: string; aisle: GroceryAisle; checked: boolean }[],
  purchaseRules: PurchaseRule[]
): {
  itemsByAisle: Record<GroceryAisle, GroceryCompiledItem[]>;
  totalItemsCount: number;
  completedItemsCount: number;
  recipeSummary: { recipe: Recipe; multiplier: number }[];
} {
  const selectedRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
  const rawMap = new Map<string, GroceryCompiledItem>();

  for (const recipe of selectedRecipes) {
    const multiplier = servingsMultiplier[recipe.id] ?? 1;

    for (const ing of recipe.ingredients) {
      const normalizedKey = `${normalizeIngredientName(ing.name)}_${(ing.unit || '').toLowerCase()}`;
      const scaledQty = ing.quantity !== null ? ing.quantity * multiplier : 0;

      if (!rawMap.has(normalizedKey)) {
        rawMap.set(normalizedKey, {
          id: `item-${normalizedKey}`,
          name: ing.name,
          raw_quantity: scaledQty,
          unit: ing.unit || '',
          aisle: ing.aisle || 'Épicerie & Garde-manger',
          purchase_packages_count: null,
          purchase_package_label: null,
          display_quantity_str: '',
          recipes_sources: [
            {
              recipe_id: recipe.id,
              recipe_title: recipe.title,
              quantity: scaledQty > 0 ? scaledQty : null,
              unit: ing.unit || ''
            }
          ],
          checked: false
        });
      } else {
        const existing = rawMap.get(normalizedKey)!;
        existing.raw_quantity += scaledQty;
        existing.recipes_sources.push({
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          quantity: scaledQty > 0 ? scaledQty : null,
          unit: ing.unit || ''
        });
      }
    }
  }

  // Calculate purchase packages according to admin rules
  const compiledList: GroceryCompiledItem[] = Array.from(rawMap.values()).map(item => {
    const rule = findMatchingRule(item.name, purchaseRules);

    let displayQty = '';
    let packagesCount: number | null = null;
    let packageLabel: string | null = null;

    if (item.raw_quantity > 0) {
      // Clean decimal display (e.g. 1.5 instead of 1.50000000)
      const cleanQty = Math.round(item.raw_quantity * 100) / 100;
      displayQty = `${cleanQty} ${item.unit}`.trim();
    } else {
      displayQty = item.unit ? `1 ${item.unit}` : 'Au goût / selon besoin';
    }

    if (rule && rule.standard_quantity > 0) {
      // Check if units match or are convertible
      let needed = item.raw_quantity;
      if (item.unit.toLowerCase() === 'kg' && rule.standard_unit.toLowerCase() === 'g') {
        needed = item.raw_quantity * 1000;
      } else if (item.unit.toLowerCase() === 'l' && rule.standard_unit.toLowerCase() === 'ml') {
        needed = item.raw_quantity * 1000;
      }

      if (needed > 0) {
        packagesCount = Math.ceil(needed / rule.standard_quantity);
        if (packagesCount === 1) {
          packageLabel = `Acheter : ${rule.package_label}`;
        } else {
          packageLabel = `Acheter : ${packagesCount}x (${rule.package_label})`;
        }
      } else {
        packagesCount = 1;
        packageLabel = `Acheter : ${rule.package_label}`;
      }
      // Re-assign appropriate aisle if defined in rule
      if (rule.aisle) {
        item.aisle = rule.aisle;
      }
    }

    return {
      ...item,
      display_quantity_str: displayQty,
      purchase_packages_count: packagesCount,
      purchase_package_label: packageLabel
    };
  });

  // Append custom one-off items
  for (const custom of customItems) {
    compiledList.push({
      id: custom.id,
      name: custom.name,
      raw_quantity: 0,
      unit: '',
      aisle: custom.aisle,
      purchase_packages_count: null,
      purchase_package_label: null,
      display_quantity_str: custom.quantity_str,
      recipes_sources: [],
      checked: custom.checked,
      is_custom: true
    });
  }

  // Group by Aisle
  const ALL_AISLES: GroceryAisle[] = [
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

  const itemsByAisle: Record<GroceryAisle, GroceryCompiledItem[]> = ALL_AISLES.reduce((acc, aisle) => {
    acc[aisle] = [];
    return acc;
  }, {} as Record<GroceryAisle, GroceryCompiledItem[]>);

  for (const item of compiledList) {
    if (itemsByAisle[item.aisle]) {
      itemsByAisle[item.aisle].push(item);
    } else {
      itemsByAisle['Divers'].push(item);
    }
  }

  const totalItemsCount = compiledList.length;
  const completedItemsCount = compiledList.filter(i => i.checked).length;

  const recipeSummary = selectedRecipes.map(r => ({
    recipe: r,
    multiplier: servingsMultiplier[r.id] ?? 1
  }));

  return {
    itemsByAisle,
    totalItemsCount,
    completedItemsCount,
    recipeSummary
  };
}

import { PurchaseRule } from './types';

export const DEFAULT_PURCHASE_RULES: PurchaseRule[] = [
  {
    id: 'rule-beurre',
    ingredient_pattern: 'beurre',
    display_name: 'Beurre',
    standard_quantity: 454,
    standard_unit: 'g',
    package_label: '1 livre (454g)',
    aisle: 'Produits laitiers & Œufs',
    notes: 'Bloc standard de 1 lb / 454g',
  },
  {
    id: 'rule-oeufs',
    ingredient_pattern: 'oeuf|œuf',
    display_name: 'Œufs',
    standard_quantity: 12,
    standard_unit: 'unité',
    package_label: '1 douzaine (12 œufs)',
    aisle: 'Produits laitiers & Œufs',
    notes: 'Boîte de 12',
  },
  {
    id: 'rule-farine',
    ingredient_pattern: 'farine',
    display_name: 'Farine tout usage',
    standard_quantity: 1000,
    standard_unit: 'g',
    package_label: '1 sac de 1 kg',
    aisle: 'Épicerie & Garde-manger',
    notes: 'Sac de 1 kg ou 2 kg',
  },
  {
    id: 'rule-sucre',
    ingredient_pattern: 'sucre|sucre blanc|cassonade',
    display_name: 'Sucre / Cassonade',
    standard_quantity: 1000,
    standard_unit: 'g',
    package_label: '1 sac de 1 kg',
    aisle: 'Épicerie & Garde-manger',
  },
  {
    id: 'rule-lait',
    ingredient_pattern: 'lait|lait 2%|lait 3.25%|lait entier',
    display_name: 'Lait',
    standard_quantity: 2000,
    standard_unit: 'ml',
    package_label: '1 contenant de 2L',
    aisle: 'Produits laitiers & Œufs',
  },
  {
    id: 'rule-creme',
    ingredient_pattern: 'crème|crème 35%|crème à fouetter|crème 15%',
    display_name: 'Crème (35% ou 15%)',
    standard_quantity: 500,
    standard_unit: 'ml',
    package_label: '1 contenant de 500 ml',
    aisle: 'Produits laitiers & Œufs',
  },
  {
    id: 'rule-huile-olive',
    ingredient_pattern: 'huile d\'olive|huile végétale|huile de canola',
    display_name: 'Huile de cuisson',
    standard_quantity: 750,
    standard_unit: 'ml',
    package_label: '1 bouteille de 750 ml',
    aisle: 'Épicerie & Garde-manger',
  },
  {
    id: 'rule-ail',
    ingredient_pattern: 'gousse d\'ail|ail',
    display_name: 'Ail frais',
    standard_quantity: 3,
    standard_unit: 'unité',
    package_label: '1 filet de têtes d\'ail',
    aisle: 'Fruits & Légumes',
  },
  {
    id: 'rule-oignons',
    ingredient_pattern: 'oignon|oignon jaune|oignon rouge',
    display_name: 'Oignons',
    standard_quantity: 1360,
    standard_unit: 'g',
    package_label: '1 sac de 3 livres (1.36 kg)',
    aisle: 'Fruits & Légumes',
  },
  {
    id: 'rule-pommes-terre',
    ingredient_pattern: 'pomme de terre|patate',
    display_name: 'Pommes de terre',
    standard_quantity: 2270,
    standard_unit: 'g',
    package_label: '1 sac de 5 livres (2.27 kg)',
    aisle: 'Fruits & Légumes',
  },
  {
    id: 'rule-bouillon',
    ingredient_pattern: 'bouillon de poulet|bouillon de boeuf|bouillon de légumes',
    display_name: 'Bouillon prêt à servir',
    standard_quantity: 900,
    standard_unit: 'ml',
    package_label: '1 carton de 900 ml',
    aisle: 'Épicerie & Garde-manger',
  },
  {
    id: 'rule-parmesan',
    ingredient_pattern: 'parmesan|parmigiano',
    display_name: 'Parmesan râpé / bloc',
    standard_quantity: 200,
    standard_unit: 'g',
    package_label: '1 bloc de 200g',
    aisle: 'Produits laitiers & Œufs',
  }
];

const LOCAL_STORAGE_RULES_KEY = 'recettes_purchase_rules_v1';

export function getPurchaseRules(): PurchaseRule[] {
  if (typeof window === 'undefined') return DEFAULT_PURCHASE_RULES;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(DEFAULT_PURCHASE_RULES));
      return DEFAULT_PURCHASE_RULES;
    }
    return JSON.parse(saved);
  } catch {
    return DEFAULT_PURCHASE_RULES;
  }
}

export function savePurchaseRules(rules: PurchaseRule[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Erreur de sauvegarde des règles d\'achat', e);
  }
}

export function findMatchingRule(ingredientName: string, rules: PurchaseRule[]): PurchaseRule | null {
  const cleanName = ingredientName.toLowerCase().trim();
  for (const rule of rules) {
    try {
      const regex = new RegExp(`(^|\\b|\\s)(${rule.ingredient_pattern})(\\b|\\s|$)`, 'i');
      if (regex.test(cleanName)) {
        return rule;
      }
    } catch {
      if (cleanName.includes(rule.ingredient_pattern.toLowerCase())) {
        return rule;
      }
    }
  }
  return null;
}

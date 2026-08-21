import { GroceryAisle, IngredientItem, StepItem } from './types';

// Keyword to aisle mapping for auto-categorization
const AISLE_KEYWORDS: { aisle: GroceryAisle; keywords: string[] }[] = [
  {
    aisle: 'Fruits & Légumes',
    keywords: ['pomme', 'poire', 'citron', 'lime', 'banane', 'oignon', 'ail', 'échalote', 'champignon', 'tomate', 'carotte', 'courgette', 'poivron', 'épinard', 'salade', 'laitue', 'avocat', 'patate', 'haricot', 'pomme de terre', 'persil', 'coriandre', 'basilic', 'gingembre', 'concombre', 'brocoli', 'chou']
  },
  {
    aisle: 'Boucherie & Volailles',
    keywords: ['poulet', 'bœuf', 'boeuf', 'porc', 'veau', 'dinde', 'canard', 'agneau', 'viande', 'steak', 'bacon', 'saucisse', 'jambon', 'haché']
  },
  {
    aisle: 'Poissonnerie & Fruits de mer',
    keywords: ['saumon', 'thon', 'crevette', 'morue', 'truite', 'fruits de mer', 'homard', 'crabe', 'moule', 'poisson', 'saint-jacques', 'calmar']
  },
  {
    aisle: 'Produits laitiers & Œufs',
    keywords: ['beurre', 'lait', 'crème', 'oeuf', 'œuf', 'fromage', 'parmesan', 'mozzarella', 'cheddar', 'yaourt', 'yogourt', 'ricotta', 'mascarpone', 'gruyère']
  },
  {
    aisle: 'Boulangerie & Pâtisserie',
    keywords: ['pain', 'baguette', 'tortilla', 'brioche', 'croissant', 'chapelure', 'pita', 'levure boulangère']
  },
  {
    aisle: 'Épicerie & Garde-manger',
    keywords: ['farine', 'sucre', 'cassonade', 'chocolat', 'riz', 'pâte', 'tagliatelle', 'spaghetti', 'nouille', 'huile', 'vinaigre', 'moutarde', 'sauce', 'bouillon', 'miel', 'sirop d\'érable', 'sirop', 'vanille', 'levure chimique', 'bicarbonate', 'poudre à pâte', 'fécule', 'noix', 'amande', 'flocons d\'avoine']
  },
  {
    aisle: 'Épices & Condiments',
    keywords: ['sel', 'poivre', 'romarin', 'thym', 'origan', 'paprika', 'cumin', 'curry', 'curcuma', 'cannelle', 'muscade', 'piment', 'laurier', 'herbes de provence']
  }
];

export function guessAisle(ingredientName: string): GroceryAisle {
  const lower = ingredientName.toLowerCase();
  for (const group of AISLE_KEYWORDS) {
    for (const kw of group.keywords) {
      if (lower.includes(kw)) {
        return group.aisle;
      }
    }
  }
  return 'Épicerie & Garde-manger';
}

function parseFraction(str: string): number | null {
  if (str.includes('/')) {
    const [num, den] = str.split('/').map(s => parseFloat(s.trim()));
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }
  const parsed = parseFloat(str.replace(',', '.'));
  return isNaN(parsed) ? null : parsed;
}

export function parseRawOcrText(rawText: string): {
  title: string;
  description: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  image_url?: string;
  ingredients: IngredientItem[];
  steps: StepItem[];
} {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let title = '';
  let description = '';
  let prep_time_min = 15;
  let cook_time_min = 20;
  let servings = 4;

  const rawIngredients: string[] = [];
  const rawSteps: string[] = [];

  let currentSection: 'header' | 'ingredients' | 'steps' = 'header';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Section headers detection
    if (
      lowerLine.match(/^(ingr[ée]dients?|pour \d+ personnes?|composition|ce qu['’]il vous faut)/i)
    ) {
      currentSection = 'ingredients';
      continue;
    }

    if (
      lowerLine.match(/^(pr[ée]paration|instructions?|[ée]tapes?|m[ée]thode|recette|r[ée]alisation)/i)
    ) {
      currentSection = 'steps';
      continue;
    }

    // Time detection in header or text
    const prepMatch = lowerLine.match(/pr[ée]p(?:aration)?\s*[:\-]?\s*(\d+)\s*(?:min|m|h)/i);
    if (prepMatch) {
      prep_time_min = parseInt(prepMatch[1], 10);
    }
    const cookMatch = lowerLine.match(/cuisson\s*[:\-]?\s*(\d+)\s*(?:min|m|h)/i);
    if (cookMatch) {
      cook_time_min = parseInt(cookMatch[1], 10);
    }
    const servingsMatch = lowerLine.match(/(?:pour|portions?|personnes?)\s*[:\-]?\s*(\d+)/i);
    if (servingsMatch) {
      servings = parseInt(servingsMatch[1], 10);
    }

    if (currentSection === 'header') {
      if (!title && line.length > 3 && !line.includes(':') && !prepMatch && !cookMatch) {
        title = line.replace(/^[#\*\-•0-9\.\s]+/, '').trim();
      } else if (!description && line.length > 10 && !prepMatch && !cookMatch && !servingsMatch) {
        description = line;
      }
    } else if (currentSection === 'ingredients') {
      // If line looks like a step (e.g. starts with step number or starts with instruction verb)
      if (line.match(/^(\d+[\.\)]|[ée]tape \d+|préchauffer|dans un|faire chauffer|mélanger|cuire)/i)) {
        currentSection = 'steps';
        rawSteps.push(line);
      } else {
        rawIngredients.push(line);
      }
    } else if (currentSection === 'steps') {
      rawSteps.push(line);
    }
  }

  if (!title && lines.length > 0) {
    title = lines[0].replace(/^[#\*\-•0-9\.\s]+/, '').trim();
  }

  // Parse Ingredients
  const ingredients: IngredientItem[] = [];
  const unitRegex = /(?:c\.\s*à\s*soupe|c\.\s*à\s*s\.|c\.\s*à\s*thé|c\.\s*à\s*t\.|cuill[eè]res?\s*à\s*(?:soupe|caf[ée]|th[ée])|tasses?|g|kg|ml|cl|l|litres?|livres?|lb|oz|gousses?|tranches?|branches?|pinc[ée]es?|bo[îi]tes?|sachets?|unit[ée]s?)/i;

  for (const rawIng of rawIngredients) {
    const cleaned = rawIng.replace(/^[\-•*·\d\.\)]\s*/, '').trim();
    if (!cleaned || cleaned.length < 2) continue;

    // Pattern: [quantity] [unit] [de/d'] [ingredient name]
    const match = cleaned.match(/^(\d+(?:[\.,]\d+|\s*\/\s*\d+)?|\d+\s+\d+\/\d+)\s*([a-zA-Zàâäéèêëîïôöùûüç\.\s]+)?\s+(?:de\s+|d['’]\s+)?(.*)$/i);

    if (match) {
      const rawQtyStr = match[1].trim();
      const possibleUnit = (match[2] || '').trim();
      let ingName = (match[3] || '').trim();
      let qty = parseFraction(rawQtyStr);
      let unit = '';

      if (unitRegex.test(possibleUnit)) {
        unit = possibleUnit;
      } else if (possibleUnit) {
        // If possibleUnit is not a recognized unit, prepend it back to ingredient name
        ingName = `${possibleUnit} ${ingName}`.trim();
      }

      if (!ingName) ingName = cleaned;

      ingredients.push({
        id: `ocr-ing-${Math.random().toString(36).substr(2, 7)}`,
        name: ingName,
        quantity: qty,
        unit: unit,
        aisle: guessAisle(ingName)
      });
    } else {
      // Fallback: no explicit numeric quantity found
      ingredients.push({
        id: `ocr-ing-${Math.random().toString(36).substr(2, 7)}`,
        name: cleaned,
        quantity: null,
        unit: '',
        aisle: guessAisle(cleaned)
      });
    }
  }

  // Parse Steps
  const steps: StepItem[] = [];
  let stepCounter = 1;

  for (const rawStep of rawSteps) {
    const cleaned = rawStep.replace(/^(\d+[\.\)]|[ée]tape \d+[:\-]?|[\-•*])\s*/i, '').trim();
    if (!cleaned || cleaned.length < 3) continue;

    steps.push({
      id: `ocr-step-${stepCounter}`,
      step_number: stepCounter,
      instruction: cleaned
    });
    stepCounter++;
  }

  // Fallback if no steps were caught under header
  if (steps.length === 0 && lines.length > 2) {
    const candidateLines = lines.filter(l => l.length > 25);
    candidateLines.forEach((l, idx) => {
      steps.push({
        id: `ocr-step-${idx + 1}`,
        step_number: idx + 1,
        instruction: l
      });
    });
  }

  return {
    title: title || 'Nouvelle recette scannée',
    description: description || 'Recette importée via scanner photo OCR.',
    prep_time_min: prep_time_min || 15,
    cook_time_min: cook_time_min || 25,
    servings: servings || 4,
    ingredients: ingredients.length > 0 ? ingredients : [
      { id: 'ocr-ing-1', name: 'Ingrédient 1', quantity: 1, unit: 'unité', aisle: 'Fruits & Légumes' }
    ],
    steps: steps.length > 0 ? steps : [
      { id: 'ocr-step-1', step_number: 1, instruction: 'Préparer et assembler les ingrédients.' }
    ]
  };
}

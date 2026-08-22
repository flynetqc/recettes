import { Recipe, IngredientItem, StepItem, Category, Difficulty } from './types';
import { guessAisle } from './ocr-parser';

// Robust CSV Line Splitter (handling quotes and commas)
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

// Parse quantity and unit string e.g. "125 ml (1/2 tasse)", "4 tranches", "1 petit", "Au goût"
function parseQuantityAndUnit(rawDetail: string): { quantity: number | null; unit: string } {
  if (!rawDetail || !rawDetail.trim()) {
    return { quantity: 1, unit: 'unité' };
  }

  const trimmed = rawDetail.trim();

  // Check for "Au goût" or similar non-numeric descriptions
  if (/^au goût/i.test(trimmed) || /^selon/i.test(trimmed) || /^pincée/i.test(trimmed)) {
    return { quantity: null, unit: trimmed };
  }

  // Regex to match leading number (integer, decimal, or fraction e.g. 1/2)
  const numMatch = trimmed.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s*(.*)$/);
  if (numMatch) {
    let qtyNum: number | null = null;
    const rawNum = numMatch[1].replace(',', '.');

    if (rawNum.includes('/')) {
      const [num, den] = rawNum.split('/');
      qtyNum = parseFloat(num) / parseFloat(den);
    } else {
      qtyNum = parseFloat(rawNum);
    }

    const unitStr = numMatch[2].trim() || 'unité';
    return {
      quantity: isNaN(qtyNum) ? 1 : Math.round(qtyNum * 100) / 100,
      unit: unitStr
    };
  }

  return { quantity: 1, unit: trimmed };
}

export function parseRecipeCSV(csvContent: string): Partial<Recipe> {
  // Normalize line endings and strip BOM
  const cleaned = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Handle multiline CSV cells properly
  const lines: string[] = [];
  let buffer = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      buffer += char;
    } else if (char === '\n' && !inQuotes) {
      if (buffer.trim()) lines.push(buffer.trim());
      buffer = '';
    } else {
      buffer += char;
    }
  }
  if (buffer.trim()) lines.push(buffer.trim());

  let title = 'Nouvelle recette';
  let servings = 4;
  let prepTime = 15;
  let cookTime = 20;
  let description = '';
  let category: Category = 'Plats principaux';
  let difficulty: Difficulty = 'Facile';

  const ingredients: IngredientItem[] = [];
  const steps: StepItem[] = [];

  for (const line of lines) {
    const cols = parseCSVLine(line);
    if (cols.length < 3) continue;

    const [type, section, element, detail, notes] = cols;

    // Header line
    if (/^type$/i.test(type) || /^information$/i.test(type) && /^général$/i.test(section) && /^type$/i.test(element)) {
      continue;
    }

    const cleanType = (type || '').toLowerCase();

    // 1. Metadata / Information line
    if (cleanType.includes('info') || cleanType.includes('général') || cleanType.includes('titre')) {
      if (/titre/i.test(element) || /titre/i.test(type)) {
        if (detail) title = detail.trim();
        else if (element && !/titre/i.test(element)) title = element.trim();

        // Extract metadata from "Remarques" or "Détail" (e.g. Portions: 4 | Préparation: 20 min | Cuisson: 5 min)
        const metaStr = `${detail || ''} ${notes || ''}`;
        
        const portionsMatch = metaStr.match(/portions?\s*[:=]\s*(\d+)/i);
        if (portionsMatch) servings = parseInt(portionsMatch[1], 10);

        const prepMatch = metaStr.match(/pr[ée]paration\s*[:=]\s*(\d+)/i);
        if (prepMatch) prepTime = parseInt(prepMatch[1], 10);

        const cookMatch = metaStr.match(/cuisson\s*[:=]\s*(\d+)/i);
        if (cookMatch) cookTime = parseInt(cookMatch[1], 10);
      }
    }

    // 2. Ingredients line
    else if (cleanType.includes('ingr')) {
      const ingName = element || detail || '';
      if (!ingName.trim()) continue;

      const { quantity, unit } = parseQuantityAndUnit(detail || '');
      const aisle = guessAisle(ingName);

      ingredients.push({
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: ingName.trim(),
        quantity,
        unit,
        aisle,
        section: section && section !== 'Général' ? section.trim() : undefined,
        notes: notes ? notes.trim() : undefined
      });
    }

    // 3. Preparation Steps line
    else if (cleanType.includes('étape') || cleanType.includes('etape') || cleanType.includes('instruction')) {
      // Step title & instruction (e.g. detail = "Cuisson du bacon", notes = "Dans une poêle...")
      let stepTitle = '';
      let stepInstruction = '';

      if (notes && detail) {
        stepTitle = detail.trim();
        stepInstruction = notes.trim();
      } else {
        stepInstruction = (notes || detail || element || '').trim();
      }

      if (stepInstruction) {
        steps.push({
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          step_number: steps.length + 1,
          section: section && section !== 'Général' ? section.trim() : undefined,
          title: stepTitle || undefined,
          instruction: stepInstruction
        });
      }
    }
  }

  // Auto-categorize based on title
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('salade') || lowerTitle.includes('soupe')) category = 'Soupes & Salades';
  else if (lowerTitle.includes('gâteau') || lowerTitle.includes('biscuit') || lowerTitle.includes('tarte')) category = 'Desserts & Pâtisseries';
  else if (lowerTitle.includes('déjeuner') || lowerTitle.includes('brunch') || lowerTitle.includes('crêpe') || lowerTitle.includes('gaufre')) category = 'Déjeuners & Brunch';
  else if (lowerTitle.includes('pâte') || lowerTitle.includes('pizza') || lowerTitle.includes('spaghetti')) category = 'Pâtes & Pizzas';

  return {
    title,
    description,
    servings,
    prep_time_min: prepTime,
    cook_time_min: cookTime,
    category,
    difficulty,
    ingredients,
    steps,
    tags: [category.toLowerCase().replace(/[^a-z0-9]/g, '')]
  };
}

import { GroceryAisle } from './types';

export interface CommonIngredientItem {
  name: string;
  aisle: GroceryAisle;
  default_unit?: string;
  keywords?: string[];
}

export const COMMON_QUEBEC_INGREDIENTS: CommonIngredientItem[] = [
  // Fruits & Légumes
  { name: 'Ail', aisle: 'Fruits & Légumes', default_unit: 'gousse' },
  { name: 'Ananas', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Asperges', aisle: 'Fruits & Légumes', default_unit: 'botte' },
  { name: 'Aubergine', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Avocat', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Bananes', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Betteraves', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Bleuets frais', aisle: 'Fruits & Légumes', default_unit: 'casseau' },
  { name: 'Brocoli', aisle: 'Fruits & Légumes', default_unit: 'pied' },
  { name: 'Carottes', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Céleri', aisle: 'Fruits & Légumes', default_unit: 'branche' },
  { name: 'Champignons blancs', aisle: 'Fruits & Légumes', default_unit: 'casseau' },
  { name: 'Champignons Cremini / Café', aisle: 'Fruits & Légumes', default_unit: 'casseau' },
  { name: 'Chou vert', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Chou-fleur', aisle: 'Fruits & Légumes', default_unit: 'tête' },
  { name: 'Citron', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Citron vert / Lime', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Concombre anglais', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Courgette / Zucchini', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Courge musquée / Butternut', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Échalotes françaises', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Épinards frais', aisle: 'Fruits & Légumes', default_unit: 'tasse' },
  { name: 'Fraises fraîches', aisle: 'Fruits & Légumes', default_unit: 'casseau' },
  { name: 'Framboises fraîches', aisle: 'Fruits & Légumes', default_unit: 'casseau' },
  { name: 'Gingembre frais', aisle: 'Fruits & Légumes', default_unit: 'c. à soupe' },
  { name: 'Haricots verts', aisle: 'Fruits & Légumes', default_unit: 'g' },
  { name: 'Laitue Iceberg', aisle: 'Fruits & Légumes', default_unit: 'tête' },
  { name: 'Laitue Romaine', aisle: 'Fruits & Légumes', default_unit: 'tête' },
  { name: 'Mélange printanier / Salade', aisle: 'Fruits & Légumes', default_unit: 'contenant' },
  { name: 'Maïs en épi', aisle: 'Fruits & Légumes', default_unit: 'épi' },
  { name: 'Navet / Rutabaga', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Oignons jaunes', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Oignons rouges', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Oignons verts / Échalotes', aisle: 'Fruits & Légumes', default_unit: 'botte' },
  { name: 'Panais', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Poireaux', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Poivron rouge', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Poivron vert', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Poivron jaune / orange', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Pommes McIntosh / Gala', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Pommes de terre Russet', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Pommes de terre grelots', aisle: 'Fruits & Légumes', default_unit: 'g' },
  { name: 'Patates douces', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Radis', aisle: 'Fruits & Légumes', default_unit: 'botte' },
  { name: 'Raisins rouges / verts', aisle: 'Fruits & Légumes', default_unit: 'g' },
  { name: 'Tomates italiennes / Roma', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Tomates rouges en grappe', aisle: 'Fruits & Légumes', default_unit: 'unité' },
  { name: 'Tomates cerises', aisle: 'Fruits & Légumes', default_unit: 'casseau' },

  // Boucherie & Volailles
  { name: 'Bacon tranché', aisle: 'Boucherie & Volailles', default_unit: 'tranche' },
  { name: 'Bœuf haché maigre', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Bœuf haché mi-maigre', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Bavette de bœuf', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Bifteck / Steak de contre-filet', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Côtelettes de porc', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Cuisse de poulet', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Filet de porc', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Haut de cuisse de poulet', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Jambon cuit / fumé', aisle: 'Boucherie & Volailles', default_unit: 'tranche' },
  { name: 'Pancetta', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Poitrine de poulet désossée', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Porc haché', aisle: 'Boucherie & Volailles', default_unit: 'g' },
  { name: 'Poulet entier', aisle: 'Boucherie & Volailles', default_unit: 'kg' },
  { name: 'Rôti de palette de bœuf', aisle: 'Boucherie & Volailles', default_unit: 'kg' },
  { name: 'Salami / Charcuteries', aisle: 'Boucherie & Volailles', default_unit: 'tranche' },
  { name: 'Saucisses italiennes douces', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Saucisses italiennes fortes', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Saucisses à déjeuner', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Saucisses fumées / Hot dog', aisle: 'Boucherie & Volailles', default_unit: 'unité' },
  { name: 'Veau haché', aisle: 'Boucherie & Volailles', default_unit: 'g' },

  // Poissonnerie & Fruits de mer
  { name: 'Crevettes crues décortiquées', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Crevettes cuites', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Filet de saumon frais', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Filet de truite', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Filet d\'aiglefin / Haddock', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Filet de morue', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Filet de tilapia', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Pétoncles', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Saumon fumé', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'g' },
  { name: 'Thon en conserve', aisle: 'Poissonnerie & Fruits de mer', default_unit: 'boîte' },

  // Produits laitiers & Œufs
  { name: 'Beurre salé', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Beurre non salé', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Crème 15% champêtre', aisle: 'Produits laitiers & Œufs', default_unit: 'ml' },
  { name: 'Crème 35% à fouetter / cuisson', aisle: 'Produits laitiers & Œufs', default_unit: 'ml' },
  { name: 'Crème sûre / aigre', aisle: 'Produits laitiers & Œufs', default_unit: 'c. à soupe' },
  { name: 'Fromage Cheddar fort', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Fromage Cheddar râpé', aisle: 'Produits laitiers & Œufs', default_unit: 'tasse' },
  { name: 'Fromage Mozzarella', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Fromage Parmesan râpé', aisle: 'Produits laitiers & Œufs', default_unit: 'c. à soupe' },
  { name: 'Fromage à la crème', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Fromage Feta', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Fromage en grains (couic-couic)', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Fromage Ricotta', aisle: 'Produits laitiers & Œufs', default_unit: 'tasse' },
  { name: 'Fromage Suisse', aisle: 'Produits laitiers & Œufs', default_unit: 'tranche' },
  { name: 'Lait 2%', aisle: 'Produits laitiers & Œufs', default_unit: 'ml' },
  { name: 'Lait 3.25% entier', aisle: 'Produits laitiers & Œufs', default_unit: 'ml' },
  { name: 'Lait d\'amande / végétal', aisle: 'Produits laitiers & Œufs', default_unit: 'ml' },
  { name: 'Margarine', aisle: 'Produits laitiers & Œufs', default_unit: 'g' },
  { name: 'Œufs gros', aisle: 'Produits laitiers & Œufs', default_unit: 'unité' },
  { name: 'Yogourt grec nature', aisle: 'Produits laitiers & Œufs', default_unit: 'tasse' },
  { name: 'Yogourt à la vanille', aisle: 'Produits laitiers & Œufs', default_unit: 'tasse' },

  // Boulangerie & Pâtisserie
  { name: 'Bagels', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Baguette de pain', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Croissants', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Muffins anglais', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Pain blanc tranché', aisle: 'Boulangerie & Pâtisserie', default_unit: 'tranche' },
  { name: 'Pain de blé entier', aisle: 'Boulangerie & Pâtisserie', default_unit: 'tranche' },
  { name: 'Pain croûté / Campagne', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Pains à burger / hamburger', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Pains à hot-dog', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Pâte à tarte', aisle: 'Boulangerie & Pâtisserie', default_unit: 'abaisse' },
  { name: 'Pâte feuilletée', aisle: 'Boulangerie & Pâtisserie', default_unit: 'rouleau' },
  { name: 'Pita / Pains naan', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },
  { name: 'Tortillas de blé / maïs', aisle: 'Boulangerie & Pâtisserie', default_unit: 'unité' },

  // Épicerie & Garde-manger
  { name: 'Bouillon de poulet', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Bouillon de bœuf', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Bouillon de légumes', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Cacao en poudre', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Cassonade / Sucre brun', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Céréales à déjeuner', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Chocolat mi-sucré / pépites', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Couscous', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Farine tout usage', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Fécule de maïs (Cornstarch)', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Gruau / Flocons d\'avoine', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Haricots noirs en conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Haricots rouges en conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Huile d\'olive extra vierge', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Huile végétale / Canola', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Huile de sésame grillé', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à thé' },
  { name: 'Lait de coco en boîte', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Lentilles sèches / conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Levure chimique / Poudre à pâte', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à thé' },
  { name: 'Miel pur', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Noix / Amandes / Pacanes', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Pâtes Spaghettis', aisle: 'Épicerie & Garde-manger', default_unit: 'g' },
  { name: 'Pâtes Pennes', aisle: 'Épicerie & Garde-manger', default_unit: 'g' },
  { name: 'Pâtes Macaroni', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Pâtes Lasagne', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Pois chiches en conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Poudre d\'amande', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Quinoa', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Riz basmati / jasmin', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Riz blanc grain long', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Riz brun', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Sauce tomate / Marinara', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Sauce soja / soya', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Sauce barbecue (BBQ)', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Sauce Worcestershire', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à thé' },
  { name: 'Sauce piquante / Sriracha', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à thé' },
  { name: 'Sirop d\'érable pur', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Sucre blanc granulé', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Sucre à glacer / en poudre', aisle: 'Épicerie & Garde-manger', default_unit: 'tasse' },
  { name: 'Tomates en dés en conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Tomates broyées en conserve', aisle: 'Épicerie & Garde-manger', default_unit: 'boîte' },
  { name: 'Pâte de tomates', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Vinaigre blanc', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Vinaigre balsamique', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Vinaigre de cidre de pomme', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },
  { name: 'Vinaigre de vin rouge', aisle: 'Épicerie & Garde-manger', default_unit: 'c. à soupe' },

  // Épices & Condiments
  { name: 'Basilic séché', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Cannelle moulue', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Coriandre moulue', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Cumin moulu', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Curry / Cari en poudre', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Épices à steak de Montréal', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Épices italiennes', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Extrait de vanille pure', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Ketchup', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Mayonnaise', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Moutarde de Dijon', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Moutarde jaune préparée', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Origan séché', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Paprika doux', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Paprika fumé', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Persil séché / frais', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Piment de Cayenne / Flocons de piment', aisle: 'Épices & Condiments', default_unit: 'pincée' },
  { name: 'Poivre noir moulu', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Poudre d\'ail', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Poudre d\'oignon', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Relish sucrée', aisle: 'Épices & Condiments', default_unit: 'c. à soupe' },
  { name: 'Romarin séché', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Sel de table', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Sel de mer / Gros sel', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },
  { name: 'Thym séché', aisle: 'Épices & Condiments', default_unit: 'c. à thé' },

  // Surgelés
  { name: 'Bleuets surgelés', aisle: 'Surgelés', default_unit: 'tasse' },
  { name: 'Fraises / Petits fruits surgelés', aisle: 'Surgelés', default_unit: 'tasse' },
  { name: 'Frites surgelées', aisle: 'Surgelés', default_unit: 'sac' },
  { name: 'Légumes mélangés surgelés', aisle: 'Surgelés', default_unit: 'tasse' },
  { name: 'Maïs en grains surgelé', aisle: 'Surgelés', default_unit: 'tasse' },
  { name: 'Pâte à pizza surgelée', aisle: 'Surgelés', default_unit: 'boule' },
  { name: 'Petits pois verts surgelés', aisle: 'Surgelés', default_unit: 'tasse' },

  // Boissons
  { name: 'Café moulu / en grains', aisle: 'Boissons', default_unit: 'tasse' },
  { name: 'Jus d\'orange', aisle: 'Boissons', default_unit: 'ml' },
  { name: 'Jus de pomme', aisle: 'Boissons', default_unit: 'ml' },
  { name: 'Thé / Tisane', aisle: 'Boissons', default_unit: 'sachet' },
  { name: 'Vin blanc de cuisine', aisle: 'Boissons', default_unit: 'ml' },
  { name: 'Vin rouge de cuisine', aisle: 'Boissons', default_unit: 'ml' }
];

// Helper to filter ingredients intelligently
export function searchCommonIngredients(
  query: string,
  filterAisle?: GroceryAisle | 'Tous'
): CommonIngredientItem[] {
  const cleanQ = query.toLowerCase().trim();
  let list = COMMON_QUEBEC_INGREDIENTS;

  if (filterAisle && filterAisle !== 'Tous') {
    list = list.filter(item => item.aisle === filterAisle);
  }

  if (!cleanQ) {
    return list.slice(0, 20);
  }

  // Exact starts-with gets highest priority, followed by contains
  return list
    .filter(item => {
      const name = item.name.toLowerCase();
      return name.includes(cleanQ);
    })
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(cleanQ);
      const bStarts = b.name.toLowerCase().startsWith(cleanQ);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name, 'fr');
    })
    .slice(0, 15);
}

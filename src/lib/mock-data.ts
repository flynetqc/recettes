import { Recipe } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Poulet rôti au citron et romarin',
    description: 'Un classique réconfortant avec une peau dorée et croustillante, parfumé au citron frais, à l\'ail et au romarin du jardin.',
    prep_time_min: 20,
    cook_time_min: 65,
    servings: 4,
    difficulty: 'Facile',
    category: 'Plats principaux',
    tags: ['Poulet', 'Rôti', 'Classique', 'Sans gluten'],
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    created_at: new Date('2026-08-01').toISOString(),
    is_favorite: true,
    ingredients: [
      { id: 'i1-1', name: 'Poulet entier', quantity: 1, unit: 'unité', aisle: 'Boucherie & Volailles' },
      { id: 'i1-2', name: 'Beurre non salé ramolli', quantity: 60, unit: 'g', aisle: 'Produits laitiers & Œufs' },
      { id: 'i1-3', name: 'Citrons jaunes', quantity: 2, unit: 'unité', aisle: 'Fruits & Légumes' },
      { id: 'i1-4', name: 'Gousses d\'ail', quantity: 6, unit: 'gousse', aisle: 'Fruits & Légumes' },
      { id: 'i1-5', name: 'Romarin frais', quantity: 4, unit: 'branche', aisle: 'Épices & Condiments' },
      { id: 'i1-6', name: 'Huile d\'olive', quantity: 30, unit: 'ml', aisle: 'Épicerie & Garde-manger' },
      { id: 'i1-7', name: 'Sel de mer et poivre noir', quantity: 1, unit: 'c. à thé', aisle: 'Épices & Condiments' }
    ],
    steps: [
      { id: 's1-1', step_number: 1, instruction: 'Préchauffer le four à 200°C (400°F). Éponger le poulet avec du papier absorbant pour assurer une peau bien croustillante.' },
      { id: 's1-2', step_number: 2, instruction: 'Mélanger le beurre ramolli avec les feuilles de romarin hachées, 2 gousses d\'ail écrasées, du sel et du poivre.' },
      { id: 's1-3', step_number: 3, instruction: 'Glisser délicatement une partie du beurre aromatisé sous la peau des poitrines de poulet, et frotter le reste sur toute la surface.' },
      { id: 's1-4', step_number: 4, instruction: 'Couper un citron en deux et l\'insérer dans la cavité du poulet avec le reste des gousses d\'ail.' },
      { id: 's1-5', step_number: 5, instruction: 'Enfourner pendant environ 1h à 1h15 jusqu\'à ce que la température interne atteigne 74°C (165°F) et que les jus soient clairs.' },
      { id: 's1-6', step_number: 6, instruction: 'Laisser reposer 10 minutes sous une feuille de papier d\'aluminium avant de découper.' }
    ]
  },
  {
    id: 'rec-2',
    title: 'Saumon glacé à l\'érable et moutarde à l\'ancienne',
    description: 'Filets de saumon fondants nappés d\'une réduction gourmande de sirop d\'érable pur, de moutarde à l\'ancienne et d\'un trait de sauce soja.',
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 4,
    difficulty: 'Facile',
    category: 'Plats principaux',
    tags: ['Poisson', 'Érable', 'Rapide', 'Semaine'],
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    created_at: new Date('2026-08-10').toISOString(),
    is_favorite: true,
    ingredients: [
      { id: 'i2-1', name: 'Filets de saumon frais', quantity: 4, unit: 'unité', aisle: 'Poissonnerie & Fruits de mer' },
      { id: 'i2-2', name: 'Sirop d\'érable pur', quantity: 60, unit: 'ml', aisle: 'Épicerie & Garde-manger' },
      { id: 'i2-3', name: 'Moutarde à l\'ancienne', quantity: 30, unit: 'ml', aisle: 'Épicerie & Garde-manger' },
      { id: 'i2-4', name: 'Sauce soja', quantity: 15, unit: 'ml', aisle: 'Épicerie & Garde-manger' },
      { id: 'i2-5', name: 'Gousse d\'ail râpée', quantity: 2, unit: 'gousse', aisle: 'Fruits & Légumes' },
      { id: 'i2-6', name: 'Poivre noir concassé', quantity: 1, unit: 'pincée', aisle: 'Épices & Condiments' }
    ],
    steps: [
      { id: 's2-1', step_number: 1, instruction: 'Préchauffer le four à 200°C (400°F) et tapisser une plaque de cuisson de papier parchemin.' },
      { id: 's2-2', step_number: 2, instruction: 'Dans un petit bol, fouetter le sirop d\'érable, la moutarde à l\'ancienne, la sauce soja et l\'ail râpé.' },
      { id: 's2-3', step_number: 3, instruction: 'Déposer les filets de saumon sur la plaque et les badigeonner généreusement avec les deux tiers du mélange.' },
      { id: 's2-4', step_number: 4, instruction: 'Cuire au four pendant 12 à 15 minutes. Passer sous le gril (broil) les 2 dernières minutes pour faire caraméliser la sauce.' },
      { id: 's2-5', step_number: 5, instruction: 'Arroser avec le restant de glaçage chaud avant de servir avec du riz basmati et des haricots verts.' }
    ]
  },
  {
    id: 'rec-3',
    title: 'Pâtes crémeuses aux champignons sauvages et parmesan',
    description: 'Tagliatelles fraîches enrobées d\'une sauce soyeuse au parmesan reggiano, ail rôti et champignons dorés au beurre.',
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 4,
    difficulty: 'Moyen',
    category: 'Pâtes & Pizzas',
    tags: ['Pâtes', 'Végétarien', 'Italien', 'Réconfort'],
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1200&q=80',
    rating: 4,
    created_at: new Date('2026-08-12').toISOString(),
    is_favorite: false,
    ingredients: [
      { id: 'i3-1', name: 'Pâtes tagliatelles ou fettuccine', quantity: 400, unit: 'g', aisle: 'Épicerie & Garde-manger' },
      { id: 'i3-2', name: 'Champignons mélangés (Paris, pleurotes, shiitakes)', quantity: 350, unit: 'g', aisle: 'Fruits & Légumes' },
      { id: 'i3-3', name: 'Beurre', quantity: 40, unit: 'g', aisle: 'Produits laitiers & Œufs' },
      { id: 'i3-4', name: 'Crème 35%', quantity: 200, unit: 'ml', aisle: 'Produits laitiers & Œufs' },
      { id: 'i3-5', name: 'Parmesan râpé', quantity: 80, unit: 'g', aisle: 'Produits laitiers & Œufs' },
      { id: 'i3-6', name: 'Échalote française', quantity: 1, unit: 'unité', aisle: 'Fruits & Légumes' },
      { id: 'i3-7', name: 'Persil frais ciselé', quantity: 2, unit: 'c. à soupe', aisle: 'Épices & Condiments' }
    ],
    steps: [
      { id: 's3-1', step_number: 1, instruction: 'Porter une grande casserole d\'eau salée à ébullition et cuire les pâtes al dente.' },
      { id: 's3-2', step_number: 2, instruction: 'Dans une grande poêle, faire fondre le beurre à feu moyen-vif. Ajouter l\'échalote hachée et les champignons émincés.' },
      { id: 's3-3', step_number: 3, instruction: 'Faire dorer les champignons pendant 8 minutes sans trop les remuer au début pour qu\'ils colorent bien.' },
      { id: 's3-4', step_number: 4, instruction: 'Verser la crème 35% et laisser mijoter 3 minutes jusqu\'à léger épaississement.' },
      { id: 's3-5', step_number: 5, instruction: 'Incorporer les pâtes égouttées avec 60ml d\'eau de cuisson et le parmesan râpé. Mélanger énergiquement pour émulsionner.' },
      { id: 's3-6', step_number: 6, instruction: 'Servir chaud avec un tour de moulin à poivre et du persil frais.' }
    ]
  },
  {
    id: 'rec-4',
    title: 'Moelleux au chocolat et cœur fondant',
    description: 'Le dessert chocolaté par excellence, avec une texture croustillante à l\'extérieur et un cœur riche et coulant à souhait.',
    prep_time_min: 15,
    cook_time_min: 12,
    servings: 6,
    difficulty: 'Facile',
    category: 'Desserts & Pâtisseries',
    tags: ['Chocolat', 'Dessert', 'Gourmand', 'Fêtes'],
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    created_at: new Date('2026-08-15').toISOString(),
    is_favorite: true,
    ingredients: [
      { id: 'i4-1', name: 'Chocolat noir 70%', quantity: 200, unit: 'g', aisle: 'Épicerie & Garde-manger' },
      { id: 'i4-2', name: 'Beurre', quantity: 150, unit: 'g', aisle: 'Produits laitiers & Œufs' },
      { id: 'i4-3', name: 'Œufs entiers', quantity: 4, unit: 'unité', aisle: 'Produits laitiers & Œufs' },
      { id: 'i4-4', name: 'Sucre', quantity: 100, unit: 'g', aisle: 'Épicerie & Garde-manger' },
      { id: 'i4-5', name: 'Farine tout usage', quantity: 50, unit: 'g', aisle: 'Épicerie & Garde-manger' },
      { id: 'i4-6', name: 'Pincée de fleur de sel', quantity: 1, unit: 'pincée', aisle: 'Épices & Condiments' }
    ],
    steps: [
      { id: 's4-1', step_number: 1, instruction: 'Préchauffer le four à 210°C (410°F). Beurrer et fariner 6 ramequins individuels.' },
      { id: 's4-2', step_number: 2, instruction: 'Faire fondre le chocolat cassé en morceaux avec le beurre au bain-marie ou à feu très doux au micro-ondes.' },
      { id: 's4-3', step_number: 3, instruction: 'Dans un saladier, fouetter vigoureusement les œufs avec le sucre jusqu\'à ce que le mélange blanchisse.' },
      { id: 's4-4', step_number: 4, instruction: 'Ajouter la farine tamisée et la pincée de sel, puis incorporer le mélange chocolat-beurre tiédi.' },
      { id: 's4-5', step_number: 5, instruction: 'Verser la préparation dans les ramequins aux 3/4.' },
      { id: 's4-6', step_number: 6, instruction: 'Cuire pendant 10 à 12 minutes précisément. Les bords doivent être cuits et le centre encore tremblotant.' },
      { id: 's4-7', step_number: 7, instruction: 'Démouler tiède et servir avec une boule de glace à la vanille.' }
    ]
  }
];

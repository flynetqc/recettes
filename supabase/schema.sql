-- ============================================================
-- SQL SCHEMA FOR "MES RECETTES GOURMANDES"
-- Exécuter ce script dans le "SQL Editor" de votre projet Supabase
-- ============================================================

-- 1. Table des Recettes
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    prep_time_min INTEGER DEFAULT 15,
    cook_time_min INTEGER DEFAULT 20,
    servings INTEGER DEFAULT 4,
    difficulty TEXT DEFAULT 'Facile',
    category TEXT DEFAULT 'Plats principaux',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT DEFAULT '',
    rating INTEGER DEFAULT 5,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON public.recipes(rating);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);

-- 2. Table des Règles d'Achat Standard (Mode Admin / Conditionnements d'épicerie)
CREATE TABLE IF NOT EXISTS public.purchase_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ingredient_pattern TEXT NOT NULL,
    display_name TEXT NOT NULL,
    standard_quantity NUMERIC NOT NULL DEFAULT 1,
    standard_unit TEXT NOT NULL DEFAULT 'unité',
    package_label TEXT NOT NULL,
    aisle TEXT DEFAULT 'Épicerie & Garde-manger',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table du Menu & Planification Hebdomadaire
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id TEXT PRIMARY KEY DEFAULT 'current_plan',
    week_start_date TIMESTAMPTZ DEFAULT NOW(),
    selected_recipe_ids JSONB DEFAULT '[]'::jsonb,
    servings_multiplier JSONB DEFAULT '{}'::jsonb,
    custom_grocery_items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Configuration du Bucket Supabase Storage pour les photos de recettes
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-photos', 'recipe-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité (RLS) permissives pour utilisation personnelle / projet
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des recettes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Ajout/Modification des recettes" ON public.recipes FOR ALL USING (true);

CREATE POLICY "Lecture des regles d'achat" ON public.purchase_rules FOR SELECT USING (true);
CREATE POLICY "Gestion des regles d'achat" ON public.purchase_rules FOR ALL USING (true);

CREATE POLICY "Lecture du menu" ON public.meal_plans FOR SELECT USING (true);
CREATE POLICY "Modification du menu" ON public.meal_plans FOR ALL USING (true);

-- Politiques pour le bucket d'images
CREATE POLICY "Images publiques" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-photos');
CREATE POLICY "Upload d'images public" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-photos');
CREATE POLICY "Mise à jour d'images public" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-photos');
CREATE POLICY "Suppression d'images public" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-photos');

-- 5. Données de départ pour les Règles d'Achat Standard (Admin)
INSERT INTO public.purchase_rules (id, ingredient_pattern, display_name, standard_quantity, standard_unit, package_label, aisle)
VALUES 
    ('rule-beurre', 'beurre', 'Beurre', 454, 'g', '1 livre (454g)', 'Produits laitiers & Œufs'),
    ('rule-oeufs', 'oeuf|œuf', 'Œufs', 12, 'unité', '1 douzaine (12 œufs)', 'Produits laitiers & Œufs'),
    ('rule-farine', 'farine', 'Farine tout usage', 1000, 'g', '1 sac de 1 kg', 'Épicerie & Garde-manger'),
    ('rule-sucre', 'sucre|sucre blanc|cassonade', 'Sucre / Cassonade', 1000, 'g', '1 sac de 1 kg', 'Épicerie & Garde-manger'),
    ('rule-lait', 'lait|lait 2%|lait 3.25%|lait entier', 'Lait', 2000, 'ml', '1 contenant de 2L', 'Produits laitiers & Œufs'),
    ('rule-creme', 'crème|crème 35%|crème à fouetter|crème 15%', 'Crème (35% ou 15%)', 500, 'ml', '1 contenant de 500 ml', 'Produits laitiers & Œufs'),
    ('rule-huile-olive', 'huile d''olive|huile végétale|huile de canola', 'Huile de cuisson', 750, 'ml', '1 bouteille de 750 ml', 'Épicerie & Garde-manger'),
    ('rule-ail', 'gousse d''ail|ail', 'Ail frais', 3, 'unité', '1 filet de têtes d''ail', 'Fruits & Légumes'),
    ('rule-oignons', 'oignon|oignon jaune|oignon rouge', 'Oignons', 1360, 'g', '1 sac de 3 livres (1.36 kg)', 'Fruits & Légumes'),
    ('rule-pommes-terre', 'pomme de terre|patate', 'Pommes de terre', 2270, 'g', '1 sac de 5 livres (2.27 kg)', 'Fruits & Légumes'),
    ('rule-bouillon', 'bouillon de poulet|bouillon de boeuf|bouillon de légumes', 'Bouillon prêt à servir', 900, 'ml', '1 carton de 900 ml', 'Épicerie & Garde-manger')
ON CONFLICT (id) DO NOTHING;

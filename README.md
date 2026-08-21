# 🍳 Mes Recettes Gourmandes & Épicerie Intelligente

Application web moderne, fluide et responsive pour stocker vos recettes préférées dans **Supabase**, numériser des pages de livres de cuisine par photo via **OCR (Tesseract)**, planifier les menus de la semaine et générer une **liste d'épicerie intelligente avec formats d'achat standards** (ex: 1 livre de beurre) exportable en **PDF**.

---

## 🌟 Fonctionnalités Principales

1. **Gestion Complète des Recettes**
   - Saisie manuelle : Titre, description, catégorie, temps de préparation et cuisson, portions, difficulté, tags, photo, ingrédients et étapes.
   - Système de notation interactif **1 à 5 étoiles**.
   - Calculateur de portions dynamique (mise à l'échelle automatique des quantités).
   - Recherche rapide par mots-clés, filtrage par catégories, favoris et notes.

2. **Scanner OCR de Recettes Photo**
   - Prenez en photo une page de votre livre de recettes ou téléversez une image.
   - Reconnaissance de texte instantanée en français avec Tesseract.js (sans abonnement ni surcoût d'API).
   - Découpage et structuration automatique (ingrédients, portions, temps, étapes).
   - Prévisualisation et édition complète avant enregistrement dans Supabase.

3. **Menu de la Semaine & Liste d'Épicerie Intelligente**
   - Sélectionnez vos recettes pour la semaine et ajustez les multiplicateurs de portions.
   - Compilation et fusion automatique des ingrédients identiques.
   - Classement automatique par rayons (Fruits & Légumes, Boucherie, Produits Laitiers, etc.).
   - Mode courses interactif avec cases à cocher sur mobile.
   - Ajout d'articles personnalisés libres (café, essuie-tout, etc.).
   - **Exportation en PDF stylisé** en un clic.

4. **Mode Admin : Règles de Conditionnement d'Achat**
   - Spécifiez des formats d'achat standards (ex: pour le beurre, commander **1 livre (454g)** plutôt que des grammes bruts).
   - Pré-configuré avec les essentiels (beurre, œufs par douzaine, farine en sac de 1kg, lait 2L, crème 500ml, etc.).
   - Ajout, modification et suppression de vos propres règles.

---

## 🚀 Démarrage Rapide en Local

### 1. Cloner le projet & installer les dépendances
```bash
npm install
```

### 2. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

> **Note :** L'application fonctionne immédiatement en mode démo / stockage local même si vous n'avez pas encore configuré Supabase !

---

## 🗄️ Configuration Supabase Cloud (2 minutes)

1. Rendez-vous sur [Supabase](https://supabase.com) et créez un projet gratuit.
2. Allez dans le **SQL Editor** de votre tableau de bord Supabase.
3. Copiez et collez l'intégralité du script présent dans le fichier [`supabase/schema.sql`](supabase/schema.sql) et cliquez sur **Run**.
   - Cela crée automatiquement les tables `recipes`, `purchase_rules`, `meal_plans`, les politiques de sécurité (RLS) et le bucket de photos `recipe-photos`.
4. Allez dans **Project Settings -> API** et copiez votre URL et votre clé `anon public`.
5. Créez un fichier `.env.local` à la racine de votre projet :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
```
6. Redémarrez `npm run dev`. Votre application est désormais connectée à votre base de données Supabase Cloud !

---

## 🌐 Déploiement sur GitHub & Vercel

### 1. Pousser sur GitHub
```bash
git add .
git commit -m "Initial commit - Application Recettes Gourmandes"
git branch -M main
git remote add origin https://github.com/VOTRE_UTILISATEUR/recettes.git
git push -u origin main
```

### 2. Déployer sur Vercel
1. Allez sur [Vercel](https://vercel.com) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **Add New -> Project** et sélectionnez votre dépôt `recettes`.
3. Dans la section **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cliquez sur **Deploy**. Votre application est en ligne !

---

## 🛠️ Technologies Utilisées
- **Framework** : Next.js 14+ (App Router, TypeScript)
- **Styles** : Tailwind CSS & Lucide Icons
- **Base de données & Stockage** : Supabase (PostgreSQL & Storage)
- **OCR** : Tesseract.js (reconnaissance de texte client-side)
- **Export PDF** : jsPDF & jsPDF-Autotable

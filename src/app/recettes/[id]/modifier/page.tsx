'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Recipe } from '@/lib/types';
import { fetchRecipeById } from '@/lib/supabase';
import { RecipeForm } from '@/components/recipe-form';
import { Edit3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ModifierRecettePage() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await fetchRecipeById(id);
      setRecipe(data);
      setIsLoading(false);
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-zinc-500">Chargement de la recette à modifier...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h2 className="text-xl font-bold">Recette introuvable</h2>
        <Link href="/" className="mt-4 inline-block text-xs font-bold text-emerald-600">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href={`/recettes/${recipe.id}`}
          className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Annuler</span>
        </Link>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-emerald-600" />
          Modifier « {recipe.title} »
        </h1>
      </div>

      <RecipeForm
        initialRecipe={recipe}
        isEditing={true}
        onSuccessRedirect={`/recettes/${recipe.id}`}
      />
    </div>
  );
}

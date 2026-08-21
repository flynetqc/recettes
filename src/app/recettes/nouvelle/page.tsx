import { RecipeForm } from '@/components/recipe-form';
import { PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NouvelleRecettePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Saisie manuelle</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Créer une nouvelle recette
            </h1>
            <p className="mt-1 text-sm text-emerald-100">
              Remplissez les ingrédients, le temps de préparation et les étapes de votre recette maison.
            </p>
          </div>

          <Link
            href="/recettes/ocr"
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition-all"
          >
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>Vous avez une photo ? Utilisez l&apos;OCR</span>
          </Link>
        </div>
      </div>

      {/* Recipe Form */}
      <RecipeForm isEditing={false} onSuccessRedirect="/" />

    </div>
  );
}

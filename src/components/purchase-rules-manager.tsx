'use client';

import { useState, useEffect } from 'react';
import { PurchaseRule, GroceryAisle } from '@/lib/types';
import { getPurchaseRules, savePurchaseRules, DEFAULT_PURCHASE_RULES } from '@/lib/purchase-rules';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  Settings, 
  Package, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Database, 
  Cloud, 
  HardDrive,
  Info,
  Edit2
} from 'lucide-react';

const AISLES: GroceryAisle[] = [
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

export function PurchaseRulesManager() {
  const [rules, setRules] = useState<PurchaseRule[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [pattern, setPattern] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [standardQty, setStandardQty] = useState<number>(454);
  const [standardUnit, setStandardUnit] = useState('g');
  const [packageLabel, setPackageLabel] = useState('1 livre (454g)');
  const [aisle, setAisle] = useState<GroceryAisle>('Produits laitiers & Œufs');
  const [notes, setNotes] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    setRules(getPurchaseRules());
    setIsConfigured(isSupabaseConfigured());
  }, []);

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() || !displayName.trim() || !packageLabel.trim()) return;

    const newRule: PurchaseRule = {
      id: `rule-${Date.now()}`,
      ingredient_pattern: pattern.trim().toLowerCase(),
      display_name: displayName.trim(),
      standard_quantity: Number(standardQty) || 1,
      standard_unit: standardUnit.trim() || 'unité',
      package_label: packageLabel.trim(),
      aisle,
      notes: notes.trim()
    };

    const updated = [newRule, ...rules];
    setRules(updated);
    savePurchaseRules(updated);

    // Reset Form
    setPattern('');
    setDisplayName('');
    setPackageLabel('');
    setNotes('');
    setShowAddForm(false);

    setFeedbackMsg('Règle d\'achat enregistrée avec succès !');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    savePurchaseRules(updated);
    setFeedbackMsg('Règle supprimée.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous restaurer les règles de conditionnement par défaut ?')) {
      setRules(DEFAULT_PURCHASE_RULES);
      savePurchaseRules(DEFAULT_PURCHASE_RULES);
      setFeedbackMsg('Règles par défaut restaurées.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Settings className="h-3.5 w-3.5" />
              <span>Administration & Paramètres</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Règles de conditionnement d&apos;épicerie
            </h1>
            <p className="mt-1 max-w-xl text-sm text-emerald-100">
              Définissez les formats d&apos;achat standards pour vos ingrédients. Par exemple, si une recette demande 300g de beurre, l&apos;application recommande automatiquement d&apos;acheter <strong>1 livre de beurre (454g)</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Nouvelle règle</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Add Form Accordion / Card */}
      {showAddForm && (
        <div className="rounded-3xl border border-emerald-200/80 bg-white p-6 sm:p-8 shadow-md dark:border-emerald-900/50 dark:bg-zinc-900 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Ajouter une règle de format d&apos;achat
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleSaveRule} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Mot-clé ingrédient (ex: beurre, oeuf, farine)
              </label>
              <input
                type="text"
                required
                placeholder="ex: beurre"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Nom d&apos;affichage (ex: Beurre standard)
              </label>
              <input
                type="text"
                required
                placeholder="ex: Beurre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantité d&apos;un paquet standard
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="ex: 454"
                value={standardQty}
                onChange={(e) => setStandardQty(parseFloat(e.target.value) || 1)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Unité (g, ml, unité, kg, L...)
              </label>
              <input
                type="text"
                required
                placeholder="ex: g"
                value={standardUnit}
                onChange={(e) => setStandardUnit(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Libellé du format à acheter (affiché sur la liste & PDF)
              </label>
              <input
                type="text"
                required
                placeholder="ex: 1 livre (454g)"
                value={packageLabel}
                onChange={(e) => setPackageLabel(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Rayon d&apos;épicerie
              </label>
              <select
                value={aisle}
                onChange={(e) => setAisle(e.target.value as GroceryAisle)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {AISLES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                Enregistrer la règle
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Rules Table */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Formats d&apos;achat configurés ({rules.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Ces règles convertissent automatiquement les quantités nettes des recettes en paquets standards pour les courses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurer les valeurs par défaut</span>
          </button>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/40">
              <tr>
                <th className="py-3 px-4">Ingrédient</th>
                <th className="py-3 px-4">Mot-clé détecté</th>
                <th className="py-3 px-4">Format d&apos;achat recommandé</th>
                <th className="py-3 px-4">Rayon</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-50">
                    {rule.display_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {rule.ingredient_pattern}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800">
                      <Package className="h-3 w-3" />
                      {rule.package_label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {rule.aisle}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase & Hosting Deployment Guide Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-600" />
          Statut Supabase, GitHub & Vercel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Supabase status */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Base de données Supabase</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isConfigured 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isConfigured ? <Cloud className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
                {isConfigured ? 'Connecté Cloud' : 'Mode Local / Démo'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pour connecter votre projet Supabase, ajoutez <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> et <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans votre fichier <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">.env.local</code> et exécutez le script SQL fourni dans <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">supabase/schema.sql</code>.
            </p>
          </div>

          {/* Vercel & Github status */}
          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Déploiement Vercel & GitHub</span>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Le projet est structuré avec Next.js 14+ App Router standard. Il suffit de pousser ce dépôt sur GitHub et d&apos;importer le projet dans Vercel avec vos variables Supabase pour un hébergement gratuit et automatique !
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

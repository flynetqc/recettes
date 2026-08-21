'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UtensilsCrossed, 
  BookOpen, 
  PlusCircle, 
  Scan, 
  ShoppingCart, 
  Settings, 
  Database,
  Cloud,
  HardDrive
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, getStoredMealPlan } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const [hasSupabase, setHasSupabase] = useState(false);
  const [plannedCount, setPlannedCount] = useState(0);

  useEffect(() => {
    setHasSupabase(isSupabaseConfigured());
    const plan = getStoredMealPlan();
    setPlannedCount(plan.selected_recipe_ids.length);

    // Listen for custom storage events to update badge in real-time
    const handleStorageChange = () => {
      const updated = getStoredMealPlan();
      setPlannedCount(updated.selected_recipe_ids.length);
    };

    window.addEventListener('mealplan-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('mealplan-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Recettes', icon: BookOpen },
    { href: '/recettes/nouvelle', label: 'Ajouter', icon: PlusCircle },
    { href: '/recettes/ocr', label: 'Scanner OCR', icon: Scan, highlight: true },
    { href: '/epicerie', label: 'Menu & Épicerie', icon: ShoppingCart, badge: plannedCount },
    { href: '/admin', label: 'Mode Admin', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-md dark:bg-zinc-950/95 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors">
              Mes Recettes
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Gourmandes & Épicerie
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                    : link.highlight
                    ? 'text-emerald-600 hover:bg-emerald-50/70 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${link.highlight && !isActive ? 'text-emerald-500 animate-pulse' : ''}`} />
                <span className="hidden md:inline">{link.label}</span>
                
                {/* Badge if present */}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Supabase Connection Status Badge */}
        <div className="flex items-center gap-2">
          <div
            title={
              hasSupabase
                ? 'Connecté à la base Supabase Cloud'
                : 'Mode local / démo actif (ajoutez vos clés Supabase dans .env.local pour synchroniser avec le cloud)'
            }
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
              hasSupabase
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {hasSupabase ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Supabase Connecté</span>
              </>
            ) : (
              <>
                <HardDrive className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Mode Local / Démo</span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

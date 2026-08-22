'use client';

import { useState, useRef, useEffect } from 'react';
import { GroceryAisle } from '@/lib/types';
import { CommonIngredientItem, searchCommonIngredients } from '@/lib/common-ingredients';
import { Search, Plus, Sparkles, Check } from 'lucide-react';

interface IngredientComboboxProps {
  value: string;
  aisle: GroceryAisle;
  onChange: (name: string, aisle?: GroceryAisle, defaultUnit?: string) => void;
  placeholder?: string;
}

export function IngredientCombobox({
  value,
  aisle,
  onChange,
  placeholder = 'Nom de l\'ingrédient (ex: Beurre, Oignons, Poulet...)'
}: IngredientComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions filtered by current query
  const suggestions = searchCommonIngredients(value, 'Tous');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: CommonIngredientItem) => {
    onChange(item.name, item.aisle, item.default_unit);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCustomUse = () => {
    if (value.trim()) {
      onChange(value.trim());
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else {
        handleCustomUse();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const hasExactMatch = suggestions.some(
    s => s.name.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-800"
        />
        {value.trim() && (
          <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 pointer-events-none">
            ↵ Tab
          </span>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in">
          
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span>Ingrédients québécois suggérés</span>
            <span className="text-[10px] text-emerald-600 font-normal">Recherche intelligente</span>
          </div>

          <div className="space-y-0.5 pt-1">
            {suggestions.map((item, idx) => {
              const isSelected = item.name.toLowerCase() === value.trim().toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    isHighlighted || isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold dark:bg-emerald-950/60 dark:text-emerald-200'
                      : 'text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{item.name}</span>
                    {isSelected && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                  </div>

                  <span className="ml-2 shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.aisle}
                  </span>
                </button>
              );
            })}

            {/* Custom option when user types custom text not in list */}
            {value.trim() && !hasExactMatch && (
              <button
                type="button"
                onClick={handleCustomUse}
                className="w-full flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-2 text-left text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 mt-1"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Utiliser &laquo; {value.trim()} &raquo; (nouvel article)</span>
              </button>
            )}

            {suggestions.length === 0 && !value.trim() && (
              <div className="p-3 text-center text-xs text-zinc-400">
                Tapez le nom d&apos;un ingrédient pour voir les suggestions.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

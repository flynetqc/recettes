'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (rating: number) => void;
  showScore?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  interactive = false,
  size = 'md',
  onRatingChange,
  showScore = false
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= currentVal;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              className={`focus:outline-none transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110 p-0.5' : 'cursor-default'
              }`}
              aria-label={`Noter ${starIndex} sur ${maxRating}`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.4)]'
                    : 'fill-transparent text-zinc-300 dark:text-zinc-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="ml-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {rating > 0 ? `${rating}/5` : 'Non noté'}
        </span>
      )}
    </div>
  );
}

import React from 'react';
import { CATEGORIES, CategoryId } from '../data/categories';

interface TopicFilterProps {
  selected: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function TopicFilter({ selected, onChange }: TopicFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5">
      {CATEGORIES.map(cat => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5
              rounded-full text-sm font-medium transition-all duration-200
              ${isSelected
                ? 'bg-forest-900 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-forest-300'
              }
            `}
          >
            <span className="text-xs">{cat.icon}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
}

export function QuantitySelector({ value, onChange, max = 99, className }: QuantitySelectorProps) {
  return (
    <div className={cn('inline-flex items-center border border-border', className)}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-4 text-sm font-medium min-w-[3rem] text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
  className?: string;
}

export function SizeSelector({ sizes, selected, onSelect, className }: SizeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          className={cn(
            'min-w-[2.75rem] px-3 h-10 text-sm border transition-all',
            selected === size
              ? 'border-foreground bg-foreground text-background'
              : 'border-border hover:border-foreground'
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

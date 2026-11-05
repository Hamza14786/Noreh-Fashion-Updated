'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SizeGuideProps {
  trigger?: React.ReactNode;
}

const sizeData = {
  cm: {
    headers: ['Size', 'Bust', 'Waist', 'Hips', 'Length'],
    rows: [
      ['XS', '82', '64', '88', '98'],
      ['S', '86', '68', '92', '100'],
      ['M', '90', '72', '96', '102'],
      ['L', '94', '76', '100', '104'],
      ['XL', '98', '80', '104', '106'],
      ['XXL', '102', '84', '108', '108'],
    ],
  },
  in: {
    headers: ['Size', 'Bust', 'Waist', 'Hips', 'Length'],
    rows: [
      ['XS', '32.3', '25.2', '34.6', '38.6'],
      ['S', '33.9', '26.8', '36.2', '39.4'],
      ['M', '35.4', '28.3', '37.8', '40.2'],
      ['L', '37.0', '29.9', '39.4', '41.0'],
      ['XL', '38.6', '31.5', '40.9', '41.7'],
      ['XXL', '40.2', '33.1', '42.5', '42.5'],
    ],
  },
};

export function SizeGuide({ trigger }: SizeGuideProps) {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const data = sizeData[unit];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="text-xs p-0 h-auto">
            Size Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Size Guide</DialogTitle>
        </DialogHeader>

        {/* Unit toggle */}
        <div className="inline-flex border border-border rounded-sm overflow-hidden w-fit">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium transition-colors',
                unit === u ? 'bg-foreground text-background' : 'hover:bg-secondary'
              )}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {data.headers.map((h) => (
                  <th key={h} className="text-left py-3 px-2 font-medium">
                    {h}
                    {h !== 'Size' && ` (${unit})`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row[0]} className="border-b border-border/50">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        'py-3 px-2',
                        i === 0 ? 'font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Measurements are approximate and may vary slightly by product. For the best fit, compare with a garment you already own.
        </p>
      </DialogContent>
    </Dialog>
  );
}

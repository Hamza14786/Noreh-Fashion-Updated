'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ruler, Scissors, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sizeData = {
  in: {
    headers: ['Size', 'Bust (Inches)', 'Waist (Inches)', 'Hips (Inches)', 'Shirt Length (Inches)'],
    rows: [
      ['XS', '34', '26 - 28', '36', '38 - 40'],
      ['S', '36', '28 - 30', '38', '39 - 41'],
      ['M', '38 - 40', '30 - 32', '40 - 42', '40 - 42'],
      ['L', '42', '33 - 35', '44', '41 - 43'],
      ['XL', '44 - 46', '36 - 38', '46 - 48', '42 - 44'],
      ['XXL', '48', '39 - 41', '50', '42 - 44'],
    ],
  },
  cm: {
    headers: ['Size', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)', 'Shirt Length (cm)'],
    rows: [
      ['XS', '86', '66 - 71', '91', '96 - 101'],
      ['S', '91', '71 - 76', '96', '99 - 104'],
      ['M', '96 - 101', '76 - 81', '101 - 106', '101 - 106'],
      ['L', '106', '84 - 89', '112', '104 - 109'],
      ['XL', '112 - 117', '91 - 96', '117 - 122', '106 - 112'],
      ['XXL', '122', '99 - 104', '127', '106 - 112'],
    ],
  },
};

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const data = sizeData[unit];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Size Guide</span>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Fitting & Measurements</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Women&#39;s Size Guide</h1>
        <p className="text-muted-foreground leading-relaxed">
          Find your perfect silhouette. Use our detailed size chart below to determine your ideal size for stitched Pret collections and unstitched fabrics.
        </p>
      </div>

      {/* Unit Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Standard Ready-to-Wear Chart</h2>
        <div className="inline-flex rounded-sm border border-border p-0.5 bg-secondary">
          <button
            onClick={() => setUnit('in')}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${
              unit === 'in' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inches
          </button>
          <button
            onClick={() => setUnit('cm')}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${
              unit === 'cm' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Centimeters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-sm bg-card mb-12">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className="py-3 px-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-4 font-bold text-foreground">{row[0]}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row[1]}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row[2]}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row[3]}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unstitched Suits Fabric Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="border border-border p-6 rounded-sm bg-secondary/30">
          <div className="flex items-center gap-3 mb-4">
            <Scissors className="h-6 w-6 text-foreground" />
            <h3 className="font-display text-xl">Unstitched 3-Piece Fabric Specs</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Our unstitched collections provide generous fabric yardage to accommodate custom cuts, flares, and alterations up to plus sizes:
          </p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span><strong>Shirt / Kameez:</strong> 3.0 Meters (Embroidered Front & Dyed Back/Sleeves)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span><strong>Trouser / Shalwar:</strong> 2.5 Meters (Dyed matching fabric)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span><strong>Shawl / Dupatta:</strong> 2.5 Meters (Embroidered or Printed)</span>
            </li>
          </ul>
        </div>

        {/* How to measure */}
        <div className="border border-border p-6 rounded-sm bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Ruler className="h-6 w-6 text-foreground" />
            <h3 className="font-display text-xl">How to Measure Accurately</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Bust:</strong> Measure around the fullest part of your chest, keeping the measuring tape horizontal under your arms.
            </p>
            <p>
              <strong className="text-foreground">Waist:</strong> Measure around your natural waistline, typically the narrowest point above your belly button.
            </p>
            <p>
              <strong className="text-foreground">Hips:</strong> Stand with feet together and measure around the widest part of your hips.
            </p>
            <p>
              <strong className="text-foreground">Length:</strong> Measure from the highest point of your shoulder down to your desired hemline.
            </p>
          </div>
        </div>
      </div>

      {/* Still need help CTA */}
      <div className="border border-border p-6 rounded-sm bg-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-lg mb-1">Unsure which size fits you best?</h4>
          <p className="text-xs text-muted-foreground">Reach out to our personal styling team for custom measurement advice.</p>
        </div>
        <Button asChild>
          <Link href="/contact">Talk to Stylist</Link>
        </Button>
      </div>
    </div>
  );
}


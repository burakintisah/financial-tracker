/**
 * MarketTabs Component
 * Allows users to switch between BIST and US markets
 */

import { Market } from '../types/analysis.types';

interface MarketTabsProps {
  selected: Market;
  onChange: (market: Market) => void;
  stockCounts?: { BIST: number; US: number };
}

export function MarketTabs({ selected, onChange, stockCounts }: MarketTabsProps) {
  const markets: { value: Market; label: string }[] = [
    { value: 'BIST', label: 'BIST' },
    { value: 'US', label: 'US Markets' },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="flex gap-4" aria-label="Market tabs">
        {markets.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              selected === value
                ? 'border-navy-700 text-navy-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {label}
            {stockCounts && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selected === value
                    ? 'bg-navy-100 text-navy-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stockCounts[value]}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default MarketTabs;

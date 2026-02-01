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
    <div className="border-b border-gray-200">
      <nav className="flex gap-4" aria-label="Market tabs">
        {markets.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              selected === value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label}
            {stockCounts && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selected === value
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
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

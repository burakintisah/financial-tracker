/**
 * TimeframeSelector Component
 * Allows users to select analysis timeframe (1M, 3M, 6M)
 */

import { Timeframe } from '../types/analysis.types';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
];

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-2">
      {timeframes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selected === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default TimeframeSelector;

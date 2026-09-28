import { useCallback } from 'react';
import type { ChangeEvent } from 'react';

export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (min: number, max: number) => void;
}

/**
 * A single dual-thumb slider control writing both a min and a max value from one control —
 * distinct from two independent NumberInputs. Dragging the low thumb past the high thumb (or
 * vice versa) clamps rather than crossing over, so the reported pair always has low <= high.
 */
export default function RangeSlider({ min, max, value, onChange }: RangeSliderProps) {
  const [low, high] = value;
  const span = max - min;

  const handleLowChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = Math.min(Number(e.target.value), high);
      onChange(next, high);
    },
    [high, onChange]
  );

  const handleHighChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = Math.max(Number(e.target.value), low);
      onChange(low, next);
    },
    [low, onChange]
  );

  const lowPct = span === 0 ? 0 : ((low - min) / span) * 100;
  const highPct = span === 0 ? 100 : ((high - min) / span) * 100;

  return (
    <div className="range-slider">
      <div className="range-slider-track">
        <div
          className="range-slider-selected"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          className="range-slider-thumb range-slider-thumb-low"
          min={min}
          max={max}
          value={low}
          onChange={handleLowChange}
          aria-label="Minimum rent"
        />
        <input
          type="range"
          className="range-slider-thumb range-slider-thumb-high"
          min={min}
          max={max}
          value={high}
          onChange={handleHighChange}
          aria-label="Maximum rent"
        />
      </div>
      <div className="range-slider-values">
        <span>₹{low}</span>
        <span>₹{high}</span>
      </div>
    </div>
  );
}

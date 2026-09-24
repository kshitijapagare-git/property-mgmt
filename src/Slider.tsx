import type { ChangeEvent } from 'react';

interface SliderProps {
  id: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Clamps a number into [min, max]; used by both the track and the readout input. */
export function clampSliderValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function Slider({
  id,
  name,
  value,
  onChange,
  min = 150,
  max = 6000,
}: SliderProps) {
  const emit = (raw: number) => {
    if (Number.isNaN(raw)) return;
    onChange(clampSliderValue(raw, min, max));
  };

  const handleTrackChange = (e: ChangeEvent<HTMLInputElement>) => {
    emit(Number(e.target.value));
  };

  const handleReadoutChange = (e: ChangeEvent<HTMLInputElement>) => {
    emit(Number(e.target.value));
  };

  return (
    <div className="slider" id={id}>
      <input
        type="range"
        name={name}
        value={value}
        onChange={handleTrackChange}
        min={min}
        max={max}
        step={1}
      />
      <input
        type="number"
        aria-label={`${name} value`}
        value={value}
        onChange={handleReadoutChange}
        min={min}
        max={max}
        step={1}
      />
    </div>
  );
}

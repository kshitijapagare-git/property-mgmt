import type { ChangeEvent } from 'react';

interface StepperProps {
  id: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function Stepper({
  id,
  name,
  value,
  onChange,
  min = 0,
  max = 20,
}: StepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next)));

  const decrement = () => onChange(clamp(value - 1));
  const increment = () => onChange(clamp(value + 1));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
  };

  return (
    <div className="stepper" id={id}>
      <button type="button" onClick={decrement} disabled={value <= min} aria-label={`Decrease ${name}`}>
        −
      </button>
      <input
        type="number"
        name={name}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={1}
      />
      <button type="button" onClick={increment} disabled={value >= max} aria-label={`Increase ${name}`}>
        +
      </button>
    </div>
  );
}

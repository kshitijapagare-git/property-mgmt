import type { ChangeEvent } from 'react';

interface CurrencyInputProps {
  id: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Outputs an integer number of minor currency units (paise/cents), matching the API's
 * wire type for `defaultDeposit`. The displayed value stays in minor units too, so the
 * component doesn't invent a major/minor conversion the API contract doesn't ask for.
 */
export default function CurrencyInput({ id, name, value, onChange }: CurrencyInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <input
      type="number"
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      min={0}
      step={1}
    />
  );
}

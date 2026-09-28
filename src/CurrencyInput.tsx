import type { ChangeEvent } from 'react';

interface CurrencyInputProps {
  name: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}

/**
 * A single numeric input with a currency prefix. This is the one currency-formatting control in
 * the app — every field that needs to capture a monetary amount (e.g. Listing's expectedRent)
 * should reuse this rather than introducing a second currency component.
 */
export default function CurrencyInput({ name, id, value, onChange, required }: CurrencyInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === '' ? 0 : Number(raw));
  };

  return (
    <div className="currency-input">
      <span className="currency-prefix">₹</span>
      <input
        id={id}
        name={name}
        type="number"
        min={0}
        step="1"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}

import type { ChangeEvent } from 'react';

export interface PhoneInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

/**
 * A single phone-number input following CurrencyInput's shape (id/name/value/onChange/required)
 * so the Viewing form's `phone` field has a purpose-built control instead of a plain
 * <input type="tel">. Strips anything that isn't a digit or a leading `+` as the user types, but
 * otherwise leaves the value free-form (no country-specific length validation).
 */
export default function PhoneInput({ id, name, value, onChange, required }: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^\d+]/g, '');
    onChange(cleaned);
  };

  return (
    <div className="phone-input">
      <span className="phone-input-prefix">☎</span>
      <input
        id={id}
        name={name}
        type="tel"
        value={value}
        onChange={handleChange}
        required={required}
        placeholder="Phone number"
      />
    </div>
  );
}

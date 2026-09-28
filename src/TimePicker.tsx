import type { ChangeEvent } from 'react';

export interface TimePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A single time-of-day input, writing an "HH:MM" string via `onChange` — used for the Viewing
 * form's `slot` field instead of a plain <input type="time">, matching the value/onChange
 * contract established by CurrencyInput/PhoneInput.
 */
export default function TimePicker({ id, name, value, onChange }: TimePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <input
      id={id}
      name={name}
      type="time"
      className="time-picker"
      value={value}
      onChange={handleChange}
    />
  );
}

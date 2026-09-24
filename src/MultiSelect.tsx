import type { ChangeEvent } from 'react';
import type { SelectOption } from './types';

interface MultiSelectProps {
  id: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
}

/**
 * A checkbox group over a fixed options list. Submits a plain string array — unchecking
 * every option yields `onChange([])` rather than `null`/`undefined`.
 */
export default function MultiSelect({ id, name, value, onChange, options }: MultiSelectProps) {
  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const optionValue = e.target.value;
    if (e.target.checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="multi-select" id={id} role="group" aria-label={name}>
      {options.map((opt) => (
        <label key={opt.value} className="multi-select-option">
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            checked={value.includes(opt.value)}
            onChange={handleToggle}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

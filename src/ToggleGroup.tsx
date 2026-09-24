import type { SelectOption } from './types';

interface ToggleGroupProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export default function ToggleGroup({
  id,
  name,
  value,
  onChange,
  options,
}: ToggleGroupProps) {
  return (
    <div className="toggle-group" id={id} role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`toggle-option ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

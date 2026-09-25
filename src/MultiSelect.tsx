import type { SelectOption } from './types';

interface MultiSelectProps {
  id: string;
  name: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
}

export default function MultiSelect({ id, name, value, onChange, options }: MultiSelectProps) {
  const toggle = (next: string) => {
    if (value.includes(next)) onChange(value.filter((v) => v !== next));
    else onChange([...value, next]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
  };

  return (
    <div id={id} name={name} onKeyDown={handleKeyDown}>
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.value)}
              value={opt.value}
            />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

import type { ChangeEventHandler } from 'react';
import type { SelectOption } from './types';

interface AsyncSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  required?: boolean;
}

export default function AsyncSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  isLoading = false,
  required = false,
}: AsyncSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={isLoading}
    >
      {isLoading ? (
        <option value="" disabled>Loading...</option>
      ) : (
        <>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </>
      )}
    </select>
  );
}

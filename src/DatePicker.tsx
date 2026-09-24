import type { ChangeEvent } from 'react';

interface DatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

/** Today's date as YYYY-MM-DD, matching the `<input type="date">` value/max format. */
function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DatePicker({ id, name, value, onChange }: DatePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <input
      type="date"
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      max={todayIso()}
    />
  );
}

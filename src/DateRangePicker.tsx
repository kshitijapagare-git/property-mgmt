import type { ChangeEvent } from 'react';
import { validateDateRange } from './utils/dateRangeGuard';

interface DateRangePickerProps {
  id: string;
  name: string;
  valueFrom: string;
  valueTo: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
}

/**
 * A single control that writes both `availableFrom` and `availableTo` — not two separate
 * DatePicker instances. Validation runs as soon as the "to" bound changes, so the error is
 * visible inline before any submit attempt.
 */
export default function DateRangePicker({
  id,
  name,
  valueFrom,
  valueTo,
  onChangeFrom,
  onChangeTo,
}: DateRangePickerProps) {
  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => onChangeFrom(e.target.value);
  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => onChangeTo(e.target.value);

  const error = validateDateRange(valueFrom, valueTo);

  return (
    <div className="date-range-picker" id={id}>
      <div className="date-range-picker-bounds">
        <input
          type="date"
          id={`${id}-from`}
          name={`${name}From`}
          aria-label={`${name} from`}
          value={valueFrom}
          onChange={handleFromChange}
        />
        <span className="date-range-picker-separator">to</span>
        <input
          type="date"
          id={`${id}-to`}
          name={`${name}To`}
          aria-label={`${name} to`}
          value={valueTo}
          onChange={handleToChange}
        />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

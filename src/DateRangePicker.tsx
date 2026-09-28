import type { ChangeEvent } from 'react';

interface DateRangePickerProps {
  startName: string;
  endName: string;
  startValue: string;
  endValue: string;
  onChange: (start: string, end: string) => void;
}

/**
 * A single control that writes both bounds of a date range through one onChange callback. It
 * renders one start-date input and one end-date input, but they are not independently wired —
 * each change event recomputes the full (start, end) pair and reports it together, so this is
 * never two separate DatePickers each owning its own state.
 */
export default function DateRangePicker({ startName, endName, startValue, endValue, onChange }: DateRangePickerProps) {
  const invalid = Boolean(startValue && endValue && endValue < startValue);

  const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, endValue);
  };

  const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(startValue, e.target.value);
  };

  return (
    <div className="date-range">
      <div className="date-range-inputs">
        <input
          id={startName}
          name={startName}
          type="date"
          value={startValue}
          onChange={handleStartChange}
          required
        />
        <span className="date-range-sep">to</span>
        <input
          id={endName}
          name={endName}
          type="date"
          value={endValue}
          onChange={handleEndChange}
          required
        />
      </div>
      {invalid && (
        <div className="date-range-error">Available-to date cannot be before the available-from date.</div>
      )}
    </div>
  );
}

import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  it('shows an inline error when the end date is before the start date', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateRangePicker
        startName="availableFrom"
        endName="availableTo"
        startValue="2024-06-10"
        endValue="2024-06-01"
        onChange={onChange}
      />
    );

    // An end date before the start date must surface an inline error before any submit.
    expect(container.textContent).toMatch(/before/i);
  });

  it('shows no error for a valid range, and a single onChange covers both bounds', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateRangePicker
        startName="availableFrom"
        endName="availableTo"
        startValue="2024-06-01"
        endValue="2024-06-10"
        onChange={onChange}
      />
    );

    expect(container.textContent).not.toMatch(/before/i);

    const startInput = container.querySelector('input[name="availableFrom"]') as HTMLInputElement;
    expect(startInput).toBeTruthy();
    fireEvent.change(startInput, { target: { value: '2024-06-02' } });

    // A single onChange call must cover both fields, never two independently-wired inputs.
    expect(onChange).toHaveBeenCalledWith('2024-06-02', '2024-06-10');
  });
});

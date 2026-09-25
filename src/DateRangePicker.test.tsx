import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DateRangePicker from './DateRangePicker';

function pickDate(cell: HTMLElement) {
  fireEvent.click(cell);
}

describe('DateRangePicker', () => {
  it('rejects end date before start date inline (does not call onChange with invalid pair)', () => {
    const onChange = vi.fn();

    const { container } = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <DateRangePicker
          id="availability"
          name="availability"
          from="2026-01-10"
          to=""
          onChange={onChange}
        />
        <button type="submit">Submit</button>
      </form>
    );

    // A start date is already set, so the trigger shows it instead of "Select availability".
    const button = screen.getByRole('button', { name: /available from: 2026-01-10/i });
    fireEvent.click(button);

    const dayButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-label]'));
    const endCandidate = dayButtons.find((b) => b.getAttribute('aria-label') === '2026-01-05');

    expect(endCandidate).toBeTruthy();
    if (!endCandidate) return;

    pickDate(endCandidate);

    expect(screen.getByText(/end date cannot be before start date/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onChange).not.toHaveBeenCalledWith({ from: '2026-01-10', to: '2026-01-05' });
  });

  it('renders exactly one visible interactive control (popover trigger)', () => {
    render(
      <DateRangePicker id="availability" name="availability" from="" to="" onChange={() => {}} />
    );

    // Only the trigger button should be visible as an interactive control.
    expect(screen.getAllByRole('button').length).toBe(1);
  });
});

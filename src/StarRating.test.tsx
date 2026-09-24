import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('clicking the currently-selected star clears the rating to null, not 0', () => {
    const onChange = vi.fn();
    render(<StarRating id="conditionRating" name="conditionRating" value={3} onChange={onChange} />);

    const activeStar = screen.getByRole('radio', { name: '3 stars' });
    activeStar.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onChange).not.toHaveBeenCalledWith(0);
  });

  it('clicking the clear control clears the rating to null', () => {
    const onChange = vi.fn();
    render(<StarRating id="conditionRating" name="conditionRating" value={2} onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: 'Clear rating' });
    clearButton.click();

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clicking a different star sets that rating', () => {
    const onChange = vi.fn();
    render(<StarRating id="conditionRating" name="conditionRating" value={null} onChange={onChange} />);

    const fourthStar = screen.getByRole('radio', { name: '4 stars' });
    fourthStar.click();

    expect(onChange).toHaveBeenCalledWith(4);
  });
});

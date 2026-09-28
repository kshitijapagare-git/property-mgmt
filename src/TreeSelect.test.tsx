import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import TreeSelect from './TreeSelect';
import type { Locality } from './types';

const localities: Locality[] = [
  { id: 'loc-1', name: 'Koramangala', pincode: '560095', city: 'Bengaluru', zone: 'South', landlordId: 'll-1' },
  { id: 'loc-2', name: 'Indiranagar', pincode: '560038', city: 'Bengaluru', zone: 'East', landlordId: 'll-1' },
];

describe('TreeSelect', () => {
  it('calls onChange with the leaf locality id, not a city or zone id', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <TreeSelect localities={localities} value="" onChange={onChange} />
    );

    // Open the tree if it isn't already expanded, then pick the leaf locality node.
    const trigger = container.querySelector('[role="button"], button, [class*="tree"]');
    if (trigger) fireEvent.click(trigger);

    fireEvent.click(getByText('Koramangala'));

    expect(onChange).toHaveBeenCalledWith('loc-1');
    expect(onChange).not.toHaveBeenCalledWith('Bengaluru');
    expect(onChange).not.toHaveBeenCalledWith('South');
  });

  it('shows "Unknown locality" and preserves the original value when it is not found', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TreeSelect localities={localities} value="missing-id" onChange={onChange} />
    );

    expect(container.textContent).toMatch(/Unknown locality/i);
    expect(onChange).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeSelect from './TreeSelect';
import type { TreeSelectOption } from './TreeSelect';

const options: TreeSelectOption[] = [
  { value: 'loc-1', label: 'Koramangala', city: 'Bengaluru', zone: 'South' },
  { value: 'loc-2', label: 'Indiranagar', city: 'Bengaluru', zone: 'East' },
  { value: 'loc-3', label: 'Andheri', city: 'Mumbai', zone: 'West' },
];

describe('TreeSelect', () => {
  it('renders cities and zones grouped from the flat options list', () => {
    render(
      <TreeSelect
        id="localityId"
        name="localityId"
        value=""
        onChange={() => {}}
        options={options}
      />
    );

    expect(screen.getByText('Bengaluru')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('South')).toBeInTheDocument();
    expect(screen.getByText('East')).toBeInTheDocument();
    expect(screen.getByText('West')).toBeInTheDocument();
  });

  it('calls onChange with the leaf localityId, not an event, when a leaf is clicked', () => {
    const onChange = vi.fn();
    render(
      <TreeSelect
        id="localityId"
        name="localityId"
        value=""
        onChange={onChange}
        options={options}
      />
    );

    screen.getByText('Koramangala').click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('loc-1');
  });

  it('shows a placeholder when nothing is selected', () => {
    render(
      <TreeSelect
        id="localityId"
        name="localityId"
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Select a locality"
      />
    );

    expect(screen.getByText('Select a locality')).toBeInTheDocument();
  });

  it('shows the selected leaf label as the current value', () => {
    render(
      <TreeSelect
        id="localityId"
        name="localityId"
        value="loc-3"
        onChange={() => {}}
        options={options}
      />
    );

    expect(screen.getByText('Andheri')).toBeInTheDocument();
  });
});

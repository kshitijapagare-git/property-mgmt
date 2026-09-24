import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AsyncSelect from './AsyncSelect';

const options = [
  { value: 'l1', label: 'Jane Doe' },
  { value: 'l2', label: 'John Smith' },
];

describe('AsyncSelect', () => {
  it('renders options from the passed-in list', () => {
    render(
      <AsyncSelect
        id="landlordId"
        name="landlordId"
        value=""
        onChange={() => {}}
        options={options}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('shows a placeholder option', () => {
    render(
      <AsyncSelect
        id="landlordId"
        name="landlordId"
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Select a landlord"
      />
    );

    expect(screen.getByText('Select a landlord')).toBeInTheDocument();
  });

  it('calls onChange with the selected option value', () => {
    const handleChange = vi.fn();
    render(
      <AsyncSelect
        id="landlordId"
        name="landlordId"
        value=""
        onChange={handleChange}
        options={options}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'l2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    const event = handleChange.mock.calls[0][0];
    expect(event.target.name).toBe('landlordId');
    expect(event.target.value).toBe('l2');
  });

  it('shows a disabled loading option when isLoading is true', () => {
    render(
      <AsyncSelect
        id="landlordId"
        name="landlordId"
        value=""
        onChange={() => {}}
        options={options}
        isLoading
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

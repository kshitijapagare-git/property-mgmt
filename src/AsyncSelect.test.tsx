import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import AsyncSelect from './AsyncSelect';
import type { Landlord } from './types';

const landlords: Landlord[] = [
  { id: 'll-1', firstName: 'Asha', lastName: 'Rao', email: 'asha.rao@example.com', phone: '1111111111' },
  { id: 'll-2', firstName: 'Vikram', lastName: 'Shah', email: 'vikram.shah@example.com', phone: '2222222222' },
  { id: 'll-3', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@work.com', phone: '3333333333' },
];

const loadOptions = (query: string): Promise<Landlord[]> => {
  const q = query.toLowerCase();
  return Promise.resolve(
    landlords.filter(
      (l) =>
        l.firstName.toLowerCase().includes(q) ||
        l.lastName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
    )
  );
};

const renderSelect = (value = '') => {
  const onChange = vi.fn();
  const utils = render(
    <AsyncSelect<Landlord>
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      getId={(l) => l.id}
      getLabel={(l) => `${l.firstName} ${l.lastName}`}
      getSecondary={(l) => l.email}
    />
  );
  return { onChange, ...utils };
};

describe('AsyncSelect', () => {
  it('opens the dropdown and shows a spinner while options are loading', async () => {
    const { container } = renderSelect();
    fireEvent.click(screen.getByRole('button'));

    expect(container.querySelector('.spinner')).toBeTruthy();

    await waitFor(() => expect(container.querySelector('.spinner')).toBeFalsy());
  });

  it('filters options by firstName/lastName/email substring as the user types', async () => {
    const { container } = renderSelect();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(container.querySelector('.async-select-option')).toBeTruthy());
    expect(screen.getByText('Vikram Shah')).toBeTruthy();

    const search = container.querySelector('.async-select-search') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'shah' } });

    await waitFor(() => {
      expect(screen.queryByText('Asha Rao')).toBeFalsy();
      expect(screen.getByText('Vikram Shah')).toBeTruthy();
    });

    // Substring match against email too, not just name.
    fireEvent.change(search, { target: { value: 'work.com' } });
    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeTruthy();
      expect(screen.queryByText('Vikram Shah')).toBeFalsy();
    });
  });

  it('renders the option label as "firstName lastName" with email as a secondary line', async () => {
    const { container } = renderSelect();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(container.querySelector('.async-select-option')).toBeTruthy());

    const option = Array.from(container.querySelectorAll('.async-select-option')).find((el) =>
      el.textContent?.includes('Asha Rao')
    );
    expect(option).toBeTruthy();
    expect(option!.querySelector('.async-select-option-label')?.textContent).toBe('Asha Rao');
    expect(option!.querySelector('.async-select-option-secondary')?.textContent).toBe(
      'asha.rao@example.com'
    );
  });

  it('shows "No results" when loadOptions resolves to an empty array', async () => {
    const { container } = renderSelect();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(container.querySelector('.async-select-option')).toBeTruthy());

    const search = container.querySelector('.async-select-search') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'nonexistent-substring' } });

    await waitFor(() => expect(screen.getByText('No results')).toBeTruthy());
  });

  it('calls onChange with the selected landlord id when an option is picked', async () => {
    const { onChange, container } = renderSelect();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(container.querySelector('.async-select-option')).toBeTruthy());

    fireEvent.click(screen.getByText('Priya Nair'));

    expect(onChange).toHaveBeenCalledWith('ll-3');
  });
});

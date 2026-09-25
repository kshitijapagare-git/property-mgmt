import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TreeSelect from './TreeSelect';
import type { Locality } from './types';

describe('TreeSelect', () => {
  const localities: Locality[] = [
    {
      id: 'loc-1',
      name: 'Locality 1',
      pincode: '111111',
      city: 'City A',
      zone: 'Zone 1',
      landlordId: 'l-1',
    },
    {
      id: 'loc-2',
      name: 'Locality 2',
      pincode: '222222',
      city: 'City A',
      zone: '',
      landlordId: 'l-2',
    },
    {
      id: 'loc-3',
      name: 'Locality 3',
      pincode: '333333',
      city: 'City B',
      zone: 'Zone X',
      landlordId: 'l-3',
    },
  ];

  it('selecting a leaf locality calls onChange with the leaf localityId only', () => {
    const onChange = vi.fn();

    render(
      <TreeSelect
        id="locality"
        name="localityId"
        value={''}
        onChange={onChange}
        localities={localities}
      />
    );

    const citySelect = screen.getByDisplayValue('-- Select city --') as HTMLSelectElement;
    fireEvent.change(citySelect, { target: { value: 'City A' } });

    const zoneSelect = screen.getByDisplayValue('-- Select zone --') as HTMLSelectElement;
    fireEvent.change(zoneSelect, { target: { value: 'Zone 1' } });

    // With zone selected, locality options should appear.
    const localitySelect = screen.getByDisplayValue('-- Select locality --') as HTMLSelectElement;
    fireEvent.change(localitySelect, { target: { value: 'loc-1' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('loc-1');
  });

  it('required-but-unselected blocks native form submission', () => {
    const onAdd = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if ((e.target as HTMLFormElement).checkValidity()) {
              onAdd(value);
            }
          }}
        >
          <TreeSelect
            id="locality"
            name="localityId"
            value={value}
            onChange={setValue}
            localities={localities}
            required
          />
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<Wrapper />);

    fireEvent.click(screen.getByText('Submit'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});

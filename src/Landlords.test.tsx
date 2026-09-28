import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import Landlords from './Landlords';
import { getDeleteLandlordGuard } from './App';
import type { Landlord, Locality } from './types';

const landlords: Landlord[] = [
  { id: 'll-1', firstName: 'Asha', lastName: 'Rao', email: 'asha@example.com', phone: '9000000001' },
  { id: 'll-2', firstName: 'Vikram', lastName: 'Shah', email: 'vikram@example.com', phone: '9000000002' },
];

describe('Landlords', () => {
  it('renders View and Edit actions per row', () => {
    render(
      <Landlords landlords={landlords} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getAllByText('View')).toHaveLength(landlords.length);
    expect(screen.getAllByText('Edit')).toHaveLength(landlords.length);
  });

  it('opens a read-only Modal with the landlord values when View is clicked', () => {
    render(
      <Landlords landlords={landlords} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );

    fireEvent.click(screen.getAllByText('View')[0]);

    expect(screen.getByText('View landlord')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Asha')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rao')).toBeInTheDocument();
    expect(screen.getByDisplayValue('asha@example.com')).toBeInTheDocument();
    // Read-only view never offers a submit action.
    expect(screen.queryByText('Save landlord')).not.toBeInTheDocument();
  });

  it('submits edits through onUpdate with the existing id', () => {
    const onUpdate = vi.fn();
    render(
      <Landlords landlords={landlords} onAdd={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} />
    );

    fireEvent.click(screen.getAllByText('Edit')[0]);
    const lastNameInput = screen.getByDisplayValue('Rao');
    fireEvent.change(lastNameInput, { target: { value: 'Raoji' } });
    fireEvent.click(screen.getByText('Save landlord'));

    expect(onUpdate).toHaveBeenCalledWith('ll-1', {
      firstName: 'Asha',
      lastName: 'Raoji',
      email: 'asha@example.com',
      phone: '9000000001',
    });
  });

  it('rejects a malformed email on blur and on submit', () => {
    const onAdd = vi.fn();
    render(
      <Landlords landlords={landlords} onAdd={onAdd} onUpdate={vi.fn()} onDelete={vi.fn()} />
    );

    fireEvent.click(screen.getByText('+ Add landlord'));
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add landlord'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('getDeleteLandlordGuard', () => {
  const localities: Locality[] = [
    { id: 'loc-1', name: 'Koramangala', pincode: '560095', city: 'Bengaluru', zone: 'South', landlordId: 'll-1' },
    { id: 'loc-2', name: 'Indiranagar', pincode: '560038', city: 'Bengaluru', zone: 'East', landlordId: 'll-1' },
  ];

  it('disables confirmation and names the exact pluralized count when localities exist', () => {
    const guard = getDeleteLandlordGuard('ll-1', localities);
    expect(guard.disabled).toBe(true);
    expect(guard.message).toBe('Cannot delete: 2 localities');
  });

  it('singularizes the message for exactly one locality', () => {
    const guard = getDeleteLandlordGuard('ll-1', [localities[0]]);
    expect(guard.disabled).toBe(true);
    expect(guard.message).toBe('Cannot delete: 1 locality');
  });

  it('allows deletion when the landlord has no localities', () => {
    const guard = getDeleteLandlordGuard('ll-2', localities);
    expect(guard.disabled).toBe(false);
  });
});

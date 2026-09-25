import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';
import type { Column, Landlord, Locality, LocalityFormValues, SelectOption } from './types';

const empty: LocalityFormValues = { name: '', pincode: '', city: '', zone: '', landlordId: '' };
const PAGE_SIZE = 10;

interface LocalitiesProps {
  localities: Locality[];
  landlords: Landlord[];
  onAdd: (locality: LocalityFormValues) => void;
  onUpdate: (id: string, locality: LocalityFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Localities({
  localities,
  landlords,
  onAdd,
  onUpdate,
  onDelete,
}: LocalitiesProps) {
  const [form, setForm] = useState<LocalityFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(localities.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = localities.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // One handler serves both the text inputs and the landlord <select>, so the event has to
  // cover either element — the body only touches `name` and `value`, which both share.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (locality: Locality) => {
    setEditingId(locality.id);
    setForm({
      name: locality.name,
      pincode: locality.pincode,
      city: locality.city,
      zone: locality.zone,
      landlordId: locality.landlordId,
    });
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const landlordName = (id: string) => {
    const l = landlords.find((x) => x.id === id);
    return l ? `${l.firstName} ${l.lastName}` : '';
  };

  const columns: Column<Locality>[] = [
    { key: 'name', header: 'Name' },
    { key: 'pincode', header: 'Pincode' },
    { key: 'city', header: 'City' },
    { key: 'landlord', header: 'Landlord', render: (l) => landlordName(l.landlordId) },
  ];

  const landlordOptions: SelectOption[] = landlords.map((l) => ({
    value: l.id,
    label: `${l.firstName} ${l.lastName}`,
  }));

  return (
    <>
      <div className="page-header">
        <h1>Localities</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add locality</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(l) => l.id}
          emptyMessage="No localities yet."
          renderActions={(l) => (
            <>
              <button className="btn btn-secondary" onClick={() => openEdit(l)}>Edit</button>{' '}
              <button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button>
            </>
          )}
        />
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit locality' : 'New locality'}
          submitLabel={editingId ? 'Save changes' : 'Add locality'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              pattern="^\d{6}$"
              title="Pincode must be exactly 6 digits"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="zone">Zone</label>
            <input id="zone" name="zone" value={form.zone} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="landlordId">Landlord</label>
            <AsyncSelect
              id="landlordId"
              name="landlordId"
              value={form.landlordId}
              onChange={handleChange}
              options={landlordOptions}
              placeholder="Select a landlord"
              required
            />
          </div>
        </Modal>
      )}
    </>
  );
}

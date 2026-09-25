import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import type { Landlord, Locality, LocalityFormValues } from './types';

const empty: LocalityFormValues = { name: '', pincode: '', city: '', landlordId: '' };
const PAGE_SIZE = 10;

interface LocalitiesProps {
  localities: Locality[];
  landlords: Landlord[];
  onAdd: (locality: LocalityFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Localities({ localities, landlords, onAdd, onDelete }: LocalitiesProps) {
  const [form, setForm] = useState<LocalityFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(localities.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = localities.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // One handler serves the text inputs and the landlord <select>, so the event covers either
  // element — the body only touches `name` and `value`, which both share.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const close = () => {
    setOpen(false);
    setForm(empty);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd(form);
    close();
  };

  const landlordName = (id: string) => {
    const l = landlords.find((x) => x.id === id);
    return l ? `${l.firstName} ${l.lastName}` : '';
  };

  return (
    <>
      <div className="page-header">
        <h1>Localities</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add locality</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Pincode</th>
              <th>City</th>
              <th>Landlord</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="empty">No localities yet.</td></tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.pincode}</td>
                  <td>{l.city}</td>
                  <td>{landlordName(l.landlordId)}</td>
                  <td><button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal title="New locality" submitLabel="Add locality" onClose={close} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="pincode">Pincode</label>
            <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="landlordId">Landlord</label>
            <select id="landlordId" name="landlordId" value={form.landlordId} onChange={handleChange} required>
              <option value="">Select a landlord</option>
              {landlords.map((l) => (
                <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}

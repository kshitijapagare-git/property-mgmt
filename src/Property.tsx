import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import TreeSelect from './TreeSelect';
import type { Locality, Property as PropertyEntity, PropertyFormValues } from './types';

const empty: PropertyFormValues = { name: '', localityId: '' };
const PAGE_SIZE = 10;

interface PropertyProps {
  properties: PropertyEntity[];
  localities: Locality[];
  onAdd: (property: PropertyFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Property({ properties, localities, onAdd, onDelete }: PropertyProps) {
  const [form, setForm] = useState<PropertyFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = properties.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocalityChange = (localityId: string) =>
    setForm({ ...form, localityId });

  const close = () => {
    setOpen(false);
    setForm(empty);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd(form);
    close();
  };

  const localityName = (id: string) => {
    const l = localities.find((x) => x.id === id);
    return l ? l.name : 'Unknown locality';
  };

  return (
    <>
      <div className="page-header">
        <h1>Properties</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add property</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Locality</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="empty">No properties yet.</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{localityName(p.localityId)}</td>
                  <td><button className="btn btn-danger" onClick={() => onDelete(p.id)}>Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal title="New property" submitLabel="Add property" onClose={close} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="localityId">Locality</label>
            <TreeSelect localities={localities} value={form.localityId} onChange={handleLocalityChange} />
          </div>
        </Modal>
      )}
    </>
  );
}

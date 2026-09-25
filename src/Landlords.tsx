import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import type { Landlord, LandlordFormValues } from './types';

const empty: LandlordFormValues = { firstName: '', lastName: '', email: '', phone: '' };
const PAGE_SIZE = 10;

interface LandlordsProps {
  landlords: Landlord[];
  onAdd: (landlord: LandlordFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Landlords({ landlords, onAdd, onDelete }: LandlordsProps) {
  const [form, setForm] = useState<LandlordFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(landlords.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = landlords.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
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

  return (
    <>
      <div className="page-header">
        <h1>Landlords</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add landlord</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="empty">No landlords yet.</td></tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id}>
                  <td>{l.firstName}</td>
                  <td>{l.lastName}</td>
                  <td>{l.email}</td>
                  <td>{l.phone}</td>
                  <td><button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal title="New landlord" submitLabel="Add landlord" onClose={close} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
        </Modal>
      )}
    </>
  );
}

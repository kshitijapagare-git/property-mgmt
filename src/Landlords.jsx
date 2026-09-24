import { useState } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';

const empty = { firstName: '', lastName: '', email: '', phone: '' };
const PAGE_SIZE = 10;

export default function Landlords({ landlords, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(landlords.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = landlords.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const openEdit = (landlord) => {
    setEditingId(landlord.id);
    setForm({
      firstName: landlord.firstName,
      lastName: landlord.lastName,
      email: landlord.email,
      phone: landlord.phone,
    });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const columns = [
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Landlords</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add landlord</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(l) => l.id}
          emptyMessage="No landlords yet."
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
          title={editingId ? 'Edit landlord' : 'New landlord'}
          submitLabel={editingId ? 'Save changes' : 'Add landlord'}
          onClose={close}
          onSubmit={handleSubmit}
        >
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

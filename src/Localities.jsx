import { useState } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';

const empty = { name: '', pincode: '', city: '', landlordId: '' };
const PAGE_SIZE = 10;

export default function Localities({ localities, landlords, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(localities.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = localities.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

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

  const openEdit = (locality) => {
    setEditingId(locality.id);
    setForm({
      name: locality.name,
      pincode: locality.pincode,
      city: locality.city,
      landlordId: locality.landlordId,
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

  const landlordName = (id) => {
    const l = landlords.find((x) => x.id === id);
    return l ? `${l.firstName} ${l.lastName}` : '';
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'pincode', header: 'Pincode' },
    { key: 'city', header: 'City' },
    { key: 'landlord', header: 'Landlord', render: (l) => landlordName(l.landlordId) },
  ];

  const landlordOptions = landlords.map((l) => ({ value: l.id, label: `${l.firstName} ${l.lastName}` }));

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

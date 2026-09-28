import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import { validateEmail } from './validation/email';
import type { Landlord, LandlordFormValues } from './types';

const empty: LandlordFormValues = { firstName: '', lastName: '', email: '', phone: '' };
const PAGE_SIZE = 10;

interface LandlordsProps {
  landlords: Landlord[];
  onAdd: (landlord: LandlordFormValues) => void;
  onUpdate: (id: string, landlord: LandlordFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Landlords({ landlords, onAdd, onUpdate, onDelete }: LandlordsProps) {
  const [form, setForm] = useState<LandlordFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingLandlord, setViewingLandlord] = useState<Landlord | null>(null);
  const [page, setPage] = useState(1);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  const totalPages = Math.max(1, Math.ceil(landlords.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = landlords.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailBlur = () => setEmailError(validateEmail(form.email));

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
    setEmailError(undefined);
  };

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setEmailError(undefined);
    setOpen(true);
  };

  const openEdit = (landlord: Landlord) => {
    const { id, ...values } = landlord;
    setForm(values);
    setEditingId(id);
    setEmailError(undefined);
    setOpen(true);
  };

  const openView = (landlord: Landlord) => setViewingLandlord(landlord);
  const closeView = () => setViewingLandlord(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateEmail(form.email);
    setEmailError(error);
    if (error) return;
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const columns: DataTableColumn<Landlord>[] = [
    { key: 'firstName', header: 'First name', render: (l) => l.firstName },
    { key: 'lastName', header: 'Last name', render: (l) => l.lastName },
    { key: 'email', header: 'Email', render: (l) => l.email },
    { key: 'phone', header: 'Phone', render: (l) => l.phone },
    {
      key: 'actions',
      header: 'Actions',
      render: (l) => (
        <>
          <button className="btn btn-secondary" onClick={() => openView(l)}>View</button>{' '}
          <button className="btn btn-secondary" onClick={() => openEdit(l)}>Edit</button>{' '}
          <button className="btn btn-danger" onClick={() => onDelete(l.id)}>Delete</button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Landlords</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add landlord</button>
      </div>
      <DataTable columns={columns} rows={rows} emptyMessage="No landlords yet." />
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit landlord' : 'New landlord'}
          submitLabel={editingId ? 'Save landlord' : 'Add landlord'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <FormField label="First name" htmlFor="firstName">
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
          </FormField>
          <FormField label="Email" htmlFor="email" error={emailError}>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
          </FormField>
        </Modal>
      )}

      {viewingLandlord && (
        <Modal title="View landlord" submitLabel="" onClose={closeView} onSubmit={(e) => e.preventDefault()} readOnly>
          <div className="field">
            <label htmlFor="view-firstName">First name</label>
            <input id="view-firstName" name="firstName" value={viewingLandlord.firstName} readOnly />
          </div>
          <div className="field">
            <label htmlFor="view-lastName">Last name</label>
            <input id="view-lastName" name="lastName" value={viewingLandlord.lastName} readOnly />
          </div>
          <div className="field">
            <label htmlFor="view-email">Email</label>
            <input id="view-email" name="email" value={viewingLandlord.email} readOnly />
          </div>
          <div className="field">
            <label htmlFor="view-phone">Phone</label>
            <input id="view-phone" name="phone" value={viewingLandlord.phone} readOnly />
          </div>
        </Modal>
      )}
    </>
  );
}

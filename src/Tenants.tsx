import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import ConfirmDialog from './ConfirmDialog';
import PhoneInput from './PhoneInput';
import { validateEmail } from './validation/email';
import type { IdProofType, Tenant, TenantFormValues } from './types';

export const ID_PROOF_TYPE_OPTIONS: IdProofType[] = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENCE'];

const empty: TenantFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  idProofType: '',
  idProofNumber: '',
};

const PAGE_SIZE = 10;

type Mode = 'create' | 'edit' | 'view';

interface TenantsProps {
  tenants: Tenant[];
  onAdd: (tenant: TenantFormValues) => void;
  onUpdate: (id: string, tenant: TenantFormValues) => void;
  onDelete: (id: string) => void;
}

/**
 * Pure rule for the "idProofNumber is required once idProofType is chosen" acceptance
 * criterion: returns undefined (valid) whenever idProofType is blank, regardless of
 * idProofNumber's value, and returns an error message when idProofType is set but
 * idProofNumber is blank. Exported so it can be unit-tested directly, mirroring
 * Listings.tsx's exported isWithinAvailabilityRange pattern.
 */
export function validateIdProofNumber(idProofType: IdProofType | '', idProofNumber: string): string | undefined {
  if (!idProofType) return undefined;
  return idProofNumber.trim() ? undefined : 'ID proof number is required once an ID proof type is selected.';
}

export default function Tenants({ tenants, onAdd, onUpdate, onDelete }: TenantsProps) {
  const [form, setForm] = useState<TenantFormValues>(empty);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [idProofError, setIdProofError] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(tenants.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = tenants.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailBlur = () => setEmailError(validateEmail(form.email));

  // Per clarification: clearing idProofType also clears idProofNumber and removes its
  // required validation, rather than leaving a stale value the user can no longer see a field
  // for.
  const handleIdProofTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const idProofType = e.target.value as IdProofType | '';
    if (!idProofType) {
      setForm({ ...form, idProofType, idProofNumber: '' });
      setIdProofError(undefined);
    } else {
      setForm({ ...form, idProofType });
    }
  };

  const handleIdProofNumberBlur = () =>
    setIdProofError(validateIdProofNumber(form.idProofType, form.idProofNumber));

  const close = () => {
    setOpen(false);
    setMode('create');
    setEditingId(null);
    setForm(empty);
    setEmailError(undefined);
    setIdProofError(undefined);
  };

  const openCreate = () => {
    setForm(empty);
    setMode('create');
    setEditingId(null);
    setEmailError(undefined);
    setIdProofError(undefined);
    setOpen(true);
  };

  const openEdit = (tenant: Tenant) => {
    const { id, ...values } = tenant;
    setForm(values);
    setMode('edit');
    setEditingId(id);
    setEmailError(undefined);
    setIdProofError(undefined);
    setOpen(true);
  };

  const openView = (tenant: Tenant) => {
    const { id, ...values } = tenant;
    setForm(values);
    setMode('view');
    setEditingId(id);
    setEmailError(undefined);
    setIdProofError(undefined);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'view') return;
    const emailErr = validateEmail(form.email);
    const idProofErr = validateIdProofNumber(form.idProofType, form.idProofNumber);
    setEmailError(emailErr);
    setIdProofError(idProofErr);
    if (emailErr || idProofErr) return;
    if (mode === 'edit' && editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);
  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const columns: DataTableColumn<Tenant>[] = [
    { key: 'name', header: 'Name', render: (t) => `${t.firstName} ${t.lastName}` },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <>
          <button className="btn btn-secondary" onClick={() => openView(t)}>View</button>{' '}
          <button className="btn btn-secondary" onClick={() => openEdit(t)}>Edit</button>{' '}
          <button className="btn btn-danger" onClick={() => requestDelete(t.id)}>Delete</button>
        </>
      ),
    },
  ];

  const title = mode === 'view' ? 'View tenant' : mode === 'edit' ? 'Edit tenant' : 'New tenant';
  const submitLabel = mode === 'edit' ? 'Save tenant' : 'Add tenant';

  return (
    <>
      <div className="page-header">
        <h1>Tenants</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add tenant</button>
      </div>
      <DataTable columns={columns} rows={rows} emptyMessage="No tenants yet." />
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal title={title} submitLabel={submitLabel} onClose={close} onSubmit={handleSubmit} readOnly={mode === 'view'}>
          <FormField label="First name" htmlFor="firstName">
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              disabled={mode === 'view'}
            />
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
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <PhoneInput
              id="phone"
              name="phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              required
            />
          </FormField>
          <FormField label="ID proof type" htmlFor="idProofType">
            <select
              id="idProofType"
              name="idProofType"
              value={form.idProofType}
              onChange={handleIdProofTypeChange}
              disabled={mode === 'view'}
            >
              <option value="">Select an ID proof type</option>
              {ID_PROOF_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
          <FormField label="ID proof number" htmlFor="idProofNumber" error={idProofError}>
            <input
              id="idProofNumber"
              name="idProofNumber"
              value={form.idProofNumber}
              onChange={handleChange}
              onBlur={handleIdProofNumberBlur}
              required={Boolean(form.idProofType)}
              disabled={mode === 'view' || !form.idProofType}
            />
          </FormField>
        </Modal>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete tenant"
          message="Are you sure you want to delete this tenant?"
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}

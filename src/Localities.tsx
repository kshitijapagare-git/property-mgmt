import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import AsyncSelect from './AsyncSelect';
import type { Landlord, Locality, LocalityFormValues } from './types';

const empty: LocalityFormValues = { name: '', pincode: '', city: '', zone: '', landlordId: '' };
const PAGE_SIZE = 10;
const PINCODE_PATTERN = /^\d{6}$/;

type Mode = 'create' | 'edit' | 'view';

interface LocalitiesProps {
  localities: Locality[];
  landlords: Landlord[];
  onAdd: (locality: LocalityFormValues) => void;
  onUpdate: (id: string, locality: LocalityFormValues) => void;
  onDelete: (id: string) => void;
}

export default function Localities({ localities, landlords, onAdd, onUpdate, onDelete }: LocalitiesProps) {
  const [form, setForm] = useState<LocalityFormValues>(empty);
  const [pincodeError, setPincodeError] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(localities.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = localities.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // landlordId is now driven by the AsyncSelect below, so this handler only ever needs to cover
  // the plain text inputs (name, pincode, city).
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLandlordChange = (landlordId: string) => setForm({ ...form, landlordId });

  const validatePincode = (value: string) =>
    PINCODE_PATTERN.test(value) ? undefined : 'Pincode must be exactly 6 digits';

  const handlePincodeBlur = () => setPincodeError(validatePincode(form.pincode));

  // AsyncSelect's loadOptions contract is async even though this data is already in memory —
  // wrapping the synchronous filter in a resolved Promise keeps this reusable once localities/
  // landlords come from a real API.
  const loadLandlordOptions = (query: string): Promise<Landlord[]> => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? landlords.filter(
          (l) =>
            l.firstName.toLowerCase().includes(q) ||
            l.lastName.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q)
        )
      : landlords;
    return Promise.resolve(filtered);
  };

  const close = () => {
    setOpen(false);
    setMode('create');
    setEditingId(null);
    setForm(empty);
    setPincodeError(undefined);
  };

  const openCreate = () => {
    setForm(empty);
    setMode('create');
    setEditingId(null);
    setPincodeError(undefined);
    setOpen(true);
  };

  const openEdit = (locality: Locality) => {
    const { id, ...values } = locality;
    setForm(values);
    setMode('edit');
    setEditingId(id);
    setPincodeError(undefined);
    setOpen(true);
  };

  const openView = (locality: Locality) => {
    const { id, ...values } = locality;
    setForm(values);
    setMode('view');
    setEditingId(id);
    setPincodeError(undefined);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'view') return;
    const error = validatePincode(form.pincode);
    if (error) {
      setPincodeError(error);
      return;
    }
    if (mode === 'edit' && editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    close();
  };

  const landlordName = (id: string) => {
    const l = landlords.find((x) => x.id === id);
    return l ? `${l.firstName} ${l.lastName}` : 'Unknown landlord';
  };

  const columns: DataTableColumn<Locality>[] = [
    { key: 'name', header: 'Name', render: (l) => l.name },
    { key: 'pincode', header: 'Pincode', render: (l) => l.pincode },
    { key: 'city', header: 'City', render: (l) => l.city },
    { key: 'landlord', header: 'Landlord', render: (l) => landlordName(l.landlordId) },
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

  const title = mode === 'view' ? 'View locality' : mode === 'edit' ? 'Edit locality' : 'New locality';
  const submitLabel = mode === 'edit' ? 'Save locality' : 'Add locality';

  return (
    <>
      <div className="page-header">
        <h1>Localities</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add locality</button>
      </div>
      <DataTable columns={columns} rows={rows} emptyMessage="No records found" />
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal title={title} submitLabel={submitLabel} onClose={close} onSubmit={handleSubmit} readOnly={mode === 'view'}>
          <FormField label="Name" htmlFor="name">
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="Pincode" htmlFor="pincode" error={pincodeError}>
            <input
              id="pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              onBlur={handlePincodeBlur}
              required
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="City" htmlFor="city">
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="Zone" htmlFor="zone">
            <input
              id="zone"
              name="zone"
              value={form.zone}
              onChange={handleChange}
              required
              disabled={mode === 'view'}
            />
          </FormField>
          <FormField label="Landlord" htmlFor="landlordId">
            {mode === 'view' ? (
              <input id="landlordId" value={landlordName(form.landlordId)} disabled readOnly />
            ) : (
              <AsyncSelect
                value={form.landlordId}
                onChange={handleLandlordChange}
                loadOptions={loadLandlordOptions}
                getId={(l) => l.id}
                getLabel={(l) => `${l.firstName} ${l.lastName}`}
                getSecondary={(l) => l.email}
              />
            )}
          </FormField>
        </Modal>
      )}
    </>
  );
}

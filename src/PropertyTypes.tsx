import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import DataTable from './DataTable';
import AsyncSelect from './AsyncSelect';
import CurrencyInput from './CurrencyInput';
import type { Column, PropertyType, PropertyTypeFormValues, PropertyTypeName, SelectOption } from './types';

const PAGE_SIZE = 10;

const nameOptions: SelectOption[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'PG', label: 'PG' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

// The form keeps `name` as `PropertyTypeName | ''` so the AsyncSelect can start unselected
// (mirroring the placeholder pattern every other AsyncSelect in the app uses); it's narrowed
// back to `PropertyTypeName` on submit, once the `required` attribute has guaranteed a choice.
interface PropertyTypeFormState {
  name: PropertyTypeName | '';
  defaultDeposit: number;
}

const empty: PropertyTypeFormState = { name: '', defaultDeposit: 0 };

interface PropertyTypesProps {
  propertyTypes: PropertyType[];
  onAdd: (propertyType: PropertyTypeFormValues) => void;
  onUpdate: (id: string, propertyType: PropertyTypeFormValues) => void;
  onDelete: (id: string) => void;
}

export default function PropertyTypes({
  propertyTypes,
  onAdd,
  onUpdate,
  onDelete,
}: PropertyTypesProps) {
  const [form, setForm] = useState<PropertyTypeFormState>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(propertyTypes.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = propertyTypes.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleNameChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, name: e.target.value as PropertyTypeName | '' });

  const handleDepositChange = (value: number) => setForm({ ...form, defaultDeposit: value });

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

  const openEdit = (propertyType: PropertyType) => {
    setEditingId(propertyType.id);
    setForm({
      name: propertyType.name,
      defaultDeposit: propertyType.defaultDeposit,
    });
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name) return;
    const values: PropertyTypeFormValues = {
      name: form.name,
      defaultDeposit: form.defaultDeposit,
    };
    if (editingId) {
      onUpdate(editingId, values);
    } else {
      onAdd(values);
    }
    close();
  };

  const columns: Column<PropertyType>[] = [
    { key: 'name', header: 'Name' },
    { key: 'defaultDeposit', header: 'Default deposit' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Property Types</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add property type</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(pt) => pt.id}
          emptyMessage="No property types yet."
          renderActions={(pt) => (
            <>
              <button className="btn btn-secondary" onClick={() => openEdit(pt)}>Edit</button>{' '}
              <button className="btn btn-danger" onClick={() => onDelete(pt.id)}>Delete</button>
            </>
          )}
        />
      </div>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      {open && (
        <Modal
          title={editingId ? 'Edit property type' : 'New property type'}
          submitLabel={editingId ? 'Save changes' : 'Add property type'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="name">Name</label>
            <AsyncSelect
              id="name"
              name="name"
              value={form.name}
              onChange={handleNameChange}
              options={nameOptions}
              placeholder="Select a type"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="defaultDeposit">Default deposit</label>
            <CurrencyInput
              id="defaultDeposit"
              name="defaultDeposit"
              value={form.defaultDeposit}
              onChange={handleDepositChange}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

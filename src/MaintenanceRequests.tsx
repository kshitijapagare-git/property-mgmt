import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import DataTable from './DataTable';
import type { DataTableColumn } from './DataTable';
import FormField from './FormField';
import CurrencyInput from './CurrencyInput';
import RichTextEditor from './RichTextEditor';
import MaintenanceBoard from './MaintenanceBoard';
import { applyStatusChange, getActiveLeaseOptions, isUrgentOverdue } from './maintenanceLogic';
import type {
  ChargeTo,
  Lease,
  MaintenanceCategory,
  MaintenanceFormValues,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
} from './types';

const CATEGORY_OPTIONS: MaintenanceCategory[] = ['PLUMBING', 'ELECTRICAL', 'APPLIANCE', 'STRUCTURAL', 'OTHER'];
const PRIORITY_OPTIONS: MaintenancePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_OPTIONS: MaintenanceStatus[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'];
const CHARGE_TO_OPTIONS: ChargeTo[] = ['OWNER', 'TENANT'];

const empty: MaintenanceFormValues = {
  leaseId: '',
  title: '',
  category: 'PLUMBING',
  priority: 'MEDIUM',
  description: '',
  reportedOn: '',
  status: 'OPEN',
  chargeTo: 'OWNER',
};

type ViewMode = 'board' | 'table';

interface MaintenanceRequestsProps {
  requests: MaintenanceRequest[];
  leases: Lease[];
  onAdd: (request: MaintenanceFormValues) => void;
  onUpdate: (id: string, request: MaintenanceFormValues) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, nextStatus: MaintenanceStatus, resolution?: { resolvedOn: string; cost: number }) => void;
}

/**
 * MaintenanceRequest screen: a switchable Kanban/DataTable view over the same `requests`, plus
 * the create/edit form. leaseId is sourced only from ACTIVE leases (getActiveLeaseOptions),
 * except while editing an existing request, whose own leaseId is kept selectable even if that
 * lease is no longer ACTIVE. The form's save path runs through the same maintenanceLogic.
 * applyStatusChange the Kanban board's drag handler uses, so a save can never skip the RESOLVED
 * gate either.
 */
export default function MaintenanceRequests({
  requests,
  leases,
  onAdd,
  onUpdate,
  onDelete,
  onStatusChange,
}: MaintenanceRequestsProps) {
  const [form, setForm] = useState<MaintenanceFormValues>(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const leaseOptions = (() => {
    const active = getActiveLeaseOptions(leases);
    if (editingId) {
      const current = leases.find((l) => l.id === form.leaseId);
      if (current && !active.some((l) => l.id === current.id)) {
        return [...active, current];
      }
    }
    return active;
  })();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLeaseChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, leaseId: e.target.value });

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, category: e.target.value as MaintenanceCategory });

  const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, priority: e.target.value as MaintenancePriority });

  const handleStatusChangeInForm = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, status: e.target.value as MaintenanceStatus });

  const handleChargeToChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setForm({ ...form, chargeTo: e.target.value as ChargeTo });

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
    setFormError(undefined);
  };

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setFormError(undefined);
    setOpen(true);
  };

  const openEdit = (request: MaintenanceRequest) => {
    const { id, ...values } = request;
    setForm(values);
    setEditingId(id);
    setFormError(undefined);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const existing = editingId ? requests.find((r) => r.id === editingId) : undefined;
    const base: MaintenanceRequest = existing
      ? { ...existing, ...form }
      : { ...form, id: 'draft' };

    const result = applyStatusChange(
      base,
      form.status,
      form.resolvedOn && form.cost ? { resolvedOn: form.resolvedOn, cost: form.cost } : undefined
    );

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    const values: MaintenanceFormValues = {
      leaseId: result.request.leaseId,
      title: result.request.title,
      category: result.request.category,
      priority: result.request.priority,
      description: result.request.description,
      reportedOn: result.request.reportedOn,
      status: result.request.status,
      resolvedOn: result.request.resolvedOn,
      cost: result.request.cost,
      chargeTo: result.request.chargeTo,
    };

    if (editingId) {
      onUpdate(editingId, values);
    } else {
      onAdd(values);
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

  const leaseLabel = (leaseId: string) => {
    const lease = leases.find((l) => l.id === leaseId);
    return lease ? `${lease.id} (${lease.status})` : 'Unknown lease';
  };

  const columns: DataTableColumn<MaintenanceRequest>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (r) => (
        <>
          {r.title}
          {isUrgentOverdue(r) && <span className="maintenance-table-badge-overdue">URGENT overdue</span>}
        </>
      ),
    },
    { key: 'lease', header: 'Lease', render: (r) => leaseLabel(r.leaseId) },
    { key: 'category', header: 'Category', render: (r) => r.category },
    { key: 'priority', header: 'Priority', render: (r) => r.priority },
    { key: 'status', header: 'Status', render: (r) => r.status },
    { key: 'reportedOn', header: 'Reported on', render: (r) => r.reportedOn },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <>
          <button className="btn btn-secondary" onClick={() => openEdit(r)}>Edit</button>{' '}
          <button className="btn btn-danger" onClick={() => requestDelete(r.id)}>Delete</button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Maintenance requests</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New request</button>
      </div>

      <div className="view-toggle">
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'board' ? 'active' : ''}`}
          onClick={() => setViewMode('board')}
        >
          Board
        </button>
        <button
          type="button"
          className={`view-toggle-option ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          Table
        </button>
      </div>

      {viewMode === 'board' ? (
        <MaintenanceBoard requests={requests} onStatusChange={onStatusChange} onSelect={openEdit} />
      ) : (
        <DataTable columns={columns} rows={requests} emptyMessage="No maintenance requests yet." />
      )}

      {open && (
        <Modal
          title={editingId ? 'Edit maintenance request' : 'New maintenance request'}
          submitLabel={editingId ? 'Save request' : 'Add request'}
          onClose={close}
          onSubmit={handleSubmit}
        >
          <FormField label="Lease" htmlFor="leaseId">
            <select id="leaseId" name="leaseId" value={form.leaseId} onChange={handleLeaseChange} required>
              <option value="">Select a lease</option>
              {leaseOptions.map((l) => (
                <option key={l.id} value={l.id}>{leaseLabel(l.id)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Title" htmlFor="title">
            <input id="title" name="title" value={form.title} onChange={handleChange} required />
          </FormField>
          <FormField label="Category" htmlFor="category">
            <select id="category" name="category" value={form.category} onChange={handleCategoryChange} required>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority" htmlFor="priority">
            <select id="priority" name="priority" value={form.priority} onChange={handlePriorityChange} required>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" htmlFor="description">
            <RichTextEditor value={form.description} onChange={(html) => setForm({ ...form, description: html })} />
          </FormField>
          <FormField label="Reported on" htmlFor="reportedOn">
            <input
              id="reportedOn"
              name="reportedOn"
              type="date"
              value={form.reportedOn}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Status" htmlFor="status" error={formError}>
            <select id="status" name="status" value={form.status} onChange={handleStatusChangeInForm} required>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>
          {form.status === 'RESOLVED' && (
            <>
              <FormField label="Resolved on" htmlFor="resolvedOn">
                <input
                  id="resolvedOn"
                  name="resolvedOn"
                  type="date"
                  value={form.resolvedOn ?? ''}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Cost" htmlFor="cost">
                <CurrencyInput
                  id="cost"
                  name="cost"
                  value={form.cost ?? 0}
                  onChange={(value) => setForm({ ...form, cost: value })}
                />
              </FormField>
            </>
          )}
          <FormField label="Charge to" htmlFor="chargeTo">
            <select id="chargeTo" name="chargeTo" value={form.chargeTo} onChange={handleChargeToChange} required>
              {CHARGE_TO_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
        </Modal>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete maintenance request"
          message="Are you sure you want to delete this maintenance request?"
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}

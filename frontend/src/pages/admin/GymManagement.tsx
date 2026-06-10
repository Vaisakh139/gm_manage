import { useEffect, useState } from 'react';
import { adminApi } from '../../api/axios';
import type { Gym } from '../../types';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

const empty = { gymName: '', address: '', phone: '', ownerName: '', ownerEmail: '', ownerPhone: '' };

export default function GymManagement() {
  const { showToast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Gym | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => adminApi.getGyms().then((r) => setGyms(r.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setModal(true); };
  const openEdit = (g: Gym) => {
    setEditing(g);
    setForm({ gymName: g.gymName, address: g.address ?? '', phone: g.phone ?? '', ownerName: g.ownerName, ownerEmail: g.ownerEmail, ownerPhone: '' });
    setModal(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      if (editing) await adminApi.updateGym(editing.id, { gymName: form.gymName, address: form.address, phone: form.phone });
      else await adminApi.createGym(form);
      showToast(editing ? 'Gym updated' : 'Gym created — credentials sent via email', 'success');
      setModal(false); load();
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error', 'error');
    } finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try { await adminApi.deleteGym(deleteId); showToast('Gym deleted', 'success'); load(); }
    catch { showToast('Failed to delete gym', 'error'); }
    finally { setDeleteId(null); }
  };

  const f = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gyms ({gyms.length})</h3>
        <button onClick={openCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          + Add Gym
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Gym Name', 'Owner', 'Phone', 'Owner Status', 'Actions'].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gyms.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{g.gymName}</td>
                <td className="px-5 py-3 text-gray-600">{g.ownerName}<br /><span className="text-xs text-gray-400">{g.ownerEmail}</span></td>
                <td className="px-5 py-3 text-gray-600">{g.phone ?? '—'}</td>
                <td className="px-5 py-3"><Badge label={g.ownerActive ? 'Active' : 'Inactive'} variant={g.ownerActive ? 'green' : 'red'} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(g)} className="text-gray-600 hover:text-gray-900 text-xs font-medium px-2 py-1 border border-gray-200 rounded">Edit</button>
                    <button onClick={() => setDeleteId(g.id)} className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-100 rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gyms.length === 0 && <p className="text-center text-gray-400 py-10">No gyms yet.</p>}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal} title={editing ? 'Edit Gym' : 'Add Gym'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <Field label="Gym Name" value={form.gymName} onChange={f('gymName')} />
          <Field label="Address" value={form.address} onChange={f('address')} />
          <Field label="Phone" value={form.phone} onChange={f('phone')} />
          {!editing && <>
            <hr className="border-gray-100" />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Owner Details</p>
            <Field label="Owner Name" value={form.ownerName} onChange={f('ownerName')} required />
            <Field label="Owner Email" type="email" value={form.ownerEmail} onChange={f('ownerEmail')} required />
            <Field label="Owner Phone" value={form.ownerPhone} onChange={f('ownerPhone')} />
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              Login credentials will be sent to the owner's email.
            </p>
          </>}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={loading}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={deleteId !== null} title="Confirm Delete" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this gym? This cannot be undone.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={value} onChange={onChange}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
    </div>
  );
}

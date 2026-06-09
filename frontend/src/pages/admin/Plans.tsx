import { useEffect, useState } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../api';
import type { MembershipPlan } from '../../types';

const empty = { name: '', description: '', durationMonths: '', price: '' };

export default function Plans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState('');

  const load = () => getPlans().then(r => setPlans(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setError(''); setModal(true); };
  const openEdit = (p: MembershipPlan) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', durationMonths: p.durationMonths.toString(), price: p.price.toString() });
    setError(''); setModal(true);
  };

  const save = async () => {
    try {
      const data = { ...form, durationMonths: Number(form.durationMonths), price: Number(form.price) };
      if (editing) await updatePlan(editing.id, data);
      else await createPlan(data);
      setModal(false); load();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving plan');
    }
  };

  const remove = async (id: number) => {
    if (confirm('Deactivate this plan?')) { await deletePlan(id); load(); }
  };

  const f = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="card">
      <div className="table-header">
        <h2>Membership Plans</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Plan</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Description</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td>{p.description}</td>
              <td>{p.durationMonths} month{p.durationMonths !== 1 ? 's' : ''}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td><span className={`badge ${p.active ? 'badge-green' : 'badge-red'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
              <td className="action-col">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Plan' : 'Add Plan'}</h2>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group"><label>Name</label><input value={form.name} onChange={f('name')} /></div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={f('description')} /></div>
            <div className="form-row">
              <div className="form-group"><label>Duration (months)</label><input type="number" value={form.durationMonths} onChange={f('durationMonths')} /></div>
              <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" value={form.price} onChange={f('price')} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

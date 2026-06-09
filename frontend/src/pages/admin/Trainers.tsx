import { useEffect, useState } from 'react';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../../api';
import type { Trainer } from '../../types';

const empty = { email: '', password: '', firstName: '', lastName: '', phone: '', specialization: '', bio: '' };

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState('');

  const load = () => getTrainers().then(r => setTrainers(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setError(''); setModal(true); };
  const openEdit = (t: Trainer) => {
    setEditing(t);
    setForm({ email: t.email, password: '', firstName: t.firstName, lastName: t.lastName, phone: t.phone || '', specialization: t.specialization || '', bio: t.bio || '' });
    setError(''); setModal(true);
  };

  const save = async () => {
    try {
      if (editing) await updateTrainer(editing.id, form);
      else await createTrainer(form);
      setModal(false); load();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving trainer');
    }
  };

  const remove = async (id: number) => {
    if (confirm('Deactivate this trainer?')) { await deleteTrainer(id); load(); }
  };

  const f = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="card">
      <div className="table-header">
        <h2>Trainers</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Trainer</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {trainers.map(t => (
            <tr key={t.id}>
              <td>{t.firstName} {t.lastName}</td>
              <td>{t.email}</td>
              <td>{t.phone}</td>
              <td>{t.specialization}</td>
              <td><span className={`badge ${t.active ? 'badge-green' : 'badge-red'}`}>{t.active ? 'Active' : 'Inactive'}</span></td>
              <td className="action-col">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Trainer' : 'Add Trainer'}</h2>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input value={form.firstName} onChange={f('firstName')} /></div>
              <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={f('lastName')} /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={f('email')} disabled={!!editing} /></div>
            <div className="form-group"><label>Password {editing && '(leave blank to keep)'}</label><input type="password" value={form.password} onChange={f('password')} /></div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={f('phone')} /></div>
              <div className="form-group"><label>Specialization</label><input value={form.specialization} onChange={f('specialization')} /></div>
            </div>
            <div className="form-group"><label>Bio</label><textarea rows={3} value={form.bio} onChange={f('bio')} /></div>
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

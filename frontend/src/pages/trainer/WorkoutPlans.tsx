import { useEffect, useState } from 'react';
import { getTrainerWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan, getMembers } from '../../api';
import type { WorkoutPlan, Member } from '../../types';

const empty = { memberId: '', title: '', description: '', exercises: '', startDate: '', endDate: '' };

export default function WorkoutPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<WorkoutPlan | null>(null);
  const [form, setForm] = useState({ ...empty });

  const load = () => getTrainerWorkoutPlans().then(r => setPlans(r.data));
  useEffect(() => {
    load();
    getMembers().then(r => setMembers(r.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setModal(true); };
  const openEdit = (w: WorkoutPlan) => {
    setEditing(w);
    setForm({ memberId: w.memberId.toString(), title: w.title, description: w.description || '', exercises: w.exercises || '', startDate: w.startDate || '', endDate: w.endDate || '' });
    setModal(true);
  };

  const save = async () => {
    const data = { ...form, memberId: Number(form.memberId) };
    if (editing) await updateWorkoutPlan(editing.id, data);
    else await createWorkoutPlan(data);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this workout plan?')) { await deleteWorkoutPlan(id); load(); }
  };

  const f = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="card">
      <div className="table-header">
        <h2>Workout Plans</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Plan</button>
      </div>
      <table>
        <thead><tr><th>Title</th><th>Member</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td><strong>{p.title}</strong></td>
              <td>{p.memberName}</td>
              <td>{p.startDate || '—'}</td>
              <td>{p.endDate || '—'}</td>
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
            <h2>{editing ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
            <div className="form-group"><label>Member</label>
              <select value={form.memberId} onChange={f('memberId')} disabled={!!editing}>
                <option value="">Select member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={f('title')} /></div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={f('description')} /></div>
            <div className="form-group"><label>Exercises</label><textarea rows={5} value={form.exercises} onChange={f('exercises')} placeholder="List exercises, sets, reps..." /></div>
            <div className="form-row">
              <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={f('startDate')} /></div>
              <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={f('endDate')} /></div>
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

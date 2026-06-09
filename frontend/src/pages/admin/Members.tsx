import { useEffect, useState } from 'react';
import { getMembers, createMember, updateMember, deleteMember, getPlans } from '../../api';
import type { Member, MembershipPlan } from '../../types';

const empty = { email: '', password: '', firstName: '', lastName: '', phone: '', address: '', membershipPlanId: '', joinDate: '', membershipExpiry: '' };

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState('');

  const load = () => getMembers().then(r => setMembers(r.data));

  useEffect(() => {
    load();
    getPlans().then(r => setPlans(r.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setError(''); setModal(true); };
  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ email: m.email, password: '', firstName: m.firstName, lastName: m.lastName, phone: m.phone || '', address: m.address || '', membershipPlanId: m.membershipPlanId?.toString() || '', joinDate: m.joinDate || '', membershipExpiry: m.membershipExpiry || '' });
    setError(''); setModal(true);
  };

  const save = async () => {
    try {
      const data = { ...form, membershipPlanId: form.membershipPlanId ? Number(form.membershipPlanId) : null };
      if (editing) await updateMember(editing.id, data);
      else await createMember(data);
      setModal(false); load();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving member');
    }
  };

  const remove = async (id: number) => {
    if (confirm('Deactivate this member?')) { await deleteMember(id); load(); }
  };

  return (
    <div className="card">
      <div className="table-header">
        <h2>Members</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Member</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id}>
              <td>{m.firstName} {m.lastName}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>{m.membershipPlanName || '—'}</td>
              <td>{m.membershipExpiry || '—'}</td>
              <td><span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>{m.active ? 'Active' : 'Inactive'}</span></td>
              <td className="action-col">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Member' : 'Add Member'}</h2>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editing} /></div>
            <div className="form-group"><label>Password {editing && '(leave blank to keep)'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group"><label>Membership Plan</label>
                <select value={form.membershipPlanId} onChange={e => setForm(f => ({ ...f, membershipPlanId: e.target.value }))}>
                  <option value="">None</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Join Date</label><input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} /></div>
              <div className="form-group"><label>Membership Expiry</label><input type="date" value={form.membershipExpiry} onChange={e => setForm(f => ({ ...f, membershipExpiry: e.target.value }))} /></div>
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

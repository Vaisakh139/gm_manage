import { useEffect, useState } from 'react';
import { getPayments, createPayment, updatePayment, deletePayment, getMembers, getPlans } from '../../api';
import type { Payment, Member, MembershipPlan, PaymentStatus } from '../../types';

const empty = { memberId: '', planId: '', amount: '', paymentDate: '', dueDate: '', status: 'PENDING' as PaymentStatus, paymentMethod: '', notes: '' };

const statusColors: Record<PaymentStatus, string> = { PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red' };

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState({ ...empty });

  const load = () => getPayments().then(r => setPayments(r.data));
  useEffect(() => { load(); getMembers().then(r => setMembers(r.data)); getPlans().then(r => setPlans(r.data)); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setModal(true); };
  const openEdit = (p: Payment) => {
    setEditing(p);
    setForm({ memberId: p.memberId.toString(), planId: p.planId?.toString() || '', amount: p.amount.toString(), paymentDate: p.paymentDate || '', dueDate: p.dueDate || '', status: p.status, paymentMethod: p.paymentMethod || '', notes: p.notes || '' });
    setModal(true);
  };

  const save = async () => {
    const data = { ...form, memberId: Number(form.memberId), planId: form.planId ? Number(form.planId) : null, amount: Number(form.amount) };
    if (editing) await updatePayment(editing.id, data);
    else await createPayment(data);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this payment?')) { await deletePayment(id); load(); }
  };

  return (
    <div className="card">
      <div className="table-header">
        <h2>Payments</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Payment</button>
      </div>
      <table>
        <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Date</th><th>Due</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.memberName}</td>
              <td>{p.planName || '—'}</td>
              <td>${Number(p.amount).toFixed(2)}</td>
              <td>{p.paymentDate || '—'}</td>
              <td>{p.dueDate || '—'}</td>
              <td>{p.paymentMethod || '—'}</td>
              <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
              <td className="action-col">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Payment' : 'Add Payment'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Member</label>
                <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
                  <option value="">Select...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Plan</label>
                <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))}>
                  <option value="">None</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PaymentStatus }))}>
                  <option>PENDING</option><option>PAID</option><option>OVERDUE</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Payment Date</label><input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Payment Method</label><input placeholder="Cash / Card / Online" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} /></div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
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

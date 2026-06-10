import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gymOwnerApi } from '../../api/axios';
import type { MemberStatus } from '../../types';
import { useToast } from '../../components/common/Toast';

const empty = { fullName: '', email: '', phone: '', membershipPlan: '', startDate: '', endDate: '', status: 'ACTIVE' as MemberStatus };

export default function AddEditMember() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      gymOwnerApi.getMember(Number(id)).then((r) => {
        const m = r.data.data;
        setForm({ fullName: m.fullName, email: m.email, phone: m.phone ?? '', membershipPlan: m.membershipPlan ?? '', startDate: m.startDate ?? '', endDate: m.endDate ?? '', status: m.status });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form, startDate: form.startDate || null, endDate: form.endDate || null };
      if (isEdit) await gymOwnerApi.updateMember(Number(id), payload);
      else await gymOwnerApi.addMember(payload);
      showToast(isEdit ? 'Member updated' : 'Member added — credentials sent via email', 'success');
      navigate('/gym-owner/members');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving member');
    } finally { setLoading(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{isEdit ? 'Edit Member' : 'Add Member'}</h3>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *" value={form.fullName} onChange={f('fullName')} required />
            <Field label="Phone" value={form.phone} onChange={f('phone')} />
          </div>
          <Field label="Email *" type="email" value={form.email} onChange={f('email')} required disabled={isEdit} />
          <Field label="Membership Plan" value={form.membershipPlan} onChange={f('membershipPlan')} placeholder="e.g. Basic, Premium" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" type="date" value={form.startDate} onChange={f('startDate')} />
            <Field label="End Date" type="date" value={form.endDate} onChange={f('endDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={f('status')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {!isEdit && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              Login credentials will be emailed to the member.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/gym-owner/members')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {loading ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, disabled = false, placeholder = '' }:
  { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} required={required} disabled={disabled} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500" />
    </div>
  );
}

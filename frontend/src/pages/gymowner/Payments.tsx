import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type {
  Gym, Member, MembershipPlan, Payment, PaymentDashboard,
  PaymentFormData, PaymentMethod, PaymentStatus,
} from '../../types';
import { paymentApi, gymOwnerApi, planApi } from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

const PM_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash', UPI: 'UPI', CARD: 'Card', BANK_TRANSFER: 'Bank Transfer',
};
const PS_VARIANT: Record<PaymentStatus, 'green' | 'yellow' | 'red'> = {
  PAID: 'green', PENDING: 'yellow', FAILED: 'red',
};

const emptyForm: PaymentFormData = {
  memberId: '', membershipPlanId: '', amount: 0,
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'CASH', status: 'PAID', notes: '',
};

function fmt(n: number) { return `₹${Number(n).toFixed(2)}`; }

export default function Payments() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gyms, setGyms]             = useState<Gym[]>([]);
  const [members, setMembers]       = useState<Member[]>([]);
  const [plans, setPlans]           = useState<MembershipPlan[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );

  const [payments, setPayments]     = useState<Payment[]>([]);
  const [dashboard, setDashboard]   = useState<PaymentDashboard | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [tab, setTab]               = useState<'all' | 'pending'>('all');

  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState<Payment | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<PaymentFormData>({ defaultValues: emptyForm });

  // Load gyms
  useEffect(() => {
    gymOwnerApi.getMyGyms().then((r) => {
      const list: Gym[] = r.data.data;
      setGyms(list);
      if (!selectedGymId && list.length > 0) setSelectedGymId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedGymId) setSearchParams({ gymId: String(selectedGymId) }, { replace: true });
  }, [selectedGymId]);

  // Load members + plans for the selected gym (for the form dropdowns)
  useEffect(() => {
    if (!selectedGymId) return;
    gymOwnerApi.getMembers(selectedGymId, '', 0, 200).then((r) => setMembers(r.data.data.content));
    planApi.getPlans(selectedGymId).then((r) => setPlans(r.data.data));
  }, [selectedGymId]);

  const load = useCallback(() => {
    if (!selectedGymId) return;
    setLoading(true);
    Promise.all([
      tab === 'all'
        ? paymentApi.getPayments(selectedGymId).then((r) => setPayments(r.data.data.content))
        : paymentApi.getPending(selectedGymId).then((r) => setPayments(r.data.data)),
      paymentApi.getDashboard(selectedGymId).then((r) => setDashboard(r.data.data)),
    ])
      .catch(() => setError('Failed to load payments'))
      .finally(() => setLoading(false));
  }, [selectedGymId, tab]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({ ...emptyForm, paymentDate: new Date().toISOString().slice(0, 10) });
    setModal(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    reset({
      memberId: p.memberId, membershipPlanId: p.membershipPlanId ?? '',
      amount: p.amount, paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod, status: p.status,
      notes: p.notes ?? '',
    });
    setModal(true);
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedGymId) return;
    setSaving(true);
    const payload = { ...data, membershipPlanId: data.membershipPlanId || null };
    try {
      if (editing) {
        await paymentApi.update(editing.id, payload);
        showToast('Payment updated', 'success');
      } else {
        await paymentApi.record(selectedGymId, payload);
        showToast('Payment recorded', 'success');
      }
      setModal(false);
      load();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await paymentApi.remove(deleteId); showToast('Payment deleted', 'success'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setDeleteId(null); }
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Record Payment
          </button>
        )}
      </div>

      {/* Gym selector */}
      {gyms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {gyms.map((g) => (
            <button key={g.id} onClick={() => setSelectedGymId(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedGymId === g.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              🏢 {g.gymName}
            </button>
          ))}
        </div>
      )}

      {/* Revenue stats */}
      {dashboard && (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: "Today's Revenue",  value: fmt(dashboard.todayRevenue),    icon: '📅', color: 'border-blue-400' },
            { label: 'Monthly Revenue',  value: fmt(dashboard.monthlyRevenue),  icon: '📆', color: 'border-indigo-400' },
            { label: 'Total Revenue',    value: fmt(dashboard.totalRevenue),    icon: '💰', color: 'border-green-400' },
            { label: 'Pending Amount',   value: fmt(dashboard.pendingAmount),   icon: '⏳', color: 'border-yellow-400' },
            { label: 'Pending Payments', value: String(dashboard.pendingPaymentsCount), icon: '🔔', color: 'border-red-400' },
          ].map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border-l-4 border border-gray-200 ${c.color} p-4`}>
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-xl font-bold text-gray-900">{c.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t === 'all' ? 'All Payments' : 'Pending Only'}
          </button>
        ))}
      </div>

      {/* Payment table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Member', 'Plan', 'Amount', 'Date', 'Method', 'Status', 'Notes', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.memberName}</p>
                    <p className="text-xs text-gray-400">{p.memberEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.membershipPlanName ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.paymentDate}</td>
                  <td className="px-4 py-3 text-gray-600">{PM_LABELS[p.paymentMethod]}</td>
                  <td className="px-4 py-3"><Badge label={p.status} variant={PS_VARIANT[p.status]} /></td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                      <button onClick={() => setDeleteId(p.id)} className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded hover:bg-red-100">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && payments.length === 0 && (
          <p className="text-center text-gray-400 py-10">No payments found.</p>
        )}
      </div>

      {/* Monthly summary */}
      {dashboard && dashboard.monthlySummary.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900">Monthly Revenue Summary</h4>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Month', 'Payments', 'Revenue'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboard.monthlySummary.slice(0, 12).map((m) => (
                <tr key={`${m.year}-${m.month}`} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{m.monthLabel}</td>
                  <td className="px-5 py-3 text-gray-600">{m.count}</td>
                  <td className="px-5 py-3 font-bold text-green-700">{fmt(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record / Edit Modal */}
      <Modal open={modal} title={editing ? 'Edit Payment' : 'Record Payment'} onClose={() => setModal(false)} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member <span className="text-red-500">*</span></label>
              <select {...register('memberId', { required: 'Member is required' })}
                disabled={!!editing}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 disabled:bg-gray-50">
                <option value="">Select member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
              </select>
              {errors.memberId && <p className="mt-1 text-xs text-red-600">{errors.memberId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership Plan</label>
              <select {...register('membershipPlanId')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
                <option value="">None</option>
                {plans.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
              <input type="number" min={0} step="0.01" {...register('amount', { required: 'Amount is required', min: { value: 0, message: 'Must be ≥ 0' }, valueAsNumber: true })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-500">*</span></label>
              <input type="date" {...register('paymentDate', { required: 'Date is required' })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
              {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select {...register('paymentMethod')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
                {(Object.keys(PM_LABELS) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>{PM_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="Optional notes…"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Update' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteId !== null} title="Delete Payment" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Delete this payment record? This cannot be undone.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

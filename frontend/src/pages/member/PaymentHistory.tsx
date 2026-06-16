import { useEffect, useState } from 'react';
import type { Payment, PaymentMethod, PaymentStatus } from '../../types';
import { paymentApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';

const PM_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash', UPI: 'UPI', CARD: 'Card', BANK_TRANSFER: 'Bank Transfer',
};
const PS_VARIANT: Record<PaymentStatus, 'green' | 'yellow' | 'red'> = {
  PAID: 'green', PENDING: 'yellow', FAILED: 'red',
};

function fmt(n: number) { return `₹${Number(n).toFixed(2)}`; }

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<PaymentStatus | 'ALL'>('ALL');

  useEffect(() => {
    paymentApi.getMyPayments()
      .then((r) => setPayments(r.data.data))
      .catch(() => setError('Failed to load payment history'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? payments : payments.filter((p) => p.status === filter);

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((s, p) => s + Number(p.amount), 0);

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-700">{fmt(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Paid</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">
            {payments.filter((p) => p.status === 'PENDING').length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Records</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PAID', 'PENDING', 'FAILED'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'ALL' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Payment list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400">No payment records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Plan', 'Amount', 'Date', 'Method', 'Status', 'Notes'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.membershipPlanName ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.paymentDate}</td>
                  <td className="px-4 py-3 text-gray-600">{PM_LABELS[p.paymentMethod]}</td>
                  <td className="px-4 py-3"><Badge label={p.status} variant={PS_VARIANT[p.status]} /></td>
                  <td className="px-4 py-3 text-gray-500">{p.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

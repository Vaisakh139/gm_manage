import { useEffect, useState } from 'react';
import { getMyPayments } from '../../api';
import type { Payment, PaymentStatus } from '../../types';

const statusColors: Record<PaymentStatus, string> = { PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red' };

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    getMyPayments().then(r => setPayments(r.data));
  }, []);

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter(p => p.status === 'PENDING').length;

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card green">
          <div className="stat-value">${totalPaid.toFixed(2)}</div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending Payments</div>
        </div>
      </div>
      <div className="card">
        <div className="table-header"><h2>Payment History</h2></div>
        {payments.length === 0
          ? <div className="empty-state">No payment records found.</div>
          : (
            <table>
              <thead><tr><th>Plan</th><th>Amount</th><th>Date</th><th>Due</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.planName || '—'}</td>
                    <td>${Number(p.amount).toFixed(2)}</td>
                    <td>{p.paymentDate || '—'}</td>
                    <td>{p.dueDate || '—'}</td>
                    <td>{p.paymentMethod || '—'}</td>
                    <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </>
  );
}

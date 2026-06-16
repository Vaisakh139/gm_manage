import { useEffect, useState } from 'react';
import type { Attendance } from '../../types';
import { attendanceApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

export default function AttendanceHistory() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    attendanceApi.getMyHistory()
      .then((r) => { setRecords(r.data.data); setError(''); })
      .catch(() => setError('Failed to load attendance history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Check if there's an open record today
  const todayStr = new Date().toISOString().slice(0, 10);
  const openToday = records.find((r) => r.attendanceDate === todayStr && r.active);

  const handleSelfAction = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.selfCheckIn();
      const updated: Attendance = res.data.data;
      showToast(updated.active ? '✅ Checked in successfully!' : '👋 Checked out successfully!', 'success');
      load();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const totalVisits = records.length;
  const thisMonth   = records.filter((r) => r.attendanceDate.startsWith(todayStr.slice(0, 7))).length;

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>

      {/* Auto check-in / check-out button */}
      <div className={`rounded-xl border-2 p-6 flex items-center justify-between ${
        openToday ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
      }`}>
        <div>
          {openToday ? (
            <>
              <p className="font-bold text-green-800 text-base">You're checked in 🟢</p>
              <p className="text-sm text-green-600 mt-0.5">Check-in time: {openToday.checkInTime.slice(0, 5)}</p>
            </>
          ) : (
            <>
              <p className="font-bold text-gray-900 text-base">Not checked in today</p>
              <p className="text-sm text-gray-500 mt-0.5">{todayStr}</p>
            </>
          )}
        </div>
        <button onClick={handleSelfAction} disabled={actionLoading}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
            openToday
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-900 hover:bg-gray-700 text-white'
          }`}>
          {actionLoading ? '…' : openToday ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
          <p className="text-xs text-gray-500 mt-0.5">Visits this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total visits</p>
        </div>
      </div>

      {/* History table */}
      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500">No attendance records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Date', 'Check-In', 'Check-Out', 'Duration', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((a) => {
                const dur = a.checkOutTime
                  ? (() => {
                      const [inH, inM] = a.checkInTime.split(':').map(Number);
                      const [outH, outM] = a.checkOutTime.split(':').map(Number);
                      const mins = (outH * 60 + outM) - (inH * 60 + inM);
                      return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '—';
                    })()
                  : '—';
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.attendanceDate}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{a.checkInTime.slice(0, 5)}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{a.checkOutTime ? a.checkOutTime.slice(0, 5) : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{dur}</td>
                    <td className="px-4 py-3">
                      <Badge label={a.active ? 'Inside' : 'Completed'} variant={a.active ? 'green' : 'gray'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

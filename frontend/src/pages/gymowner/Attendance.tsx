import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Attendance, AttendanceDashboard, Gym, Member } from '../../types';
import { attendanceApi, gymOwnerApi } from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

export default function AttendancePage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gyms, setGyms]           = useState<Gym[]>([]);
  const [members, setMembers]     = useState<Member[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dashboard, setDashboard]   = useState<AttendanceDashboard | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [modal, setModal]   = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    memberId: number | ''; checkInTime: string;
  }>({ defaultValues: { memberId: '', checkInTime: new Date().toTimeString().slice(0, 5) } });

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

  // Load members for the check-in form dropdown
  useEffect(() => {
    if (!selectedGymId) return;
    gymOwnerApi.getMembers(selectedGymId, '', 0, 200).then((r) => setMembers(r.data.data.content));
  }, [selectedGymId]);

  const load = useCallback(() => {
    if (!selectedGymId) return;
    setLoading(true);
    Promise.all([
      attendanceApi.getByDate(selectedGymId, selectedDate).then((r) => setAttendance(r.data.data)),
      attendanceApi.getDashboard(selectedGymId).then((r) => setDashboard(r.data.data)),
    ])
      .catch(() => setError('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [selectedGymId, selectedDate]);

  useEffect(() => { load(); }, [load]);

  const onCheckIn = async (data: { memberId: number | ''; checkInTime: string }) => {
    if (!selectedGymId || !data.memberId) return;
    setSaving(true);
    try {
      await attendanceApi.checkIn(selectedGymId, {
        memberId: data.memberId,
        attendanceDate: selectedDate,
        checkInTime: data.checkInTime + ':00',
      });
      showToast('Member checked in', 'success');
      setModal(false);
      reset();
      load();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error',
        'error'
      );
    } finally { setSaving(false); }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await attendanceApi.checkOut(id);
      showToast('Member checked out', 'success');
      load();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error',
        'error'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this attendance record?')) return;
    await attendanceApi.deleteAtt(id);
    showToast('Deleted', 'success');
    load();
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <button onClick={() => { reset({ memberId: '', checkInTime: new Date().toTimeString().slice(0, 5) }); setModal(true); }}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Mark Attendance
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

      {/* Dashboard stats */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Today's Check-ins",  value: dashboard.todayCount,          icon: '📅', color: 'border-blue-400' },
            { label: 'Monthly Check-ins',  value: dashboard.monthlyCount,        icon: '📆', color: 'border-indigo-400' },
            { label: 'Currently Inside',   value: dashboard.currentlyActiveCount, icon: '🟢', color: 'border-green-400' },
          ].map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border-l-4 border border-gray-200 ${c.color} p-5`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-xs text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Date picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input type="date" value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={today}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
        <button onClick={() => setSelectedDate(today)}
          className="text-sm text-gray-500 hover:text-gray-900 underline">Today</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      {/* Attendance list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Member', 'Check-In', 'Check-Out', 'Duration', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((a) => {
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
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.memberName}</p>
                      <p className="text-xs text-gray-400">{a.memberEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{a.checkInTime.slice(0, 5)}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{a.checkOutTime ? a.checkOutTime.slice(0, 5) : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{dur}</td>
                    <td className="px-4 py-3">
                      <Badge label={a.active ? 'Inside' : 'Left'} variant={a.active ? 'green' : 'gray'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {a.active && (
                          <button onClick={() => handleCheckOut(a.id)}
                            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded hover:bg-blue-100 font-medium">
                            Check Out
                          </button>
                        )}
                        <button onClick={() => handleDelete(a.id)}
                          className="text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded hover:bg-red-100">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && attendance.length === 0 && (
          <p className="text-center text-gray-400 py-10">No attendance records for {selectedDate}.</p>
        )}
      </div>

      {/* Monthly daily chart (text) */}
      {dashboard && dashboard.dailyCounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900">Monthly Breakdown</h4>
          </div>
          <div className="p-5 grid grid-cols-7 gap-2">
            {dashboard.dailyCounts.map((d) => (
              <div key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className="text-center cursor-pointer group">
                <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${d.date === selectedDate ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'}`}>
                  {d.count}
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(d.date + 'T00:00:00').getDate()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in modal */}
      <Modal open={modal} title="Mark Attendance" onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit(onCheckIn)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member <span className="text-red-500">*</span></label>
            <select {...register('memberId', { required: 'Please select a member' })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900">
              <option value="">Select member…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
            </select>
            {errors.memberId && <p className="mt-1 text-xs text-red-600">{errors.memberId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Time</label>
            <input type="time" {...register('checkInTime')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900" />
          </div>
          <p className="text-xs text-gray-400">Date: {selectedDate}</p>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Check In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

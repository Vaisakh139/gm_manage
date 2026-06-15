import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gymOwnerApi } from '../../api/axios';
import type { GymOwnerDashboard } from '../../types';

export default function GymOwnerDashboard() {
  const [data, setData] = useState<GymOwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gymOwnerApi.getDashboard()
      .then((r) => setData(r.data.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;
  if (!data) return null;

  const memberCards = [
    { label: 'Total Gyms',    value: data.totalGyms,     icon: '🏢', color: 'border-blue-500' },
    { label: 'Total Members', value: data.totalMembers,  icon: '👥', color: 'border-indigo-500' },
    { label: 'Active',        value: data.activeMembers, icon: '✅', color: 'border-green-500' },
    { label: 'Expired',       value: data.expiredMembers, icon: '⚠️', color: 'border-red-500' },
  ];

  const equipCards = [
    { label: 'Total Equipment', value: data.totalEquipments,        icon: '🏋️', color: 'border-blue-400' },
    { label: 'Available',       value: data.availableEquipments,    icon: '✅',  color: 'border-green-400' },
    { label: 'Out of Service',  value: data.outOfServiceEquipments, icon: '🚫',  color: 'border-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Member stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Members</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {memberCards.map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border-l-4 border border-gray-200 ${c.color} p-5`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Equipment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {equipCards.map((c) => (
            <div key={c.label} className={`bg-white rounded-xl border-l-4 border border-gray-200 ${c.color} p-5`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-gym breakdown — stats only, no action links */}
      {data.gymStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Gym Branches</h3>
            <Link to="/gym-owner/profile" className="text-sm text-red-600 hover:underline">
              Manage Gyms →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Branch', 'Location', 'Members', 'Active', 'Equipment', 'Available'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.gymStats.map((g) => (
                <tr key={g.gymId} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{g.gymName}</td>
                  <td className="px-5 py-3 text-gray-500">{g.address ?? '—'}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{g.totalMembers}</td>
                  <td className="px-5 py-3 font-semibold text-green-700">{g.activeMembers}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{g.totalEquipments}</td>
                  <td className="px-5 py-3 font-semibold text-green-700">{g.availableEquipments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

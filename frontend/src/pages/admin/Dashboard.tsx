import { useEffect, useState } from 'react';
import { adminApi } from '../../api/axios';
import type { DashboardStats } from '../../types';

function StatCard({ label, value, icon, sub }: { label: string; value: number | string; icon: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      {[0, 1].map((s) => (
        <div key={s}>
          <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Gyms & Members */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Gyms & Members</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Gyms"       value={stats.totalGyms}     icon="🏢" />
          <StatCard label="Total Members"    value={stats.totalMembers}  icon="👥" sub={`${stats.activeMembers} active`} />
          <StatCard label="Gym Owners"       value={stats.totalGymOwners} icon="👔" sub={`${stats.activeGymOwners} active`} />
          <StatCard label="Active Members"   value={stats.activeMembers}  icon="✅" />
        </div>
      </div>

      {/* Equipment */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Equipment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Equipment"        value={stats.totalEquipments}            icon="🏋️" />
          <StatCard label="Available"              value={stats.availableEquipments}         icon="✅" />
          <StatCard label="Under Maintenance"      value={stats.equipmentsUnderMaintenance}  icon="🔧" />
        </div>
      </div>
    </div>
  );
}

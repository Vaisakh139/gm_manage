import { useEffect, useState } from 'react';
import { adminApi } from '../../api/axios';
import type { DashboardStats } from '../../types';

function StatCard({ label, value, icon, sub }: { label: string; value: number; icon: string; sub?: string }) {
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

  useEffect(() => { adminApi.getStats().then((r) => setStats(r.data.data)); }, []);

  if (!stats) return <div className="text-gray-400 text-center py-16">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Gyms" value={stats.totalGyms} icon="🏢" />
          <StatCard label="Gym Owners" value={stats.totalGymOwners} icon="👔"
            sub={`${stats.activeGymOwners} active`} />
          <StatCard label="Total Members" value={stats.totalMembers} icon="👥"
            sub={`${stats.activeMembers} active`} />
          <StatCard label="Active Members" value={stats.activeMembers} icon="✅" />
        </div>
      </div>
    </div>
  );
}

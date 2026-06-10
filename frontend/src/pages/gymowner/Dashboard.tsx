import { useEffect, useState } from 'react';
import { gymOwnerApi } from '../../api/axios';
import type { GymOwnerDashboard } from '../../types';
import { Link } from 'react-router-dom';

export default function GymOwnerDashboard() {
  const [data, setData] = useState<GymOwnerDashboard | null>(null);

  useEffect(() => { gymOwnerApi.getDashboard().then((r) => setData(r.data.data)); }, []);

  if (!data) return <div className="text-gray-400 text-center py-16">Loading…</div>;

  const cards = [
    { label: 'Total Members', value: data.totalMembers, icon: '👥', color: 'border-blue-500' },
    { label: 'Active', value: data.activeMembers, icon: '✅', color: 'border-green-500' },
    { label: 'Inactive', value: data.inactiveMembers, icon: '⏸', color: 'border-gray-400' },
    { label: 'Expired', value: data.expiredMembers, icon: '⚠️', color: 'border-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 text-lg">{data.gymName}</h3>
        <p className="text-gray-500 text-sm mt-1">Your gym overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`bg-white rounded-xl border-l-4 border border-gray-200 ${c.color} p-5`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Link to="/gym-owner/members/add"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          + Add Member
        </Link>
        <Link to="/gym-owner/members"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          View All Members
        </Link>
      </div>
    </div>
  );
}

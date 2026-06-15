import { useEffect, useState } from 'react';
import type { Equipment, EquipmentStatus } from '../../types';
import { getMemberEquipments } from '../../services/equipmentService';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import Badge from '../../components/ui/Badge';

const statusVariant: Record<EquipmentStatus, 'green' | 'yellow' | 'red'> = {
  AVAILABLE:         'green',
  UNDER_MAINTENANCE: 'yellow',
  OUT_OF_SERVICE:    'red',
};

type Filter = 'ALL' | EquipmentStatus;

export default function MemberEquipment() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMemberEquipments()
      .then((data) => { setEquipments(data); setError(''); })
      .catch((e: Error) => setError(e.message ?? 'Failed to load equipment'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = equipments.filter((eq) => {
    const matchStatus = filter === 'ALL' || eq.status === filter;
    const matchSearch = search === '' ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      (eq.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Gym Equipment ({filtered.length})</h3>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search equipment…"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 w-64" />
        <div className="flex gap-2">
          {(['ALL', 'AVAILABLE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'] as Filter[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {(['AVAILABLE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'] as EquipmentStatus[]).map((s) => {
          const count = equipments.filter((e) => e.status === s).length;
          return (
            <div key={s} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs">
              <Badge label={s.replace('_', ' ')} variant={statusVariant[s]} />
              <span className="font-semibold text-gray-900">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Equipment grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-gray-500">No equipment found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} readOnly />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { adminApi } from '../../api/axios';
import type { GymUser } from '../../types';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/common/Toast';

type RoleFilter = 'ALL' | 'GYM_OWNER' | 'MEMBER';

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<RoleFilter>('ALL');

  const load = () => {
    setLoading(true);
    adminApi.getUsers()
      .then((r) => { setUsers(r.data.data); setError(''); })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (user: GymUser) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.active);
      showToast(`User ${user.active ? 'disabled' : 'enabled'}`, 'success');
      load();
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const filtered = filter === 'ALL' ? users : users.filter((u) => u.role === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Users {!loading && `(${filtered.length})`}</h3>
        <div className="flex gap-2">
          {(['ALL', 'GYM_OWNER', 'MEMBER'] as RoleFilter[]).map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {r === 'ALL' ? 'All' : r === 'GYM_OWNER' ? 'Gym Owners' : 'Members'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Name', 'Email', 'Phone', 'Role', 'Status', 'Pwd Changed', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3 text-gray-600">{u.phone ?? '—'}</td>
                  <td className="px-5 py-3">
                    <Badge label={u.role === 'GYM_OWNER' ? 'Gym Owner' : 'Member'}
                      variant={u.role === 'GYM_OWNER' ? 'blue' : 'gray'} />
                  </td>
                  <td className="px-5 py-3"><Badge label={u.active ? 'Active' : 'Inactive'} variant={u.active ? 'green' : 'red'} /></td>
                  <td className="px-5 py-3"><Badge label={u.passwordChanged ? 'Yes' : 'No'} variant={u.passwordChanged ? 'green' : 'yellow'} /></td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggle(u)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        u.active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}>
                      {u.active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">No users found.</p>
        )}
      </div>
    </div>
  );
}

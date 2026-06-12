import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gymOwnerApi } from '../../api/axios';
import type { Gym, Member, PageResponse } from '../../types';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/common/Toast';

const statusVariant = { ACTIVE: 'green', INACTIVE: 'gray', EXPIRED: 'red' } as const;

export default function MembersList() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    searchParams.get('gymId') ? Number(searchParams.get('gymId')) : null
  );

  const [data, setData] = useState<PageResponse<Member> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load gym list on mount
  useEffect(() => {
    gymOwnerApi.getMyGyms().then((r) => {
      const list: Gym[] = r.data.data;
      setGyms(list);
      // Auto-select first gym if none selected
      if (!selectedGymId && list.length > 0) {
        setSelectedGymId(list[0].id);
      }
    });
  }, []);

  // Sync gymId to URL param
  useEffect(() => {
    if (selectedGymId) setSearchParams({ gymId: String(selectedGymId) }, { replace: true });
  }, [selectedGymId]);

  const load = useCallback(() => {
    if (!selectedGymId) return;
    setLoading(true);
    gymOwnerApi.getMembers(selectedGymId, search, page, 10)
      .then((r) => { setData(r.data.data); setError(''); })
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false));
  }, [selectedGymId, search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, selectedGymId]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await gymOwnerApi.deleteMember(deleteId);
      showToast('Member deleted', 'success');
      load();
    } catch { showToast('Failed to delete member', 'error'); }
    finally { setDeleteId(null); }
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Members</h3>
          {selectedGym && <p className="text-sm text-gray-500 mt-0.5">📍 {selectedGym.gymName}</p>}
        </div>
        {selectedGymId && (
          <Link to={`/gym-owner/members/add?gymId=${selectedGymId}`}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Add Member
          </Link>
        )}
      </div>

      {/* Gym selector */}
      {gyms.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {gyms.map((g) => (
            <button key={g.id} onClick={() => setSelectedGymId(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedGymId === g.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              🏢 {g.gymName}
            </button>
          ))}
        </div>
      )}

      {gyms.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-700 text-sm">
          No gyms found. <Link to="/gym-owner/profile" className="underline font-medium">Create a gym first</Link>.
        </div>
      )}

      {selectedGymId && (
        <>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full max-w-sm px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />

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
                  <tr>{['Name', 'Email', 'Phone', 'Plan', 'Start', 'End', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.content.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{m.fullName}</td>
                      <td className="px-5 py-3 text-gray-600">{m.email}</td>
                      <td className="px-5 py-3 text-gray-600">{m.phone ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{m.membershipPlan ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{m.startDate ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{m.endDate ?? '—'}</td>
                      <td className="px-5 py-3"><Badge label={m.status} variant={statusVariant[m.status]} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link to={`/gym-owner/members/${m.id}/edit?gymId=${selectedGymId}`}
                            className="text-gray-600 hover:text-gray-900 text-xs font-medium px-2 py-1 border border-gray-200 rounded">Edit</Link>
                          <button onClick={() => setDeleteId(m.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-100 rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && data?.content.length === 0 && (
              <p className="text-center text-gray-400 py-10">No members found in this gym.</p>
            )}
          </div>

          {data && data.totalPages > 1 && !loading && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500">
                Showing {page * 10 + 1}–{Math.min((page + 1) * 10, data.totalElements)} of {data.totalElements}
              </p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                <button disabled={data.last} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={deleteId !== null} title="Confirm Delete" onClose={() => setDeleteId(null)} size="sm">
        <p className="text-gray-600 text-sm">Delete this member? This will also remove their login account.</p>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

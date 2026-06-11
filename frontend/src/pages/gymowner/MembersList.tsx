import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gymOwnerApi } from '../../api/axios';
import type { Member, PageResponse } from '../../types';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/common/Toast';

const statusVariant = { ACTIVE: 'green', INACTIVE: 'gray', EXPIRED: 'red' } as const;

export default function MembersList() {
  const { showToast } = useToast();
  const [data, setData] = useState<PageResponse<Member> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    gymOwnerApi.getMembers(search, page, 10)
      .then((r) => { setData(r.data.data); setError(''); })
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await gymOwnerApi.deleteMember(deleteId);
      showToast('Member deleted', 'success');
      load();
    } catch {
      showToast('Failed to delete member', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Members {data ? `(${data.totalElements})` : ''}
        </h3>
        <Link to="/gym-owner/members/add"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          + Add Member
        </Link>
      </div>

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
                  <td className="px-5 py-3">
                    <Badge label={m.status} variant={statusVariant[m.status]} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link to={`/gym-owner/members/${m.id}/edit`}
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
          <p className="text-center text-gray-400 py-10">No members found.</p>
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

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { gymOwnerApi } from '../../api/axios';
import type { Gym } from '../../types';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/common/Toast';

const emptyForm = { gymName: '', address: '', phone: '' };

export default function GymProfile() {
  const { showToast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Gym | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = () => {
    gymOwnerApi.getMyGyms()
      .then((r) => { setGyms(r.data.data); setError(''); })
      .catch(() => setError('Failed to load gyms'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };

  const openEdit = (gym: Gym) => {
    setEditing(gym);
    setForm({ gymName: gym.gymName, address: gym.address ?? '', phone: gym.phone ?? '' });
    setModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await gymOwnerApi.updateMyGym(editing.id, form);
        showToast('Gym updated', 'success');
      } else {
        await gymOwnerApi.createGym(form);
        showToast('New gym branch created!', 'success');
      }
      setModal(false);
      load();
    } catch (err: unknown) {
      showToast(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Gym Branches</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your gym locations from here</p>
        </div>
        <button onClick={openCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          + Add Branch
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Gym cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : gyms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No gyms yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first gym branch to start managing members.</p>
          <button onClick={openCreate}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            Create First Gym
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            <div key={gym.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    🏋️
                  </div>
                  <button onClick={() => openEdit(gym)}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 font-medium">
                    Edit
                  </button>
                </div>

                <h4 className="font-bold text-gray-900 text-lg mb-1">{gym.gymName}</h4>

                {gym.address && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {gym.address}
                  </div>
                )}

                {gym.phone && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {gym.phone}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">ID #{gym.id}</p>
              </div>

              {/* Action buttons for this gym */}
              <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
                <Link
                  to={`/gym-owner/members?gymId=${gym.id}`}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span>👥</span> Members
                </Link>
                <Link
                  to={`/gym-owner/equipment?gymId=${gym.id}`}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span>🏋️</span> Equipment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={modal}
        title={editing ? 'Edit Gym Branch' : 'Add New Gym Branch'}
        onClose={() => setModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name *</label>
            <input value={form.gymName} onChange={f('gymName')} required
              placeholder="e.g. FitZone Downtown"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / City</label>
            <input value={form.address} onChange={f('address')}
              placeholder="e.g. 123 Main St, New York"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={f('phone')}
              placeholder="+1 234 567 8900"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Gym'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

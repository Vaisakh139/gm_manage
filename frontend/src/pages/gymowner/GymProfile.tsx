import { useEffect, useState } from 'react';
import { gymOwnerApi } from '../../api/axios';
import { useToast } from '../../components/common/Toast';

interface GymData { id: number; gymName: string; address: string; phone: string }

export default function GymProfile() {
  const { showToast } = useToast();
  const [gym, setGym] = useState<GymData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ gymName: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gymOwnerApi.getMyGym().then((r) => {
      setGym(r.data.data);
      setForm({ gymName: r.data.data.gymName, address: r.data.data.address ?? '', phone: r.data.data.phone ?? '' });
    });
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await gymOwnerApi.updateMyGym(form);
      showToast('Gym profile updated', 'success');
      setEditing(false);
      gymOwnerApi.getMyGym().then((r) => setGym(r.data.data));
    } catch { showToast('Update failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!gym) return <div className="text-gray-400 text-center py-16">Loading…</div>;

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Gym Profile</h3>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {(['gymName', 'address', 'phone'] as const).map((k) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{k === 'gymName' ? 'Gym Name' : k}</label>
                <input value={form[k]} onChange={f(k)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={loading}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-4">
            {[['Gym Name', gym.gymName], ['Address', gym.address ?? '—'], ['Phone', gym.phone ?? '—']].map(([l, v]) => (
              <div key={l} className="flex border-b border-gray-100 pb-3">
                <dt className="w-32 text-sm text-gray-500">{l}</dt>
                <dd className="text-sm font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

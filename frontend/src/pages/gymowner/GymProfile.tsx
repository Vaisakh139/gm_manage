import { useEffect, useState } from 'react';
import { gymOwnerApi } from '../../api/axios';
import { useToast } from '../../components/common/Toast';

interface GymData { id: number; gymName: string; address: string; phone: string }

export default function GymProfile() {
  const { showToast } = useToast();
  const [gym, setGym] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ gymName: '', address: '', phone: '' });

  const loadGym = () => {
    gymOwnerApi.getMyGym()
      .then((r) => {
        const g = r.data.data as GymData;
        setGym(g);
        setForm({ gymName: g.gymName, address: g.address ?? '', phone: g.phone ?? '' });
        setError('');
      })
      .catch(() => setError('Failed to load gym profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGym(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await gymOwnerApi.updateMyGym(form);
      showToast('Gym profile updated', 'success');
      setEditing(false);
      loadGym();
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  if (loading) return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;
  if (!gym) return null;

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
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {k === 'gymName' ? 'Gym Name' : k}
                </label>
                <input value={form[k]} onChange={f(k)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
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

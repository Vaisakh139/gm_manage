import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { memberApi } from '../../api/axios';
import type { MemberProfile } from '../../types';
import { useToast } from '../../components/common/Toast';

export default function MemberProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const load = () => memberApi.getProfile().then((r) => {
    setProfile(r.data.data);
    setForm({ name: r.data.data.name, phone: r.data.data.phone ?? '' });
  });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await memberApi.updateProfile(form);
      showToast('Profile updated', 'success');
      setEditing(false); load();
    } catch { showToast('Update failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!profile) return <div className="text-gray-400 text-center py-16">Loading…</div>;

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            {[['Name', profile.name], ['Email', profile.email], ['Phone', profile.phone ?? '—'], ['Gym', profile.gymName]].map(([l, v]) => (
              <div key={l} className="flex border-b border-gray-100 pb-3">
                <dt className="w-24 text-sm text-gray-500">{l}</dt>
                <dd className="text-sm font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

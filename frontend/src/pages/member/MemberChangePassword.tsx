import { useState } from 'react';
import type { FormEvent } from 'react';
import { authApi } from '../../api/axios';
import { useToast } from '../../components/common/Toast';

export default function MemberChangePassword() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.changePassword(form.currentPassword, form.newPassword);
      showToast('Password changed successfully', 'success');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error');
    } finally { setLoading(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['currentPassword', 'newPassword', 'confirm'] as const).map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {k === 'currentPassword' ? 'Current Password' : k === 'newPassword' ? 'New Password' : 'Confirm Password'}
              </label>
              <input type="password" value={form[k]} onChange={f(k)} required minLength={k !== 'currentPassword' ? 6 : undefined}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

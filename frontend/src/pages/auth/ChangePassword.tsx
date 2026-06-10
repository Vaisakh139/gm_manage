import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export default function ChangePassword() {
  const { user, markPasswordChanged } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFirstLogin = !user?.passwordChanged;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.changePassword(form.currentPassword, form.newPassword);
      markPasswordChanged();
      showToast('Password changed successfully', 'success');
      const home = user?.role === 'ADMIN' ? '/admin/dashboard'
        : user?.role === 'GYM_OWNER' ? '/gym-owner/dashboard'
        : '/member/dashboard';
      navigate(home);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          {isFirstLogin && (
            <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              You must change your temporary password before continuing.
            </p>
          )}
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isFirstLogin ? 'Temporary Password' : 'Current Password'}
            </label>
            <input type="password" value={form.currentPassword} onChange={f('currentPassword')} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={form.newPassword} onChange={f('newPassword')} required minLength={6}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={f('confirm')} required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

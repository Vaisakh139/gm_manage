import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const empty = {
  gymName: '', ownerName: '', email: '',
  phone: '', address: '', password: '', confirmPassword: '',
};

type Step = 1 | 2;

export default function RegisterModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const f = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleClose = () => {
    setForm({ ...empty });
    setStep(1);
    setError('');
    onClose();
  };

  const validateStep1 = () => {
    if (!form.gymName.trim()) return 'Gym name is required';
    if (!form.ownerName.trim()) return 'Owner name is required';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid email is required';
    return null;
  };

  const validateStep2 = () => {
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);

    try {
      const res = await authApi.register({
        gymName: form.gymName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      });
      const d = res.data.data;
      login({ token: d.token, userId: d.userId, name: d.name, email: d.email, role: d.role as Role, passwordChanged: d.passwordChanged });
      handleClose();
      navigate('/gym-owner/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gray-900 px-8 py-6 relative">
          <button onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🏃</span>
            <span className="text-white font-bold text-lg">GymPro</span>
          </div>
          <h2 className="text-white text-2xl font-bold">Register Your Gym</h2>
          <p className="text-gray-400 text-sm mt-1">
            {step === 1 ? 'Step 1 of 2 — Gym & owner details' : 'Step 2 of 2 — Set your password'}
          </p>

          {/* Progress bar */}
          <div className="mt-5 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* ── Step 1: Gym & Owner Details ── */
            <div className="space-y-4">
              <Field label="Gym Name *" value={form.gymName} onChange={f('gymName')}
                placeholder="e.g. Titan Fitness Centre" icon="🏢" />
              <Field label="Owner Name *" value={form.ownerName} onChange={f('ownerName')}
                placeholder="e.g. John Smith" icon="👤" />
              <Field label="Email Address *" type="email" value={form.email} onChange={f('email')}
                placeholder="you@example.com" icon="📧" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" value={form.phone} onChange={f('phone')}
                  placeholder="+1 234 567 8900" icon="📞" />
                <Field label="City / Address" value={form.address} onChange={f('address')}
                  placeholder="New York, NY" icon="📍" />
              </div>
              <button type="button" onClick={handleNextStep}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-colors duration-200 mt-2">
                Continue →
              </button>
            </div>
          ) : (
            /* ── Step 2: Password ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-5">
                <p className="text-xs text-gray-500 mb-1">Registering as</p>
                <p className="font-semibold text-gray-900">{form.ownerName}</p>
                <p className="text-sm text-gray-500">{form.email} · {form.gymName}</p>
              </div>
              <Field label="Password *" type="password" value={form.password} onChange={f('password')}
                placeholder="Minimum 6 characters" icon="🔒" />
              <Field label="Confirm Password *" type="password" value={form.confirmPassword}
                onChange={f('confirmPassword')} placeholder="Repeat your password" icon="🔒" />

              {/* Password strength */}
              {form.password && (
                <div>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length < 6 ? 'bg-red-300'
                          : form.password.length < 10 ? n <= 2 ? 'bg-yellow-400' : 'bg-gray-200'
                          : 'bg-green-500'
                        }`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Moderate' : 'Strong password'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 py-3.5 rounded-xl font-medium transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating…
                    </span>
                  ) : 'Create Account'}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-2">
                By registering you agree to our{' '}
                <span className="text-red-500 cursor-pointer hover:underline">Terms of Service</span>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={() => { handleClose(); navigate('/login'); }}
            className="text-red-600 font-semibold hover:underline">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, icon }:
  { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; icon?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none">
            {icon}
          </span>
        )}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full py-3 pr-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all ${icon ? 'pl-10' : 'pl-4'}`} />
      </div>
    </div>
  );
}

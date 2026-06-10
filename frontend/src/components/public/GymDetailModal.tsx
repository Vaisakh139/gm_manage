import { useEffect } from 'react';
import type { GymPublicResult } from '../../types';

interface Props {
  gym: GymPublicResult | null;
  onClose: () => void;
}

export default function GymDetailModal({ gym, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!gym) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gym, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (gym) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [gym]);

  if (!gym) return null;

  const detailRows: { icon: React.ReactNode; label: string; value: string | null }[] = [
    {
      icon: <MapPinIcon />,
      label: 'Address / City',
      value: gym.address ?? 'Not provided',
    },
    {
      icon: <PhoneIcon />,
      label: 'Phone',
      value: gym.phone ?? 'Not provided',
    },
    {
      icon: <PersonIcon />,
      label: 'Owner',
      value: gym.ownerName,
    },
    {
      icon: <UsersIcon />,
      label: 'Total Members',
      value: `${gym.totalMembers} registered member${gym.totalMembers !== 1 ? 's' : ''}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'modalIn 0.22s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="relative bg-gray-900 px-7 py-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Gym icon + badge */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🏋️
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-white text-2xl font-bold leading-tight break-words">
                {gym.gymName}
              </h2>
              {gym.address && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {gym.address}
                </p>
              )}
            </div>
          </div>

          {/* Member count chip */}
          <div className="mt-5 inline-flex items-center gap-2 bg-white/10 text-gray-300 text-sm px-3 py-1.5 rounded-full">
            <UsersIcon className="w-4 h-4" />
            {gym.totalMembers} {gym.totalMembers === 1 ? 'member' : 'members'}
          </div>
        </div>

        {/* ── Details ────────────────────────────────────── */}
        <div className="px-7 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
            Gym Details
          </p>
          <div className="space-y-5">
            {detailRows.map((row) => (
              <div key={row.label} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500">
                  {row.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                  <p className={`text-sm font-medium ${row.value === 'Not provided' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Part of the GymPro network
          </p>
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

// ── Mini icon components ──────────────────────────────────────
function MapPinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function PersonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function UsersIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

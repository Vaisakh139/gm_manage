import { useEffect, useState } from 'react';
import { memberApi } from '../../api/axios';
import type { MemberProfile } from '../../types';
import Badge from '../../components/ui/Badge';

const statusVariant = { ACTIVE: 'green', INACTIVE: 'gray', EXPIRED: 'red' } as const;

export default function MemberDashboard() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    memberApi.getProfile()
      .then((r) => setProfile(r.data.data))
      .catch(() => setError('Failed to load your profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;
  if (!profile) return null;

  const isExpired = profile.endDate && new Date(profile.endDate) < new Date();

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
          </div>
          <Badge label={profile.memberStatus} variant={statusVariant[profile.memberStatus]} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Membership Details</h4>
        <dl className="space-y-3">
          {[
            ['Gym',        profile.gymName],
            ['Plan',       profile.membershipPlan ?? '—'],
            ['Start Date', profile.startDate ?? '—'],
            ['End Date',   profile.endDate ?? '—'],
          ].map(([l, v]) => (
            <div key={l} className="flex border-b border-gray-100 pb-3">
              <dt className="w-32 text-sm text-gray-500">{l}</dt>
              <dd className="text-sm font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {isExpired && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            ⚠️ Your membership has expired. Please contact your gym.
          </div>
        )}
      </div>
    </div>
  );
}

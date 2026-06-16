import { useEffect, useState } from 'react';
import type { Trainer } from '../../types';
import { trainerApi } from '../../api/axios';

const IMAGE_BASE = 'http://localhost:8080';

export default function MyTrainer() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    trainerApi.getMyTrainer()
      .then((r) => setTrainer(r.data.data))
      .catch(() => setError('Failed to load trainer info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-sm">
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );

  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>;

  if (!trainer) return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md">
      <div className="text-5xl mb-4">🏋️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trainer Assigned</h3>
      <p className="text-gray-500 text-sm">
        You haven't been assigned a personal trainer yet. Contact your gym for more information.
      </p>
    </div>
  );

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900">My Trainer</h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Trainer photo */}
        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {trainer.imageUrl
            ? <img src={`${IMAGE_BASE}${trainer.imageUrl}`} alt={trainer.name} className="w-full h-full object-cover" />
            : <div className="text-7xl text-gray-300">👤</div>
          }
        </div>

        {/* Info */}
        <div className="p-6">
          <h4 className="text-2xl font-bold text-gray-900 mb-1">{trainer.name}</h4>
          {trainer.specialization && (
            <p className="text-gray-500 text-sm mb-4">🎯 {trainer.specialization}</p>
          )}

          <dl className="space-y-3">
            {trainer.experienceYears != null && (
              <div className="flex border-b border-gray-100 pb-2">
                <dt className="w-36 text-sm text-gray-500">Experience</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {trainer.experienceYears} year{trainer.experienceYears !== 1 ? 's' : ''}
                </dd>
              </div>
            )}
            {trainer.email && (
              <div className="flex border-b border-gray-100 pb-2">
                <dt className="w-36 text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">{trainer.email}</dd>
              </div>
            )}
            {trainer.phone && (
              <div className="flex border-b border-gray-100 pb-2">
                <dt className="w-36 text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{trainer.phone}</dd>
              </div>
            )}
            <div className="flex">
              <dt className="w-36 text-sm text-gray-500">Gym</dt>
              <dd className="text-sm font-medium text-gray-900">{trainer.gymName}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

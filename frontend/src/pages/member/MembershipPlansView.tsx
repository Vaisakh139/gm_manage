import { useEffect, useState } from 'react';
import type { MembershipPlan } from '../../types';
import { planApi } from '../../api/axios';

export default function MembershipPlansView() {
  const [plans, setPlans]   = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    planApi.getMemberPlans()
      .then((r) => setPlans(r.data.data))
      .catch(() => setError('Failed to load membership plans'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Membership Plans</h3>
        <p className="text-sm text-gray-500 mt-0.5">Available plans at your gym</p>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500">No membership plans available at your gym yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 flex flex-col gap-3 hover:border-gray-900 hover:shadow-md transition-all">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                )}
              </div>

              <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-gray-900">₹{Number(plan.price).toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {plan.durationInMonths} month{plan.durationInMonths !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  ~₹{(Number(plan.price) / plan.durationInMonths).toFixed(0)}/mo
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

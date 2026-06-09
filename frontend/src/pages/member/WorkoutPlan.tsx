import { useEffect, useState } from 'react';
import { getMemberWorkoutPlans } from '../../api';
import type { WorkoutPlan } from '../../types';

export default function WorkoutPlanPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    getMemberWorkoutPlans().then(r => setPlans(r.data));
  }, []);

  const active = plans.filter(p => p.active);

  if (plans.length === 0) return (
    <div className="card"><div className="empty-state">No workout plans assigned yet.</div></div>
  );

  return (
    <>
      {active.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <h3 style={{ marginBottom: 16, color: '#16a34a' }}>Current Plan</h3>
          {active.map(p => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
      {plans.filter(p => !p.active).length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#6b7280' }}>Previous Plans</h3>
          {plans.filter(p => !p.active).map(p => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
    </>
  );
}

function PlanCard({ plan }: { plan: WorkoutPlan }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong style={{ fontSize: 16 }}>{plan.title}</strong>
        <span className={`badge ${plan.active ? 'badge-green' : 'badge-red'}`}>{plan.active ? 'Active' : 'Completed'}</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Trainer: {plan.trainerName}</div>
      {plan.description && <p style={{ marginBottom: 12, fontSize: 14 }}>{plan.description}</p>}
      {plan.exercises && (
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', fontSize: 14 }}>
          {plan.exercises}
        </div>
      )}
      <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13, color: '#6b7280' }}>
        {plan.startDate && <span>Start: {plan.startDate}</span>}
        {plan.endDate && <span>End: {plan.endDate}</span>}
      </div>
    </div>
  );
}

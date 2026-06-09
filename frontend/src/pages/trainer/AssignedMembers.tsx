import { useEffect, useState } from 'react';
import { getTrainerWorkoutPlans } from '../../api';
import type { WorkoutPlan } from '../../types';

export default function AssignedMembers() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    getTrainerWorkoutPlans().then(r => setPlans(r.data));
  }, []);

  const uniqueMembers = Array.from(
    new Map(plans.map(p => [p.memberId, { id: p.memberId, name: p.memberName }])).values()
  );

  return (
    <div className="card">
      <div className="table-header"><h2>Assigned Members</h2></div>
      {uniqueMembers.length === 0
        ? <div className="empty-state">No members assigned yet.</div>
        : (
          <table>
            <thead><tr><th>#</th><th>Member Name</th><th>Active Plans</th></tr></thead>
            <tbody>
              {uniqueMembers.map((m, i) => {
                const memberPlans = plans.filter(p => p.memberId === m.id && p.active);
                return (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td>{m.name}</td>
                    <td>{memberPlans.length} plan{memberPlans.length !== 1 ? 's' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
    </div>
  );
}

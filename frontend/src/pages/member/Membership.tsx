import { useEffect, useState } from 'react';
import { getMyMemberProfile } from '../../api';
import type { Member } from '../../types';

export default function Membership() {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    getMyMemberProfile().then(r => setMember(r.data));
  }, []);

  if (!member) return <div>Loading...</div>;

  const isExpired = member.membershipExpiry && new Date(member.membershipExpiry) < new Date();

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 24 }}>Membership Details</h2>
      {member.membershipPlanId ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="stat-card blue" style={{ marginBottom: 0 }}>
            <div className="stat-value">{member.membershipPlanName}</div>
            <div className="stat-label">Current Plan</div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
            <div style={{ width: 160, color: '#6b7280', fontSize: 14 }}>Join Date</div>
            <div style={{ fontWeight: 500 }}>{member.joinDate || '—'}</div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
            <div style={{ width: 160, color: '#6b7280', fontSize: 14 }}>Expiry Date</div>
            <div style={{ fontWeight: 500 }}>{member.membershipExpiry || '—'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 160, color: '#6b7280', fontSize: 14 }}>Status</div>
            <span className={`badge ${isExpired ? 'badge-red' : 'badge-green'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>
        </div>
      ) : (
        <div className="empty-state">No membership plan assigned. Contact admin.</div>
      )}
    </div>
  );
}

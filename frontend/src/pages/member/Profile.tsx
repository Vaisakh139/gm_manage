import { useEffect, useState } from 'react';
import { getMyMemberProfile } from '../../api';
import type { Member } from '../../types';

export default function Profile() {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    getMyMemberProfile().then(r => setMember(r.data));
  }, []);

  if (!member) return <div>Loading...</div>;

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 24 }}>My Profile</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <Row label="Full Name" value={`${member.firstName} ${member.lastName}`} />
        <Row label="Email" value={member.email} />
        <Row label="Phone" value={member.phone || '—'} />
        <Row label="Address" value={member.address || '—'} />
        <Row label="Join Date" value={member.joinDate || '—'} />
        <Row label="Status">
          <span className={`badge ${member.active ? 'badge-green' : 'badge-red'}`}>
            {member.active ? 'Active' : 'Inactive'}
          </span>
        </Row>
      </div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
      <div style={{ width: 140, color: '#6b7280', fontSize: 14 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{children ?? value}</div>
    </div>
  );
}

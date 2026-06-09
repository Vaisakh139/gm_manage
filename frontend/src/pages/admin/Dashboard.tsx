import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api';
import type { DashboardStats } from '../../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.activeMembers}</div>
          <div className="stat-label">Active Members</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value">{stats.totalTrainers}</div>
          <div className="stat-label">Trainers</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.pendingPayments}</div>
          <div className="stat-label">Pending Payments</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">${Number(stats.totalRevenue).toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value">{stats.activeWorkoutPlans}</div>
          <div className="stat-label">Active Workout Plans</div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Quick Overview</h3>
        <table>
          <tbody>
            <tr><td>Total Members</td><td><strong>{stats.totalMembers}</strong></td></tr>
            <tr><td>Active Members</td><td><strong>{stats.activeMembers}</strong></td></tr>
            <tr><td>Total Trainers</td><td><strong>{stats.totalTrainers}</strong></td></tr>
            <tr><td>Active Trainers</td><td><strong>{stats.activeTrainers}</strong></td></tr>
            <tr><td>Total Payments</td><td><strong>{stats.totalPayments}</strong></td></tr>
            <tr><td>Pending Payments</td><td><strong>{stats.pendingPayments}</strong></td></tr>
            <tr><td>Total Revenue</td><td><strong>${Number(stats.totalRevenue).toFixed(2)}</strong></td></tr>
            <tr><td>Active Workout Plans</td><td><strong>{stats.activeWorkoutPlans}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

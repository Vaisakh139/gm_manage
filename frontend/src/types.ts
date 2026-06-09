export type Role = 'ADMIN' | 'TRAINER' | 'MEMBER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface AuthUser {
  token: string;
  email: string;
  role: Role;
}

export interface Member {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  membershipPlanId: number | null;
  membershipPlanName: string | null;
  joinDate: string | null;
  membershipExpiry: string | null;
  active: boolean;
}

export interface Trainer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  bio: string;
  active: boolean;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  active: boolean;
}

export interface Payment {
  id: number;
  memberId: number;
  memberName: string;
  planId: number | null;
  planName: string | null;
  amount: number;
  paymentDate: string | null;
  dueDate: string | null;
  status: PaymentStatus;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export interface WorkoutPlan {
  id: number;
  trainerId: number;
  trainerName: string;
  memberId: number;
  memberName: string;
  title: string;
  description: string;
  exercises: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  activeTrainers: number;
  totalPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  activeWorkoutPlans: number;
}

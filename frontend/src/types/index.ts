export type Role = 'ADMIN' | 'GYM_OWNER' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  passwordChanged: boolean;
}

// Convenience alias for older imports
export type { AuthUser as User };

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Gym {
  id: number;
  gymName: string;
  address: string;
  phone: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerActive: boolean;
  createdAt: string;
}

export interface GymUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  passwordChanged: boolean;
  createdAt: string;
}

export interface Member {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  membershipPlan: string;
  startDate: string | null;
  endDate: string | null;
  status: MemberStatus;
  active: boolean;
  createdAt: string;
  assignedTrainerId: number | null;
  assignedTrainerName: string | null;
}

export interface MemberProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  gymName: string;
  membershipPlan: string;
  startDate: string | null;
  endDate: string | null;
  memberStatus: MemberStatus;
}

// ── Membership Plans ─────────────────────────────────────────
export interface MembershipPlan {
  id: number;
  name: string;
  description: string | null;
  durationInMonths: number;
  price: number;
  active: boolean;
  gymId: number;
  gymName: string;
  createdAt: string;
  updatedAt: string;
}

// ── Trainers ──────────────────────────────────────────────────
export interface Trainer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  experienceYears: number | null;
  imageUrl: string | null;
  active: boolean;
  gymId: number;
  gymName: string;
  assignedMembersCount: number;
  createdAt: string;
}

export interface TrainerFormData {
  name: string;
  phone: string;
  email: string;
  specialization: string;
  experienceYears: number | '';
  imageUrl: string;
}

// ── Attendance ────────────────────────────────────────────────
export interface Attendance {
  id: number;
  memberId: number;
  memberName: string;
  memberEmail: string;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string | null;
  active: boolean;
}

export interface AttendanceDashboard {
  todayCount: number;
  monthlyCount: number;
  currentlyActiveCount: number;
  dailyCounts: { date: string; count: number }[];
}

// ── Payments ─────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface Payment {
  id: number;
  memberId: number;
  memberName: string;
  memberEmail: string;
  membershipPlanId: number | null;
  membershipPlanName: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
}

export interface PaymentFormData {
  memberId: number | '';
  membershipPlanId: number | '';
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes: string;
}

export interface MonthlySummary {
  year: number;
  month: number;
  monthLabel: string;
  total: number;
  count: number;
}

export interface PaymentDashboard {
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  pendingPaymentsCount: number;
  pendingAmount: number;
  monthlySummary: MonthlySummary[];
}

export interface MembershipPlanFormData {
  name: string;
  description: string;
  durationInMonths: number;
  price: number;
}

export type EquipmentStatus = 'AVAILABLE' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  quantity: number;
  status: EquipmentStatus;
  gymId: number;
  gymName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  quantity: number;
  status: EquipmentStatus;
  imageUrl: string;
}

export interface GymPublicResult {
  id: number;
  gymName: string;
  address: string | null;
  phone: string | null;
  ownerName: string;
  totalMembers: number;
}

export interface DashboardStats {
  totalGyms: number;
  totalGymOwners: number;
  activeGymOwners: number;
  totalMembers: number;
  activeMembers: number;
  totalEquipments: number;
  availableEquipments: number;
  equipmentsUnderMaintenance: number;
}

export interface GymOwnerDashboard {
  totalGyms: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  totalEquipments: number;
  availableEquipments: number;
  outOfServiceEquipments: number;
  gymStats: GymStat[];
}

export interface GymStat {
  gymId: number;
  gymName: string;
  address: string | null;
  totalMembers: number;
  activeMembers: number;
  totalEquipments: number;
  availableEquipments: number;
}

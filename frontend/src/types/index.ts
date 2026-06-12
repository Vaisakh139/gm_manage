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
}

export interface GymOwnerDashboard {
  totalGyms: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  gymStats: GymStat[];
}

export interface GymStat {
  gymId: number;
  gymName: string;
  address: string | null;
  totalMembers: number;
  activeMembers: number;
}

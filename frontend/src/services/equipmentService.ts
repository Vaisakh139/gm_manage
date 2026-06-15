/**
 * Equipment Service — uses the native fetch API (not Axios).
 * Reads the JWT from localStorage and attaches it to every request.
 */

import type { Equipment, EquipmentFormData } from '../types';

const API_BASE = 'http://localhost:8080/api';

interface ApiResult<T> {
  success: boolean;
  message: string;
  data: T;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResult<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data;
}

// ── Image upload ─────────────────────────────────────────────

export async function uploadEquipmentImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/uploads/equipment-image`, {
    method: 'POST',
    headers: { ...authHeaders() },   // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  return handleResponse<{ imageUrl: string }>(res);
}

// ── Gym Owner endpoints ───────────────────────────────────────

export async function getOwnerEquipments(gymId: number): Promise<Equipment[]> {
  const res = await fetch(`${API_BASE}/owner/equipments?gymId=${gymId}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<Equipment[]>(res);
}

export async function getOwnerEquipmentById(id: number): Promise<Equipment> {
  const res = await fetch(`${API_BASE}/owner/equipments/${id}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<Equipment>(res);
}

export async function createOwnerEquipment(gymId: number, data: EquipmentFormData): Promise<Equipment> {
  const res = await fetch(`${API_BASE}/owner/equipments?gymId=${gymId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<Equipment>(res);
}

export async function updateOwnerEquipment(id: number, data: EquipmentFormData): Promise<Equipment> {
  const res = await fetch(`${API_BASE}/owner/equipments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<Equipment>(res);
}

export async function deleteOwnerEquipment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/equipments/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  await handleResponse<null>(res);
}

// ── Admin endpoints ───────────────────────────────────────────

export async function getAllEquipments(): Promise<Equipment[]> {
  const res = await fetch(`${API_BASE}/admin/equipments`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<Equipment[]>(res);
}

export async function adminCreateEquipment(gymId: number, data: EquipmentFormData): Promise<Equipment> {
  const res = await fetch(`${API_BASE}/admin/equipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...data, gymId }),
  });
  return handleResponse<Equipment>(res);
}

export async function adminUpdateEquipment(id: number, data: EquipmentFormData): Promise<Equipment> {
  const res = await fetch(`${API_BASE}/admin/equipments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<Equipment>(res);
}

export async function adminDeleteEquipment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/equipments/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  await handleResponse<null>(res);
}

// ── Member endpoints ──────────────────────────────────────────

export async function getMemberEquipments(): Promise<Equipment[]> {
  const res = await fetch(`${API_BASE}/member/equipments`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<Equipment[]>(res);
}

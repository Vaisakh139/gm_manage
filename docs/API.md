# API Reference

## Overview

- **Base URL:** `http://localhost:8080/api`
- **Auth:** All protected endpoints require `Authorization: Bearer <jwt_token>`
- **Content-Type:** `application/json`
- **Timeout:** 15 seconds (configured in Axios)

### Standard Response Envelope

Every endpoint returns:
```json
{
  "success": true,
  "message": "Human-readable result",
  "data": { ... },
  "timestamp": "2026-06-12T11:34:29"
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2026-06-12T11:34:29"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success |
| `400 Bad Request` | Validation error — `data` contains field→message map |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated but wrong role |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Unexpected server error |

---

## Public Endpoints (No Auth)

### POST /api/auth/register
Gym owner self-registration — creates GYM_OWNER user + gym branch atomically. Returns JWT immediately (no email needed — user set their own password).

**Body**
```json
{
  "gymName": "FitZone",
  "ownerName": "John Smith",
  "email": "john@fitzone.com",
  "phone": "+1234567890",
  "address": "123 Main St, New York",
  "password": "mypassword"
}
```

**Response `data`**
```json
{
  "token": "eyJhbGci...",
  "userId": 5,
  "name": "John Smith",
  "email": "john@fitzone.com",
  "role": "GYM_OWNER",
  "passwordChanged": true
}
```

---

### POST /api/auth/login

**Body**
```json
{ "email": "admin@gym.com", "password": "admin123" }
```

**Response `data`**
```json
{
  "token": "eyJhbGci...",
  "userId": 1,
  "name": "System Admin",
  "email": "admin@gym.com",
  "role": "ADMIN",
  "passwordChanged": true
}
```

> If `passwordChanged: false` → frontend MUST redirect to `/change-password` before any other navigation.

---

### POST /api/auth/forgot-password

**Body** `{ "email": "user@example.com" }`

**Response** Always returns success (prevents email enumeration).

---

### POST /api/auth/reset-password

**Body**
```json
{ "token": "uuid-from-email", "newPassword": "newsecurepass" }
```

---

### GET /api/public/gyms
Search gyms by name or city (unauthenticated landing page).

**Query params:** `query` (string), `page` (default 0), `size` (default 10, max 20)

**Response `data`**
```json
{
  "content": [
    {
      "id": 1,
      "gymName": "FitZone Downtown",
      "address": "123 Main St",
      "phone": "+1234567890",
      "ownerName": "John Smith",
      "totalMembers": 42
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### GET /api/public/gyms/{id}
Single gym public details. Same shape as one content item above.

---

## Authenticated (Any Role)

### POST /api/auth/change-password

**Body**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```

---

## Admin Endpoints

All require `ROLE_ADMIN`.

### GET /api/admin/stats
```json
{
  "totalGyms": 5,
  "totalGymOwners": 5,
  "activeGymOwners": 4,
  "totalMembers": 87,
  "activeMembers": 72
}
```

---

### GET /api/admin/gyms
Returns array of all gyms.

```json
[{
  "id": 1,
  "gymName": "FitZone Downtown",
  "address": "123 Main St",
  "phone": "+1234567890",
  "ownerId": 3,
  "ownerName": "John Smith",
  "ownerEmail": "john@fitzone.com",
  "ownerActive": true,
  "createdAt": "2026-01-15T10:30:00"
}]
```

---

### POST /api/admin/gyms
Creates a gym **and** a new GYM_OWNER account. Sends welcome email with temp password.

**Body**
```json
{
  "gymName": "FitZone",
  "address": "123 Main St",
  "phone": "+1234567890",
  "ownerName": "Jane Doe",
  "ownerEmail": "jane@fitzone.com",
  "ownerPhone": "+0987654321"
}
```

---

### PUT /api/admin/gyms/{id}
Update gym details (same body as POST, owner fields are ignored on update).

---

### DELETE /api/admin/gyms/{id}
Hard delete gym.

---

### GET /api/admin/users
Returns all non-admin users (GYM_OWNER and MEMBER).

```json
[{
  "id": 3,
  "name": "John Smith",
  "email": "john@fitzone.com",
  "phone": "+1234567890",
  "role": "GYM_OWNER",
  "active": true,
  "passwordChanged": true,
  "createdAt": "2026-01-15T10:30:00"
}]
```

---

### PUT /api/admin/users/{id}/status
Enable or disable a user account.

**Body** `{ "active": false }`

---

## Gym Owner Endpoints

All require `ROLE_GYM_OWNER`.

### GET /api/gym-owner/gyms
All gym branches owned by the current user.

```json
[{
  "id": 1,
  "gymName": "FitZone Downtown",
  "address": "123 Main St",
  "phone": "+1234567890",
  "ownerId": 3,
  "ownerName": "John Smith",
  "ownerEmail": "john@fitzone.com",
  "ownerActive": true,
  "createdAt": "2026-01-15T10:30:00"
}]
```

---

### POST /api/gym-owner/gyms
Create a new branch under the current owner's account.

**Body**
```json
{ "gymName": "FitZone Uptown", "address": "456 Park Ave", "phone": "+1112223333" }
```

---

### GET /api/gym-owner/gyms/{gymId}
Single branch details (validates ownership).

---

### PUT /api/gym-owner/gyms/{gymId}
Update branch details (same body as POST).

---

### GET /api/gym-owner/dashboard
Aggregate stats + per-branch breakdown.

```json
{
  "totalGyms": 3,
  "totalMembers": 87,
  "activeMembers": 72,
  "inactiveMembers": 10,
  "expiredMembers": 5,
  "gymStats": [
    {
      "gymId": 1,
      "gymName": "FitZone Downtown",
      "address": "123 Main St",
      "totalMembers": 45,
      "activeMembers": 38
    },
    {
      "gymId": 2,
      "gymName": "FitZone Uptown",
      "address": "456 Park Ave",
      "totalMembers": 42,
      "activeMembers": 34
    }
  ]
}
```

---

### GET /api/members
Members of a specific gym branch (paginated + searchable).

**Query params:** `gymId` (required), `search` (optional), `page` (default 0), `size` (default 10)

```json
{
  "content": [{
    "id": 10,
    "userId": 20,
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "membershipPlan": "Premium",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "status": "ACTIVE",
    "active": true,
    "createdAt": "2026-01-01T09:00:00"
  }],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### POST /api/members
Add a new member to a gym branch. Creates User account + sends welcome email with temp password.

**Body**
```json
{
  "gymId": 1,
  "fullName": "Bob Wilson",
  "email": "bob@example.com",
  "phone": "+1987654321",
  "membershipPlan": "Basic",
  "startDate": "2026-06-01",
  "endDate": "2026-12-31",
  "status": "ACTIVE"
}
```

---

### GET /api/members/{id}
Single member (validates that member's gym belongs to current owner).

---

### PUT /api/members/{id}
Update member details (same body as POST, `gymId` is optional on update).

---

### DELETE /api/members/{id}
Hard delete member and their User account.

---

## Member Endpoints

All require `ROLE_MEMBER`.

### GET /api/profile

```json
{
  "userId": 20,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "gymName": "FitZone Downtown",
  "membershipPlan": "Premium",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "memberStatus": "ACTIVE"
}
```

---

### PUT /api/profile
Update own name and phone number.

**Body** `{ "name": "Alice J.", "phone": "+9876543210" }`

---

---

## Equipment Endpoints

### Admin Equipment

```
GET    /api/admin/equipments          All equipment across all gyms
GET    /api/admin/equipments/{id}     Single equipment
POST   /api/admin/equipments          Create (body includes gymId)
PUT    /api/admin/equipments/{id}     Update
DELETE /api/admin/equipments/{id}     Delete
```

### Gym Owner Equipment

All require `ROLE_GYM_OWNER`. Ownership is validated server-side.

```
GET    /api/owner/equipments?gymId=X   List equipment for a specific branch
GET    /api/owner/equipments/{id}      Single equipment (validates ownership)
POST   /api/owner/equipments?gymId=X   Create equipment for a branch
PUT    /api/owner/equipments/{id}      Update
DELETE /api/owner/equipments/{id}      Delete
```

### Member Equipment

```
GET    /api/member/equipments          Equipment in the member's gym (read-only)
```

### Equipment Request Body

```json
{
  "name": "Treadmill",
  "description": "Commercial grade, 10-speed",
  "quantity": 5,
  "status": "AVAILABLE",
  "imageUrl": "/uploads/equipments/treadmill-a1b2c3d4.jpg"
}
```

### Equipment Response

```json
{
  "id": 1,
  "name": "Treadmill",
  "description": "Commercial grade, 10-speed",
  "imageUrl": "/uploads/equipments/treadmill-a1b2c3d4.jpg",
  "quantity": 5,
  "status": "AVAILABLE",
  "gymId": 1,
  "gymName": "FitZone Downtown",
  "createdAt": "2026-06-12T11:30:00",
  "updatedAt": "2026-06-12T11:30:00"
}
```

---

## Image Upload

### POST /api/uploads/equipment-image

Requires `ROLE_ADMIN` or `ROLE_GYM_OWNER`.  
Content-Type: `multipart/form-data`

**Request:** `file` field containing the image file.

**Constraints:** jpg/jpeg/png only · max 5 MB

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded",
  "data": { "imageUrl": "/uploads/equipments/treadmill-a1b2c3d4.jpg" }
}
```

Images are served publicly at `http://localhost:8080/uploads/...` — no auth required.

---

## Enum Values

### Role
`ADMIN` · `GYM_OWNER` · `MEMBER`

### MemberStatus
`ACTIVE` · `INACTIVE` · `EXPIRED`

### EquipmentStatus
`AVAILABLE` · `UNDER_MAINTENANCE` · `OUT_OF_SERVICE`

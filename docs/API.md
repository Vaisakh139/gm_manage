# API Reference

## Overview

- **Base URL**: `http://localhost:8080/api`
- **Format**: JSON (all requests and responses)
- **Authentication**: Bearer token in `Authorization` header
- **Versioning**: URL-based prefix `/api/v1/`

---

## Authentication

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Endpoints

| Method | Endpoint              | Access  | Description            |
|--------|-----------------------|---------|------------------------|
| POST   | `/api/v1/auth/login`  | Public  | Obtain a JWT token     |
| POST   | `/api/v1/auth/logout` | Auth    | Invalidate token       |
| GET    | `/api/v1/auth/me`     | Auth    | Get current user info  |

#### POST `/api/v1/auth/login`

Request:
```json
{
  "email": "admin@gym.com",
  "password": "secret"
}
```

Response `200 OK`:
```json
{
  "token": "<jwt>",
  "role": "ADMIN",
  "userId": 1
}
```

---

## Members

> Accessible by: **ADMIN** (full access), **MEMBER** (own profile only)

| Method | Endpoint                  | Access       | Description                  |
|--------|---------------------------|--------------|------------------------------|
| GET    | `/api/v1/members`         | ADMIN        | List all members             |
| GET    | `/api/v1/members/{id}`    | ADMIN/MEMBER | Get member by ID             |
| POST   | `/api/v1/members`         | ADMIN        | Create a new member          |
| PUT    | `/api/v1/members/{id}`    | ADMIN        | Update member details        |
| DELETE | `/api/v1/members/{id}`    | ADMIN        | Deactivate a member          |
| GET    | `/api/v1/members/me`      | MEMBER       | Get own profile              |

---

## Trainers

> Accessible by: **ADMIN** (full access), **TRAINER** (own profile)

| Method | Endpoint                  | Access        | Description                  |
|--------|---------------------------|---------------|------------------------------|
| GET    | `/api/v1/trainers`        | ADMIN         | List all trainers            |
| GET    | `/api/v1/trainers/{id}`   | ADMIN/TRAINER | Get trainer by ID            |
| POST   | `/api/v1/trainers`        | ADMIN         | Create a new trainer         |
| PUT    | `/api/v1/trainers/{id}`   | ADMIN         | Update trainer details       |
| DELETE | `/api/v1/trainers/{id}`   | ADMIN         | Deactivate a trainer         |
| GET    | `/api/v1/trainers/{id}/members` | ADMIN/TRAINER | Get members assigned to trainer |

---

## Membership Plans

> Accessible by: **ADMIN** (full CRUD), **MEMBER** (read-only)

| Method | Endpoint                        | Access       | Description                  |
|--------|---------------------------------|--------------|------------------------------|
| GET    | `/api/v1/plans`                 | ADMIN/MEMBER | List all active plans        |
| GET    | `/api/v1/plans/{id}`            | ADMIN/MEMBER | Get plan by ID               |
| POST   | `/api/v1/plans`                 | ADMIN        | Create a plan                |
| PUT    | `/api/v1/plans/{id}`            | ADMIN        | Update a plan                |
| DELETE | `/api/v1/plans/{id}`            | ADMIN        | Deactivate a plan            |

---

## Payments

> Accessible by: **ADMIN** (all), **MEMBER** (own history)

| Method | Endpoint                          | Access       | Description                  |
|--------|-----------------------------------|--------------|------------------------------|
| GET    | `/api/v1/payments`                | ADMIN        | List all payments            |
| GET    | `/api/v1/payments/{id}`           | ADMIN        | Get payment by ID            |
| GET    | `/api/v1/payments/member/{memberId}` | ADMIN/MEMBER | Get payments for a member |
| POST   | `/api/v1/payments`                | ADMIN        | Record a payment             |
| PUT    | `/api/v1/payments/{id}`           | ADMIN        | Update payment record        |

---

## Workout Plans

> Accessible by: **TRAINER** (own plans), **ADMIN** (all), **MEMBER** (own assigned plans)

| Method | Endpoint                                    | Access           | Description                         |
|--------|---------------------------------------------|------------------|-------------------------------------|
| GET    | `/api/v1/workout-plans`                     | ADMIN/TRAINER    | List all workout plans              |
| GET    | `/api/v1/workout-plans/{id}`                | ADMIN/TRAINER/MEMBER | Get workout plan by ID          |
| POST   | `/api/v1/workout-plans`                     | TRAINER          | Create a workout plan               |
| PUT    | `/api/v1/workout-plans/{id}`                | TRAINER          | Update a workout plan               |
| DELETE | `/api/v1/workout-plans/{id}`                | ADMIN/TRAINER    | Delete a workout plan               |
| POST   | `/api/v1/workout-plans/{id}/assign`         | TRAINER          | Assign a plan to a member           |
| GET    | `/api/v1/workout-plans/member/{memberId}`   | TRAINER/MEMBER   | Get workout plans for a member      |

---

## Dashboard

> Accessible by: **ADMIN** only

| Method | Endpoint                       | Description                              |
|--------|--------------------------------|------------------------------------------|
| GET    | `/api/v1/dashboard/summary`    | Total counts: members, trainers, revenue |
| GET    | `/api/v1/dashboard/revenue`    | Monthly revenue breakdown                |
| GET    | `/api/v1/dashboard/memberships`| Active vs expired memberships            |
| GET    | `/api/v1/dashboard/new-members`| New member registrations over time       |

---

## Standard Response Structure

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Member with id 42 not found",
  "timestamp": "2026-06-08T10:00:00Z"
}
```

---

## HTTP Status Codes Used

| Code | Meaning                       |
|------|-------------------------------|
| 200  | OK                            |
| 201  | Created                       |
| 204  | No Content (DELETE success)   |
| 400  | Bad Request / Validation error|
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient role) |
| 404  | Resource not found            |
| 409  | Conflict (duplicate email etc)|
| 500  | Internal Server Error         |

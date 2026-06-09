# Architecture Overview

## System Overview

The Gym Membership Management System is a full-stack web application built with a React frontend and a Spring Boot backend. It follows a layered, RESTful architecture with JWT-based stateless authentication.

---

## Technology Stack

| Layer          | Technology                |
|----------------|---------------------------|
| Frontend       | React 18, TypeScript, Vite |
| UI Components  | TailwindCSS               |
| State Management | Redux Toolkit / React Query |
| Backend        | Spring Boot 3.x (Java 17) |
| API Style      | REST (JSON)               |
| Authentication | JWT + Spring Security     |
| Database       | PostgreSQL 15             |
| ORM            | Spring Data JPA / Hibernate |
| Build Tool     | Maven                     |

---

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│               Client Browser            │
│         React + TypeScript (SPA)        │
└────────────────────┬────────────────────┘
                     │ HTTPS / REST API
┌────────────────────▼────────────────────┐
│            Spring Boot Backend          │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │Controller│→ │ Service  │→ │  Repo │ │
│  └──────────┘  └──────────┘  └───┬───┘ │
│           Spring Security / JWT  │     │
└──────────────────────────────────┼─────┘
                                   │ JDBC
┌──────────────────────────────────▼─────┐
│              PostgreSQL Database        │
└─────────────────────────────────────────┘
```

---

## Backend Layer Responsibilities

### Controller Layer
- Handles incoming HTTP requests.
- Validates request payloads using Bean Validation (`@Valid`).
- Maps routes to service methods.
- Returns structured `ResponseEntity` responses.

### Service Layer
- Contains all business logic.
- Enforces role-based access rules.
- Coordinates between multiple repositories when needed.
- Handles transaction boundaries (`@Transactional`).

### Repository Layer
- Extends `JpaRepository` for CRUD operations.
- Contains custom JPQL/native queries where needed.
- No business logic lives here.

### Security Layer
- JWT filter validates tokens on every request.
- Spring Security `SecurityFilterChain` defines access rules per role.
- Roles: `ADMIN`, `TRAINER`, `MEMBER`.

---

## Frontend Structure

```
src/
├── api/            # Axios instances and API call functions
├── components/     # Reusable UI components
├── features/       # Feature-based modules (admin, trainer, member)
│   ├── admin/
│   ├── trainer/
│   └── member/
├── hooks/          # Custom React hooks
├── routes/         # Route definitions and protected route guards
├── store/          # Redux store and slices
├── types/          # TypeScript interfaces and types
└── utils/          # Helper functions
```

---

## Role-Based Access

| Feature                  | Admin | Trainer | Member |
|--------------------------|-------|---------|--------|
| Manage Members           | ✓     |         |        |
| Manage Trainers          | ✓     |         |        |
| Manage Membership Plans  | ✓     |         |        |
| Manage Payments          | ✓     |         |        |
| View Dashboard Reports   | ✓     |         |        |
| View Assigned Members    |       | ✓       |        |
| Create/Update Workout Plans |    | ✓       |        |
| View Profile             |       |         | ✓      |
| View Membership Details  |       |         | ✓      |
| View Workout Plans       |       |         | ✓      |
| View Payment History     |       |         | ✓      |

---

## Deployment Topology (Target)

- **Frontend**: Served as a static build (Nginx or CDN).
- **Backend**: Packaged as a JAR, deployed on a Linux server or container.
- **Database**: Managed PostgreSQL instance.
- **Reverse Proxy**: Nginx routes `/api/*` to the backend and serves the frontend.

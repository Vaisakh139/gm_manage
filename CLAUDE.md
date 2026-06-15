# Gym Management System — CLAUDE.md

Full-stack gym membership management platform supporting three roles (ADMIN, GYM_OWNER, MEMBER).  
One gym owner can manage **multiple gym branches**.

- **Backend:** Spring Boot 4.0.6 · Java 17 · PostgreSQL · Spring Security 7 + JWT · MapStruct 1.6.3
- **Frontend:** React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · React Router v7 · Axios

---

## Project Structure

```
GymManagement/
├── backend/gym-management/
│   └── src/main/java/com/gymmanagement/gym_management/
│       ├── GymManagementApplication.java   ← @EntityScan + @EnableJpaRepositories scoped
│       ├── config/                         ← SecurityConfig, AsyncConfig, DataInitializer
│       ├── controller/                     ← AuthController, AdminController,
│       │                                      GymOwnerController, MemberController,
│       │                                      PublicController (+ legacy stubs)
│       ├── dto/
│       │   ├── auth/                       ← LoginRequest, AuthResponse, RegisterRequest, …
│       │   ├── admin/                      ← GymRequest/Response, UserResponse, DashboardStatsResponse
│       │   ├── gymowner/                   ← GymOwnerGymRequest, MemberRequest/Response,
│       │   │                                  GymOwnerDashboardResponse
│       │   ├── member/                     ← ProfileResponse, UpdateProfileRequest
│       │   ├── pub/                        ← GymPublicResponse
│       │   ├── ApiResponse.java            ← Standard envelope for all responses
│       │   └── PageResponse.java           ← Paginated response wrapper
│       ├── entity/                         ← User, Gym, Member, PasswordResetToken,
│       │                                      Role, MemberStatus   (JPA entities)
│       ├── exception/                      ← GlobalExceptionHandler, ResourceNotFoundException,
│       │                                      BusinessException
│       ├── filter/                         ← LoggingFilter (HTTP request/response logging)
│       ├── mapper/                         ← UserMapper, GymMapper, MemberMapper (MapStruct)
│       ├── model/                          ← Legacy stubs (empty classes, not JPA entities)
│       ├── repository/                     ← UserRepository, GymRepository, MemberRepository,
│       │                                      PasswordResetTokenRepository (active)
│       │                                      + legacy stubs (TrainerRepository, etc.)
│       ├── security/                       ← JwtUtil, JwtAuthFilter (@Lazy), UserDetailsServiceImpl
│       └── service/                        ← AuthService, AdminService, GymOwnerService,
│                                              MemberProfileService, EmailService, PublicGymService
│                                              + legacy stubs (DashboardService, etc.)
├── frontend/src/
│   ├── api/
│   │   ├── axios.ts                        ← Axios instance + all API endpoint groups
│   │   ├── interceptors.ts                 ← Request (JWT) + Response (401/403/500) interceptors
│   │   └── index.ts                        ← Barrel export
│   ├── components/
│   │   ├── common/                         ← Layout, Sidebar, ProtectedRoute, Toast
│   │   ├── public/                         ← Navbar, RegisterModal, GymSearchSection, GymDetailModal
│   │   └── ui/                             ← Modal, Badge
│   ├── context/
│   │   └── AuthContext.tsx                 ← JWT + user state, markPasswordChanged()
│   ├── pages/
│   │   ├── public/                         ← Home (landing page with search)
│   │   ├── auth/                           ← Login, ForgotPassword, ResetPassword, ChangePassword
│   │   ├── admin/                          ← Dashboard, GymManagement, UserManagement
│   │   ├── gymowner/                       ← Dashboard, GymProfile, MembersList, AddEditMember
│   │   └── member/                         ← Dashboard, Profile, MemberChangePassword
│   └── types/
│       └── index.ts                        ← All TypeScript interfaces
└── docs/                                   ← Architecture, API, Database, Setup, etc.
```

---

## Running the Project

### Prerequisites
- Java 17+, Maven 3.9+
- Node.js 20 LTS, npm 10+
- PostgreSQL 15+ (remote: `64.71.152.28/demodatabase`)

### Backend
```bash
cd backend/gym-management
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Default Admin Login
| Email | Password |
|---|---|
| admin@gym.com | admin123 |

---

## Database

- **Database:** `demodatabase` (remote PostgreSQL at `64.71.152.28`)
- **Schema:** `gym_management`
- **Connection string:** `jdbc:postgresql://64.71.152.28/demodatabase?currentSchema=gym_management`
- **DDL:** `spring.jpa.hibernate.ddl-auto=update` — Hibernate manages schema
- **Setup script:** `backend/gym-management/src/main/resources/db/create_tables.sql`

### Active Tables
| Table | Description |
|---|---|
| `users` | Auth accounts for all roles (ADMIN/GYM_OWNER/MEMBER) |
| `gyms` | Gym branches — one owner can have **many** gyms (`owner_id` is NOT unique) |
| `members` | Member records linked to a specific gym and user |
| `password_reset_tokens` | Time-limited (1 hr) tokens for forgot-password flow |

---

## Authentication Flow

1. `POST /api/auth/login` → returns JWT + `passwordChanged` flag
2. `JwtAuthFilter` validates every request (Bearer token → `UserDetailsServiceImpl`)
3. `UserDetailsService` injected with `@Lazy` to avoid startup ordering issue
4. `@PreAuthorize("hasAuthority('ROLE_X')")` enforces role access on each controller
5. If `passwordChanged = false` → frontend forces `/change-password` redirect

### Password Flows
- **First login:** Temp password emailed → forced change on first login
- **Forgot password:** `POST /api/auth/forgot-password` → email with reset link → `POST /api/auth/reset-password`
- **Voluntary change:** `POST /api/auth/change-password` (authenticated)

---

## Roles & Access

| Role | Key Permissions |
|---|---|
| `ADMIN` | Manage all gyms + owners + users; view dashboard stats |
| `GYM_OWNER` | Manage own gym branches; add/edit/delete members per branch |
| `MEMBER` | View own profile, membership, change password |
| _(public)_ | Landing page, gym search (`/api/public/**`) |

Authorities in JWT/Security: `ROLE_ADMIN`, `ROLE_GYM_OWNER`, `ROLE_MEMBER`

---

## Multi-Gym (Owner) Design

A GYM_OWNER can manage **multiple gym branches**:

```
GymOwner (User)
    ├── Gym A (Downtown)  ─── Member 1, Member 2
    ├── Gym B (Uptown)    ─── Member 3, Member 4
    └── Gym C (Suburb)    ─── Member 5
```

- `Gym.owner` is `@ManyToOne` (no unique constraint on `owner_id`)
- `GymRepository.findByOwnerIdOrderByCreatedAtAsc()` returns all branches
- Dashboard aggregates across all branches + per-branch breakdown
- All member operations require `gymId` to scope to the correct branch

---

## API Endpoints

### Public (no auth)
```
POST /api/auth/register          # Gym owner self-registration
POST /api/auth/login             # Returns JWT
POST /api/auth/forgot-password   # Send reset email
POST /api/auth/reset-password    # Apply reset token
GET  /api/public/gyms            # Search gyms by name/city
GET  /api/public/gyms/{id}       # Single gym public details
```

### Authenticated (any role)
```
POST /api/auth/change-password
```

### Admin only
```
GET/POST        /api/admin/gyms
PUT/DELETE      /api/admin/gyms/{id}
GET             /api/admin/users
PUT             /api/admin/users/{id}/status
GET             /api/admin/stats
```

### Equipment (multi-role)
```
GET/POST/PUT/DELETE  /api/admin/equipments/{id}         # Admin — all gyms
GET/POST/PUT/DELETE  /api/owner/equipments?gymId=X      # Gym owner — own gyms only
GET                  /api/member/equipments              # Member — own gym (read-only)
POST                 /api/uploads/equipment-image        # Image upload (admin/owner)
```

### Gym Owner only
```
GET/POST        /api/gym-owner/gyms           # List/create branches
GET/PUT         /api/gym-owner/gyms/{id}      # Get/update specific branch
GET             /api/gym-owner/dashboard      # Aggregate + per-branch stats
GET             /api/members?gymId=X          # Members of a branch
POST            /api/members                  # Add member (body includes gymId)
GET/PUT/DELETE  /api/members/{id}
```

### Member only
```
GET/PUT  /api/profile
```

---

## Entity Relationships

```
User (1) ──────────── (1) Member ───── (N:1) Gym
User (1) ──────────── (N) Gym  [as owner]
Gym  (1) ──────────── (N) Member
User (1) ──────────── (1) PasswordResetToken
```

- Creating a `Member` also creates their `User` (CascadeType.ALL)
- Creating a `Gym` (admin) also creates the `GymOwner` User
- Self-registration (`/api/auth/register`) creates User + Gym atomically
- Deletes are **hard deletes** (members and gyms are fully removed)

---

## Adding a New Feature

### Backend checklist
1. Add/update entity in `entity/` — run `mvn clean compile` after
2. Add/update repository in `repository/`
3. Add Request + Response DTOs in the appropriate `dto/` sub-package
4. Add mapper method in `mapper/` (MapStruct, `componentModel = "spring"`)
5. Add service method with `@Transactional` — map to DTO **inside** the transaction
6. Add controller endpoint with `@PreAuthorize("hasAuthority('ROLE_X')")`
7. Add route to `SecurityConfig.authorizeHttpRequests` if public

### Frontend checklist
1. Add TypeScript types in `types/index.ts`
2. Add API function in `api/axios.ts`
3. Add page in `pages/<role>/`
4. Register route in `App.tsx`
5. Add nav link in `components/common/Sidebar.tsx`

---

## Conventions

### Backend
- **Packages:** All active code in `entity/`, `repository/`, `service/`, `controller/`, etc.  
  The `model/` package contains **empty legacy stubs** — do not add code there.
- **Jakarta EE:** Always use `jakarta.*` — never `javax.*`
- **Lombok:** `@Data`, `@Builder`, `@Slf4j`, `@RequiredArgsConstructor` on services/controllers.  
  Use `@Builder.Default` for boolean fields with non-false defaults.
- **DTOs:** Separate Request and Response objects per domain. Never expose JPA entities directly.
- **Mapping:** MapStruct mappers — **always map inside `@Transactional` methods** to avoid  
  `LazyInitializationException` on lazy relationships.
- **Transactions:** Services are `@Transactional`; read-only operations use `@Transactional(readOnly = true)`
- **Logging:** `@Slf4j` + `log.info("[CONTEXT] Action | key=val ...")` on all write operations

### Frontend
- **Type-only imports:** `import type { Foo }` required (`verbatimModuleSyntax` is on)
- **No `any`:** Strict TypeScript throughout
- **API calls:** All go through `api/axios.ts` (single Axios instance with interceptors)
- **Auth state:** `context/AuthContext.tsx` — token in `localStorage`, role-based routing
- **Error handling:** Every API call needs `.catch()` and an error state with user-visible message
- **Loading states:** Every data-fetching component shows skeleton loaders during load

---

## Known Issues & Solutions

| Problem | Root Cause | Fix |
|---|---|---|
| `UserDetailsService` not found at startup | Bean init order: SecurityConfig loads before JPA | `@Lazy` on `UserDetailsService` in `JwtAuthFilter` constructor |
| `LazyInitializationException` on Gym serialisation | `Gym.owner` is LAZY, session closes before Jackson runs | Map to DTO inside `@Transactional` service method, never return raw entity |
| `NonUniqueResultException` on `/gym-owner/dashboard` | Multiple gyms per owner (by design now) | Changed `findByOwnerId` to `findByOwnerIdOrderByCreatedAtAsc` returning `List` |
| 403 on `POST /api/members` | Used `hasRole()` instead of `hasAuthority()` with underscore role names | All `@PreAuthorize` use `hasAuthority('ROLE_X')` explicitly |
| Stale `.class` files causing Hibernate `AnnotationException` | Old `model/*.class` in `target/` had `@Entity` | `@EntityScan("...entity")` in main class; always `mvn clean compile` after structural changes |
| `HHH90000025` dialect warning | Hibernate 7 auto-detects dialect | Removed `spring.jpa.properties.hibernate.dialect` from properties |

---

## Build Commands

```bash
# Backend
./mvnw clean compile          # After entity/package changes (clears stale .class)
./mvnw compile                # Fast incremental during development
./mvnw spring-boot:run        # Start the application

# Frontend
npm run dev                   # Development server (http://localhost:5173)
npm run build                 # Production build
npx tsc -b                    # TypeScript check only
```

> **Always use `mvn clean compile`** after renaming packages, removing `@Entity`, or moving classes.
> Plain `mvn compile` leaves old `.class` files that Hibernate scans at runtime.

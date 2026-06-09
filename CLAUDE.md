# Gym Management System — CLAUDE.md

Full-stack gym membership management system.
- **Backend:** Spring Boot 4 (Java 17), PostgreSQL, Spring Security 7 + JWT
- **Frontend:** React 19, TypeScript 6, Vite 8, React Router 7, Axios

---

## Project Structure

```
GymManagement/
├── backend/gym-management/          # Spring Boot application
│   └── src/main/java/com/gymmanagement/gym_management/
│       ├── auth/                    # Login endpoint + JWT response
│       ├── config/                  # SecurityConfig, DataInitializer
│       ├── controller/              # REST controllers (one per domain)
│       ├── dto/                     # Request/Response DTOs
│       ├── model/                   # JPA entities + enums
│       ├── repository/              # Spring Data JPA repositories
│       ├── security/                # JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
│       └── service/                 # Business logic (one per domain)
├── frontend/src/
│   ├── components/                  # Layout, ProtectedRoute
│   ├── pages/
│   │   ├── admin/                   # Dashboard, Members, Trainers, Plans, Payments
│   │   ├── trainer/                 # AssignedMembers, WorkoutPlans
│   │   └── member/                  # Profile, Membership, WorkoutPlan, PaymentHistory
│   ├── api.ts                       # All Axios API calls
│   ├── AuthContext.tsx              # Auth state (token, email, role)
│   ├── types.ts                     # All TypeScript interfaces
│   └── App.tsx                      # React Router route tree
└── docs/                            # Architecture, API, DB, security docs
```

---

## Running the Project

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

### Default Login
| Email | Password | Role |
|---|---|---|
| admin@gym.com | admin123 | ADMIN |

Create trainers/members via the Admin panel after login.

---

## Database

- **Database:** `demodatabase`
- **Schema:** `gym_management`
- **Config:** `backend/gym-management/src/main/resources/application.properties`
- **Setup script:** `backend/gym-management/src/main/resources/db/create_tables.sql`

Run the setup script once before starting the backend:
```bash
psql -U postgres -d demodatabase -f backend/gym-management/src/main/resources/db/create_tables.sql
```

### Tables
| Table | Description |
|---|---|
| `users` | Auth accounts for all roles |
| `members` | Member profiles (links to users + plans) |
| `trainers` | Trainer profiles (links to users) |
| `membership_plans` | Plan catalog with price + duration |
| `payments` | Payment records per member |
| `workout_plans` | Workout plans assigned by trainers to members |

### application.properties (change credentials as needed)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/demodatabase?currentSchema=gym_management
spring.datasource.username=postgres
spring.datasource.password=password
app.jwt.secret=3cfa76ef14937c1c0ea519f8fc057a80fcd04a7420f8e8bcd0a7567c272e007b
app.jwt.expiration=86400000
app.cors.allowed-origins=http://localhost:5173
```

---

## Authentication Flow

1. Client sends `POST /api/auth/login` with email + password
2. `AuthController` → `AuthService` → `AuthenticationManager.authenticate()`
3. `UserDetailsServiceImpl.loadUserByUsername()` loads user from DB
4. `BCryptPasswordEncoder` verifies the password
5. On success, `JwtUtil.generateToken()` creates a signed JWT (24h expiry)
6. Client stores token in `localStorage`, sends it as `Authorization: Bearer <token>` on every request
7. `JwtAuthFilter` intercepts every request, validates the token, and sets the `SecurityContext`
8. `@PreAuthorize` on each controller method enforces role-based access

---

## Roles & Access Control

| Role | Can Access |
|---|---|
| `ADMIN` | All endpoints — manage members, trainers, plans, payments; view dashboard |
| `TRAINER` | Their own workout plans, their assigned members |
| `MEMBER` | Their own profile, membership details, workout plans, payment history |

Role is embedded in the JWT and enforced server-side via `@PreAuthorize("hasRole('...')")`.

---

## Key API Endpoints

```
POST   /api/auth/login                  # Public — returns JWT

# Admin only
GET    /api/members                     # List all members
POST   /api/members                     # Create member (also creates User)
PUT    /api/members/{id}                # Update member
DELETE /api/members/{id}                # Soft-delete (sets active=false)

GET    /api/trainers                    # List all trainers
POST   /api/trainers                    # Create trainer
PUT    /api/trainers/{id}
DELETE /api/trainers/{id}

GET    /api/plans                       # List all plans (public)
POST   /api/plans                       # Create plan (admin only)
PUT    /api/plans/{id}
DELETE /api/plans/{id}

GET    /api/payments                    # All payments (admin)
POST   /api/payments                    # Record a payment
PUT    /api/payments/{id}
DELETE /api/payments/{id}

GET    /api/dashboard/stats             # Aggregate stats for admin dashboard

# Trainer only
GET    /api/workout-plans/trainer       # This trainer's workout plans
POST   /api/workout-plans               # Create a workout plan for a member
PUT    /api/workout-plans/{id}
DELETE /api/workout-plans/{id}

# Member only
GET    /api/members/me                  # Own profile
GET    /api/payments/my                 # Own payment history
GET    /api/workout-plans/member        # Own workout plans
```

---

## Domain Model

```
User  ──(1:1)──  Member  ──(N:1)──  MembershipPlan
User  ──(1:1)──  Trainer
Trainer  ──(1:N)──  WorkoutPlan  ──(N:1)──  Member
Member   ──(1:N)──  Payment  ──(N:1)──  MembershipPlan
```

- `User` implements Spring Security's `UserDetails` — it IS the security principal
- Creating a `Member` or `Trainer` automatically creates their `User` (cascaded)
- Deletes are **soft** — `active=false` on the entity and its linked `User`

---

## Adding a New Feature — Checklist

### Backend
1. Add entity in `model/` if new table needed
2. Add repository in `repository/` extending `JpaRepository`
3. Add Request + Response DTOs in `dto/`
4. Add service in `service/` — annotate with `@Service`, use `@Transactional`
5. Add controller in `controller/` — annotate with `@RestController`, add `@PreAuthorize`
6. Add SQL column/table to `db/create_tables.sql`

### Frontend
1. Add TypeScript types in `types.ts`
2. Add API functions in `api.ts`
3. Add page component in `pages/<role>/`
4. Register route in `App.tsx`
5. Add nav link in `components/Layout.tsx`

---

## Conventions

### Backend
- **Imports:** Always use `jakarta.*` — never `javax.*` (Spring Boot 4 / Jakarta EE 10)
- **Lombok:** Use `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@AllArgsConstructor` — no manual getters/setters
- **Services:** All public methods are `@Transactional`; read-only methods use `@Transactional(readOnly = true)`
- **DTOs:** Separate Request and Response objects for every endpoint — never expose entities directly
- **Enums:** `Role` (ADMIN, TRAINER, MEMBER) and `PaymentStatus` (PENDING, PAID, OVERDUE) are stored as strings in DB
- **Soft delete:** Set `active = false` on entity and linked `User`; never hard-delete members or trainers

### Frontend
- **Type-only imports:** Use `import type { Foo }` for interfaces/types (TypeScript `verbatimModuleSyntax` is on)
- **No `any`:** Strict TypeScript throughout
- **API calls:** All go through `api.ts` (Axios instance with auth interceptor)
- **Auth state:** Managed by `AuthContext` — token, email, role stored in `localStorage`
- **Styling:** Plain CSS in `index.css` — utility classes (`btn`, `card`, `badge`, `modal`, `stat-card`, etc.)

---

## Security Notes

- JWT secret is in `application.properties` — move to environment variable before deploying
- Passwords are BCrypt-hashed — never stored in plain text
- CORS is locked to `http://localhost:5173` — update `app.cors.allowed-origins` for production
- All endpoints except `/api/auth/**` require a valid JWT
- Role enforcement is **server-side** via `@PreAuthorize` — never trust the frontend role alone

---

## Common Issues & Fixes

| Problem | Cause | Fix |
|---|---|---|
| `NoSuchBeanDefinitionException: UserDetailsService` | `UserDetailsService` bean missing | Ensure `UserDetailsServiceImpl` exists in `security/` package with `@Service` |
| `403 Forbidden` on valid token | Role mismatch in `@PreAuthorize` | Check the role string — it's `ROLE_ADMIN` internally but you write `hasRole('ADMIN')` |
| CORS error from frontend | Origin not whitelisted | Set `app.cors.allowed-origins=http://localhost:5173` in properties |
| Token not sent | Axios interceptor not attached | All calls must go through the `api` instance in `api.ts`, not plain `axios` |
| `401` after login | Token expired or wrong secret | Check `app.jwt.secret` matches what was used to sign the token |
| Schema not found | `currentSchema` not set in JDBC URL | Use `?currentSchema=gym_management` in the datasource URL |

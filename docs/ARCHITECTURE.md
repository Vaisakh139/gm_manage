# Architecture

## System Overview

GymPro is a full-stack gym membership management system. A single GYM_OWNER can manage **multiple gym branches** under one account.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│   React 19 · TypeScript 6 · Tailwind CSS v4 · Vite 8       │
│   React Router v7 · Axios · Context API                     │
│   http://localhost:5173                                     │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP + JWT Bearer token
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
│   Spring Boot 4.0.6 · Java 17 · Spring Security 7          │
│   Spring Data JPA · Hibernate 7 · MapStruct 1.6.3           │
│   JJWT 0.12.6 · JavaMailSender (Gmail SMTP)                 │
│   http://localhost:8080                                     │
└────────────────────────┬────────────────────────────────────┘
                         │  JDBC (HikariCP)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│   PostgreSQL 15  ·  Database: demodatabase                  │
│   Schema: gym_management  ·  Host: 64.71.152.28             │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Layered Architecture

```
HTTP Request
     │
     ▼
LoggingFilter          → Logs method, URI, IP, user, status, duration (@Order 1)
JwtAuthFilter          → Validates Bearer token → populates SecurityContextHolder
Spring Security        → @PreAuthorize("hasAuthority('ROLE_X')") via AOP proxy
     │
     ▼
Controller             → @Valid input, delegates to service, wraps in ApiResponse<T>
     │
     ▼
Service (@Transactional) → Business logic; entity↔DTO mapping via MapStruct
                           (mapping happens HERE while session is open)
     │
     ▼
Repository             → Spring Data JPA — derived queries + JPQL
     │
     ▼
Entity / PostgreSQL
```

### Package Map

| Package | Purpose |
|---|---|
| `entity/` | JPA entities — **only package scanned by Hibernate** (`@EntityScan`) |
| `repository/` | Spring Data JPA interfaces (`@EnableJpaRepositories`) |
| `service/` | Business logic, `@Transactional`, `@Slf4j` |
| `controller/` | REST endpoints, `@PreAuthorize`, `@Valid` |
| `dto/auth/` | LoginRequest, AuthResponse, RegisterRequest, ChangePasswordRequest, … |
| `dto/admin/` | GymRequest/Response, UserResponse, DashboardStatsResponse |
| `dto/gymowner/` | GymOwnerGymRequest, MemberRequest/Response, GymOwnerDashboardResponse |
| `dto/member/` | ProfileResponse, UpdateProfileRequest |
| `dto/pub/` | GymPublicResponse (unauthenticated landing page) |
| `dto/` (root) | ApiResponse\<T\>, PageResponse\<T\> |
| `mapper/` | MapStruct: GymMapper, MemberMapper, UserMapper |
| `security/` | JwtUtil, JwtAuthFilter (@Lazy), UserDetailsServiceImpl |
| `config/` | SecurityConfig, AsyncConfig, DataInitializer |
| `filter/` | LoggingFilter |
| `exception/` | GlobalExceptionHandler, ResourceNotFoundException, BusinessException |
| `model/` | **Empty legacy stubs** — do not use |

---

## Entity Model

```
User  ──(1:N)──  Gym         (one owner, many branches)
Gym   ──(1:N)──  Member      (one branch, many members)
User  ──(1:1)──  Member      (one login account per member, CascadeType.ALL)
User  ──(1:1)──  PasswordResetToken
```

### Entity Fields

**User**
```
id, name, email (unique), password (BCrypt),
phone, role (ADMIN|GYM_OWNER|MEMBER),
passwordChanged (boolean), active (boolean),
createdAt, updatedAt
```

**Gym**
```
id, gymName, address, phone,
owner_id → users.id   (@ManyToOne LAZY — NOT unique, multiple branches allowed),
createdAt, updatedAt
```

**Member**
```
id,
gym_id  → gyms.id    (@ManyToOne LAZY),
user_id → users.id   (@OneToOne LAZY, cascade ALL, unique),
membershipPlan (String), startDate, endDate,
status (ACTIVE|INACTIVE|EXPIRED),
createdAt, updatedAt
```

**PasswordResetToken**
```
id, token (UUID, unique), user_id → users.id, expiryDate (1 hour)
```

---

## Security Architecture

### JWT Authentication Flow

```
POST /api/auth/login
    ↓
AuthController → AuthService.login()
    ↓
AuthenticationManager.authenticate(email, password)
    ↓
UserDetailsServiceImpl.loadUserByUsername(email)   ← @Lazy proxy used here
    ↓
UserRepository.findByEmail(email)  →  entity.User (implements UserDetails)
    ↓
BCryptPasswordEncoder.matches(rawPassword, hash)
    ↓ success
JwtUtil.generateToken(user)   →   HMAC-SHA256, sub=email, exp=24h
    ↓
AuthResponse { token, userId, name, email, role, passwordChanged }
```

**Every subsequent request:**
```
Authorization: Bearer <token>
    ↓
JwtAuthFilter
    1. jwtUtil.extractUsername(token)  →  email
    2. userDetailsService.loadUserByUsername(email)  →  User from DB
    3. jwtUtil.validateToken(token, user)  →  username match + not expired
    4. SecurityContextHolder ← UsernamePasswordAuthenticationToken(user, authorities)
    ↓
@PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")  →  pass or 403
```

**@Lazy on UserDetailsService:** Needed to break the Spring startup cycle:
`SecurityConfig → JwtAuthFilter → UserDetailsService → UserRepository → JPA (not ready yet)`

### Role-Based Access Control

| Role | Authority String | Controller Annotation |
|---|---|---|
| Admin | `ROLE_ADMIN` | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` on class |
| Gym Owner | `ROLE_GYM_OWNER` | `@PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")` on class |
| Member | `ROLE_MEMBER` | `@PreAuthorize("hasAuthority('ROLE_MEMBER')")` on class |
| Public | — | `permitAll()` in `SecurityConfig` for `/api/auth/**` and `/api/public/**` |

`hasAuthority('ROLE_X')` is used instead of `hasRole('X')` to avoid Spring Security 7 role-prefix ambiguity with underscore-named roles like `GYM_OWNER`.

---

## Multi-Gym Architecture

A GYM_OWNER can have multiple gym branches under one account:

```
GymOwner (User)
    ├── Gym "Downtown Branch"  →  Member A, Member B, Member C
    ├── Gym "Uptown Location"  →  Member D, Member E
    └── Gym "Suburb Studio"    →  Member F
```

- `Gym.owner` is `@ManyToOne` — `owner_id` has **no UNIQUE constraint**
- All member operations include `gymId` to scope to the correct branch
- Dashboard aggregates totals + per-branch breakdown in one response
- Ownership validated via `gymRepository.findByIdAndOwnerId(gymId, ownerId)`

---

## Frontend Architecture

### State & Data Flow

```
AuthContext (Context API)
    ├── user: { token, userId, name, email, role, passwordChanged }
    ├── Persisted in localStorage
    └── Checked by ProtectedRoute on every navigation

api/interceptors.ts
    ├── Request: attach Authorization: Bearer <token>
    └── Response:
        ├── 401 → localStorage.clear() + window.location.replace('/login')
        ├── 403 → console.warn (component shows message)
        ├── Network error → "Unable to reach server"
        └── 500 → console.error (component shows message)
```

### Routing Structure

```
/                    → Home (public landing page + gym search)
/login               → Login
/forgot-password     → Forgot Password
/reset-password      → Reset Password (token in query param)
/change-password     → Change Password (any authenticated user)

/admin/dashboard     → Stats overview
/admin/gyms          → Gym management (CRUD + owner creation)
/admin/users         → User management (enable/disable)

/gym-owner/dashboard → Aggregate + per-branch stats
/gym-owner/profile   → Manage gym branches (list + create + edit)
/gym-owner/members   → Member list (branch selector, search, pagination)
/gym-owner/members/add         → Add member (gym selector)
/gym-owner/members/:id/edit    → Edit member

/member/dashboard    → Membership overview
/member/profile      → View/edit profile
/member/change-password → Change password
```

---

## Email Architecture

Emails are sent asynchronously (non-blocking for the HTTP request):

```
Service method (e.g. addMember)
    │
    ├── Saves user + member to DB (synchronous, within @Transactional)
    └── emailService.sendWelcomeEmail()   ← @Async → background thread
            │
            ▼
    JavaMailSender → Gmail SMTP → inbox
```

`AsyncConfig` (`@EnableAsync`) enables Spring's `@Async` support.  
`spring.mail.test-connection=false` prevents startup failure if SMTP is unreachable.

---

## MapStruct Mapping Strategy

All entity→DTO mapping is done via MapStruct inside `@Transactional` service methods:

```java
// CORRECT — inside @Transactional, Hibernate session is open
@Transactional(readOnly = true)
public GymResponse getGymById(Long gymId, Long ownerId) {
    Gym gym = findGymByIdAndOwner(gymId, ownerId);
    return gymMapper.toGymResponse(gym);  // gym.owner accessed here — OK
}

// WRONG — returns entity, Jackson accesses gym.owner AFTER session closes
public Gym getGymById(Long gymId) {
    return gymRepository.findById(gymId).get();  // → LazyInitializationException
}
```

MapStruct processor runs **after Lombok** in the Maven annotation processor chain:
`lombok → lombok-mapstruct-binding → mapstruct-processor`

# Security Guide

## Authentication

### JWT (JSON Web Tokens)

- **Algorithm:** HMAC-SHA256 (`HS256`)
- **Library:** JJWT 0.12.6
- **Token lifetime:** 24 hours (`app.jwt.expiration=86400000` ms)
- **Subject claim:** User email address
- **Additional claims:** `role`, `name`
- **Secret:** 64-character hex string in `application.properties` — **change before production**

Token generation:
```java
Jwts.builder()
    .subject(user.getEmail())
    .claim("role", user.getRole().name())
    .claim("name", user.getName())
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + expiration))
    .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
    .compact();
```

### Password Hashing

BCrypt with Spring Security's default cost factor (10 rounds):
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();   // strength = 10 (default)
}
```

### First-Login Password Change

When the system creates an account (admin creates gym owner, gym owner adds member):
1. A random 10-character temp password is generated (`UUID.randomUUID().toString().substring(0, 10)`)
2. BCrypt-hashed and stored
3. Emailed to the user in plain text (one-time)
4. `passwordChanged = false` is set on the User record
5. The JWT response includes `"passwordChanged": false`
6. Frontend `ProtectedRoute` detects this and redirects to `/change-password`
7. After changing, `passwordChanged = true` is stored — redirect is removed

---

## Authorization

### Role-Based Access Control (RBAC)

Three roles enforced at the controller level:

| Role | `ROLE_` string | Access |
|---|---|---|
| `ADMIN` | `ROLE_ADMIN` | Full system — all gyms, all users |
| `GYM_OWNER` | `ROLE_GYM_OWNER` | Own gym branches and their members only |
| `MEMBER` | `ROLE_MEMBER` | Own profile only |
| (public) | none | `/api/auth/**`, `/api/public/**` |

### Enforcement

`@PreAuthorize("hasAuthority('ROLE_X')")` at **class level** in every controller:

```java
@RestController
@PreAuthorize("hasAuthority('ROLE_GYM_OWNER')")
public class GymOwnerController { ... }
```

`hasAuthority('ROLE_GYM_OWNER')` is used instead of `hasRole('GYM_OWNER')` to prevent Spring Security 7's role-prefix logic from mishandling underscore-named roles.

### Ownership Validation

Gym owner can only access **their own** gyms and members:

```java
// Gym ownership: fetch by id AND ownerId in one query
gymRepository.findByIdAndOwnerId(gymId, ownerId)
    .orElseThrow(() -> new ResourceNotFoundException("Gym not found or does not belong to you"));

// Member ownership: check member.gym.owner.id
if (!member.getGym().getOwner().getId().equals(ownerId)) {
    throw new BusinessException("This member does not belong to one of your gyms");
}
```

---

## Spring Security Configuration

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()    // login, register, forgot/reset password
    .requestMatchers("/api/public/**").permitAll()  // gym search (landing page)
    .anyRequest().authenticated()
)
```

Session management: **STATELESS** — no session cookies, JWT only.

CSRF: **disabled** (stateless JWT API, no browser session).

### Exception Handling at Filter Level

Custom `AuthenticationEntryPoint` and `AccessDeniedHandler` return JSON instead of HTML:

```json
// 401 Unauthorized (no/invalid token)
{ "success": false, "message": "Authentication required — please log in" }

// 403 Forbidden (valid token, wrong role — URL-level)
{ "success": false, "message": "You do not have permission to perform this action" }
```

Method-level 403 (from `@PreAuthorize`) is caught by `GlobalExceptionHandler.handleAuthorizationDenied()`.

---

## CORS

Configured in `SecurityConfig`:

```java
config.setAllowedOrigins(List.of("http://localhost:5173"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("*"));
config.setAllowCredentials(true);
```

For production, update `app.cors.allowed-origins` to your actual frontend domain.

---

## Password Reset Flow

```
1. POST /api/auth/forgot-password  { "email": "user@example.com" }
        ↓
2. AuthService deletes any existing token for this user
3. Generates UUID token, saves with expiryDate = now + 1 hour
4. Sends email: "https://frontend/reset-password?token=UUID"
5. Response always 200 (prevents email enumeration)

6. User clicks link → frontend shows reset form

7. POST /api/auth/reset-password  { "token": "UUID", "newPassword": "..." }
        ↓
8. AuthService validates token (not expired, exists in DB)
9. Sets new BCrypt-hashed password, passwordChanged = true
10. Deletes token from DB
```

---

## Data Exposure

### What's NOT in the API Response

- Password hashes — all mappers (`GymMapper`, `MemberMapper`, `UserMapper`) use DTOs that exclude the `password` field
- Admin-only fields not exposed to members (e.g. `active`, `passwordChanged` not in `ProfileResponse`)

### Entity vs DTO Rule

**Never return a JPA entity directly from a controller.** Always map to a DTO inside a `@Transactional` method:

```java
// SECURE — password hash never reaches Jackson serializer
return gymMapper.toGymResponse(gym);

// INSECURE — entity.User.password would be serialized
return ResponseEntity.ok(gym);  // Gym.owner is a User with password field
```

---

## Sensitive Data in Logs

The `LoggingFilter` logs: HTTP method, URI, IP, response status, duration, authenticated user email.

**It does NOT log:**
- Request body (passwords, personal data)
- JWT token values
- Password hashes

Service-level logs (`AuthService`, `GymOwnerService`, etc.) log emails and IDs but never passwords.

---

## Production Security Checklist

- [ ] Change `app.jwt.secret` to a new random 256-bit (32-byte) secret
- [ ] Set `app.cors.allowed-origins` to your exact frontend domain (no wildcards)
- [ ] Serve backend over HTTPS (TLS 1.2+)
- [ ] Move all secrets from `application.properties` to environment variables
- [ ] Set `spring.jpa.show-sql=false` (already done)
- [ ] Set `logging.level.root=WARN` (already done)
- [ ] Consider shorter JWT expiry (e.g. 1 hour) with refresh token implementation
- [ ] Enable PostgreSQL SSL: append `?ssl=true&sslmode=require` to JDBC URL
- [ ] Rate-limit `/api/auth/login` and `/api/auth/forgot-password`
- [ ] Add `Content-Security-Policy` headers (can be added in `SecurityConfig`)

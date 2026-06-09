# Security Guide

## Overview

Security is built into the system at every layer — API, service logic, database, and frontend. This document describes the security model, mechanisms in place, and rules developers must follow.

---

## Authentication

### Mechanism

- **JWT (JSON Web Token)** issued on successful login.
- Tokens are signed using **HMAC-SHA256** with a secret key stored in environment configuration (never in code).
- Token expiry: **24 hours** by default (configurable via `jwt.expiration-ms`).
- No refresh token is issued in the initial version — users must re-authenticate after expiry.

### Token Flow

```
Client → POST /api/v1/auth/login → Server validates credentials
                                 → Server issues signed JWT
Client → Stores token (memory or httpOnly cookie)
Client → Sends token in Authorization: Bearer <token> header on every request
Server → JWT filter validates signature and expiry on every protected request
```

### Token Storage (Frontend)

- Prefer storing the JWT in **memory** (JavaScript variable) for the strongest XSS protection.
- If persistence across page refreshes is required, store in an **httpOnly cookie** — never in `localStorage` or `sessionStorage`.
- Clearing auth state on logout must also remove the stored token.

---

## Authorization

### Role-Based Access Control (RBAC)

Three roles are defined: `ADMIN`, `TRAINER`, `MEMBER`.

- Role is stored in the JWT payload and enforced server-side on every request.
- Frontend uses role to determine what UI to show — this is for UX only and is not a security boundary.
- Backend enforces all access rules regardless of frontend state.

### Enforcement

- Spring Security `SecurityFilterChain` defines method-level or URL-level access rules.
- `@PreAuthorize` annotations on service or controller methods enforce fine-grained rules.
- A member may only access their own data — service layer must verify `authenticatedUserId == requestedResourceOwnerId` before returning or modifying data.

---

## Input Validation

### Backend

- All incoming request bodies are validated with Bean Validation (`@Valid`, `@NotNull`, `@Email`, `@Size`, etc.).
- Validation failures return `400 Bad Request` with a structured error response — never raw exception stack traces.
- Never trust any value from the client as inherently safe.

### SQL Injection Prevention

- All database queries use **JPA / JPQL parameterized queries** or **Spring Data repository methods**.
- Raw SQL strings built with string concatenation are prohibited.
- Native queries must use named parameters (`:paramName`), never string interpolation.

### Frontend

- Validate form inputs before submission (client-side validation for UX only).
- Never use `dangerouslySetInnerHTML` unless the content is explicitly sanitized.
- Any content rendered from user input or API responses must go through React's default escaping — no raw HTML injection.

---

## Password Security

- Passwords are hashed using **BCrypt** before storage — plain-text passwords never touch the database.
- `PasswordEncoder` bean is configured with a strength factor of at least 12.
- Password reset flows (if implemented) must use time-limited, single-use tokens sent to the registered email.

---

## CORS Configuration

- CORS is configured server-side in Spring Security to allow requests only from the known frontend origin.
- Allowed origin must be specified explicitly — `*` (wildcard) is not permitted in production.
- Only required HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and headers (`Authorization`, `Content-Type`) are allowed.

---

## HTTPS

- All production traffic must be served over **HTTPS**.
- HTTP requests should be redirected to HTTPS at the reverse proxy (Nginx) level.
- JWT tokens sent over plain HTTP are considered compromised.

---

## Sensitive Data Handling

- JWT secret, database credentials, and any API keys are stored in environment variables or a secrets manager — never in source code or committed property files.
- `.env` and `application-local.properties` files must be in `.gitignore`.
- Log statements must never include passwords, tokens, or personally identifiable information (PII).
- Responses must never return `password_hash` or internal system fields.

---

## Error Handling and Information Leakage

- Production error responses return a generic message and an error code — not stack traces or internal details.
- The global `@RestControllerAdvice` maps all exceptions to structured responses.
- `404 Not Found` is preferred over `403 Forbidden` when hiding the existence of a resource from unauthorized users.

---

## Security Checklist for Code Reviews

Before merging any PR, verify:

- [ ] No credentials, tokens, or secrets in the code or config files.
- [ ] All new endpoints have appropriate `@PreAuthorize` or security config entries.
- [ ] Service layer verifies ownership before returning or modifying user-scoped data.
- [ ] No raw SQL built with string concatenation.
- [ ] No `dangerouslySetInnerHTML` on the frontend.
- [ ] New environment variables are documented in `SETUP.md` and never hardcoded.
- [ ] Log messages do not contain sensitive data.

---

## Known Limitations (v1)

- No rate limiting on the login endpoint — brute-force protection is not implemented in the initial version.
- No refresh token mechanism — token expiry requires full re-authentication.
- No audit log of admin actions.

These are tracked as planned improvements for a future release.

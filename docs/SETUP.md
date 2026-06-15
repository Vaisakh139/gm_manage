# Setup Guide

## Prerequisites

| Tool | Minimum Version | Check |
|---|---|---|
| Java | 17 | `java -version` |
| Maven | 3.9 | `./mvnw -version` |
| Node.js | 20 LTS | `node -version` |
| npm | 10 | `npm -version` |
| PostgreSQL | 15 | Remote at `64.71.152.28` |

---

## Quick Start

### 1. Clone / Open Project

```
GymManagement/
├── backend/gym-management/   ← Spring Boot application
├── frontend/                 ← React + Vite application
└── docs/
```

### 2. Database (already configured)

The project connects to a remote PostgreSQL database:
- Host: `64.71.152.28`
- Database: `demodatabase`
- Schema: `gym_management`
- Credentials: see `application.properties`

**First-time setup only** — run the table creation script if the schema is empty:

```bash
psql -U demouser -h 64.71.152.28 -d demodatabase \
  -f backend/gym-management/src/main/resources/db/create_tables.sql
```

### 3. Start the Backend

```bash
cd backend/gym-management
./mvnw spring-boot:run
```

Wait for:
```
INFO  c.g.g.GymManagementApplication : Started GymManagementApplication in X seconds
```

Backend runs at: `http://localhost:8080`

### 4. Start the Frontend

```bash
cd frontend
npm install        # first time only
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Login

Open `http://localhost:5173` → you'll see the landing page.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gym.com` | `admin123` |

---

## Configuration

### Backend — `application.properties`

Located at `backend/gym-management/src/main/resources/application.properties`.

```properties
# Database
spring.datasource.url=jdbc:postgresql://64.71.152.28/demodatabase?currentSchema=gym_management
spring.datasource.username=demouser
spring.datasource.password=<password>

# JPA
spring.jpa.hibernate.ddl-auto=update    # update | validate | none
spring.jpa.open-in-view=false           # always false for REST APIs

# JWT (change secret in production)
app.jwt.secret=<64-char hex string>
app.jwt.expiration=86400000             # 24 hours in ms

# CORS
app.cors.allowed-origins=http://localhost:5173

# App
app.frontend-url=http://localhost:5173  # used in email reset links

# Mail
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=<gmail address>
spring.mail.password=<app password>     # Gmail App Password (not account password)
spring.mail.test-connection=false       # don't fail startup if SMTP unreachable

server.port=8080
```

### Frontend — Environment

The API base URL is hardcoded in `frontend/src/api/axios.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15_000,
});
```

For production, extract this to a `.env` file:
```
VITE_API_URL=https://your-api-domain.com/api
```

And update `axios.ts`:
```typescript
baseURL: import.meta.env.VITE_API_URL,
```

---

## Gmail App Password Setup

The system sends emails via Gmail SMTP. To set up:

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail"
4. Set `spring.mail.password=<generated 16-char password>` (spaces in the password are fine)

> Do NOT use your regular Gmail password — use an App Password only.

---

## Development Commands

### Backend

```bash
# Full clean build (use after entity/package changes)
./mvnw clean compile

# Start with hot reload
./mvnw spring-boot:run

# Run tests
./mvnw test

# Package as JAR
./mvnw clean package -DskipTests
```

### Frontend

```bash
npm run dev        # Development server with HMR
npm run build      # Production build to dist/
npm run lint       # ESLint check
npx tsc -b         # TypeScript type check only
```

---

## Logging

Log output is configured in `application.properties`:

```properties
logging.level.root=WARN
logging.level.com.gymmanagement.gym_management=INFO
logging.level.com.gymmanagement.gym_management.filter=INFO
```

**INFO** level shows every HTTP request, business actions (member added, gym created, etc.)  
**DEBUG** level (commented out) adds read operations (member list fetched, dashboard stats)

Sample output:
```
11:34:00.001 INFO  c.g.g.filter.LoggingFilter  : → POST   /api/auth/login     [IP: 127.0.0.1]
11:34:00.088 INFO  c.g.g.service.AuthService   : [AUTH] Login successful | email=admin@gym.com role=ADMIN
11:34:00.090 INFO  c.g.g.filter.LoggingFilter  : ← POST   /api/auth/login     [200] [user: admin@gym.com] 89ms
```

---

## Production Deployment Checklist

- [ ] Change `app.jwt.secret` to a new random 64-char hex string
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`)
- [ ] Set `app.cors.allowed-origins` to your actual frontend domain
- [ ] Set `app.frontend-url` to your actual frontend domain
- [ ] Configure real SMTP credentials (or use SendGrid/SES)
- [ ] Move secrets to environment variables (not in properties file)
- [ ] Enable HTTPS on both backend and frontend
- [ ] Set `logging.level.root=WARN` (already configured)
- [ ] Extract `VITE_API_URL` to `.env.production` in frontend
- [ ] Build frontend with `npm run build` and serve from CDN or nginx

---

## Troubleshooting

### `UserDetailsService` not found at startup
**Cause:** Bean initialization order — JPA not ready when SecurityConfig loads.  
**Fix:** `@Lazy` is already applied to `UserDetailsService` in `JwtAuthFilter` constructor.

### `LazyInitializationException` on API response
**Cause:** Returning a JPA entity from a controller — Jackson hits lazy-loaded fields after the Hibernate session closes.  
**Fix:** Always map entity → DTO inside a `@Transactional` service method.

### `HHH90000025` dialect warning
**Cause:** Hibernate 7 auto-detects PostgreSQL.  
**Fix:** `hibernate.dialect` property is already commented out.

### `spring.jpa.open-in-view` warning
**Fix:** `spring.jpa.open-in-view=false` is already set.

### Stale `.class` files cause `AnnotationException` at startup
**Cause:** `mvn compile` (not `clean`) leaves old bytecode.  
**Fix:** Always run `./mvnw clean compile` after changing entity classes or package structure.

### Port already in use
```bash
# Kill process on port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

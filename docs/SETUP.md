# Setup Guide

## Prerequisites

Make sure the following are installed on your machine before proceeding.

| Tool        | Minimum Version | Purpose                          |
|-------------|-----------------|----------------------------------|
| Java (JDK)  | 17              | Backend runtime                  |
| Maven       | 3.9+            | Backend build tool               |
| Node.js     | 20 LTS          | Frontend runtime                 |
| npm         | 10+             | Frontend package manager         |
| PostgreSQL  | 15+             | Database                         |
| Git         | Any             | Version control                  |

---

## Repository Structure

```
GymManagement/
├── backend/        # Spring Boot project
├── frontend/       # React + TypeScript project
└── docs/           # Project documentation
```

---

## 1. Database Setup

1. Start PostgreSQL and connect as a superuser.
2. Create the database and a dedicated user:

```sql
CREATE DATABASE gym_management;
CREATE USER gym_user WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE gym_management TO gym_user;
```

3. Flyway will run all migrations automatically on first backend startup — no manual SQL execution needed.

---

## 2. Backend Setup

### Configuration

Navigate to `backend/src/main/resources/` and create `application-local.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gym_management
spring.datasource.username=gym_user
spring.datasource.password=yourpassword

jwt.secret=replace-with-a-strong-random-secret-at-least-256-bits
jwt.expiration-ms=86400000

spring.flyway.enabled=true
```

> The active profile is controlled by `spring.profiles.active`. Set it to `local` during development.

### Run the Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

The API will be available at `http://localhost:8080`.

### Build a JAR

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/gym-management-*.jar --spring.profiles.active=local
```

---

## 3. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Run the Frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
cd frontend
npm run build
```

The output is in `frontend/dist/`.

---

## 4. Seed Data (Development)

A seed SQL script is provided at `backend/src/main/resources/db/seed/dev-seed.sql`.

Run it manually against your local database after the first startup:

```bash
psql -U gym_user -d gym_management -f backend/src/main/resources/db/seed/dev-seed.sql
```

This creates:
- One default admin user (`admin@gym.com` / `admin123`)
- Two sample trainers
- Five sample members
- Two membership plans

---

## 5. Running Both Together

Open two terminal tabs:

**Terminal 1 — Backend:**
```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

---

## Environment Variables Reference

### Backend (`application-local.properties`)

| Property                        | Description                               |
|---------------------------------|-------------------------------------------|
| `spring.datasource.url`         | JDBC connection URL                       |
| `spring.datasource.username`    | Database username                         |
| `spring.datasource.password`    | Database password                         |
| `jwt.secret`                    | Secret key for signing JWT tokens         |
| `jwt.expiration-ms`             | Token expiry in milliseconds              |
| `spring.flyway.enabled`         | Enable or disable Flyway migrations       |

### Frontend (`.env.local`)

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `VITE_API_BASE_URL`   | Full base URL for backend API calls |

---

## Common Issues

### Port already in use (8080)
```bash
# Find and kill the process using port 8080
lsof -i :8080
kill -9 <PID>
```

### Database connection refused
- Verify PostgreSQL is running: `pg_ctl status`
- Check credentials in `application-local.properties`

### Frontend can't reach the API
- Verify `VITE_API_BASE_URL` in `.env.local` points to the correct backend address.
- Confirm the backend is running and CORS is configured for `http://localhost:5173`.

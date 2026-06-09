# Database Design

## Overview

- **DBMS**: PostgreSQL 15
- **ORM**: Hibernate via Spring Data JPA
- **Schema Management**: Flyway migrations (versioned SQL scripts)
- **Naming Convention**: snake_case for all table and column names

---

## Entity Relationship Summary

```
users ──────────────── roles
  │
  ├── members ─────── membership_plans
  │       │
  │       ├── payments
  │       └── workout_plan_assignments ──── workout_plans
  │
  └── trainers ──── workout_plans
```

---

## Tables

### `users`
Central authentication table shared by all roles.

| Column        | Type           | Constraints              |
|---------------|----------------|--------------------------|
| id            | BIGSERIAL      | PRIMARY KEY              |
| email         | VARCHAR(255)   | UNIQUE, NOT NULL         |
| password_hash | VARCHAR(255)   | NOT NULL                 |
| role          | VARCHAR(20)    | NOT NULL (ADMIN/TRAINER/MEMBER) |
| is_active     | BOOLEAN        | NOT NULL, DEFAULT true   |
| created_at    | TIMESTAMPTZ    | NOT NULL, DEFAULT now()  |
| updated_at    | TIMESTAMPTZ    | NOT NULL, DEFAULT now()  |

---

### `members`
Profile information for users with the MEMBER role.

| Column         | Type         | Constraints              |
|----------------|--------------|--------------------------|
| id             | BIGSERIAL    | PRIMARY KEY              |
| user_id        | BIGINT       | FK → users.id, UNIQUE    |
| full_name      | VARCHAR(255) | NOT NULL                 |
| phone          | VARCHAR(20)  |                          |
| date_of_birth  | DATE         |                          |
| address        | TEXT         |                          |
| joined_date    | DATE         | NOT NULL                 |
| plan_id        | BIGINT       | FK → membership_plans.id |
| plan_start_date| DATE         |                          |
| plan_end_date  | DATE         |                          |
| created_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |
| updated_at     | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |

---

### `trainers`
Profile information for users with the TRAINER role.

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| id            | BIGSERIAL    | PRIMARY KEY              |
| user_id       | BIGINT       | FK → users.id, UNIQUE    |
| full_name     | VARCHAR(255) | NOT NULL                 |
| phone         | VARCHAR(20)  |                          |
| specialization| VARCHAR(255) |                          |
| bio           | TEXT         |                          |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |

---

### `membership_plans`
Defines the available gym membership tiers.

| Column        | Type           | Constraints              |
|---------------|----------------|--------------------------|
| id            | BIGSERIAL      | PRIMARY KEY              |
| name          | VARCHAR(255)   | NOT NULL                 |
| description   | TEXT           |                          |
| duration_days | INTEGER        | NOT NULL                 |
| price         | NUMERIC(10, 2) | NOT NULL                 |
| is_active     | BOOLEAN        | NOT NULL, DEFAULT true   |
| created_at    | TIMESTAMPTZ    | NOT NULL, DEFAULT now()  |
| updated_at    | TIMESTAMPTZ    | NOT NULL, DEFAULT now()  |

---

### `payments`
Records payment transactions for members.

| Column          | Type           | Constraints              |
|-----------------|----------------|--------------------------|
| id              | BIGSERIAL      | PRIMARY KEY              |
| member_id       | BIGINT         | FK → members.id          |
| plan_id         | BIGINT         | FK → membership_plans.id |
| amount          | NUMERIC(10, 2) | NOT NULL                 |
| payment_date    | DATE           | NOT NULL                 |
| payment_method  | VARCHAR(50)    | NOT NULL                 |
| status          | VARCHAR(20)    | NOT NULL (PAID/PENDING/FAILED) |
| notes           | TEXT           |                          |
| created_at      | TIMESTAMPTZ    | NOT NULL, DEFAULT now()  |

---

### `workout_plans`
Workout plans created by trainers.

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| id            | BIGSERIAL    | PRIMARY KEY              |
| trainer_id    | BIGINT       | FK → trainers.id         |
| title         | VARCHAR(255) | NOT NULL                 |
| description   | TEXT         |                          |
| goal          | VARCHAR(100) |                          |
| duration_weeks| INTEGER      |                          |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  |

---

### `workout_plan_assignments`
Junction table linking workout plans to specific members.

| Column         | Type        | Constraints              |
|----------------|-------------|--------------------------|
| id             | BIGSERIAL   | PRIMARY KEY              |
| workout_plan_id| BIGINT      | FK → workout_plans.id    |
| member_id      | BIGINT      | FK → members.id          |
| assigned_date  | DATE        | NOT NULL                 |
| notes          | TEXT        |                          |

---

## Indexes

| Table                       | Index Column(s)       | Purpose                    |
|-----------------------------|-----------------------|----------------------------|
| users                       | email                 | Login lookup               |
| members                     | user_id               | Profile fetch by auth user |
| trainers                    | user_id               | Profile fetch by auth user |
| payments                    | member_id             | Payment history lookup     |
| workout_plan_assignments    | member_id             | Member's workout plans     |
| workout_plan_assignments    | workout_plan_id       | Members in a plan          |

---

## Migration Strategy

- All schema changes are managed via **Flyway** versioned migration scripts.
- Migration files are located at `src/main/resources/db/migration/`.
- Naming format: `V{version}__{description}.sql` (e.g., `V1__create_users_table.sql`).
- Never modify an already-applied migration file; always create a new version.

# Database Design

## Connection Details

| Property | Value |
|---|---|
| Host | `64.71.152.28` |
| Database | `demodatabase` |
| Schema | `gym_management` |
| User | `demouser` |
| Port | `5432` |
| Driver | `org.postgresql.Driver` |

JDBC URL: `jdbc:postgresql://64.71.152.28/demodatabase?currentSchema=gym_management`

---

## Schema Management

`spring.jpa.hibernate.ddl-auto=update` — Hibernate automatically creates and alters tables to match the entity classes. For production, switch to `validate` after running the setup script.

Run the setup script once on a fresh database:
```bash
psql -U demouser -h 64.71.152.28 -d demodatabase -f backend/gym-management/src/main/resources/db/create_tables.sql
```

---

## Tables

### `users`

Stores authentication accounts for all roles.

```sql
CREATE TABLE users (
    id               BIGSERIAL    PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,          -- BCrypt hash
    phone            VARCHAR(20),
    role             VARCHAR(20)  NOT NULL            -- ADMIN | GYM_OWNER | MEMBER
                         CHECK (role IN ('ADMIN','GYM_OWNER','MEMBER')),
    password_changed BOOLEAN      NOT NULL DEFAULT FALSE,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

### `gyms`

Gym branches. One GYM_OWNER can own **multiple** rows (different locations).

```sql
CREATE TABLE gyms (
    id          BIGSERIAL    PRIMARY KEY,
    gym_name    VARCHAR(200) NOT NULL,
    address     TEXT,
    phone       VARCHAR(20),
    owner_id    BIGINT       NOT NULL REFERENCES users(id),   -- NOT UNIQUE
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gyms_owner_id ON gyms(owner_id);
```

> `owner_id` is **not** unique — one owner can have multiple branches.

---

### `members`

Gym member records linking a User account to a specific gym branch.

```sql
CREATE TABLE members (
    id               BIGSERIAL   PRIMARY KEY,
    gym_id           BIGINT      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id          BIGINT      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_plan  VARCHAR(100),
    start_date       DATE,
    end_date         DATE,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','INACTIVE','EXPIRED')),
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_gym_id  ON members(gym_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status  ON members(status);
```

---

### `password_reset_tokens`

Time-limited (1 hour) tokens for the forgot-password flow.

```sql
CREATE TABLE password_reset_tokens (
    id           BIGSERIAL    PRIMARY KEY,
    token        VARCHAR(255) NOT NULL UNIQUE,   -- UUID string
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date  TIMESTAMP    NOT NULL
);

CREATE INDEX idx_prt_token   ON password_reset_tokens(token);
CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);
```

---

### `equipments`

```sql
CREATE TABLE equipments (
    id          BIGSERIAL     PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    description VARCHAR(500),
    image_url   VARCHAR(500),
    quantity    INTEGER       NOT NULL DEFAULT 0,
    status      VARCHAR(30)   NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','UNDER_MAINTENANCE','OUT_OF_SERVICE')),
    gym_id      BIGINT        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipments_gym_id ON equipments(gym_id);
CREATE INDEX idx_equipments_status ON equipments(status);
```

Images are stored on disk at `uploads/equipments/` and served at `/uploads/equipments/<filename>`.

---

## Entity Relationships

```
users  (1) ──────── (N) gyms               via owner_id
gyms   (1) ──────── (N) members            via gym_id
users  (1) ──────── (1) members            via user_id  (UNIQUE)
users  (1) ──────── (1) password_reset_tokens via user_id
gyms   (1) ──────── (N) equipments         via gym_id
```

### Cascade Behaviour

| Relationship | On Delete |
|---|---|
| `gyms.owner_id → users` | Restricted (manual delete) |
| `members.gym_id → gyms` | `CASCADE` — deleting a gym deletes all its members |
| `members.user_id → users` | `CASCADE` — deleting a user deletes their member record |
| `password_reset_tokens.user_id → users` | `CASCADE` — deleting a user removes their tokens |

---

## JPA Entity → Column Mapping

Hibernate's `SpringPhysicalNamingStrategy` converts `camelCase` Java fields to `snake_case` columns:

| Java Field | DB Column |
|---|---|
| `gymName` | `gym_name` |
| `passwordChanged` | `password_changed` |
| `startDate` | `start_date` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

---

## Seed Data

`DataInitializer` runs on startup and creates the default admin if it doesn't exist:

```
Email:    admin@gym.com
Password: admin123   (BCrypt hash stored)
Role:     ADMIN
```

Membership plans are no longer a separate table — `membershipPlan` is a free-text field on `members`.

---

## Indexes Summary

| Table | Index | Column(s) | Type |
|---|---|---|---|
| `users` | `idx_users_email` | `email` | Unique (via column constraint) |
| `gyms` | `idx_gyms_owner_id` | `owner_id` | Non-unique B-tree |
| `members` | `idx_members_gym_id` | `gym_id` | Non-unique B-tree |
| `members` | `idx_members_user_id` | `user_id` | Unique (via column constraint) |
| `members` | `idx_members_status` | `status` | Non-unique B-tree |
| `password_reset_tokens` | `idx_prt_token` | `token` | Unique (via column constraint) |
| `password_reset_tokens` | `idx_prt_user_id` | `user_id` | Non-unique B-tree |

---

## Common Queries

**Count members per gym:**
```sql
SELECT g.gym_name, COUNT(m.id) AS total, 
       COUNT(CASE WHEN m.status = 'ACTIVE' THEN 1 END) AS active
FROM gyms g
LEFT JOIN members m ON m.gym_id = g.id
WHERE g.owner_id = ?
GROUP BY g.id, g.gym_name;
```

**Find expired memberships:**
```sql
SELECT u.name, u.email, m.end_date, g.gym_name
FROM members m
JOIN users u ON u.id = m.user_id
JOIN gyms g ON g.id = m.gym_id
WHERE m.end_date < CURRENT_DATE AND m.status = 'ACTIVE'
ORDER BY m.end_date;
```

**All gyms for an owner:**
```sql
SELECT * FROM gyms WHERE owner_id = ? ORDER BY created_at ASC;
```

---

## Migration Notes

When changing an entity field:

1. Update the Java entity class
2. Run `./mvnw clean compile` (stale `.class` files cause Hibernate errors)
3. Restart — `ddl-auto=update` will ALTER the table
4. Update the setup script `db/create_tables.sql` to keep it in sync

For column renames or data migrations, write explicit SQL and run it manually before restarting.

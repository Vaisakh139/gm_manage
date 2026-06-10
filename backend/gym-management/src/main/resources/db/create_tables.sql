-- ============================================================
-- Gym Management System — Table Creation Script  (v2)
-- Database: demodatabase | Schema: gym_management
-- Run once before starting the application.
-- ============================================================

SET search_path TO gym_management;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id                BIGSERIAL       PRIMARY KEY,
    name              VARCHAR(150)    NOT NULL,
    email             VARCHAR(255)    NOT NULL UNIQUE,
    password          VARCHAR(255)    NOT NULL,
    phone             VARCHAR(20),
    role              VARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN','GYM_OWNER','MEMBER')),
    password_changed  BOOLEAN         NOT NULL DEFAULT FALSE,
    active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 2. GYMS
CREATE TABLE IF NOT EXISTS gyms (
    id          BIGSERIAL       PRIMARY KEY,
    gym_name    VARCHAR(200)    NOT NULL,
    address     TEXT,
    phone       VARCHAR(20),
    owner_id    BIGINT          NOT NULL UNIQUE REFERENCES users(id),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 3. MEMBERS
CREATE TABLE IF NOT EXISTS members (
    id               BIGSERIAL   PRIMARY KEY,
    gym_id           BIGINT      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id          BIGINT      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_plan  VARCHAR(100),
    start_date       DATE,
    end_date         DATE,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','EXPIRED')),
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 4. PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id           BIGSERIAL    PRIMARY KEY,
    token        VARCHAR(255) NOT NULL UNIQUE,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date  TIMESTAMP    NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_gyms_owner_id     ON gyms(owner_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id    ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id   ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status    ON members(status);
CREATE INDEX IF NOT EXISTS idx_prt_token         ON password_reset_tokens(token);

-- ── Seed: Default Admin ───────────────────────────────────────
-- Password: admin123  (BCrypt hashed)
INSERT INTO users (name, email, password, role, password_changed, active)
VALUES ('System Admin', 'admin@gym.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
        'ADMIN', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

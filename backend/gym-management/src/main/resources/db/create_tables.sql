-- ============================================================
-- Gym Management System - Table Creation Script
-- Schema: gym_management | Database: demodatabase
-- ============================================================

SET search_path TO gym_management;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN', 'TRAINER', 'MEMBER')),
    active      BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 2. MEMBERSHIP PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
    id               BIGSERIAL       PRIMARY KEY,
    name             VARCHAR(100)    NOT NULL,
    description      TEXT,
    duration_months  INT             NOT NULL,
    price            NUMERIC(10, 2)  NOT NULL,
    active           BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 3. MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL UNIQUE REFERENCES users(id),
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    phone               VARCHAR(20),
    address             TEXT,
    membership_plan_id  BIGINT          REFERENCES membership_plans(id),
    join_date           DATE,
    membership_expiry   DATE,
    active              BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 4. TRAINERS
-- ============================================================
CREATE TABLE IF NOT EXISTS trainers (
    id               BIGSERIAL       PRIMARY KEY,
    user_id          BIGINT          NOT NULL UNIQUE REFERENCES users(id),
    first_name       VARCHAR(100)    NOT NULL,
    last_name        VARCHAR(100)    NOT NULL,
    phone            VARCHAR(20),
    specialization   VARCHAR(255),
    bio              TEXT,
    active           BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 5. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGSERIAL       PRIMARY KEY,
    member_id       BIGINT          NOT NULL REFERENCES members(id),
    plan_id         BIGINT          REFERENCES membership_plans(id),
    amount          NUMERIC(10, 2)  NOT NULL,
    payment_date    DATE,
    due_date        DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    payment_method  VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. WORKOUT PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_plans (
    id           BIGSERIAL       PRIMARY KEY,
    trainer_id   BIGINT          NOT NULL REFERENCES trainers(id),
    member_id    BIGINT          NOT NULL REFERENCES members(id),
    title        VARCHAR(255)    NOT NULL,
    description  TEXT,
    exercises    TEXT,
    start_date   DATE,
    end_date     DATE,
    active       BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_user_id         ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_plan_id         ON members(membership_plan_id);
CREATE INDEX IF NOT EXISTS idx_trainers_user_id        ON trainers(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id      ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON payments(status);
CREATE INDEX IF NOT EXISTS idx_workout_plans_trainer   ON workout_plans(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_member    ON workout_plans(member_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user  (password = admin123, BCrypt hashed)
INSERT INTO users (email, password, role, active)
VALUES ('admin@gym.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Sample membership plans
INSERT INTO membership_plans (name, description, duration_months, price, active) VALUES
    ('Basic',    'Access to gym floor only',               1,  29.99, TRUE),
    ('Standard', 'Gym floor + all group classes',          3,  79.99, TRUE),
    ('Premium',  'All access + 1 personal training/week',  6, 149.99, TRUE)
ON CONFLICT DO NOTHING;

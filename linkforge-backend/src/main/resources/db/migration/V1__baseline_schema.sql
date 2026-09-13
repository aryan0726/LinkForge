-- ===========================================================================
-- V1 - Baseline schema
-- ===========================================================================
--
-- This migration describes the schema as it already exists in every
-- environment created before Flyway was switched on (the tables were
-- originally produced by Hibernate's `ddl-auto: update`).
--
-- It is therefore written to be idempotent: on a database that already has
-- these tables Flyway's baseline mechanism marks V1 as applied without running
-- it, and where it does run, `IF NOT EXISTS` leaves existing tables and their
-- rows untouched. No `DROP` appears anywhere in this file, by design — this
-- project has no environment in which destroying existing data is acceptable.
--
-- Column types and lengths must match the JPA entities exactly.
-- `spring.jpa.hibernate.ddl-auto` is `validate` in every profile, so Hibernate
-- compares this schema against the entities at startup and refuses to boot on
-- any mismatch. A wrong length here is not a silent warning; it is a failure to
-- start, which is the point of validate mode.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id          UUID                        NOT NULL,
    full_name   VARCHAR(255)                NOT NULL,
    email       VARCHAR(255)                NOT NULL,
    username    VARCHAR(255)                NOT NULL,
    password    VARCHAR(255)                NOT NULL,
    role        VARCHAR(255)                NOT NULL,
    enabled     BOOLEAN                     NOT NULL,
    created_at  TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    updated_at  TIMESTAMP(6) WITHOUT TIME ZONE,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_role_check
        CHECK (role IN ('USER', 'ADMIN'))
);

-- Unique constraints are declared separately from the column definitions so the
-- generated names stay stable. Hibernate's `validate` mode checks column types
-- and nullability, not constraint names, but a stable name makes later
-- migrations (dropping or renaming one) far easier to write.
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email    ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_username ON users (username);

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------

-- Note the absence of created_at / updated_at: Link does not extend the audited
-- BaseEntity, so those columns do not exist. Adding them here would make
-- `validate` fail, and adding them to the entity would change the API by
-- introducing a per-link creation date the frontend has no contract for.
CREATE TABLE IF NOT EXISTS links (
    id           UUID                       NOT NULL,
    original_url VARCHAR(255)               NOT NULL,
    short_code   VARCHAR(255)               NOT NULL,
    click_count  BIGINT                     NOT NULL,
    active       BOOLEAN                    NOT NULL,
    expiry_date  TIMESTAMP(6) WITHOUT TIME ZONE,
    user_id      UUID,
    CONSTRAINT links_pkey PRIMARY KEY (id),
    CONSTRAINT fk_links_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_links_short_code ON links (short_code);

-- ---------------------------------------------------------------------------
-- Indexes backing the query paths
-- ---------------------------------------------------------------------------

-- The redirect endpoint runs on every click and always looks a link up by short
-- code. `uk_links_short_code` already provides that access path, so no extra
-- index is needed — adding one would only slow down writes.

-- `findByUserOrderByIdDesc` filters by user. Without an index that is a full
-- scan of the links table every time a dashboard loads, so the filter gets one.
--
-- The sort that goes with it is by primary key, and that is not something an
-- index can make chronological: `links` has no created_at column, and its id is
-- a random UUID rather than a time-ordered value. This index removes the scan
-- and that is the honest limit of what can be improved without a schema change.
-- See the README's "Known limitations" for the migration that would add a real
-- creation timestamp.
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links (user_id);

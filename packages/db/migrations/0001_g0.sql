CREATE TABLE users (
 id VARCHAR(64) PRIMARY KEY, person_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL,
 display_name VARCHAR(100) NOT NULL, roles JSON NOT NULL, membership_status VARCHAR(32) NOT NULL,
 demo_only BOOLEAN NOT NULL, password_hash VARCHAR(256), active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE wallets (
 user_id VARCHAR(64) PRIMARY KEY, available_points INT NOT NULL DEFAULT 0 CHECK(available_points>=0),
 frozen_points INT NOT NULL DEFAULT 0 CHECK(frozen_points>=0), investigation_frozen_points INT NOT NULL DEFAULT 0,
 growth_mileage INT NOT NULL DEFAULT 0 CHECK(growth_mileage>=0), recovery_due INT NOT NULL DEFAULT 0 CHECK(recovery_due>=0),
 version INT NOT NULL DEFAULT 0, FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, audience VARCHAR(12) NOT NULL,
 csrf_token CHAR(64) NOT NULL, expires_at DATETIME(3) NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE rewards (id VARCHAR(64) PRIMARY KEY, body JSON NOT NULL);
CREATE TABLE earning_sources (
 id VARCHAR(128) PRIMARY KEY, beneficiary_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL,
 applicant_person_id VARCHAR(64) NOT NULL, interested_person_ids JSON NOT NULL,
 kind VARCHAR(16) NOT NULL, points INT NOT NULL CHECK(points>0), growth INT NOT NULL CHECK(growth>=0),
 reverse_entry_id VARCHAR(64), reason VARCHAR(500) NOT NULL, rule_version VARCHAR(64) NOT NULL,
 FOREIGN KEY(beneficiary_id) REFERENCES users(id)
);
CREATE TABLE approval_decisions (
 source_id VARCHAR(128) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 representative BOOLEAN NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(source_id,person_id), FOREIGN KEY(source_id) REFERENCES earning_sources(id), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE ledger_entries (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, business_key VARCHAR(128) NOT NULL UNIQUE,
 kind VARCHAR(16) NOT NULL, delta_available INT NOT NULL, delta_reserved INT NOT NULL DEFAULT 0,
 delta_growth INT NOT NULL, delta_recovery INT NOT NULL DEFAULT 0, source_type VARCHAR(32) NOT NULL,
 source_id VARCHAR(128) NOT NULL, rule_version VARCHAR(64) NOT NULL, reason VARCHAR(500) NOT NULL,
 actor_id VARCHAR(64) NOT NULL, request_id VARCHAR(64) NOT NULL, reverse_entry_id VARCHAR(64) UNIQUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE point_lots (
 entry_id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, available INT NOT NULL CHECK(available>=0),
 consumed INT NOT NULL DEFAULT 0, reversed INT NOT NULL DEFAULT 0, expires_at DATETIME(3) NOT NULL,
 FOREIGN KEY(entry_id) REFERENCES ledger_entries(id)
);
CREATE TABLE idempotency (
 actor_id VARCHAR(64) NOT NULL, operation VARCHAR(32) NOT NULL, request_key VARCHAR(128) NOT NULL,
 request_hash CHAR(64) NOT NULL, result_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(actor_id,operation,request_key), FOREIGN KEY(result_id) REFERENCES ledger_entries(id)
);
CREATE TABLE audit_events (
 id VARCHAR(64) PRIMARY KEY, actor_id VARCHAR(64) NOT NULL, action VARCHAR(64) NOT NULL,
 resource_id VARCHAR(128) NOT NULL, request_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

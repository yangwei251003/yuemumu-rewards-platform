CREATE TABLE reporting_org_locks (
 organization_id VARCHAR(64) PRIMARY KEY
);
CREATE TABLE reporting_budget_versions (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, month CHAR(7) NOT NULL,
 version INT NOT NULL CHECK(version>0), budget_cents INT NOT NULL CHECK(budget_cents>=0),
 reason VARCHAR(500) NOT NULL, actor_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(organization_id,month,version), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE reporting_cost_events (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, business_key VARCHAR(128) NOT NULL,
 kind VARCHAR(24) NOT NULL, amount_cents INT NOT NULL, description VARCHAR(300) NOT NULL,
 occurred_at DATETIME(3) NOT NULL, actor_id VARCHAR(64) NOT NULL, reversed_cost_id VARCHAR(64),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(organization_id,business_key), UNIQUE(reversed_cost_id),
 FOREIGN KEY(actor_id) REFERENCES users(id), FOREIGN KEY(reversed_cost_id) REFERENCES reporting_cost_events(id),
 INDEX(organization_id,occurred_at), CHECK((kind='REVERSAL' AND amount_cents<0 AND reversed_cost_id IS NOT NULL) OR (kind IN ('DEMO_EXPENSE','STOCK_RECEIPT') AND amount_cents>0 AND reversed_cost_id IS NULL))
);
CREATE TABLE reporting_import_batches (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, source_hash CHAR(64) NOT NULL,
 status VARCHAR(16) NOT NULL, safe_rows JSON NOT NULL, issues JSON NOT NULL,
 created_count INT NOT NULL DEFAULT 0, existing_count INT NOT NULL DEFAULT 0, created_user_ids JSON NOT NULL,
 actor_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(organization_id,source_hash), FOREIGN KEY(actor_id) REFERENCES users(id)
);
CREATE TABLE reporting_import_identities (
 organization_id VARCHAR(64) NOT NULL, external_key VARCHAR(40) NOT NULL, user_id VARCHAR(64) NOT NULL,
 display_name VARCHAR(40) NOT NULL, batch_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(organization_id,external_key), UNIQUE(user_id), FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(batch_id) REFERENCES reporting_import_batches(id)
);

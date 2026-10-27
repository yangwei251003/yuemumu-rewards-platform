ALTER TABLE learning_units ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED', ADD COLUMN managed BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN capacity INT NOT NULL DEFAULT 10000;
CREATE TABLE learning_unit_revisions (
 unit_id VARCHAR(64) NOT NULL, version INT NOT NULL, snapshot JSON NOT NULL, actor_id VARCHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(unit_id,version)
);
CREATE TABLE unit_claims (
 id VARCHAR(64) PRIMARY KEY, unit_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, role_contribution VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(unit_id,user_id), FOREIGN KEY(unit_id) REFERENCES learning_units(id)
);
CREATE TABLE project_recruitments (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL, description TEXT NOT NULL,
 tier VARCHAR(8) NOT NULL, pool_points INT NOT NULL, capacity INT NOT NULL, status VARCHAR(16) NOT NULL DEFAULT 'OPEN',
 project_id VARCHAR(64), version INT NOT NULL DEFAULT 1, creator_id VARCHAR(64) NOT NULL
);
CREATE TABLE project_applications (
 id VARCHAR(64) PRIMARY KEY, recruitment_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, statement TEXT NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'SUBMITTED', decision_reason TEXT NOT NULL, version INT NOT NULL DEFAULT 1,
 UNIQUE(recruitment_id,user_id), FOREIGN KEY(recruitment_id) REFERENCES project_recruitments(id)
);
CREATE TABLE membership_applications (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, statement TEXT NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'SUBMITTED', decision_reason TEXT NOT NULL, version INT NOT NULL DEFAULT 1, UNIQUE(user_id)
);
CREATE TABLE management_decisions (
 id VARCHAR(64) PRIMARY KEY, resource_type VARCHAR(32) NOT NULL, resource_id VARCHAR(64) NOT NULL,
 actor_id VARCHAR(64) NOT NULL, decision VARCHAR(32) NOT NULL, reason TEXT NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(resource_type,resource_id)
);

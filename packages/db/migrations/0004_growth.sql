CREATE TABLE projects (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL,
 tier VARCHAR(8) NOT NULL, pool_points INT NOT NULL CHECK(pool_points>0), status VARCHAR(24) NOT NULL,
 creator_id VARCHAR(64) NOT NULL, allocation_version INT NOT NULL DEFAULT 1, completed_stage INT NOT NULL DEFAULT 0,
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE project_allocations (
 project_id VARCHAR(64) NOT NULL, version INT NOT NULL, members JSON NOT NULL, paid_anchor JSON NOT NULL,
 reason VARCHAR(1000) NOT NULL, actor_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(project_id,version), FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE project_confirmations (
 project_id VARCHAR(64) NOT NULL, allocation_version INT NOT NULL, user_id VARCHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(project_id,allocation_version,user_id)
);
CREATE TABLE competitions (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL,
 series VARCHAR(64) NOT NULL, edition VARCHAR(32) NOT NULL, award_track VARCHAR(64) NOT NULL,
 allowed_levels JSON NOT NULL, description VARCHAR(1000) NOT NULL, version INT NOT NULL DEFAULT 1,
 UNIQUE(organization_id,series,edition,award_track)
);
CREATE TABLE artifact_registry (
 organization_id VARCHAR(64) NOT NULL, artifact_id VARCHAR(128) NOT NULL, category VARCHAR(32) NOT NULL,
 family_id VARCHAR(128) NOT NULL, owner_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(organization_id,artifact_id)
);
CREATE TABLE award_requests (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, kind VARCHAR(32) NOT NULL,
 source_id VARCHAR(64) NOT NULL, family_id VARCHAR(128) NOT NULL, artifact_id VARCHAR(128) NOT NULL,
 applicant_id VARCHAR(64) NOT NULL, interested_people JSON NOT NULL, targets JSON NOT NULL,
 details JSON NOT NULL, evidence_file_ids JSON NOT NULL, description TEXT NOT NULL,
 status VARCHAR(24) NOT NULL, required_approvers INT NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE award_decisions (
 request_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(request_id,person_id), FOREIGN KEY(request_id) REFERENCES award_requests(id)
);
CREATE TABLE entitlements (
 family_id VARCHAR(128) NOT NULL, user_id VARCHAR(64) NOT NULL, target_points INT NOT NULL CHECK(target_points>=0), recovery_recorded INT NOT NULL DEFAULT 0 CHECK(recovery_recorded>=0),
 PRIMARY KEY(family_id,user_id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE entitlement_lots (
 family_id VARCHAR(128) NOT NULL, user_id VARCHAR(64) NOT NULL, entry_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(family_id,user_id,entry_id), FOREIGN KEY(entry_id) REFERENCES point_lots(entry_id)
);
CREATE TABLE learning_units (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL,
 kind VARCHAR(24) NOT NULL, rule_code VARCHAR(64) NOT NULL, points INT NOT NULL, description TEXT NOT NULL,
 requirements TEXT NOT NULL, questions JSON NOT NULL, answer_keys JSON NOT NULL, badge_code VARCHAR(64),
 creator_id VARCHAR(64) NOT NULL, version INT NOT NULL DEFAULT 1
);
CREATE TABLE learning_attempts (
 id VARCHAR(64) PRIMARY KEY, unit_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL,
 answers JSON NOT NULL, score INT NOT NULL, passed BOOLEAN NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE skill_badges (
 user_id VARCHAR(64) NOT NULL, badge_code VARCHAR(64) NOT NULL, request_id VARCHAR(64) NOT NULL,
 status VARCHAR(24) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(user_id,badge_code), FOREIGN KEY(request_id) REFERENCES award_requests(id)
);

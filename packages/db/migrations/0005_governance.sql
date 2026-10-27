CREATE TABLE governance_cases (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, subject_id VARCHAR(64) NOT NULL,
 case_type VARCHAR(32) NOT NULL, resource_id VARCHAR(128) NOT NULL, severity INT NOT NULL CHECK(severity BETWEEN 1 AND 4),
 description TEXT NOT NULL, evidence_file_ids JSON NOT NULL, creator_id VARCHAR(64) NOT NULL,
 occurred_at DATETIME(3) NOT NULL, status VARCHAR(32) NOT NULL, proposed_days INT NOT NULL DEFAULT 0,
 restriction_scope VARCHAR(32) NOT NULL, decision_id VARCHAR(64), delivered_at DATETIME(3), version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(organization_id,case_type,resource_id,subject_id)
);
CREATE TABLE case_statements (
 id VARCHAR(64) PRIMARY KEY, case_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 statement TEXT NOT NULL, evidence_file_ids JSON NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE case_decisions (
 id VARCHAR(64) PRIMARY KEY, case_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(case_id,person_id)
);
CREATE TABLE sanctions (
 case_id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, scope VARCHAR(32) NOT NULL,
 starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL, status VARCHAR(16) NOT NULL,
 FOREIGN KEY(case_id) REFERENCES governance_cases(id)
);
CREATE TABLE appeals (
 id VARCHAR(64) PRIMARY KEY, case_id VARCHAR(64) NOT NULL UNIQUE, decision_id VARCHAR(64) NOT NULL,
 user_id VARCHAR(64) NOT NULL, reason TEXT NOT NULL, evidence_file_ids JSON NOT NULL,
 status VARCHAR(24) NOT NULL, due_at DATETIME(3) NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(case_id) REFERENCES governance_cases(id)
);
CREATE TABLE appeal_decisions (
 id VARCHAR(64) PRIMARY KEY, appeal_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL,
 actor_id VARCHAR(64) NOT NULL, decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(appeal_id,person_id)
);
CREATE TABLE notifications (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, event_type VARCHAR(64) NOT NULL,
 resource_id VARCHAR(128) NOT NULL, message VARCHAR(2000) NOT NULL, read_at DATETIME(3),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(user_id,event_type,resource_id)
);
CREATE TABLE audit_samples (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, month CHAR(7) NOT NULL, seed VARCHAR(128) NOT NULL,
 population JSON NOT NULL, selected JSON NOT NULL, high_risk JSON NOT NULL, actor_id VARCHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

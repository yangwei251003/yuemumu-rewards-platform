CREATE TABLE command_receipts (
 actor_id VARCHAR(64) NOT NULL, operation VARCHAR(64) NOT NULL, request_key VARCHAR(128) NOT NULL,
 request_hash CHAR(64) NOT NULL, response JSON NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(actor_id,operation,request_key)
);
CREATE TABLE role_scopes (
 user_id VARCHAR(64) NOT NULL, scope_type VARCHAR(32) NOT NULL, scope_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(user_id,scope_type,scope_id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE activities (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL,
 status VARCHAR(32) NOT NULL, starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL,
 capacity INT NOT NULL CHECK(capacity>0), rule_code VARCHAR(64) NOT NULL, points INT NOT NULL,
 requirements VARCHAR(1000) NOT NULL, creator_id VARCHAR(64) NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE registrations (
 id VARCHAR(64) PRIMARY KEY, activity_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL,
 status VARCHAR(32) NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(activity_id,user_id),
 FOREIGN KEY(activity_id) REFERENCES activities(id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE attendance_codes (
 token_hash CHAR(64) PRIMARY KEY, activity_id VARCHAR(64) NOT NULL, phase VARCHAR(8) NOT NULL,
 expires_at DATETIME(3) NOT NULL, issuer_id VARCHAR(64) NOT NULL,
 FOREIGN KEY(activity_id) REFERENCES activities(id)
);
CREATE TABLE attendance_records (
 activity_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, phase VARCHAR(8) NOT NULL,
 recorded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(activity_id,user_id,phase)
);
CREATE TABLE submissions (
 id VARCHAR(64) PRIMARY KEY, source_type VARCHAR(32) NOT NULL, source_id VARCHAR(64) NOT NULL,
 user_id VARCHAR(64) NOT NULL, artifact_id VARCHAR(128) NOT NULL, evidence_file_ids JSON NOT NULL,
 description TEXT NOT NULL, status VARCHAR(32) NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(user_id,artifact_id), UNIQUE(user_id,source_type,source_id)
);
CREATE TABLE flow_approvals (
 id VARCHAR(64) PRIMARY KEY, submission_id VARCHAR(64) NOT NULL UNIQUE, organization_id VARCHAR(64) NOT NULL,
 status VARCHAR(32) NOT NULL, points INT NOT NULL, required_approvers INT NOT NULL,
 fact_actor_id VARCHAR(64), rule_version VARCHAR(64) NOT NULL, version INT NOT NULL DEFAULT 1,
 FOREIGN KEY(submission_id) REFERENCES submissions(id)
);
CREATE TABLE flow_decisions (
 approval_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(24) NOT NULL, reason TEXT NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(approval_id,person_id), FOREIGN KEY(approval_id) REFERENCES flow_approvals(id)
);
CREATE TABLE outbox_events (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, event_type VARCHAR(64) NOT NULL,
 resource_id VARCHAR(128) NOT NULL, payload JSON NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), delivered_at DATETIME(3),
 UNIQUE(user_id,event_type,resource_id)
);

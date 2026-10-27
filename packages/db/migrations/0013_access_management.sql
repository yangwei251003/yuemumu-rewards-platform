CREATE TABLE access_staff_registry (
 user_id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL,
 registered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(user_id) REFERENCES users(id)
);
INSERT INTO access_staff_registry(user_id,organization_id)
SELECT id,organization_id FROM users WHERE demo_only=TRUE AND JSON_LENGTH(roles)>0 AND NOT JSON_CONTAINS(roles,'"STUDENT"');
CREATE TABLE access_subject_versions (
 user_id VARCHAR(64) PRIMARY KEY, version INT NOT NULL DEFAULT 0 CHECK(version>=0), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE access_requests (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, target_id VARCHAR(64) NOT NULL,
 action VARCHAR(24) NOT NULL, role VARCHAR(32) NOT NULL, scope_type VARCHAR(32), scope_id VARCHAR(64),
 reason VARCHAR(2000) NOT NULL, requester_id VARCHAR(64) NOT NULL, requester_person_id VARCHAR(64) NOT NULL,
 expected_subject_version INT NOT NULL, snapshot_sha256 CHAR(64) NOT NULL, before_roles JSON NOT NULL, before_scopes JSON NOT NULL,
 status VARCHAR(24) NOT NULL, version INT NOT NULL DEFAULT 1, applied_at DATETIME(3),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX ix_access_target(target_id,status), FOREIGN KEY(target_id) REFERENCES users(id), FOREIGN KEY(requester_id) REFERENCES users(id)
);
CREATE TABLE access_decisions (
 request_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(request_id,person_id), FOREIGN KEY(request_id) REFERENCES access_requests(id)
);
CREATE TABLE access_events (
 id VARCHAR(64) PRIMARY KEY, request_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL, target_id VARCHAR(64) NOT NULL,
 action VARCHAR(32) NOT NULL, role VARCHAR(32), scope_type VARCHAR(32), scope_id VARCHAR(64),
 reason VARCHAR(2000) NOT NULL, actor_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(request_id) REFERENCES access_requests(id), FOREIGN KEY(target_id) REFERENCES users(id), INDEX ix_access_events_target(target_id,created_at)
);

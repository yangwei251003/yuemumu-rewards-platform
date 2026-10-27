CREATE TABLE academic_org_locks (organization_id VARCHAR(64) PRIMARY KEY);
CREATE TABLE academic_terms (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, title VARCHAR(200) NOT NULL,
 starts_on DATE NOT NULL, ends_on DATE NOT NULL, creator_id VARCHAR(64) NOT NULL,
 CHECK(ends_on>starts_on), INDEX ix_terms_org (organization_id,starts_on,ends_on)
);
CREATE TABLE meetings (
 id VARCHAR(64) PRIMARY KEY, activity_id VARCHAR(64) NOT NULL UNIQUE, term_id VARCHAR(64) NOT NULL,
 host_id VARCHAR(64) NOT NULL, idea_points INT NOT NULL CHECK(idea_points IN (5,10)), agenda TEXT NOT NULL,
 FOREIGN KEY(activity_id) REFERENCES activities(id), FOREIGN KEY(term_id) REFERENCES academic_terms(id)
);
CREATE TABLE meeting_claims (
 id VARCHAR(64) PRIMARY KEY, meeting_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL,
 parts JSON NOT NULL, description TEXT NOT NULL, evidence_file_ids JSON NOT NULL,
 active_points INT NOT NULL, passive_points INT NOT NULL, status VARCHAR(16) NOT NULL DEFAULT 'SUBMITTED',
 decision_reason TEXT NOT NULL, version INT NOT NULL DEFAULT 1,
 UNIQUE(meeting_id,user_id), FOREIGN KEY(meeting_id) REFERENCES meetings(id)
);
CREATE TABLE meeting_decisions (
 claim_id VARCHAR(64) PRIMARY KEY, actor_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason TEXT NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE passive_candidates (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, term_id VARCHAR(64) NOT NULL,
 source_id VARCHAR(64) NOT NULL UNIQUE, points INT NOT NULL CHECK(points>0), posted_points INT NOT NULL DEFAULT 0,
 occurred_at DATETIME(3) NOT NULL, CHECK(posted_points>=0 AND posted_points<=points),
 FOREIGN KEY(term_id) REFERENCES academic_terms(id), INDEX ix_passive_pending (user_id,term_id,occurred_at)
);

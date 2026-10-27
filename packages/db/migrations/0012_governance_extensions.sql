CREATE TABLE point_adjustment_requests (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, beneficiary_id VARCHAR(64) NOT NULL,
 creator_id VARCHAR(64) NOT NULL, kind VARCHAR(16) NOT NULL, original_reference VARCHAR(128) NOT NULL,
 source_id VARCHAR(128) NOT NULL UNIQUE, original_entry_id VARCHAR(64), points INT NOT NULL CHECK(points>0),
 reason VARCHAR(2000) NOT NULL, evidence_file_ids JSON NOT NULL, request_hash CHAR(64) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'PENDING', version INT NOT NULL DEFAULT 1, entry_id VARCHAR(64),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(organization_id,beneficiary_id,original_reference),
 FOREIGN KEY(beneficiary_id) REFERENCES users(id), FOREIGN KEY(source_id) REFERENCES earning_sources(id)
);
CREATE TABLE point_adjustment_decisions (
 adjustment_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(adjustment_id,person_id), FOREIGN KEY(adjustment_id) REFERENCES point_adjustment_requests(id)
);
CREATE TABLE point_adjustment_evidence_keys (
 organization_id VARCHAR(64) NOT NULL, beneficiary_id VARCHAR(64) NOT NULL, file_sha256 CHAR(64) NOT NULL,
 adjustment_id VARCHAR(64) NOT NULL, PRIMARY KEY(organization_id,beneficiary_id,file_sha256),
 FOREIGN KEY(adjustment_id) REFERENCES point_adjustment_requests(id)
);
ALTER TABLE flow_approvals ADD COLUMN round INT NOT NULL DEFAULT 1, ADD UNIQUE KEY submission_round(submission_id,round), DROP INDEX submission_id;
CREATE TABLE activity_evidence_revisions (
 submission_id VARCHAR(64) NOT NULL, round INT NOT NULL, approval_id VARCHAR(64) NOT NULL,
 description TEXT NOT NULL, evidence_file_ids JSON NOT NULL, evidence_hash CHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(submission_id,round),
 UNIQUE(submission_id,evidence_hash), FOREIGN KEY(submission_id) REFERENCES submissions(id), FOREIGN KEY(approval_id) REFERENCES flow_approvals(id)
);
CREATE TABLE case_review_rounds (
 id VARCHAR(64) PRIMARY KEY, case_id VARCHAR(64) NOT NULL, original_decision_id VARCHAR(64) NOT NULL,
 parent_review_id VARCHAR(64), parent_appeal_id VARCHAR(64), sequence INT NOT NULL,
 applicant_id VARCHAR(64) NOT NULL, reason TEXT NOT NULL, evidence_file_ids JSON NOT NULL, evidence_hash CHAR(64) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'PENDING', required_approvers INT NOT NULL, version INT NOT NULL DEFAULT 1,
 due_at DATETIME(3) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(case_id,sequence), UNIQUE(case_id,evidence_hash), FOREIGN KEY(case_id) REFERENCES governance_cases(id)
);
CREATE TABLE case_review_evidence (
 case_id VARCHAR(64) NOT NULL, file_sha256 CHAR(64) NOT NULL, review_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(case_id,file_sha256), FOREIGN KEY(review_id) REFERENCES case_review_rounds(id)
);
CREATE TABLE case_review_decisions (
 id VARCHAR(64) PRIMARY KEY, review_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL,
 actor_id VARCHAR(64) NOT NULL, decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL, teacher BOOLEAN NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(review_id,person_id),
 FOREIGN KEY(review_id) REFERENCES case_review_rounds(id)
);
CREATE TABLE learning_revocations (
 original_award_id VARCHAR(64) NOT NULL, revocation_award_id VARCHAR(64) NOT NULL PRIMARY KEY,
 mode VARCHAR(24) NOT NULL, evidence_hash CHAR(64) NOT NULL, UNIQUE(original_award_id,mode,evidence_hash),
 FOREIGN KEY(original_award_id) REFERENCES award_requests(id), FOREIGN KEY(revocation_award_id) REFERENCES award_requests(id)
);

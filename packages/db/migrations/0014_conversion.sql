CREATE TABLE conversion_goals (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, unit_id VARCHAR(64) NOT NULL UNIQUE,
 activity_id VARCHAR(64) NOT NULL UNIQUE, metric VARCHAR(24) NOT NULL, baseline INT NOT NULL CHECK(baseline>0),
 creator_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE conversion_requests (
 id VARCHAR(64) PRIMARY KEY, goal_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL,
 base_award_id VARCHAR(64) NOT NULL, verified_count INT NOT NULL, target_points INT NOT NULL,
 correction BOOLEAN NOT NULL, description VARCHAR(2000) NOT NULL, status VARCHAR(24) NOT NULL,
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(goal_id) REFERENCES conversion_goals(id), CHECK(target_points IN (0,20,50,100))
);
CREATE TABLE conversion_decisions (
 request_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL,
 decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(request_id,person_id),
 FOREIGN KEY(request_id) REFERENCES conversion_requests(id)
);

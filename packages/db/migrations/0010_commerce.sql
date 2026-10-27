CREATE TABLE commerce_slots (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL,
 starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL, cancel_until DATETIME(3) NOT NULL,
 capacity INT NOT NULL, reserved INT NOT NULL DEFAULT 0, fulfilled INT NOT NULL DEFAULT 0,
 safety_required BOOLEAN NOT NULL, safety_requirements VARCHAR(1000) NOT NULL, creator_id VARCHAR(64) NOT NULL,
 version INT NOT NULL DEFAULT 1, CHECK(capacity>0 AND reserved>=0 AND fulfilled>=0 AND capacity>=reserved+fulfilled), CHECK(ends_at>starts_at AND cancel_until<=starts_at), FOREIGN KEY(reward_id) REFERENCES rewards(id)
);
CREATE TABLE commerce_programs (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL,
 title VARCHAR(200) NOT NULL, requirements VARCHAR(2000) NOT NULL, max_support_cents INT NOT NULL,
 starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL,
 capacity INT NOT NULL, reserved INT NOT NULL DEFAULT 0, fulfilled INT NOT NULL DEFAULT 0,
 creator_id VARCHAR(64) NOT NULL, version INT NOT NULL DEFAULT 1,
 CHECK(max_support_cents>0 AND capacity>0 AND reserved>=0 AND fulfilled>=0 AND capacity>=reserved+fulfilled), CHECK(ends_at>starts_at), FOREIGN KEY(reward_id) REFERENCES rewards(id)
);
CREATE TABLE commerce_requests (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, reward_id VARCHAR(64) NOT NULL,
 reward_name VARCHAR(200) NOT NULL, kind VARCHAR(24) NOT NULL, status VARCHAR(32) NOT NULL,
 site_id VARCHAR(64) NOT NULL, slot_id VARCHAR(64), program_id VARCHAR(64), required_points INT NOT NULL, debit_points INT NOT NULL,
 requested_support_cents INT NOT NULL, safety_required BOOLEAN NOT NULL, required_approvers INT NOT NULL,
 reason VARCHAR(2000) NOT NULL, evidence_file_ids JSON NOT NULL, ready_at DATETIME(3), expires_at DATETIME(3),
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 CHECK(required_points>=0 AND debit_points>=0 AND requested_support_cents>=0),
 INDEX ix_commerce_owner(user_id,reward_id,status), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(reward_id) REFERENCES rewards(id),
 FOREIGN KEY(slot_id) REFERENCES commerce_slots(id), FOREIGN KEY(program_id) REFERENCES commerce_programs(id)
);
CREATE TABLE commerce_allocations (
 request_id VARCHAR(64) NOT NULL, lot_id VARCHAR(64) NOT NULL, points INT NOT NULL CHECK(points>0),
 PRIMARY KEY(request_id,lot_id), FOREIGN KEY(request_id) REFERENCES commerce_requests(id), FOREIGN KEY(lot_id) REFERENCES point_lots(entry_id)
);
CREATE TABLE commerce_decisions (
 request_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL, decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(request_id,person_id), FOREIGN KEY(request_id) REFERENCES commerce_requests(id)
);
CREATE TABLE commerce_stock_requests (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL,
 kind VARCHAR(24) NOT NULL, delta_quantity INT NOT NULL, unit_cost_cents INT NOT NULL, batch_reference VARCHAR(100) NOT NULL,
 expected_inventory_version INT NOT NULL, reason VARCHAR(2000) NOT NULL, creator_id VARCHAR(64) NOT NULL, status VARCHAR(32) NOT NULL,
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 CHECK(delta_quantity<>0 AND unit_cost_cents>=0), UNIQUE(organization_id,reward_id,site_id,batch_reference), FOREIGN KEY(reward_id) REFERENCES rewards(id)
);
CREATE TABLE commerce_stock_decisions (
 request_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL, decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(request_id,person_id), FOREIGN KEY(request_id) REFERENCES commerce_stock_requests(id)
);
CREATE TABLE commerce_inventory_batches (
 id VARCHAR(64) PRIMARY KEY, request_id VARCHAR(64) NOT NULL UNIQUE, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL,
 quantity INT NOT NULL CHECK(quantity>0), unit_cost_cents INT NOT NULL CHECK(unit_cost_cents>=0), batch_reference VARCHAR(100) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(request_id) REFERENCES commerce_stock_requests(id)
);
CREATE TABLE commerce_returns (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, source_type VARCHAR(16) NOT NULL,
 order_id VARCHAR(64) NOT NULL, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL, quantity INT NOT NULL, total_points INT NOT NULL,
 reason VARCHAR(2000) NOT NULL, evidence_file_ids JSON NOT NULL, status VARCHAR(32) NOT NULL,
 receiver_person_id VARCHAR(64), refund_points INT NOT NULL DEFAULT 0, recovery_settled_points INT NOT NULL DEFAULT 0,
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE(source_type,order_id), CHECK(quantity>0 AND total_points>0 AND refund_points>=0 AND recovery_settled_points>=0), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE commerce_return_decisions (
 return_id VARCHAR(64) NOT NULL, person_id VARCHAR(64) NOT NULL, actor_id VARCHAR(64) NOT NULL, decision VARCHAR(16) NOT NULL, reason VARCHAR(2000) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY(return_id,person_id), FOREIGN KEY(return_id) REFERENCES commerce_returns(id)
);
ALTER TABLE point_lots ADD COLUMN recovery_settled INT NOT NULL DEFAULT 0, ADD CHECK(recovery_settled>=0 AND recovery_settled<=consumed_revoked);
CREATE TABLE commerce_return_allocations (
 return_id VARCHAR(64) NOT NULL, lot_id VARCHAR(64) NOT NULL, points INT NOT NULL,
 refund_points INT NOT NULL, revoked_points INT NOT NULL, recovery_settled_points INT NOT NULL, previously_settled_points INT NOT NULL,
 PRIMARY KEY(return_id,lot_id), CHECK(points>0 AND refund_points>=0 AND revoked_points>=0 AND points=refund_points+revoked_points),
 CHECK(recovery_settled_points>=0 AND previously_settled_points>=0 AND revoked_points=recovery_settled_points+previously_settled_points),
 FOREIGN KEY(return_id) REFERENCES commerce_returns(id), FOREIGN KEY(lot_id) REFERENCES point_lots(entry_id)
);
CREATE TABLE point_recovery_settlements (
 id VARCHAR(64) PRIMARY KEY, lot_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL, method VARCHAR(32) NOT NULL,
 business_key VARCHAR(128) NOT NULL UNIQUE, points INT NOT NULL CHECK(points>0), actor_id VARCHAR(64) NOT NULL, request_id VARCHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(lot_id) REFERENCES point_lots(entry_id)
);
CREATE TABLE commerce_action_notes (
 id VARCHAR(64) PRIMARY KEY, resource_type VARCHAR(16) NOT NULL, resource_id VARCHAR(64) NOT NULL,
 actor_id VARCHAR(64) NOT NULL, action VARCHAR(32) NOT NULL, details VARCHAR(2000) NOT NULL,
 recipient_confirmed BOOLEAN NULL, safety_confirmed BOOLEAN NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(resource_type,resource_id,action)
);
CREATE TABLE commerce_wishes (
 id VARCHAR(64) PRIMARY KEY, organization_id VARCHAR(64) NOT NULL, user_id VARCHAR(64) NOT NULL,
 reward_id VARCHAR(64), wish_key CHAR(64) NOT NULL, title VARCHAR(200) NOT NULL, description VARCHAR(2000) NOT NULL,
 status VARCHAR(24) NOT NULL, review_note VARCHAR(2000), reviewer_id VARCHAR(64), version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(user_id,wish_key), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(reward_id) REFERENCES rewards(id)
);

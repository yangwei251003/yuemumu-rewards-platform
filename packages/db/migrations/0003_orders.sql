ALTER TABLE point_lots ADD COLUMN reserved INT NOT NULL DEFAULT 0 CHECK(reserved>=0), ADD COLUMN expired INT NOT NULL DEFAULT 0 CHECK(expired>=0);
CREATE TABLE inventory (
 reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL,
 on_hand INT NOT NULL CHECK(on_hand>=0), reserved INT NOT NULL DEFAULT 0 CHECK(reserved>=0),
 quarantine INT NOT NULL DEFAULT 0 CHECK(quarantine>=0), version INT NOT NULL DEFAULT 1,
 PRIMARY KEY(reward_id,site_id), CHECK(on_hand>=reserved+quarantine), FOREIGN KEY(reward_id) REFERENCES rewards(id)
);
CREATE TABLE redemption_orders (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL,
 reward_id VARCHAR(64) NOT NULL, reward_name VARCHAR(200) NOT NULL, quantity INT NOT NULL CHECK(quantity>0),
 total_points INT NOT NULL CHECK(total_points>0), status VARCHAR(32) NOT NULL, site_id VARCHAR(64) NOT NULL,
 ready_at DATETIME(3), expires_at DATETIME(3), version INT NOT NULL DEFAULT 1, request_id VARCHAR(64) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(reward_id,site_id) REFERENCES inventory(reward_id,site_id)
);
CREATE TABLE order_reservations (
 order_id VARCHAR(64) NOT NULL, lot_id VARCHAR(64) NOT NULL, points INT NOT NULL CHECK(points>0),
 PRIMARY KEY(order_id,lot_id), FOREIGN KEY(order_id) REFERENCES redemption_orders(id), FOREIGN KEY(lot_id) REFERENCES point_lots(entry_id)
);
CREATE TABLE inventory_movements (
 id VARCHAR(64) PRIMARY KEY, reward_id VARCHAR(64) NOT NULL, site_id VARCHAR(64) NOT NULL, order_id VARCHAR(64),
 kind VARCHAR(32) NOT NULL, delta_on_hand INT NOT NULL, delta_reserved INT NOT NULL, actor_id VARCHAR(64) NOT NULL,
 request_id VARCHAR(64) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(order_id,kind)
);
CREATE TABLE pickup_credentials (
 token_hash CHAR(64) PRIMARY KEY, order_id VARCHAR(64) NOT NULL, expires_at DATETIME(3) NOT NULL,
 credential_version INT NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(order_id) REFERENCES redemption_orders(id)
);
ALTER TABLE redemption_orders ADD COLUMN credential_version INT NOT NULL DEFAULT 0;

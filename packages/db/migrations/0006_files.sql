CREATE TABLE private_files (
 id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64) NOT NULL, organization_id VARCHAR(64) NOT NULL,
 filename VARCHAR(120) NOT NULL, mime_type VARCHAR(64) NOT NULL, byte_size INT NOT NULL,
 sha256 CHAR(64) NOT NULL, purpose VARCHAR(16) NOT NULL, content MEDIUMBLOB NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE(owner_id,sha256,purpose),
 FOREIGN KEY(owner_id) REFERENCES users(id)
);
CREATE TABLE file_links (
 file_id VARCHAR(64) NOT NULL, resource_type VARCHAR(16) NOT NULL, resource_id VARCHAR(64) NOT NULL,
 PRIMARY KEY(file_id,resource_type,resource_id), FOREIGN KEY(file_id) REFERENCES private_files(id)
);

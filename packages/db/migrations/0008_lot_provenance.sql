CREATE TEMPORARY TABLE legacy_compensation_parents AS
SELECT child.entry_id child_id, MIN(parent.entry_id) parent_id, COUNT(*) parent_count
FROM point_lots child JOIN ledger_entries release_entry ON release_entry.id=child.entry_id AND release_entry.kind='RELEASE' AND release_entry.source_type='ORDER'
JOIN order_reservations allocation ON allocation.order_id=release_entry.source_id
JOIN point_lots parent ON parent.entry_id=allocation.lot_id AND parent.expires_at<=DATE_SUB(child.expires_at, INTERVAL 7 DAY)
GROUP BY child.entry_id;
CREATE TEMPORARY TABLE lot_provenance_requires_unambiguous_history (ambiguous_count INT CHECK(ambiguous_count=0));
INSERT INTO lot_provenance_requires_unambiguous_history SELECT COUNT(*) FROM legacy_compensation_parents WHERE parent_count<>1;
INSERT INTO lot_provenance_requires_unambiguous_history SELECT COUNT(*) FROM point_lots l JOIN ledger_entries e ON e.id=l.entry_id AND e.kind='RELEASE' AND e.source_type='ORDER' LEFT JOIN legacy_compensation_parents p ON p.child_id=l.entry_id WHERE p.child_id IS NULL;
ALTER TABLE point_lots
 ADD COLUMN parent_entry_id VARCHAR(64) NULL,
 ADD COLUMN root_entry_id VARCHAR(64) NULL,
 ADD COLUMN transferred INT NOT NULL DEFAULT 0 CHECK(transferred>=0),
 ADD COLUMN consumed_revoked INT NOT NULL DEFAULT 0,
 ADD COLUMN expired_revoked INT NOT NULL DEFAULT 0,
 ADD CHECK(consumed_revoked>=0 AND consumed_revoked<=consumed),
 ADD CHECK(expired_revoked>=0 AND expired_revoked<=expired),
 ADD INDEX ix_lot_root (user_id,root_entry_id),
 ADD FOREIGN KEY(parent_entry_id) REFERENCES point_lots(entry_id),
 ADD FOREIGN KEY(root_entry_id) REFERENCES point_lots(entry_id);
UPDATE point_lots child JOIN legacy_compensation_parents p ON p.child_id=child.entry_id SET child.parent_entry_id=p.parent_id;
WITH RECURSIVE ancestry AS (
 SELECT entry_id,entry_id root_id FROM point_lots WHERE parent_entry_id IS NULL
 UNION ALL SELECT child.entry_id,a.root_id FROM point_lots child JOIN ancestry a ON child.parent_entry_id=a.entry_id
) UPDATE point_lots l JOIN ancestry a ON a.entry_id=l.entry_id SET l.root_entry_id=a.root_id;
WITH transfers AS (
 SELECT parent_entry_id,SUM(available+reserved+consumed+expired+reversed) points FROM point_lots WHERE parent_entry_id IS NOT NULL GROUP BY parent_entry_id
) UPDATE point_lots parent JOIN transfers t ON t.parent_entry_id=parent.entry_id SET parent.transferred=t.points;
INSERT INTO lot_provenance_requires_unambiguous_history SELECT COUNT(*) FROM point_lots WHERE root_entry_id IS NULL OR transferred>expired;
CREATE TEMPORARY TABLE legacy_revocations AS
SELECT l.entry_id,l.consumed,GREATEST(l.expired-l.transferred,0) expired,
 COALESCE(e.family_id,l.root_entry_id) family_id,l.user_id,
 COALESCE(e.recovery_recorded,r.delta_recovery,0) recovery,
 COALESCE(t.expired_to_revoke,0) expired_to_revoke
FROM point_lots l
LEFT JOIN entitlement_lots el ON el.entry_id=l.root_entry_id AND el.user_id=l.user_id
LEFT JOIN entitlements e ON e.family_id=el.family_id AND e.user_id=el.user_id
LEFT JOIN ledger_entries r ON r.reverse_entry_id=l.root_entry_id
LEFT JOIN (
 SELECT e.family_id,e.user_id,GREATEST(SUM(original.delta_available)-MAX(e.target_points)-MAX(e.recovery_recorded)-SUM(l.reversed),0) expired_to_revoke
 FROM entitlements e JOIN entitlement_lots el ON el.family_id=e.family_id AND el.user_id=e.user_id
 JOIN point_lots l ON l.entry_id=el.entry_id JOIN ledger_entries original ON original.id=l.entry_id GROUP BY e.family_id,e.user_id
) t ON t.family_id=e.family_id AND t.user_id=e.user_id;
WITH counted AS (
 SELECT entry_id,consumed,expired,recovery,expired_to_revoke,
 COALESCE(SUM(consumed) OVER(PARTITION BY family_id,user_id ORDER BY entry_id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) earlier_consumed,
 COALESCE(SUM(expired) OVER(PARTITION BY family_id,user_id ORDER BY entry_id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) earlier_expired
 FROM legacy_revocations
) UPDATE point_lots l JOIN counted c ON c.entry_id=l.entry_id SET
 l.consumed_revoked=LEAST(c.consumed,GREATEST(c.recovery-c.earlier_consumed,0)),
 l.expired_revoked=LEAST(c.expired,GREATEST(c.expired_to_revoke-c.earlier_expired,0));
INSERT INTO lot_provenance_requires_unambiguous_history
SELECT COUNT(*) FROM (
 SELECT e.family_id,e.user_id FROM entitlements e
 LEFT JOIN entitlement_lots el ON el.family_id=e.family_id AND el.user_id=e.user_id
 LEFT JOIN point_lots l ON l.root_entry_id=el.entry_id AND l.user_id=e.user_id
 GROUP BY e.family_id,e.user_id,e.target_points,e.recovery_recorded
 HAVING COALESCE(SUM(l.available+l.reserved+l.consumed-l.consumed_revoked+l.expired-l.transferred-l.expired_revoked),0)<>e.target_points
 OR COALESCE(SUM(l.consumed_revoked),0)<>e.recovery_recorded
) inconsistent_legacy_entitlements;
DROP TEMPORARY TABLE legacy_revocations;
DROP TEMPORARY TABLE lot_provenance_requires_unambiguous_history;
DROP TEMPORARY TABLE legacy_compensation_parents;

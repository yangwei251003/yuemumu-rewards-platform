import {pool} from '../packages/db/src/client';
// Once a staff member enters audited access management, startup must not undo a
// revocation or silently add a newly introduced default scope.
export async function seedScope(userId:string,type:string,scopeId:string){
 await pool.execute('INSERT IGNORE INTO role_scopes(user_id,scope_type,scope_id) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM access_subject_versions WHERE user_id=?)',[userId,type,scopeId,userId]);
}

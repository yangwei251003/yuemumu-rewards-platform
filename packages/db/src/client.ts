import mysql,{type PoolConnection,type RowDataPacket} from 'mysql2/promise';
import {drizzle} from 'drizzle-orm/mysql2';
import {config} from './config';
import * as schema from './schema';
const c=config();
export const pool=mysql.createPool({host:c.dbHost,port:c.dbPort,user:c.dbUser,password:c.dbPassword,database:c.database,connectionLimit:8,timezone:'Z',decimalNumbers:true});
export const db=drizzle(pool,{schema,mode:'default'});
export type Executor=Pick<PoolConnection,'execute'>;
export async function rows<T>(cx:Executor,sql:string,params:(string|number|boolean|Date|Buffer|null)[]=[]):Promise<T[]>{
 const [result]=await cx.execute<RowDataPacket[]>(sql,params);return result as T[];
}
export async function transaction<T>(fn:(cx:PoolConnection)=>Promise<T>):Promise<T>{
 for(let attempt=0;;attempt++){
  const cx=await pool.getConnection();
  try{await cx.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await cx.beginTransaction();const result=await fn(cx);await cx.commit();return result;}
  catch(e){await cx.rollback();if(attempt<2&&['ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT','ER_DUP_ENTRY'].includes((e as {code?:string}).code||''))continue;throw e;}
  finally{cx.release();}
 }
}

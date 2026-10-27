import {mysqlTable,varchar,int,json,boolean} from 'drizzle-orm/mysql-core';
export const users=mysqlTable('users',{
 id:varchar('id',{length:64}).primaryKey(),personId:varchar('person_id',{length:64}).notNull(),
 organizationId:varchar('organization_id',{length:64}).notNull(),displayName:varchar('display_name',{length:100}).notNull(),
 roles:json('roles').$type<string[]>().notNull(),membershipStatus:varchar('membership_status',{length:32}).notNull(),
 demoOnly:boolean('demo_only').notNull(),passwordHash:varchar('password_hash',{length:256}),active:boolean('active').notNull()
});
export const wallets=mysqlTable('wallets',{
 userId:varchar('user_id',{length:64}).primaryKey(),availablePoints:int('available_points').notNull(),
 frozenPoints:int('frozen_points').notNull(),investigationFrozenPoints:int('investigation_frozen_points').notNull(),
 growthMileage:int('growth_mileage').notNull(),recoveryDue:int('recovery_due').notNull(),version:int('version').notNull()
});

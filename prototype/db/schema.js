import {sqliteTable,text,integer,index,check} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
export const enquiries=sqliteTable('enquiries',{
  id:text('id').primaryKey(),requestKey:text('request_key').notNull().unique(),requestHash:text('request_hash').notNull(),
  name:text('name').notNull(),email:text('email').notNull(),organisation:text('organisation').notNull().default(''),
  intent:text('intent').notNull(),material:text('material').notNull(),message:text('message').notNull(),
  status:text('status').notNull().default('new'),revision:integer('revision').notNull().default(0),
  createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},table=>[
  index('enquiries_created_idx').on(table.createdAt,table.id),
  index('enquiries_status_created_idx').on(table.status,table.createdAt),
  check('enquiries_status_check',sql`${table.status} IN ('new','in_progress','resolved')`),
]);
export const rateLimits=sqliteTable('rate_limits',{
  bucket:text('bucket').primaryKey(),count:integer('count').notNull().default(1),expiresAt:integer('expires_at').notNull(),
},table=>[index('rate_limits_expiry_idx').on(table.expiresAt)]);

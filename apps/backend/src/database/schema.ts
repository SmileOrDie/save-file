import { pgTable, pgEnum, uuid, varchar, text, timestamp, bigint, jsonb } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin', 'user', 'read_only']);
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull().default('user'),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  originalName: text('original_name').notNull(),
  storageKey: text('storage_key').notNull().unique(),
  contentType: varchar('content_type', { length: 255 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  sha256: varchar('sha256', { length: 64 }).notNull(),
  kind: varchar('kind', { length: 32 }).notNull().default('document'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }),
  resourceId: text('resource_id'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

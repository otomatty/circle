/**
 * Drizzle ORM schema for Cloudflare D1 (SQLite).
 *
 * This replaces the previous Supabase/PostgreSQL schema. It contains:
 *   1. Better Auth tables (user / session / account / verification)
 *   2. Circle application tables (statuses, priorities, labels, teams, ...)
 *
 * Note: D1 has no row-level security. All authorization must be enforced in
 * application code (Server Actions / route handlers).
 */

import { sql } from 'drizzle-orm';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

/**
 * Identity table managed by Better Auth. Replaces the old `profiles` table.
 * Application-specific fields (`role`, `status`) are registered via
 * `user.additionalFields` in `lib/auth.ts`.
 */
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  role: text('role').default('メンバー'),
  status: text('status').default('オンライン'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`
  ),
});

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

const now = sql`CURRENT_TIMESTAMP`;

export const statuses = sqliteTable('statuses', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const priorities = sqliteTable('priorities', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const labels = sqliteTable('labels', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const teamMembers = sqliteTable(
  'team_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('メンバー'),
    createdAt: text('created_at').default(now),
    updatedAt: text('updated_at').default(now),
  },
  (table) => ({
    teamUserUnique: uniqueIndex('team_members_team_user_unique').on(
      table.teamId,
      table.userId
    ),
  })
);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  statusId: text('status_id').references(() => statuses.id),
  percentComplete: integer('percent_complete'),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const teamProjects = sqliteTable(
  'team_projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(now),
    updatedAt: text('updated_at').default(now),
  },
  (table) => ({
    teamProjectUnique: uniqueIndex('team_projects_team_project_unique').on(
      table.teamId,
      table.projectId
    ),
  })
);

export const cycles = sqliteTable('cycles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  statusId: text('status_id').references(() => statuses.id),
  priorityId: text('priority_id').references(() => priorities.id),
  projectId: text('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  cycleId: text('cycle_id').references(() => cycles.id, {
    onDelete: 'set null',
  }),
  rank: text('rank'),
  createdBy: text('created_by').references(() => user.id, {
    onDelete: 'set null',
  }),
  createdAt: text('created_at').default(now),
  updatedAt: text('updated_at').default(now),
});

export const issueAssignees = sqliteTable(
  'issue_assignees',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(now),
  },
  (table) => ({
    issueUserUnique: uniqueIndex('issue_assignees_issue_user_unique').on(
      table.issueId,
      table.userId
    ),
  })
);

export const issueLabels = sqliteTable(
  'issue_labels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(now),
  },
  (table) => ({
    issueLabelUnique: uniqueIndex('issue_labels_issue_label_unique').on(
      table.issueId,
      table.labelId
    ),
  })
);

export const issueRelations = sqliteTable(
  'issue_relations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    parentIssueId: text('parent_issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    childIssueId: text('child_issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(now),
  },
  (table) => ({
    relationUnique: uniqueIndex('issue_relations_parent_child_unique').on(
      table.parentIssueId,
      table.childIssueId
    ),
  })
);

export const schema = {
  user,
  session,
  account,
  verification,
  statuses,
  priorities,
  labels,
  teams,
  teamMembers,
  projects,
  teamProjects,
  cycles,
  issues,
  issueAssignees,
  issueLabels,
  issueRelations,
};

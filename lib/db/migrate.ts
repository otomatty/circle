/**
 * Migration Management System
 *
 * SQLiteデータベースのマイグレーションを管理します。
 * マイグレーションファイルの実行と履歴管理を行います。
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ scripts/migrate.ts
 *
 * Dependencies (External files that this file imports):
 *   └─ ./client.ts
 *
 * Related Documentation:
 *   └─ Issue: https://github.com/otomatty/circle/issues/1
 */

import { getDatabase } from './client';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface Migration {
  name: string;
  filename: string;
  up: string;
  down?: string;
}

/**
 * マイグレーションファイルの命名規則
 * 形式: YYYYMMDDHHMMSS_description.sql
 * 例: 20251117120000_create_migrations_table.sql
 */
const MIGRATION_NAME_PATTERN = /^(\d{14})_(.+)\.sql$/;

/**
 * マイグレーションディレクトリのパス
 */
const MIGRATIONS_DIR = join(process.cwd(), 'lib/db/migrations');

/**
 * マイグレーション履歴テーブルを初期化します
 */
export function initializeMigrationsTable(): void {
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

/**
 * マイグレーションファイルを読み込みます
 */
function loadMigration(filename: string): Migration | null {
  const match = filename.match(MIGRATION_NAME_PATTERN);
  if (!match) {
    console.warn(`Invalid migration filename format: ${filename}`);
    return null;
  }

  const [, timestamp, description] = match;
  const filePath = join(MIGRATIONS_DIR, filename);
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // SQLファイルをupとdownに分割（-- DOWN セクションがある場合）
    const downIndex = content.indexOf('-- DOWN');
    const up = downIndex >= 0 ? content.substring(0, downIndex).trim() : content.trim();
    const down = downIndex >= 0 ? content.substring(downIndex + 7).trim() : undefined;
    
    return {
      name: `${timestamp}_${description}`,
      filename,
      up,
      down,
    };
  } catch (error) {
    console.error(`Failed to load migration ${filename}:`, error);
    return null;
  }
}

/**
 * すべてのマイグレーションファイルを読み込みます
 */
export function loadAllMigrations(): Migration[] {
  try {
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();
    
    const migrations = files
      .map((file) => loadMigration(file))
      .filter((migration): migration is Migration => migration !== null);
    
    return migrations;
  } catch (error) {
    console.error('Failed to load migrations:', error);
    return [];
  }
}

/**
 * 実行済みのマイグレーション名のリストを取得します
 */
export function getExecutedMigrations(): string[] {
  const db = getDatabase();
  initializeMigrationsTable();
  
  const rows = db.prepare('SELECT name FROM migrations ORDER BY name').all() as Array<{ name: string }>;
  return rows.map((row) => row.name);
}

/**
 * 未実行のマイグレーションを取得します
 */
export function getPendingMigrations(): Migration[] {
  const allMigrations = loadAllMigrations();
  const executedMigrations = getExecutedMigrations();
  const executedSet = new Set(executedMigrations);
  
  return allMigrations.filter((migration) => !executedSet.has(migration.name));
}

/**
 * マイグレーションを実行します
 */
export function runMigration(migration: Migration): void {
  const db = getDatabase();
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // マイグレーションSQLを実行
    db.exec(migration.up);
    
    // 実行履歴を記録
    const stmt = db.prepare('INSERT INTO migrations (name) VALUES (?)');
    stmt.run(migration.name);
    
    db.exec('COMMIT');
    console.log(`✓ Migration executed: ${migration.name}`);
  } catch (error) {
    db.exec('ROLLBACK');
    console.error(`✗ Migration failed: ${migration.name}`, error);
    throw error;
  }
}

/**
 * すべての未実行マイグレーションを実行します
 */
export function runPendingMigrations(): void {
  const pendingMigrations = getPendingMigrations();
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migration(s)`);
  
  for (const migration of pendingMigrations) {
    runMigration(migration);
  }
  
  console.log('All migrations completed successfully');
}

/**
 * マイグレーションの状態を表示します
 */
export function showMigrationStatus(): void {
  const allMigrations = loadAllMigrations();
  const executedMigrations = getExecutedMigrations();
  const executedSet = new Set(executedMigrations);
  
  console.log('\nMigration Status:');
  console.log('─'.repeat(60));
  
  if (allMigrations.length === 0) {
    console.log('No migrations found');
    return;
  }
  
  for (const migration of allMigrations) {
    const status = executedSet.has(migration.name) ? '✓ Executed' : '○ Pending';
    console.log(`${status.padEnd(12)} ${migration.name}`);
  }
  
  console.log('─'.repeat(60));
  console.log(`Total: ${allMigrations.length} | Executed: ${executedMigrations.length} | Pending: ${allMigrations.length - executedMigrations.length}`);
}

/**
 * マイグレーションをロールバックします（最後に実行されたマイグレーションを1つ戻す）
 */
export function rollbackLastMigration(): void {
  const db = getDatabase();
  initializeMigrationsTable();
  
  // 最後に実行されたマイグレーションを取得
  const lastMigration = db.prepare('SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1').get() as { name: string } | undefined;
  
  if (!lastMigration) {
    console.log('No migrations to rollback');
    return;
  }
  
  // マイグレーションファイルを検索
  const allMigrations = loadAllMigrations();
  const migration = allMigrations.find((m) => m.name === lastMigration.name);
  
  if (!migration) {
    console.error(`Migration file not found: ${lastMigration.name}`);
    return;
  }
  
  if (!migration.down) {
    console.error(`Rollback SQL not found for migration: ${lastMigration.name}`);
    return;
  }
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // ロールバックSQLを実行
    db.exec(migration.down);
    
    // 実行履歴から削除
    const stmt = db.prepare('DELETE FROM migrations WHERE name = ?');
    stmt.run(lastMigration.name);
    
    db.exec('COMMIT');
    console.log(`✓ Migration rolled back: ${lastMigration.name}`);
  } catch (error) {
    db.exec('ROLLBACK');
    console.error(`✗ Rollback failed: ${lastMigration.name}`, error);
    throw error;
  }
}


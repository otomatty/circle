/**
 * Test Database Utilities
 *
 * テスト用のデータベースユーティリティ
 * テスト用のインメモリデータベースを作成・管理します
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getDatabase, closeDatabase } from '~/lib/db/client';

/**
 * テスト用のインメモリデータベースを作成します
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  // スキーマを読み込んで実行
  const schemaPath = join(process.cwd(), 'lib/db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

/**
 * テスト用のデータベースをクリーンアップします
 */
export function cleanupTestDatabase(db: Database.Database): void {
  db.close();
}

/**
 * テスト用のデータベースインスタンスをモックします
 */
export function mockDatabase(testDb: Database.Database): void {
  // getDatabase関数をモックするためのヘルパー
  // 実際のモックは各テストファイルで実装
}

/**
 * テストデータを挿入するヘルパー関数
 */
export function seedTestData(db: Database.Database, table: string, data: Record<string, unknown>[]): void {
  for (const row of data) {
    const columns = Object.keys(row).join(', ');
    const placeholders = Object.keys(row).map(() => '?').join(', ');
    const values = Object.values(row);

    db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...values);
  }
}


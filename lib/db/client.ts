/**
 * SQLite Database Client
 *
 * SQLiteデータベースへの接続とクエリを管理します。
 * better-sqlite3を使用してデータベースに接続します。
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

// データベースファイルのパス
const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'database.sqlite');

// グローバルなデータベースインスタンス（開発環境でのホットリロード対策）
let dbInstance: Database.Database | null = null;

/**
 * SQLiteデータベースクライアントを取得します
 * シングルトンパターンでインスタンスを管理します
 */
export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // データベースファイルが存在しない場合は作成
  dbInstance = new Database(DB_PATH);

  // 外部キー制約を有効化
  dbInstance.pragma('foreign_keys = ON');

  // 開発環境ではWALモードを有効化（パフォーマンス向上）
  if (process.env.NODE_ENV !== 'production') {
    dbInstance.pragma('journal_mode = WAL');
  }

  return dbInstance;
}

/**
 * データベーススキーマを初期化します
 * 既存のテーブルがある場合はスキップします
 */
export function initializeDatabase(): void {
  const db = getDatabase();
  const schemaPath = join(process.cwd(), 'lib/db/schema.sql');

  try {
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * データベース接続を閉じます
 * 主にテストやアプリケーション終了時に使用
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * データベースをリセットします（開発用）
 * 注意: 本番環境では使用しないでください
 */
export function resetDatabase(): void {
  closeDatabase();
  const fs = require('fs');
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  initializeDatabase();
}


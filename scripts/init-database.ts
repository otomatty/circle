/**
 * データベース初期化スクリプト
 *
 * SQLiteデータベースを初期化し、スキーマを適用します
 */

import { initializeDatabase } from '../lib/db/client';

async function main() {
  try {
    console.log('Initializing database...');
    initializeDatabase();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();


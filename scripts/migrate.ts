/**
 * Migration Script
 *
 * データベースマイグレーションを実行するスクリプトです。
 * 
 * Usage:
 *   bun run db:migrate          - 未実行のマイグレーションを実行
 *   bun run db:migrate:status   - マイグレーションの状態を表示
 *   bun run db:migrate:rollback - 最後のマイグレーションをロールバック
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ package.json (scripts)
 *
 * Dependencies (External files that this file imports):
 *   └─ ../lib/db/migrate.ts
 *
 * Related Documentation:
 *   └─ Issue: https://github.com/otomatty/circle/issues/1
 */

import {
  initializeMigrationsTable,
  runPendingMigrations,
  showMigrationStatus,
  rollbackLastMigration,
} from '../lib/db/migrate';

const command = process.argv[2];

async function main() {
  // マイグレーションテーブルを初期化（存在しない場合）
  initializeMigrationsTable();

  switch (command) {
    case 'status':
      showMigrationStatus();
      break;

    case 'rollback':
      rollbackLastMigration();
      break;

    case 'up':
    case undefined:
      // デフォルトはマイグレーション実行
      runPendingMigrations();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log('\nUsage:');
      console.log('  bun run db:migrate          - Run pending migrations');
      console.log('  bun run db:migrate:status   - Show migration status');
      console.log('  bun run db:migrate:rollback - Rollback last migration');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});


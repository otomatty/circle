/**
 * データベースシードスクリプト
 *
 * mock-dataを使用してSQLiteデータベースにシードデータを挿入します
 */

import { getDatabase } from '../lib/db/client';
import { users } from '../mock-data/users';
import { teams } from '../mock-data/teams';
import { projects } from '../mock-data/projects';
import { status } from '../mock-data/status';
import { priorities } from '../mock-data/priorities';
import { labels } from '../mock-data/labels';

async function main() {
  try {
    console.log('Seeding database...');
    const db = getDatabase();

    // トランザクション開始
    db.exec('BEGIN TRANSACTION');

    try {
      // ステータスの挿入
      console.log('Inserting statuses...');
      const statusStmt = db.prepare(`
        INSERT OR REPLACE INTO statuses (id, slug, name, color, icon, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      status.forEach((s, index) => {
        statusStmt.run(
          s.id,
          s.id,
          s.name,
          s.color,
          s.id, // iconは文字列として保存
          index
        );
      });

      // 優先度の挿入
      console.log('Inserting priorities...');
      const priorityStmt = db.prepare(`
        INSERT OR REPLACE INTO priorities (id, slug, name, icon, display_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      priorities.forEach((p, index) => {
        priorityStmt.run(
          p.id,
          p.id,
          p.name,
          p.id, // iconは文字列として保存
          index
        );
      });

      // ラベルの挿入
      console.log('Inserting labels...');
      const labelStmt = db.prepare(`
        INSERT OR REPLACE INTO labels (id, slug, name, color)
        VALUES (?, ?, ?, ?)
      `);
      labels.forEach((l) => {
        labelStmt.run(l.id, l.id, l.name, l.color);
      });

      // ユーザーの挿入
      console.log('Inserting users...');
      const userStmt = db.prepare(`
        INSERT OR REPLACE INTO users (id, name, email, avatar_url, role, status, joined_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      users.forEach((u) => {
        userStmt.run(
          u.id,
          u.name,
          u.email,
          u.avatarUrl,
          u.role,
          u.status,
          u.joinedDate
        );
      });

      // プロジェクトの挿入（チームより先に挿入）
      console.log('Inserting projects...');
      const projectStmt = db.prepare(`
        INSERT OR REPLACE INTO projects (id, name, icon, status_id, percent_complete)
        VALUES (?, ?, ?, ?, ?)
      `);
      projects.forEach((p) => {
        projectStmt.run(
          p.id,
          p.name,
          p.icon.name || 'Box', // icon名を文字列として保存
          p.status.id,
          p.percentComplete
        );
      });

      // チームの挿入
      console.log('Inserting teams...');
      const teamStmt = db.prepare(`
        INSERT OR REPLACE INTO teams (id, slug, name, icon, color)
        VALUES (?, ?, ?, ?, ?)
      `);
      const teamMemberStmt = db.prepare(`
        INSERT OR REPLACE INTO team_members (id, team_id, user_id, role)
        VALUES (?, ?, ?, ?)
      `);
      const teamProjectStmt = db.prepare(`
        INSERT OR REPLACE INTO team_projects (id, team_id, project_id)
        VALUES (?, ?, ?)
      `);

      teams.forEach((t) => {
        teamStmt.run(t.id, t.id.toLowerCase(), t.name, t.icon, t.color);

        // チームメンバーの挿入
        t.members.forEach((member, index) => {
          teamMemberStmt.run(
            `${t.id}-${member.id}`,
            t.id,
            member.id,
            index === 0 ? '管理者' : 'メンバー'
          );
        });

        // チームプロジェクトの挿入
        t.projects.forEach((project, index) => {
          teamProjectStmt.run(
            `${t.id}-${project.id}-${index}`,
            t.id,
            project.id
          );
        });
      });

      // トランザクションコミット
      db.exec('COMMIT');
      console.log('Database seeded successfully!');
    } catch (error) {
      // エラー時はロールバック
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main();


import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getUsers, getAssigneeCounts } from '../users';
import { createTestDatabase, cleanupTestDatabase, seedTestData } from '~/lib/test-utils';
import Database from 'better-sqlite3';
import * as dbClient from '~/lib/db/client';

describe('users actions', () => {
  let testDb: Database.Database;

  beforeEach(() => {
    testDb = createTestDatabase();

    // getDatabase関数をモック
    vi.spyOn(dbClient, 'getDatabase').mockReturnValue(testDb);

    // テストデータを挿入
    seedTestData(testDb, 'users', [
      {
        id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
        avatar_url: null,
        role: 'メンバー',
        status: 'オンライン',
        joined_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-2',
        name: 'User 2',
        email: 'user2@example.com',
        avatar_url: 'https://example.com/avatar.png',
        role: 'メンバー',
        status: 'オフライン',
        joined_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    seedTestData(testDb, 'teams', [
      {
        id: 'team-1',
        slug: 'team-1',
        name: 'Team 1',
        icon: null,
        color: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    seedTestData(testDb, 'team_members', [
      {
        id: 'tm-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'メンバー',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tm-2',
        team_id: 'team-1',
        user_id: 'user-2',
        role: 'メンバー',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  });

  afterEach(() => {
    cleanupTestDatabase(testDb);
    vi.restoreAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users with team ids', async () => {
      const result = await getUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
        avatarUrl: null,
        teamIds: ['team-1'],
      });
      expect(result[1]).toMatchObject({
        id: 'user-2',
        name: 'User 2',
        email: 'user2@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        teamIds: ['team-1'],
      });
    });

    it('should return users sorted by name', async () => {
      const result = await getUsers();

      expect(result[0].name).toBe('User 1');
      expect(result[1].name).toBe('User 2');
    });

    it('should return empty array when no users exist', async () => {
      testDb.prepare('DELETE FROM users').run();
      testDb.prepare('DELETE FROM team_members').run();

      const result = await getUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getAssigneeCounts', () => {
    beforeEach(() => {
      // イシューとアサインデータを追加
      seedTestData(testDb, 'issues', [
        {
          id: 'issue-1',
          identifier: 'ISSUE-1',
          title: 'Issue 1',
          description: null,
          status_id: null,
          priority_id: null,
          project_id: null,
          cycle_id: null,
          rank: 'a',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'issue-2',
          identifier: 'ISSUE-2',
          title: 'Issue 2',
          description: null,
          status_id: null,
          priority_id: null,
          project_id: null,
          cycle_id: null,
          rank: 'b',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'issue-3',
          identifier: 'ISSUE-3',
          title: 'Issue 3',
          description: null,
          status_id: null,
          priority_id: null,
          project_id: null,
          cycle_id: null,
          rank: 'c',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      seedTestData(testDb, 'issue_assignees', [
        {
          id: 'ia-1',
          issue_id: 'issue-1',
          user_id: 'user-1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ia-2',
          issue_id: 'issue-2',
          user_id: 'user-1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ia-3',
          issue_id: 'issue-3',
          user_id: 'user-2',
          created_at: new Date().toISOString(),
        },
      ]);
    });

    it('should return assignee counts', async () => {
      const result = await getAssigneeCounts();

      expect(result).toMatchObject({
        unassigned: 0,
        'user-1': 2,
        'user-2': 1,
      });
    });

    it('should count unassigned issues', async () => {
      // アサインデータを削除
      testDb.prepare('DELETE FROM issue_assignees').run();

      const result = await getAssigneeCounts();

      expect(result).toMatchObject({
        unassigned: 3,
      });
    });
  });
});


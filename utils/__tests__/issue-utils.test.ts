import { describe, it, expect } from 'vitest';
import { groupIssuesByStatus, sortIssuesByPriority } from '../issue-utils';
import { getIconFromString } from '~/utils/icon-utils';
import type { Issue } from '~/types/issues';

describe('issue-utils', () => {
  describe('groupIssuesByStatus', () => {
    it('should group issues by status id', () => {
      const issues: Issue[] = [
        {
          id: '1',
          identifier: 'ISSUE-1',
          title: 'Issue 1',
          description: '',
          status: { id: 'status-1', name: 'Todo', color: '#000', icon: getIconFromString('circle') },
          priority: { id: 'high', name: 'High', icon: 'arrow-up' },
          project: undefined,
          assignees: null,
          labels: [],
          createdAt: new Date().toISOString(),
          cycleId: '',
          rank: 'a',
        },
        {
          id: '2',
          identifier: 'ISSUE-2',
          title: 'Issue 2',
          description: '',
          status: { id: 'status-1', name: 'Todo', color: '#000', icon: getIconFromString('circle') },
          priority: { id: 'low', name: 'Low', icon: 'arrow-down' },
          project: undefined,
          assignees: null,
          labels: [],
          createdAt: new Date().toISOString(),
          cycleId: '',
          rank: 'b',
        },
        {
          id: '3',
          identifier: 'ISSUE-3',
          title: 'Issue 3',
          description: '',
          status: { id: 'status-2', name: 'In Progress', color: '#000', icon: getIconFromString('spinner') },
          priority: { id: 'medium', name: 'Medium', icon: 'minus' },
          project: undefined,
          assignees: null,
          labels: [],
          createdAt: new Date().toISOString(),
          cycleId: '',
          rank: 'c',
        },
      ];

      const result = groupIssuesByStatus(issues);

      expect(result).toHaveProperty('status-1');
      expect(result).toHaveProperty('status-2');
      expect(result['status-1']).toHaveLength(2);
      expect(result['status-2']).toHaveLength(1);
      expect(result['status-1'][0].id).toBe('1');
      expect(result['status-1'][1].id).toBe('2');
      expect(result['status-2'][0].id).toBe('3');
    });

    it('should return empty object for empty array', () => {
      const result = groupIssuesByStatus([]);
      expect(result).toEqual({});
    });
  });

  describe('sortIssuesByPriority', () => {
    const createIssue = (id: string, priorityId: string): Issue => ({
      id,
      identifier: `ISSUE-${id}`,
      title: `Issue ${id}`,
      description: '',
      status: { id: 'status-1', name: 'Todo', color: '#000', icon: getIconFromString('circle') },
      priority: { id: priorityId, name: priorityId, icon: 'circle' },
      project: undefined,
      assignees: null,
      labels: [],
      createdAt: new Date().toISOString(),
      cycleId: '',
      rank: id,
    });

    it('should sort issues by priority order', () => {
      const issues: Issue[] = [
        createIssue('1', 'low'),
        createIssue('2', 'urgent'),
        createIssue('3', 'high'),
        createIssue('4', 'medium'),
      ];

      const result = sortIssuesByPriority(issues);

      expect(result[0].priority?.id).toBe('urgent');
      expect(result[1].priority?.id).toBe('high');
      expect(result[2].priority?.id).toBe('medium');
      expect(result[3].priority?.id).toBe('low');
    });

    it('should handle unknown priority ids', () => {
      const issues: Issue[] = [
        createIssue('1', 'high'),
        createIssue('2', 'unknown-priority'),
      ];

      const result = sortIssuesByPriority(issues);

      expect(result[0].priority?.id).toBe('high');
      expect(result[1].priority?.id).toBe('unknown-priority');
      // 未知の優先度はデフォルト値（'no-priority'）として扱われる
    });

    it('should not mutate original array', () => {
      const issues: Issue[] = [
        createIssue('1', 'low'),
        createIssue('2', 'high'),
      ];

      const originalOrder = issues.map((i) => i.id);
      sortIssuesByPriority(issues);
      const afterSortOrder = issues.map((i) => i.id);

      expect(originalOrder).toEqual(afterSortOrder);
    });
  });
});


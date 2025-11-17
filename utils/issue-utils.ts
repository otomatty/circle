import type { Issue } from '~/types/issues';
import type { Priority } from '~/types/priorities';

export function groupIssuesByStatus(issues: Issue[]): Record<string, Issue[]> {
  return issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    const statusId = issue.status.id;

    if (!acc[statusId]) {
      acc[statusId] = [];
    }

    acc[statusId].push(issue);

    return acc;
  }, {});
}

export function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
    'no-priority': 4,
  };
  const defaultPriorityValue = priorityOrder['no-priority'];

  // Add assertion check for defaultPriorityValue
  if (defaultPriorityValue === undefined) {
    // This should not happen based on the object literal definition
    throw new Error(
      "Default priority 'no-priority' is unexpectedly missing in priorityOrder."
    );
  }

  // Modified helper function to directly check lookup result
  const getPriorityValue = (priority: Priority | undefined): number => {
    if (!priority) {
      return defaultPriorityValue;
    }
    // Directly lookup the value
    const value = priorityOrder[priority.id];
    // Check if the lookup result is undefined
    if (value === undefined) {
      return defaultPriorityValue;
    }
    // Return the found number
    return value;
  };

  return issues.slice().sort((a, b) => {
    const valueA = getPriorityValue(a.priority);
    const valueB = getPriorityValue(b.priority);
    return valueA - valueB;
  });
}

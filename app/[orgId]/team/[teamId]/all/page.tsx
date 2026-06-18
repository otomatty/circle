import AllIssues from '~/components/common/issues/all-issues';
import { getIssuesForTeam } from '~/actions/issues';
import type { Issue } from '~/types/issues';

export default async function AllIssuesPage({
  params,
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { teamId } = await params;

  // Fetch the team's issues from D1 (scoped to the current user's membership)
  // and hand them to the board for hydration, replacing the old mock data.
  const initialIssues = (await getIssuesForTeam(teamId)) as unknown as Issue[];

  return <AllIssues initialIssues={initialIssues} />;
}

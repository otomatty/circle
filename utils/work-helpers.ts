import type {
  WorkWithRelations,
  WorkDetail,
  WorkChallenge,
  WorkSolution,
  WorkResult,
  WorkImage,
  WorkResponsibility,
  Technology,
} from '@kit/types';

/**
 * 実績の詳細情報を取得する
 */
export function getWorkDetail(work: WorkWithRelations): WorkDetail | null {
  return work.work_details[0] || null;
}

/**
 * 実績の技術スタックを取得する
 */
export function getWorkTechnologies(work: WorkWithRelations): Technology[] {
  return work.work_technologies.map((tech) => tech.technology);
}

/**
 * 実績の技術スタック名のリストを取得する
 */
export function getWorkTechnologyNames(work: WorkWithRelations): string[] {
  return work.work_technologies.map((tech) => tech.technology.name);
}

/**
 * 実績の課題と解決策のペアを取得する
 */
export function getChallengeAndSolutions(
  work: WorkWithRelations
): { challenge: WorkChallenge; solutions: WorkSolution[] }[] {
  return work.work_challenges.map((challenge) => ({
    challenge,
    solutions: work.work_solutions.filter(
      (solution) =>
        solution.challenge_id === challenge.id || solution.challenge_id === null
    ),
  }));
}

/**
 * 実績の成果を取得する
 */
export function getWorkResults(work: WorkWithRelations): WorkResult[] {
  return work.work_results.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 実績の画像を取得する
 */
export function getWorkImages(work: WorkWithRelations): WorkImage[] {
  return work.work_images.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 実績の責任・役割を取得する
 */
export function getWorkResponsibilities(
  work: WorkWithRelations
): WorkResponsibility[] {
  return work.work_responsibilities.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 実績の課題を取得する
 */
export function getWorkChallenges(work: WorkWithRelations): WorkChallenge[] {
  return work.work_challenges.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 実績の解決策を取得する
 */
export function getWorkSolutions(work: WorkWithRelations): WorkSolution[] {
  return work.work_solutions.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 実績が特定のステータスかどうかを判定する
 */
export function isWorkStatus(work: WorkWithRelations, status: string): boolean {
  return work.status === status;
}

/**
 * 注目実績かどうかを判定する
 */
export function isFeaturedWork(work: WorkWithRelations): boolean {
  return isWorkStatus(work, 'featured');
}

/**
 * 公開実績かどうかを判定する
 */
export function isPublishedWork(work: WorkWithRelations): boolean {
  return isWorkStatus(work, 'published');
}

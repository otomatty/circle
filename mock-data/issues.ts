import LexRank from '../utils/lexRank';
import type { LabelInterface } from '~/types/labels';
import type { Priority } from '~/types/priorities';
import type { Project } from '~/types/projects';
import type { Status } from '~/types/status';
import type { User } from '~/types/users';
import type { Issue } from '~/types/issues';
import { labels } from './labels';
import { priorities } from './priorities';
import { projects } from './projects';
import { status } from './status';
import { users } from './users';

// Helper functions to get data by index or throw/return undefined
function getStatusByIndex(index: number): Status {
  const s = status[index];
  if (s === undefined) {
    throw new Error(`Invalid status index used in mock data: ${index}`);
  }
  return s as Status;
}

function getPriorityByIndex(index: number): Priority {
  const p = priorities[index];
  if (p === undefined) {
    throw new Error(`Invalid priority index used in mock data: ${index}`);
  }
  return p as Priority;
}

function getUserByIndex(index: number): User {
  const u = users[index];
  if (u === undefined) {
    throw new Error(`Invalid user index used in mock data: ${index}`);
  }
  return u as User;
}

function getLabelByIndex(index: number): LabelInterface {
  const l = labels[index];
  if (l === undefined) {
    throw new Error(`Invalid label index used in mock data: ${index}`);
  }
  return l as LabelInterface;
}

function getProjectByIndex(index: number): Project | undefined {
  // Project is optional in Issue interface, so return undefined if not found
  return projects[index] as Project | undefined;
}

function getRankByIndex(index: number): string {
  const rank = ranks[index];
  if (rank === undefined) {
    throw new Error(`Invalid rank index used in mock data: ${index}`);
  }
  return rank;
}

// generates issues ranks using LexoRank algorithm.
export const ranks: string[] = [];
const generateIssuesRanks = () => {
  const firstRank = new LexRank('a3c');
  ranks.push(firstRank.toString());
  for (let i = 1; i < 30; i++) {
    const previousRankValue = ranks[i - 1];
    if (previousRankValue === undefined) {
      // This should logically never happen due to the loop structure
      throw new Error(`Unexpected undefined rank at index ${i - 1}`);
    }
    const previousRank = LexRank.from(previousRankValue);
    const currentRank = previousRank.increment();
    ranks.push(currentRank.toString());
  }
};
generateIssuesRanks();

export const issues: Issue[] = [
  {
    id: '1',
    identifier: 'LNUI-101',
    title: 'アクセシビリティ準拠のためにButtonコンポーネントをリファクタリング',
    description: '',
    status: getStatusByIndex(5),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(0)],
    createdAt: '2025-03-08',
    cycleId: '42',
    project: getProjectByIndex(0),
    rank: getRankByIndex(0),
  },
  {
    id: '2',
    identifier: 'LNUI-204',
    title: 'よりスムーズなUI遷移のためにアニメーションを最適化',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(1)],
    createdAt: '2025-03-12',
    cycleId: '42',
    subissues: ['1', '3'],
    rank: getRankByIndex(1),
  },
  {
    id: '3',
    identifier: 'LNUI-309',
    title: 'システム設定連携のダークモード切り替え機能を実装',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(2)],
    createdAt: '2025-03-14',
    cycleId: '42',
    project: getProjectByIndex(1),
    rank: getRankByIndex(2),
  },
  {
    id: '4',
    identifier: 'LNUI-415',
    title: 'フォーカストラップ機能を持つ新しいモーダルシステムを設計',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(3)],
    createdAt: '2025-03-09',
    cycleId: '42',
    project: getProjectByIndex(2),
    rank: getRankByIndex(3),
  },
  {
    id: '5',
    identifier: 'LNUI-501',
    title: 'ナビゲーションバーのレスポンシブ性を向上',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(4)],
    createdAt: '2025-03-10',
    cycleId: '42',
    project: getProjectByIndex(4),
    subissues: ['8', '9'],
    rank: getRankByIndex(4),
  },
  {
    id: '6',
    identifier: 'LNUI-502',
    title: 'フッターの読み込み時間を最適化',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(0),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-03-11',
    cycleId: '42',
    project: getProjectByIndex(5),
    rank: getRankByIndex(5),
  },
  {
    id: '7',
    identifier: 'LNUI-503',
    title: 'アクセシビリティ向上のためにサイドバーをリファクタリング',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(2),
    labels: [getLabelByIndex(6)],
    createdAt: '2025-03-12',
    cycleId: '42',
    project: getProjectByIndex(5),
    rank: getRankByIndex(6),
  },
  {
    id: '8',
    identifier: 'LNUI-504',
    title: '新しいカードコンポーネントデザインを実装',
    description: '',
    status: getStatusByIndex(4),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(7)],
    createdAt: '2025-03-13',
    cycleId: '42',
    project: getProjectByIndex(6),
    rank: getRankByIndex(7),
  },
  {
    id: '9',
    identifier: 'LNUI-505',
    title: 'ツールチップのインタラクティブ性を改善',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(2),
    labels: [getLabelByIndex(8)],
    createdAt: '2025-03-14',
    cycleId: '42',
    project: getProjectByIndex(6),
    rank: getRankByIndex(8),
  },
  {
    id: '10',
    identifier: 'LNUI-506',
    title: 'モバイルデバイス向けにドロップダウンを再設計',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(9)],
    createdAt: '2025-03-15',
    cycleId: '42',
    project: getProjectByIndex(7),
    rank: getRankByIndex(9),
  },
  {
    id: '11',
    identifier: 'LNUI-507',
    title: 'フォームのバリデーション問題を修正',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(1),
    assignees: null,
    labels: [getLabelByIndex(10)],
    createdAt: '2025-03-16',
    cycleId: '42',
    project: getProjectByIndex(7),
    rank: getRankByIndex(10),
  },
  {
    id: '12',
    identifier: 'LNUI-508',
    title: 'モーダルアニメーションを更新',
    description: '',
    status: getStatusByIndex(0),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(9)],
    createdAt: '2025-03-17',
    cycleId: '42',
    project: getProjectByIndex(8),
    rank: getRankByIndex(11),
  },
  {
    id: '13',
    identifier: 'LNUI-509',
    title: 'ボタンの状態とインタラクションを刷新',
    description: '',
    status: getStatusByIndex(5),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(3)],
    createdAt: '2025-03-18',
    cycleId: '42',
    project: getProjectByIndex(8),
    rank: getRankByIndex(12),
  },
  {
    id: '14',
    identifier: 'LNUI-510',
    title: '入力コンポーネントのスタイリングを合理化',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(2),
    labels: [getLabelByIndex(9)],
    createdAt: '2025-03-19',
    cycleId: '42',
    project: getProjectByIndex(9),
    rank: getRankByIndex(13),
  },
  {
    id: '15',
    identifier: 'LNUI-511',
    title: '新しいセレクトコンポーネントの動作を統合',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(4)],
    createdAt: '2025-03-20',
    cycleId: '42',
    project: getProjectByIndex(9),
    rank: getRankByIndex(14),
  },
  {
    id: '16',
    identifier: 'LNUI-512',
    title: 'パンくずナビゲーションのユーザビリティを向上',
    description: '',
    status: getStatusByIndex(0),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-03-21',
    cycleId: '42',
    project: getProjectByIndex(9),
    rank: getRankByIndex(15),
  },
  {
    id: '17',
    identifier: 'LNUI-513',
    title: 'スムーズな遷移のためにアコーディオンをリファクタリング',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(2),
    assignees: null,
    labels: [getLabelByIndex(3)],
    createdAt: '2025-03-22',
    cycleId: '42',
    project: getProjectByIndex(0),
    rank: getRankByIndex(16),
  },
  {
    id: '18',
    identifier: 'LNUI-514',
    title: '遅延読み込み機能付きカルーセルを実装',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(6)],
    createdAt: '2025-03-23',
    cycleId: '42',
    project: getProjectByIndex(0),
    rank: getRankByIndex(17),
  },
  {
    id: '19',
    identifier: 'LNUI-515',
    title: 'レスポンシブデザイン向けにグリッドレイアウトを最適化',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(2),
    assignees: null,
    labels: [getLabelByIndex(7)],
    createdAt: '2025-03-24',
    cycleId: '42',
    project: getProjectByIndex(0),
    rank: getRankByIndex(18),
  },
  {
    id: '20',
    identifier: 'LNUI-516',
    title: '明瞭さ向上のためにタイポグラフィシステムを更新',
    description: '',
    status: getStatusByIndex(4),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-03-25',
    cycleId: '42',
    project: getProjectByIndex(0),
    rank: getRankByIndex(19),
  },
  {
    id: '21',
    identifier: 'LNUI-517',
    title: 'カラースキームの一貫性を改善',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(0),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-03-26',
    cycleId: '42',
    project: getProjectByIndex(1),
    rank: getRankByIndex(20),
  },
  {
    id: '22',
    identifier: 'LNUI-518',
    title: 'より良いスケーラビリティのための新しいアイコンセットを設計',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-03-27',
    cycleId: '42',
    project: getProjectByIndex(1),
    rank: getRankByIndex(21),
  },
  {
    id: '23',
    identifier: 'LNUI-519',
    title: '通知システムのタイミングを修正',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(2),
    labels: [getLabelByIndex(8)],
    createdAt: '2025-03-28',
    cycleId: '42',
    project: getProjectByIndex(4),
    rank: getRankByIndex(22),
  },
  {
    id: '24',
    identifier: 'LNUI-520',
    title: 'ローディングインジケーターのパフォーマンスを向上',
    description: '',
    status: getStatusByIndex(0),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(9)],
    createdAt: '2025-03-29',
    cycleId: '42',
    project: getProjectByIndex(3),
    rank: getRankByIndex(23),
  },
  {
    id: '25',
    identifier: 'LNUI-521',
    title: 'プログレスバーのアニメーションをリファクタリング',
    description: '',
    status: getStatusByIndex(5),
    priority: getPriorityByIndex(2),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(6)],
    createdAt: '2025-03-30',
    cycleId: '42',
    project: getProjectByIndex(3),
    rank: getRankByIndex(24),
  },
  {
    id: '26',
    identifier: 'LNUI-522',
    title: 'テーブルコンポーネントのソート機能を最適化',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(1),
    labels: [getLabelByIndex(7)],
    createdAt: '2025-03-31',
    cycleId: '42',
    project: getProjectByIndex(6),
    rank: getRankByIndex(25),
  },
  {
    id: '27',
    identifier: 'LNUI-523',
    title: 'ページネーションロジックを改善',
    description: '',
    status: getStatusByIndex(3),
    priority: getPriorityByIndex(0),
    assignees: getUserByIndex(0),
    labels: [getLabelByIndex(8)],
    createdAt: '2025-04-01',
    cycleId: '42',
    project: getProjectByIndex(6),
    rank: getRankByIndex(26),
  },
  {
    id: '28',
    identifier: 'LNUI-524',
    title: 'オートコンプリート機能付き検索バーを実装',
    description: '',
    status: getStatusByIndex(0),
    priority: getPriorityByIndex(1),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(5)],
    createdAt: '2025-04-02',
    cycleId: '42',
    project: getProjectByIndex(5),
    rank: getRankByIndex(27),
  },
  {
    id: '29',
    identifier: 'LNUI-525',
    title: '重要な通知のためのアラートシステムを更新',
    description: '',
    status: getStatusByIndex(1),
    priority: getPriorityByIndex(2),
    assignees: null,
    labels: [getLabelByIndex(9)],
    createdAt: '2025-04-03',
    cycleId: '42',
    project: getProjectByIndex(5),
    rank: getRankByIndex(28),
  },
  {
    id: '30',
    identifier: 'LNUI-526',
    title: 'ユーザビリティ向上のためにオーバーレイを改良',
    description: '',
    status: getStatusByIndex(2),
    priority: getPriorityByIndex(3),
    assignees: getUserByIndex(3),
    labels: [getLabelByIndex(8)],
    createdAt: '2025-04-04',
    cycleId: '42',
    project: getProjectByIndex(1),
    rank: getRankByIndex(29),
  },
];

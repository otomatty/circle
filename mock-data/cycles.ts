export interface Cycle {
  id: string;
  number: number;
  name: string;
  teamId: string;
  startDate: string;
  endDate: string;
  progress: number;
}

export const cycles: Cycle[] = [
  {
    id: '42',
    number: 42,
    name: 'スプリント 42 - ピクセルパーフェクト',
    teamId: 'design-system',
    startDate: '2025-03-10',
    endDate: '2025-03-24',
    progress: 80,
  },
  {
    id: '43',
    number: 43,
    name: 'スプリント 43 - パフォーマンス向上',
    teamId: 'performance-lab',
    startDate: '2025-03-10',
    endDate: '2025-03-24',
    progress: 50,
  },
  {
    id: '44',
    number: 44,
    name: 'スプリント 44 - コア機能強化',
    teamId: 'lndev-core',
    startDate: '2025-03-10',
    endDate: '2025-03-24',
    progress: 0,
  },
];

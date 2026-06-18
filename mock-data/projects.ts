import { type Status, status } from './status';
import {
  Blocks,
  Bomb,
  BrickWall,
  Cuboid,
  Grid2X2,
  type LucideIcon,
  Shapes,
  TrafficCone,
  Vault,
  Wallpaper,
} from 'lucide-react';

function getStatusByIndex(index: number): Status {
  const s = status[index];
  if (s === undefined) {
    // Use a more specific error message if desired
    throw new Error(`Invalid status index used in mock data: ${index}`);
  }
  return s;
}

export interface Project {
  id: string;
  name: string;
  status: Status;
  icon: LucideIcon;
  percentComplete: number;
  startDate: string;
}

export const projects: Project[] = [
  {
    id: '1',
    name: 'Circle UI - コアコンポーネント',
    status: getStatusByIndex(0),
    icon: Cuboid,
    percentComplete: 80,
    startDate: '2025-03-08',
  },
  {
    id: '2',
    name: 'Circle UI - テーマ設定',
    status: getStatusByIndex(1),
    icon: Blocks,
    percentComplete: 50,
    startDate: '2025-03-14',
  },
  {
    id: '3',
    name: 'Circle UI - モーダル',
    status: getStatusByIndex(2),
    icon: Vault,
    percentComplete: 0,
    startDate: '2025-03-09',
  },
  {
    id: '4',
    name: 'Circle UI - ナビゲーション',
    status: getStatusByIndex(3),
    icon: BrickWall,
    percentComplete: 0,
    startDate: '2025-03-10',
  },
  {
    id: '5',
    name: 'Circle UI - レイアウト',
    status: getStatusByIndex(4),
    icon: Wallpaper,
    percentComplete: 0,
    startDate: '2025-03-11',
  },
  {
    id: '6',
    name: 'Circle UI - サイドバー',
    status: getStatusByIndex(5),
    icon: TrafficCone,
    percentComplete: 0,
    startDate: '2025-03-12',
  },
  {
    id: '7',
    name: 'Circle UI - カード',
    status: getStatusByIndex(1),
    icon: Grid2X2,
    percentComplete: 0,
    startDate: '2025-03-13',
  },
  {
    id: '8',
    name: 'Circle UI - ツールチップ',
    status: getStatusByIndex(2),
    icon: Bomb,
    percentComplete: 0,
    startDate: '2025-03-14',
  },
  {
    id: '9',
    name: 'Circle UI - ドロップダウン',
    status: getStatusByIndex(3),
    icon: Shapes,
    percentComplete: 50,
    startDate: '2025-03-15',
  },
];

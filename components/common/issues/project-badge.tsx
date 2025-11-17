import { Badge } from '@kit/ui/badge';
import type { Project } from '~/types/projects';
import Link from 'next/link';

/**
 * プロジェクトバッジコンポーネント
 * 課題に関連付けられたプロジェクトをバッジ形式で表示します。
 * プロジェクトのアイコンと名前を含み、クリックするとプロジェクト一覧に
 * 遷移するリンクになっています。
 */
// TODO: hrefは別のものにすること
export function ProjectBadge({ project }: { project: Project }) {
  return (
    <Link
      href={'/lndev-ui/projects/all'}
      className="flex items-center justify-center gap-.5"
    >
      <Badge
        variant="outline"
        className="gap-1.5 rounded-full text-muted-foreground bg-background"
      >
        <project.icon size={16} />
        {project.name}
      </Badge>
    </Link>
  );
}

import { Badge } from '@kit/ui/badge';
import type { LabelInterface } from '~/types/labels';

/**
 * ラベルバッジコンポーネント
 * 課題に関連付けられたラベルをバッジ形式で表示します。
 * 各ラベルはその色を示す小さな円とラベル名を含み、
 * 複数のラベルを並べて表示できます。
 */
export function LabelBadge({ label }: { label: LabelInterface[] }) {
  return (
    <>
      {label.map((l) => (
        <Badge
          key={l.id}
          variant="outline"
          className="gap-1.5 rounded-full text-muted-foreground bg-background"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: l.color }}
            aria-hidden="true"
          />
          {l.name}
        </Badge>
      ))}
    </>
  );
}

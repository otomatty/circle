/**
 * ラベルの型定義
 * 課題に付与できるラベル情報を表します。
 */
export interface LabelInterface {
  /** ラベルの一意識別子 */
  id: string;

  /** ラベルの表示名 */
  name: string;

  /** ラベルの色（HEXカラーコード） */
  color: string;
}

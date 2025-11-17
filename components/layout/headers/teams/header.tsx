import HeaderNav from './header-nav';
import HeaderOptions from './header-options';

/**
 * チームヘッダーコンポーネント
 * チーム一覧画面のヘッダー全体を構成します。
 * 上部にナビゲーション、下部に表示オプションを配置しています。
 */
export default function Header() {
  return (
    <div className="w-full flex flex-col items-center">
      <HeaderNav />
      <HeaderOptions />
    </div>
  );
}

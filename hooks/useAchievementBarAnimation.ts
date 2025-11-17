import { useWindowSize } from "./useWindowSize";

/**
 * 実績バーのアニメーション設定を管理するカスタムフック
 *
 * このフックは以下の機能を提供します：
 * 1. アニメーション設定
 *    - バーの状態に応じたアニメーションバリアント
 *    - タイトルの表示/非表示アニメーション
 *    - フィルターエフェクトのアニメーション
 *
 * 2. レスポンシブ対応
 *    - ウィンドウサイズに応じた正方形サイズの計算
 *    - 適切なアスペクト比の維持
 *
 * 3. トランジション制御
 *    - スムーズなアニメーション効果
 *    - イージング関数の最適化
 *
 * @returns {Object} アニメーション関連の設定とユーティリティ
 * @returns {Object} barVariants - バーのアニメーションバリアント
 * @returns {Object} titleVariants - タイトルのアニメーションバリアント
 * @returns {Object} filterVariants - フィルターのアニメーションバリアント
 * @returns {Function} calculateSquareSize - 正方形サイズを計算する関数
 * @returns {Object} transition - 共通のトランジション設定
 */
export const useAchievementBarAnimation = () => {
	// ウィンドウサイズを監視
	const { width: windowWidth, height: windowHeight } = useWindowSize();

	// 共通のトランジション設定
	const transition = {
		duration: 0.5,
		ease: [0.32, 0.72, 0, 1], // カスタムイージング関数
	};

	/**
	 * 正方形サイズを計算する関数
	 * ウィンドウサイズに応じて適切なサイズを返す
	 * 最小300px、最大600pxの範囲で調整
	 */
	const calculateSquareSize = () => {
		const size = Math.min(windowWidth, windowHeight) * 0.6;
		return Math.max(300, Math.min(size, 600));
	};

	/**
	 * バーのアニメーションバリアント
	 * - default: 通常状態（半透明の縦長バー）
	 * - active: アクティブ状態（不透明で若干上に浮く）
	 * - expanded: 拡大状態（正方形に展開）
	 * - fullWidth: 全幅表示状態（横幅いっぱいに展開）
	 */
	const barVariants = {
		default: {
			y: 0,
			opacity: 0.3,
			width: "2.5rem",
			height: "40vh",
			transition,
		},
		active: {
			y: -20,
			opacity: 1,
			width: "2.5rem",
			height: "40vh",
			transition,
		},
		expanded: {
			y: 0,
			opacity: 1,
			width: `${calculateSquareSize()}px`,
			height: `${calculateSquareSize()}px`,
			transition: {
				...transition,
				duration: 0.8,
			},
		},
		fullWidth: {
			y: "calc(-30vh + 0.6rem)", // バーの位置を少しだけ内側に配置させる
			opacity: 1,
			width: "calc(80vw - 1rem)", // バーの幅を少しだけ狭くすることで、NeonGradientCardと隙間を開ける
			height: "200px",
			transition: {
				...transition,
				duration: 0.8,
				y: { type: "spring", stiffness: 100, damping: 15 },
				height: { type: "spring", stiffness: 100, damping: 15 },
			},
		},
	};

	/**
	 * タイトルのアニメーションバリアント
	 * - hidden: 非表示状態
	 * - visible: 表示状態（通常のフェードイン）
	 * - expanded: 拡大表示状態（遅延付きフェードイン）
	 */
	const titleVariants = {
		hidden: {
			opacity: 0,
			y: 10,
			transition,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				...transition,
				delay: 0.1,
			},
		},
		expanded: {
			opacity: 1,
			y: 0,
			transition: {
				...transition,
				delay: 0.3,
			},
		},
	};

	/**
	 * フィルターのアニメーションバリアント
	 * - hidden: 非表示状態
	 * - visible: 表示状態（遅延付きフェードイン）
	 */
	const filterVariants = {
		hidden: {
			opacity: 0,
			transition,
		},
		visible: {
			opacity: 1,
			transition: {
				...transition,
				delay: 0.2,
			},
		},
	};

	return {
		barVariants,
		titleVariants,
		filterVariants,
		calculateSquareSize,
		transition,
	};
};

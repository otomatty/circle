"use client";

import { useState, useEffect } from "react";

/**
 * 一度だけ表示する要素の表示状態を管理するカスタムフック
 * @param key - ローカルストレージに保存する際のキー
 * @returns 要素を表示するかどうかのブール値と表示済みとしてマークする関数
 */
export const useDisplayOnce = (key: string) => {
	const [shouldShow, setShouldShow] = useState(true);

	useEffect(() => {
		// ローカルストレージから表示状態を取得
		const hasShown = localStorage.getItem(key);

		if (hasShown) {
			setShouldShow(false);
		}
	}, [key]);

	const markAsShown = () => {
		localStorage.setItem(key, "true");
		setShouldShow(false);
	};

	return { shouldShow, markAsShown };
};

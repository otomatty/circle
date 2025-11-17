"use client";

import { useState, useEffect } from "react";

const GREETING_SHOWN_KEY = "greeting-shown";

/**
 * 挨拶の表示状態を管理するカスタムフック
 * @returns 挨拶を表示するかどうかのブール値
 */
export const useGreetingDisplay = () => {
	const [shouldShowGreeting, setShouldShowGreeting] = useState(true);

	useEffect(() => {
		// ローカルストレージから表示状態を取得
		const hasShownGreeting = localStorage.getItem(GREETING_SHOWN_KEY);

		if (hasShownGreeting) {
			setShouldShowGreeting(false);
		}
	}, []);

	const markGreetingAsShown = () => {
		localStorage.setItem(GREETING_SHOWN_KEY, "true");
		setShouldShowGreeting(false);
	};

	return { shouldShowGreeting, markGreetingAsShown };
};

'use client';

/**
 * 現在の時間帯に応じた挨拶を生成するカスタムフック
 * @returns 時間帯に応じた挨拶文
 */
export const useGreeting = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'おはようございます';
    }
    if (hour >= 12 && hour < 17) {
      return 'こんにちは';
    }
    return 'こんばんは';
  };

  return getGreeting();
};

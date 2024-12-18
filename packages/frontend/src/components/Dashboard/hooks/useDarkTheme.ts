import { useEffect, useState } from 'react';

export default function useDarkTheme() {
  const [theme, setTheme] = useState(localStorage.theme);
  const preference = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(preference);
    root.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme, preference]);

  return [preference, setTheme] as const;
}

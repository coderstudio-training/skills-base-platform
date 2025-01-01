import { useEffect, useState } from 'react';

export function useDarkTheme() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    const root = window.document.documentElement;

    // Apply the theme class to the root element
    root.classList.add(storedTheme);
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      const root = window.document.documentElement;

      // Update the class on the root element
      root.classList.remove(prev!);
      root.classList.add(newTheme);

      // Persist in localStorage
      localStorage.setItem('theme', newTheme);

      return newTheme;
    });
  };

  return {
    theme,
    toggleTheme,
  };
}

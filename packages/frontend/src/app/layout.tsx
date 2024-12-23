import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skills Base Platform',
  description: "Manage and develop your team's skills",
};

function getInitialTheme(): string {
  // Server-side rendering can't access localStorage, so we default to light.
  if (typeof window === 'undefined') {
    return 'light';
  }

  // Client-side: resolve theme from localStorage or system preference
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    return storedTheme;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialTheme = getInitialTheme();

  return (
    <html lang="en" className={initialTheme}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

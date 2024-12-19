import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skills Base Platform',
  description: "Manage and develop your team's skills",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function() {
      const storedTheme = localStorage.getItem('theme');
      const theme = storedTheme === 'dark' ? 'dark' : 'light';
      document.documentElement.classList.add(theme);
    })();
  `;

  return (
    <html lang="en">
      <head>
        {/* Add the script to set the initial theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

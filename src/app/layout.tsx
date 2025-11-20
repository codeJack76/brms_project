// src/app/layout.tsx
import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Barangay Records Management System',
  description: 'Barangay records management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Mes Recettes Gourmandes | Gestion de recettes, OCR & Épicerie',
  description: 'Application moderne pour stocker vos recettes, scanner des livres de cuisine en photo avec OCR, et générer votre liste d\'épicerie avec formats d\'achat standards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-full flex-col bg-zinc-50/50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200/80 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Mes Recettes Gourmandes — Développé avec Next.js, Supabase & OCR</p>
        </footer>
      </body>
    </html>
  );
}

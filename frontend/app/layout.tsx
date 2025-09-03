import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../hooks/use-auth';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EventPlanner - Create & Discover Amazing Events',
  description: 'The ultimate platform for event management, ticketing, and discovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
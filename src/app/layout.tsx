import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'hairlog',
  description: '가족 미용 시술 기록',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className="min-h-screen bg-white text-black antialiased"
        suppressHydrationWarning
      >
        <main className="mx-auto max-w-md px-4 pb-24 pt-6">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

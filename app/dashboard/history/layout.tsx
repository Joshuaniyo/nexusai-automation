import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content History',
  description: 'Browse and review all AI-generated content from your automation runs.',
  robots: { index: false, follow: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

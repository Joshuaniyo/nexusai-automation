import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asset Manager',
  description: 'Manage and configure your client websites for targeted AI content delivery.',
  robots: { index: false, follow: false },
};

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

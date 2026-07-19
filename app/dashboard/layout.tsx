'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Loader2, Menu, Sparkles } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      const redirectPath = encodeURIComponent(pathname);
      router.push(`/auth?redirect=${redirectPath}`);
    }
  }, [session, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(220,16%,6%)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-[hsl(215,16%,60%)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(220,16%,6%)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-[hsl(215,16%,60%)]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem('nexus-sidebar-collapsed') === 'true');
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('nexus-sidebar-collapsed', String(next));
      return next;
    });
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[hsl(220,16%,6%)]">
          <div className={`hidden h-full shrink-0 transition-[width] duration-300 ease-out lg:block ${sidebarCollapsed ? 'w-16' : 'w-60'}`}><Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} /></div>
          <div className={`fixed inset-0 z-50 transition lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
            <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative h-full w-[min(86vw,20rem)] shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 lg:hidden">
              <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/5" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-cyan-400" />NexusAI</span>
              <span className="w-9" />
            </header>
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}

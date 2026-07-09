'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Zap, Globe, History, Settings, Sparkles, Crown, ChevronRight, LogOut, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/dashboard', label: 'Generate', icon: Zap, exact: true },
  { href: '/dashboard/assets', label: 'Asset Manager', icon: Globe },
  { href: '/dashboard/history', label: 'Content History', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tier, isPremium, signOut, loading } = useAuth();

  async function handleUpgrade() {
    if (isPremium) return;
    router.push('/api/billing/checkout');
  }

  if (loading) {
    return (
      <aside className="w-60 shrink-0 h-screen flex flex-col border-r" style={{ borderColor: 'hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)' }}>
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 shrink-0 h-screen flex flex-col border-r" style={{ borderColor: 'hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-4 py-4 border-b hover:opacity-80 transition-opacity" style={{ borderColor: 'hsl(220,14%,16%)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-cyan" style={{ background: 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'hsl(210,20%,95%)' }}>NexusAI</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'hsl(215,16%,47%)' }}>Automation</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: 'hsl(215,16%,47%)' }}>Core</p>
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'border'
                  : 'hover:opacity-80'
              )}
              style={active
                ? { backgroundColor: 'hsla(199,89%,48%,0.1)', color: 'hsl(199,89%,65%)', borderColor: 'hsla(199,89%,48%,0.25)' }
                : { color: 'hsl(215,16%,60%)', backgroundColor: 'transparent', borderColor: 'transparent' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </Link>
          );
        })}
        <div className="pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: 'hsl(215,16%,47%)' }}>Quick Links</p>
          <Link
            href="/pricing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'hsl(215,16%,60%)' }}
          >
            <Crown className="w-4 h-4" />
            Pricing
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </Link>
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-default" style={{ color: 'hsl(215,16%,50%)' }}>
            <Settings className="w-4 h-4" /> Settings
          </span>
        </div>
      </nav>

      {/* Tier & User */}
      <div className="px-3 py-3 border-t space-y-3" style={{ borderColor: 'hsl(220,14%,16%)' }}>
        <div className="rounded-lg p-3 border" style={{ backgroundColor: 'hsl(220,14%,14%)', borderColor: 'hsl(220,14%,20%)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(215,16%,47%)' }}>Plan</p>
            <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5', isPremium ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-white/10 text-white/40')}>
              {isPremium ? 'Premium' : 'Free'}
            </Badge>
          </div>
          {!isPremium ? (
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="w-full h-7 text-xs border-0 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Crown className="w-3 h-3 mr-1.5" />
              Upgrade to Premium
            </Button>
          ) : (
            <div className="text-xs text-center text-[hsl(215,16%,47%)] py-1">
              All features unlocked
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))' }}>
              <span className="text-[10px] font-bold text-white">{user.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: 'hsl(210,20%,95%)' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'hsl(215,16%,47%)' }}>{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded hover:bg-[hsl(220,14%,14%)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-[hsl(215,16%,47%)]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
